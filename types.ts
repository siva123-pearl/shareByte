
export enum UserRole {
  DONOR = 'DONOR',
  RECIPIENT = 'RECIPIENT',
  ADMIN = 'ADMIN'
}

export interface FoodVan {
  id: string;
  name: string;
  currentLocation: {
    lat: number;
    lng: number;
    address: string;
  };
  status: 'traveling' | 'parked' | 'maintenance';
  lastUpdated: string;
  nextStop?: string;
}

export interface FoodItem {
  id: string;
  name: string;
  category: string;
  quantity: string;
  expiryDate: string;
  description: string;
  donorId: string;
  status: 'available' | 'reserved' | 'completed';
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  imageUrl?: string;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  sources?: GroundingSource[];
}
