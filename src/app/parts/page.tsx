"use client"

import React from "react"
import { Package, RefreshCw, ArrowLeft, ShoppingCart, Truck, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import Link from "next/link"
import { Supplier, Part, BatchOrder } from "@/src/types/parts"
import { AddSupplierDialog } from "@/src/components/parts/add-supplier-dialog"
import { AddPartDialog } from "@/src/components/parts/add-part-dialog"
import { AddPartOrderDialog } from "@/src/components/parts/add-part-order-dialog"
import { toast } from "sonner"

export default function PartsPage() {
  const [suppliers, setSuppliers] = React.useState<Supplier[]>([])
  const [parts, setParts] = React.useState<Part[]>([])
  const [batchOrders, setBatchOrders] = React.useState<BatchOrder[]>([])
  const [assets, setAssets] = React.useState<Array<{ id: string; name: string }>>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [searchTerm, setSearchTerm] = React.useState("")
  const [selectedSupplier, setSelectedSupplier] = React.useState("")
  const [selectedCategory, setSelectedCategory] = React.useState("")

  async function fetchSuppliers() {
    try {
      const response = await fetch("/api/suppliers?activeOnly=true")
      if (!response.ok) throw new Error("Failed to fetch suppliers")
      const data = await response.json()
      setSuppliers(data)
    } catch (error) {
      console.error("Error fetching suppliers:", error)
      toast.error("Failed to fetch suppliers")
    }
  }

  async function fetchParts() {
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.append("search", searchTerm)
      if (selectedSupplier) params.append("supplierId", selectedSupplier)
      if (selectedCategory) params.append("category", selectedCategory)
      params.append("activeOnly", "true")

      const response = await fetch(`/api/parts?${params}`)
      if (!response.ok) throw new Error("Failed to fetch parts")
      const data = await response.json()
      setParts(data)
    } catch (error) {
      console.error("Error fetching parts:", error)
      toast.error("Failed to fetch parts")
    }
  }

  async function fetchBatchOrders() {
    try {
      const response = await fetch("/api/batch-orders")
      if (!response.ok) throw new Error("Failed to fetch batch orders")
      const data = await response.json()
      setBatchOrders(data)
    } catch (error) {
      console.error("Error fetching batch orders:", error)
      toast.error("Failed to fetch batch orders")
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

  async function createBatchOrder(supplierId: string) {
    try {
      const response = await fetch("/api/batch-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ supplierId }),
      })
      if (!response.ok) throw new Error("Failed to create batch order")
      await fetchBatchOrders()
      toast.success("Batch order created successfully!")
    } catch (error) {
      console.error("Error creating batch order:", error)
      toast.error("Failed to create batch order")
    }
  }

  React.useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      await Promise.all([
        fetchSuppliers(),
        fetchParts(),
        fetchBatchOrders(),
        fetchAssets(),
      ])
      setIsLoading(false)
    }
    loadData()
  }, [])

  React.useEffect(() => {
    fetchParts()
  }, [searchTerm, selectedSupplier, selectedCategory])

  function handleRefresh() {
    fetchSuppliers()
    fetchParts()
    fetchBatchOrders()
  }

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

  const categories = [...new Set(parts.map(p => p.category))].sort()
  const draftOrders = batchOrders.filter(order => order.status === "draft")

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Link href="/dashboard">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Package className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-3xl font-bold text-gray-900">
                    Parts Management
                  </CardTitle>
                  <CardDescription className="text-gray-600 mt-1">
                    Manage parts catalog, suppliers, and batch orders
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  onClick={handleRefresh}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                  />
                  Refresh
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardDescription className="text-sm font-medium text-gray-600">
                    Total Parts
                  </CardDescription>
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    {parts.length}
                  </CardTitle>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardDescription className="text-sm font-medium text-gray-600">
                    Active Suppliers
                  </CardDescription>
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    {suppliers.length}
                  </CardTitle>
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                  <Truck className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardDescription className="text-sm font-medium text-gray-600">
                    Draft Orders
                  </CardDescription>
                  <CardTitle className="text-2xl font-bold text-orange-600">
                    {draftOrders.length}
                  </CardTitle>
                </div>
                <div className="bg-orange-100 p-3 rounded-lg">
                  <ShoppingCart className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardDescription className="text-sm font-medium text-gray-600">
                    Total Orders
                  </CardDescription>
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    {batchOrders.length}
                  </CardTitle>
                </div>
                <div className="bg-purple-100 p-3 rounded-lg">
                  <ShoppingCart className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="parts" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="parts">Parts Catalog</TabsTrigger>
            <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
            <TabsTrigger value="orders">Batch Orders</TabsTrigger>
            <TabsTrigger value="create-order">Create Order</TabsTrigger>
          </TabsList>

          <TabsContent value="parts">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Parts Catalog</CardTitle>
                  <AddPartDialog suppliers={suppliers} onPartAdded={fetchParts} />
                </div>
                <div className="flex gap-4 mt-4">
                  <Input
                    placeholder="Search parts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                  <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="All suppliers" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All suppliers</SelectItem>
                      {suppliers.map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id}>
                          {supplier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Part Number</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Manufacturer</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Unit Price</TableHead>
                      <TableHead>Min Order</TableHead>
                      <TableHead>Lead Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parts.map((part) => (
                      <TableRow key={part.id}>
                        <TableCell className="font-medium">{part.partNumber}</TableCell>
                        <TableCell>{part.name}</TableCell>
                        <TableCell>{part.category}</TableCell>
                        <TableCell>{part.manufacturer || "-"}</TableCell>
                        <TableCell>{part.supplier?.name}</TableCell>
                        <TableCell>${part.unitPrice || "N/A"}</TableCell>
                        <TableCell>{part.minimumOrderQuantity}</TableCell>
                        <TableCell>{part.leadTimeDays} days</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="suppliers">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Suppliers</CardTitle>
                  <AddSupplierDialog onSupplierAdded={fetchSuppliers} />
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Parts Count</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {suppliers.map((supplier) => (
                      <TableRow key={supplier.id}>
                        <TableCell className="font-medium">{supplier.name}</TableCell>
                        <TableCell>{supplier.contactName || "-"}</TableCell>
                        <TableCell>{supplier.email || "-"}</TableCell>
                        <TableCell>{supplier.phone || "-"}</TableCell>
                        <TableCell>
                          {parts.filter(p => p.supplierId === supplier.id).length}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            onClick={() => createBatchOrder(supplier.id)}
                          >
                            Create Order
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Batch Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Batch Number</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Total Amount</TableHead>
                      <TableHead>Order Date</TableHead>
                      <TableHead>Expected Delivery</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {batchOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.batchNumber}</TableCell>
                        <TableCell>{order.supplier?.name}</TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell>${order.totalAmount}</TableCell>
                        <TableCell>
                          {order.orderDate ? new Date(order.orderDate).toLocaleDateString() : "-"}
                        </TableCell>
                        <TableCell>
                          {order.expectedDeliveryDate 
                            ? new Date(order.expectedDeliveryDate).toLocaleDateString() 
                            : "-"}
                        </TableCell>
                        <TableCell>
                          <Link href={`/parts/orders/${order.id}`}>
                            <Button size="sm" variant="outline">
                              View Details
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="create-order">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Create New Batch Order</CardTitle>
                  <CardDescription>
                    Select a supplier to create a new batch order. You can then add parts to the order.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {suppliers.map((supplier) => (
                      <div
                        key={supplier.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div>
                          <h3 className="font-medium">{supplier.name}</h3>
                          <p className="text-sm text-gray-600">
                            {supplier.contactName && `Contact: ${supplier.contactName}`}
                            {supplier.email && ` | ${supplier.email}`}
                          </p>
                          <p className="text-xs text-gray-500">
                            {parts.filter(p => p.supplierId === supplier.id).length} parts available
                          </p>
                        </div>
                        <Button onClick={() => createBatchOrder(supplier.id)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Create Order
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {draftOrders.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Draft Orders</CardTitle>
                    <CardDescription>
                      Continue working on these draft orders by adding parts.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                      {draftOrders.map((order) => (
                        <div
                          key={order.id}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div>
                            <h3 className="font-medium">{order.batchNumber}</h3>
                            <p className="text-sm text-gray-600">
                              Supplier: {order.supplier?.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              Total: ${order.totalAmount}
                            </p>
                          </div>
                          <Link href={`/parts/orders/${order.id}`}>
                            <Button variant="outline">
                              Continue Order
                            </Button>
                          </Link>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}