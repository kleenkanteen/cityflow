import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { inventoryItem } from "@/src/db/schema"
import { desc, ilike, or } from "drizzle-orm"
import { CreateInventoryItemRequest } from "@/src/types/inventory"
import { v4 as uuidv4 } from "uuid"
import { auth } from "@/src/lib/auth"
import { headers } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")

    let query = db.select().from(inventoryItem).$dynamic()

    if (search) {
      query = query.where(
        or(
          ilike(inventoryItem.name, `%${search}%`),
          ilike(inventoryItem.description, `%${search}%`),
        ),
      )
    }

    const items = await query.orderBy(desc(inventoryItem.createdAt))

    return NextResponse.json(items)
  } catch (error) {
    console.error("Error fetching inventory items:", error)
    return NextResponse.json(
      { error: "Failed to fetch inventory items" },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: CreateInventoryItemRequest = await request.json()

    const { name, description, quantity } = body

    if (!name || quantity === undefined) {
      return NextResponse.json(
        { error: "Name and quantity are required" },
        { status: 400 },
      )
    }

    console.log(`User ${session.user.id} is creating an inventory item.`)

    const now = new Date()
    const newItem = await db
      .insert(inventoryItem)
      .values({
        id: uuidv4(),
        name,
        description: description || null,
        quantity,
        createdAt: now,
        updatedAt: now,
      })
      .returning()

    return NextResponse.json(newItem[0], { status: 201 })
  } catch (error) {
    console.error("Error creating inventory item:", error)
    return NextResponse.json(
      { error: "Failed to create inventory item" },
      { status: 500 },
    )
  }
}