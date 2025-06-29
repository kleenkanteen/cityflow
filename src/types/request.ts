export interface EquipmentRequest {
  id: string;
  requestorEmail: string;
  inventoryId: string;
  inventoryItemName: string;
  quantity: number;
  startDate: Date;
  endDate: Date;
  status: 'pending' | 'approved' | 'denied';
  denialReason: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateEquipmentRequestRequest {
  requestorEmail: string;
  inventoryId: string;
  inventoryItemName: string;
  quantity: number;
  startDate: Date;
  endDate: Date;
}

export interface UpdateRequestStatusRequest {
  id: string;
  status: 'approved' | 'denied';
  denialReason?: string;
}