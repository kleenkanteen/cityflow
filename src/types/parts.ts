export interface Supplier {
  id: string
  name: string
  contactName: string | null
  email: string | null
  phone: string | null
  address: string | null
  website: string | null
  notes: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Part {
  id: string
  partNumber: string
  name: string
  description: string | null
  category: string
  manufacturer: string | null
  unitPrice: string | null
  minimumOrderQuantity: number
  leadTimeDays: number
  supplierId: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  supplier?: Supplier
}

export interface BatchOrder {
  id: string
  batchNumber: string
  supplierId: string
  status: 'draft' | 'pending' | 'ordered' | 'received' | 'cancelled'
  totalAmount: string
  orderDate: Date | null
  expectedDeliveryDate: Date | null
  actualDeliveryDate: Date | null
  notes: string | null
  orderedBy: string
  createdAt: Date
  updatedAt: Date
  supplier?: Supplier
  partOrders?: PartOrder[]
}

export interface PartOrder {
  id: string
  batchOrderId: string
  partId: string
  quantity: number
  unitPrice: string
  totalPrice: string
  requestedBy: string
  requestReason: string
  urgencyLevel: 'low' | 'normal' | 'high' | 'critical'
  assetId: string | null
  workOrderNumber: string | null
  receivedQuantity: number
  createdAt: Date
  updatedAt: Date
  part?: Part
  requestedByUser?: {
    id: string
    name: string
    email: string
  }
  asset?: {
    id: string
    name: string
  }
}

export interface CreateSupplierRequest {
  name: string
  contactName?: string
  email?: string
  phone?: string
  address?: string
  website?: string
  notes?: string
}

export interface CreatePartRequest {
  partNumber: string
  name: string
  description?: string
  category: string
  manufacturer?: string
  unitPrice?: number
  minimumOrderQuantity?: number
  leadTimeDays?: number
  supplierId: string
}

export interface CreatePartOrderRequest {
  partId: string
  quantity: number
  requestReason: string
  urgencyLevel: 'low' | 'normal' | 'high' | 'critical'
  assetId?: string
  workOrderNumber?: string
}

export interface CreateBatchOrderRequest {
  supplierId: string
  notes?: string
  expectedDeliveryDate?: Date
}