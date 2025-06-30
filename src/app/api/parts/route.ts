import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { part, supplier } from "@/src/db/schema"
import { desc, ilike, or, eq } from "drizzle-orm"
import { CreatePartRequest } from "@/src/types/parts"
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
    const category = searchParams.get("category")
    const supplierId = searchParams.get("supplierId")
    const activeOnly = searchParams.get("activeOnly") === "true"

    let query = db
      .select({
        id: part.id,
        partNumber: part.partNumber,
        name: part.name,
        description: part.description,
        category: part.category,
        manufacturer: part.manufacturer,
        unitPrice: part.unitPrice,
        minimumOrderQuantity: part.minimumOrderQuantity,
        leadTimeDays: part.leadTimeDays,
        supplierId: part.supplierId,
        isActive: part.isActive,
        createdAt: part.createdAt,
        updatedAt: part.updatedAt,
        supplier: {
          id: supplier.id,
          name: supplier.name,
          contactName: supplier.contactName,
          email: supplier.email,
          phone: supplier.phone,
          address: supplier.address,
          website: supplier.website,
          notes: supplier.notes,
          isActive: supplier.isActive,
          createdAt: supplier.createdAt,
          updatedAt: supplier.updatedAt,
        },
      })
      .from(part)
      .leftJoin(supplier, eq(part.supplierId, supplier.id))
      .$dynamic()

    if (search) {
      query = query.where(
        or(
          ilike(part.name, `%${search}%`),
          ilike(part.partNumber, `%${search}%`),
          ilike(part.description, `%${search}%`),
          ilike(part.manufacturer, `%${search}%`)
        )
      )
    }

    if (category) {
      query = query.where(eq(part.category, category))
    }

    if (supplierId) {
      query = query.where(eq(part.supplierId, supplierId))
    }

    if (activeOnly) {
      query = query.where(eq(part.isActive, true))
    }

    const parts = await query.orderBy(desc(part.createdAt))

    return NextResponse.json(parts)
  } catch (error) {
    console.error("Error fetching parts:", error)
    return NextResponse.json(
      { error: "Failed to fetch parts" },
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

    const body: CreatePartRequest = await request.json()

    const {
      partNumber,
      name,
      description,
      category,
      manufacturer,
      unitPrice,
      minimumOrderQuantity,
      leadTimeDays,
      supplierId,
    } = body

    if (!partNumber || !name || !category || !supplierId) {
      return NextResponse.json(
        { error: "Part number, name, category, and supplier are required" },
        { status: 400 }
      )
    }

    const now = new Date()
    const newPart = await db
      .insert(part)
      .values({
        id: uuidv4(),
        partNumber,
        name,
        description: description || null,
        category,
        manufacturer: manufacturer || null,
        unitPrice: unitPrice ? unitPrice.toString() : null,
        minimumOrderQuantity: minimumOrderQuantity || 1,
        leadTimeDays: leadTimeDays || 7,
        supplierId,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      })
      .returning()

    return NextResponse.json(newPart[0], { status: 201 })
  } catch (error) {
    console.error("Error creating part:", error)
    return NextResponse.json(
      { error: "Failed to create part" },
      { status: 500 }
    )
  }
}