import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { supplier } from "@/src/db/schema"
import { desc, ilike, or, eq } from "drizzle-orm"
import { CreateSupplierRequest } from "@/src/types/parts"
import { v4 as uuidv4 } from "uuid"
import { auth } from "@/src/lib/auth"
import { headers } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const activeOnly = searchParams.get("activeOnly") === "true"

    let query = db.select().from(supplier).$dynamic()

    if (search) {
      query = query.where(
        or(
          ilike(supplier.name, `%${search}%`),
          ilike(supplier.contactName, `%${search}%`),
          ilike(supplier.email, `%${search}%`)
        )
      )
    }

    if (activeOnly) {
      query = query.where(eq(supplier.isActive, true))
    }

    const suppliers = await query.orderBy(desc(supplier.createdAt))

    return NextResponse.json(suppliers)
  } catch (error) {
    console.error("Error fetching suppliers:", error)
    return NextResponse.json(
      { error: "Failed to fetch suppliers" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body: CreateSupplierRequest = await request.json()

    const { name, contactName, email, phone, address, website, notes } = body

    if (!name) {
      return NextResponse.json(
        { error: "Supplier name is required" },
        { status: 400 }
      )
    }

    const now = new Date()
    const newSupplier = await db
      .insert(supplier)
      .values({
        id: uuidv4(),
        name,
        contactName: contactName || null,
        email: email || null,
        phone: phone || null,
        address: address || null,
        website: website || null,
        notes: notes || null,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      })
      .returning()

    return NextResponse.json(newSupplier[0], { status: 201 })
  } catch (error) {
    console.error("Error creating supplier:", error)
    return NextResponse.json(
      { error: "Failed to create supplier" },
      { status: 500 }
    )
  }
}