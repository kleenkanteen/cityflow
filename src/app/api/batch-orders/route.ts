import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { batchOrder, supplier, partOrder, part, user } from "@/src/db/schema"
import { desc, eq } from "drizzle-orm"
import { CreateBatchOrderRequest } from "@/src/types/parts"
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
    const status = searchParams.get("status")

    let query = db
      .select({
        id: batchOrder.id,
        batchNumber: batchOrder.batchNumber,
        supplierId: batchOrder.supplierId,
        status: batchOrder.status,
        totalAmount: batchOrder.totalAmount,
        orderDate: batchOrder.orderDate,
        expectedDeliveryDate: batchOrder.expectedDeliveryDate,
        actualDeliveryDate: batchOrder.actualDeliveryDate,
        notes: batchOrder.notes,
        orderedBy: batchOrder.orderedBy,
        createdAt: batchOrder.createdAt,
        updatedAt: batchOrder.updatedAt,
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
      .from(batchOrder)
      .leftJoin(supplier, eq(batchOrder.supplierId, supplier.id))
      .$dynamic()

    if (status) {
      query = query.where(eq(batchOrder.status, status))
    }

    const orders = await query.orderBy(desc(batchOrder.createdAt))

    return NextResponse.json(orders)
  } catch (error) {
    console.error("Error fetching batch orders:", error)
    return NextResponse.json(
      { error: "Failed to fetch batch orders" },
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

    const body: CreateBatchOrderRequest = await request.json()

    const { supplierId, notes, expectedDeliveryDate } = body

    if (!supplierId) {
      return NextResponse.json(
        { error: "Supplier is required" },
        { status: 400 }
      )
    }

    // Generate batch number
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const time = String(now.getTime()).slice(-6)
    const batchNumber = `BO-${year}${month}${day}-${time}`

    const newBatchOrder = await db
      .insert(batchOrder)
      .values({
        id: uuidv4(),
        batchNumber,
        supplierId,
        status: "draft",
        totalAmount: "0.00",
        orderDate: null,
        expectedDeliveryDate: expectedDeliveryDate ? new Date(expectedDeliveryDate) : null,
        actualDeliveryDate: null,
        notes: notes || null,
        orderedBy: session.user.id,
        createdAt: now,
        updatedAt: now,
      })
      .returning()

    return NextResponse.json(newBatchOrder[0], { status: 201 })
  } catch (error) {
    console.error("Error creating batch order:", error)
    return NextResponse.json(
      { error: "Failed to create batch order" },
      { status: 500 }
    )
  }
}