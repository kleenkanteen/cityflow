export interface Complaint {
  id: string;
  name: string | null;
  email: string | null;
  description: string;
  location: string;
  imageUrl: string | null;
  status: 'pending' | 'in_progress' | 'resolved';
  createdAt: Date;
  updatedAt: Date;
  reviewed: boolean;
  resolved?: Date | string | null;
}

export interface CreateComplaintRequest {
  name?: string;
  email?: string;
  description: string;
  location: string;
  imageUrl?: string;
}

export interface UpdateComplaintRequest {
  id: string;
  status?: 'pending' | 'in_progress' | 'resolved';
  reviewed?: boolean;
}