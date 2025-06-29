export interface InventoryItem {
  id: string;
  name: string;
  description: string | null;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateInventoryItemRequest {
  name: string;
  description?: string;
  quantity: number;
}

export interface UpdateInventoryItemRequest {
  id: string;
  name?: string;
  description?: string;
  quantity?: number;
}