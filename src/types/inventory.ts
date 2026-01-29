// Core domain types for Inventory Management System

export type ProductKind = 'ASSET' | 'CONSUMABLE';

export type AssetStatus = 
  | 'AVAILABLE' 
  | 'ASSIGNED' 
  | 'IN_SERVICE' 
  | 'BROKEN' 
  | 'SCRAPPED';

export interface Product {
  id: string;
  name: string;
  sku: string;
  kind: ProductKind;
  defaultCost: number;
  reorderLevel: number;
  category?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Asset {
  id: string;
  productId: string;
  product?: Product;
  serialNumber?: string;
  tagNumber: string;
  purchaseDate: Date;
  purchaseCost: number;
  status: AssetStatus;
  currentLocation?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
  department?: string;
  avatarUrl?: string;
}

export interface AssetAssignment {
  id: string;
  assetId: string;
  asset?: Asset;
  userId: string;
  user?: User;
  startAt: Date;
  endAt?: Date;
  startNote?: string;
  returnReason?: string;
  returnNote?: string;
}

export interface ServiceTicket {
  id: string;
  assetId: string;
  asset?: Asset;
  issue: string;
  vendor?: string;
  openedAt: Date;
  closedAt?: Date;
  resolution?: string;
  cost?: number;
}

export interface Maintenance {
  id: string;
  assetId: string;
  asset?: Asset;
  type: string;
  performedAt: Date;
  nextDueAt?: Date;
  note?: string;
}

export interface ConsumableStock {
  id: string;
  productId: string;
  product?: Product;
  locationId?: string;
  quantity: number;
  unitCost: number;
}

export interface StockMovement {
  id: string;
  productId: string;
  type: 'RECEIVE' | 'ISSUE' | 'ADJUST';
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  note?: string;
  performedBy?: string;
  performedAt: Date;
}

// Status value multipliers for valuation
export const STATUS_MULTIPLIERS: Record<AssetStatus, number> = {
  AVAILABLE: 1.0,
  ASSIGNED: 1.0,
  IN_SERVICE: 0.8,
  BROKEN: 0.5,
  SCRAPPED: 0.0,
};

// Utility types for forms and filters
export interface ProductFilters {
  kind?: ProductKind;
  search?: string;
}

export interface AssetFilters {
  status?: AssetStatus;
  productId?: string;
  search?: string;
}
