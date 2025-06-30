import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { batchOrder, supplier, partOrder, part, user, asset } from "@/src/db/schema"
import { eq } from "drizzle-orm"
import { auth } from "@/src/lib/auth"
import { headers } from "next/headers"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params

    // Get batch order with supplier
    const batchOrderData = await db
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
      .where(eq(batchOrder.id, id))
      .limit(1)

    if (batchOrderData.length === 0) {
      return NextResponse.json(
        { error: "Batch order not found" },
        { status: 404 }
      )
    }

    // Get part orders for this batch
    const partOrders = await db
      .select({
        id: partOrder.id,
        batchOrderId: partOrder.batchOrderId,
        partId: partOrder.partId,
        quantity: partOrder.quantity,
        unitPrice: partOrder.unitPrice,
        totalPrice: partOrder.totalPrice,
        requestedBy: partOrder.requestedBy,
        requestReason: partOrder.requestReason,
        urgencyLevel: partOrder.urgencyLevel,
        assetId: partOrder.assetId,
        workOrderNumber: partOrder.workOrderNumber,
        receivedQuantity: partOrder.receivedQuantity,
        createdAt: partOrder.createdAt,
        updatedAt: partOrder.updatedAt,
        part: {
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
        },
        requestedByUser: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        asset: {
          id: asset.id,
          name: asset.name,
        },
      })
      .from(partOrder)
      .leftJoin(part, eq(partOrder.partId, part.id))
      .leftJoin(user, eq(partOrder.requestedBy, user.id))
      .leftJoin(asset, eq(partOrder.assetId, asset.id))
      .where(eq(partOrder.batchOrderId, id))

    const result = {
      ...batchOrderData[0],
      partOrders,
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching batch order:", error)
    return NextResponse.json(
      { error: "Failed to fetch batch order" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params
    const body = await request.json()

    const updatedBatchOrder = await db
      .update(batchOrder)
      .set({
        ...body,
        updatedAt: new Date(),
      })
      .where(eq(batchOrder.id, id))
      .returning()

    if (updatedBatchOrder.length === 0) {
      return NextResponse.json(
        { error: "Batch order not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(updatedBatchOrder[0])
  } catch (error) {
    console.error("Error updating batch order:", error)
    return NextResponse.json(
      { error: "Failed to update batch order" },
      { status: 500 }
    )
  }
}