"use client"

import React from "react"
import { Package, ArrowLeft, Plus, Trash2, Send, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import { BatchOrder, Part } from "@/src/types/parts"
import { AddPartOrderDialog } from "@/src/components/parts/add-part-order-dialog"
import { toast } from "sonner"

interface BatchOrderDetailsPageProps {
  params: { id: string }
}

export default function BatchOrderDetailsPage({ params }: BatchOrderDetailsPageProps) {
  const [batchOrder, setBatchOrder] = React.useState<BatchOrder | null>(null)
  const [parts, setParts] = React.useState<Part[]>([])
  const [assets, setAssets] = React.useState<Array<{ id: string; name: string }>>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [isUpdating, setIsUpdating] = React.useState(false)
  const [notes, setNotes] = React.useState("")
  const [expectedDeliveryDate, setExpectedDeliveryDate] = React.useState("")

  async function fetchBatchOrder() {
    try {
      const response = await fetch(`/api/batch-orders/${params.id}`)
      if (!response.ok) throw new Error("Failed to fetch batch order")
      const data = await response.json()
      setBatchOrder(data)
      setNotes(data.notes || "")
      setExpectedDeliveryDate(
        data.expectedDeliveryDate 
          ? new Date(data.expectedDeliveryDate).toISOString().split('T')[0]
          : ""
      )
    } catch (error) {
      console.error("Error fetching batch order:", error)
      toast.error("Failed to fetch batch order")
    }
  }

  async function fetchParts() {
    try {
      if (!batchOrder?.supplierId) return
      const response = await fetch(`/api/parts?supplierId=${batchOrder.supplierId}&activeOnly=true`)
      if (!response.ok) throw new Error("Failed to fetch parts")
      const data = await response.json()
      setParts(data)
    } catch (error) {
      console.error("Error fetching parts:", error)
      toast.error("Failed to fetch parts")
    }
  }

  async function fetchAssets() {
    try {
      const response = await fetch("/api/assets/all")
      if (!response.ok) throw new Error("Failed to fetch assets")
      const data = await response.json()
      setAssets(data.map((asset: any) => ({ id: asset.id, name: asset.name })))
    } catch (error) {
      console.error("Error fetching assets:", error)
    }
  }

  async function updateBatchOrder() {
    if (!batchOrder) return
    
    setIsUpdating(true)
    try {
      const response = await fetch(`/api/batch-orders/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notes: notes || null,
          expectedDeliveryDate: expectedDeliveryDate ? new Date(expectedDeliveryDate) : null,
        }),
      })
      if (!response.ok) throw new Error("Failed to update batch order")
      await fetchBatchOrder()
      toast.success("Batch order updated successfully!")
    } catch (error) {
      console.error("Error updating batch order:", error)
      toast.error("Failed to update batch order")
    } finally {
      setIsUpdating(false)
    }
  }

  async function submitOrder() {
    if (!batchOrder) return
    
    setIsUpdating(true)
    try {
      const response = await fetch(`/api/batch-orders/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "pending",
          orderDate: new Date(),
        }),
      })
      if (!response.ok) throw new Error("Failed to submit order")
      await fetchBatchOrder()
      toast.success("Order submitted successfully!")
    } catch (error) {
      console.error("Error submitting order:", error)
      toast.error("Failed to submit order")
    } finally {
      setIsUpdating(false)
    }
  }

  React.useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      await fetchBatchOrder()
      await fetchAssets()
      setIsLoading(false)
    }
    loadData()
  }, [params.id])

  React.useEffect(() => {
    if (batchOrder?.supplierId) {
      fetchParts()
    }
  }, [batchOrder?.supplierId])

  function getStatusBadge(status: string) {
    switch (status) {
      case "draft":
        return <Badge variant="secondary">Draft</Badge>
      case "pending":
        return <Badge variant="secondary">Pending</Badge>
      case "ordered":
        return <Badge variant="default">Ordered</Badge>
      case "received":
        return <Badge variant="reviewed">Received</Badge>
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  function getUrgencyBadge(urgency: string) {
    switch (urgency) {
      case "low":
        return <Badge variant="secondary">Low</Badge>
      case "normal":
        return <Badge variant="default">Normal</Badge>
      case "high":
        return <Badge variant="secondary" className="bg-orange-100 text-orange-600">High</Badge>
      case "critical":
        return <Badge variant="destructive">Critical</Badge>
      default:
        return <Badge variant="secondary">{urgency}</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading batch order...</p>
        </div>
      </div>
    )
  }

  if (!batchOrder) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Batch order not found</p>
          <Link href="/parts">
            <Button className="mt-4">Back to Parts</Button>
          </Link>
        </div>
      </div>
    )
  }

  const canEdit = batchOrder.status === "draft"
  const totalItems = batchOrder.partOrders?.reduce((sum, order) => sum + order.quantity, 0) || 0

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Link href="/parts">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Parts
                  </Button>
                </Link>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Package className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-3xl font-bold text-gray-900">
                    {batchOrder.batchNumber}
                  </CardTitle>
                  <CardDescription className="text-gray-600 mt-1">
                    Batch order for {batchOrder.supplier?.name}
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {getStatusBadge(batchOrder.status)}
                {canEdit && batchOrder.partOrders && batchOrder.partOrders.length > 0 && (
                  <Button onClick={submitOrder} disabled={isUpdating}>
                    <Send className="h-4 w-4 mr-2" />
                    Submit Order
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Order Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Supplier</Label>
                  <p className="font-medium">{batchOrder.supplier?.name}</p>
                  {batchOrder.supplier?.contactName && (
                    <p className="text-sm text-gray-600">
                      Contact: {batchOrder.supplier.contactName}
                    </p>
                  )}
                  {batchOrder.supplier?.email && (
                    <p className="text-sm text-gray-600">{batchOrder.supplier.email}</p>
                  )}
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-600">Total Amount</Label>
                  <p className="text-2xl font-bold text-green-600">${batchOrder.totalAmount}</p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-600">Total Items</Label>
                  <p className="font-medium">{totalItems}</p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-600">Created</Label>
                  <p className="text-sm">{new Date(batchOrder.createdAt).toLocaleString()}</p>
                </div>

                {batchOrder.orderDate && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Order Date</Label>
                    <p className="text-sm">{new Date(batchOrder.orderDate).toLocaleString()}</p>
                  </div>
                )}

                <div>
                  <Label htmlFor="expectedDelivery" className="text-sm font-medium text-gray-600">
                    Expected Delivery Date
                  </Label>
                  <Input
                    id="expectedDelivery"
                    type="date"
                    value={expectedDeliveryDate}
                    onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                    disabled={!canEdit}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="notes" className="text-sm font-medium text-gray-600">
                    Notes
                  </Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    disabled={!canEdit}
                    rows={3}
                    className="mt-1"
                    placeholder="Add notes about this order..."
                  />
                </div>

                {canEdit && (
                  <Button
                    onClick={updateBatchOrder}
                    disabled={isUpdating}
                    className="w-full"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Update Order Details
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Parts List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Parts in Order</CardTitle>
                  {canEdit && (
                    <AddPartOrderDialog
                      batchOrderId={batchOrder.id}
                      parts={parts}
                      assets={assets}
                      onPartOrderAdded={fetchBatchOrder}
                    />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {!batchOrder.partOrders || batchOrder.partOrders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No parts added to this order yet.</p>
                    {canEdit && (
                      <p className="text-sm text-gray-400 mt-2">
                        Click "Add Part to Order" to get started.
                      </p>
                    )}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Part</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Unit Price</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Urgency</TableHead>
                        <TableHead>Requested By</TableHead>
                        <TableHead>Reason</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {batchOrder.partOrders.map((partOrder) => (
                        <TableRow key={partOrder.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">
                                {partOrder.part?.partNumber} - {partOrder.part?.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {partOrder.part?.category}
                              </p>
                              {partOrder.asset && (
                                <p className="text-xs text-blue-600">
                                  Asset: {partOrder.asset.name}
                                </p>
                              )}
                              {partOrder.workOrderNumber && (
                                <p className="text-xs text-purple-600">
                                  WO: {partOrder.workOrderNumber}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{partOrder.quantity}</TableCell>
                          <TableCell>${partOrder.unitPrice}</TableCell>
                          <TableCell className="font-medium">
                            ${partOrder.totalPrice}
                          </TableCell>
                          <TableCell>
                            {getUrgencyBadge(partOrder.urgencyLevel)}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="text-sm font-medium">
                                {partOrder.requestedByUser?.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {partOrder.requestedByUser?.email}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <p className="text-sm max-w-xs truncate" title={partOrder.requestReason}>
                              {partOrder.requestReason}
                            </p>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}