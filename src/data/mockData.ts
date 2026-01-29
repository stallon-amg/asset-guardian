import { 
  Product, 
  Asset, 
  User, 
  AssetAssignment, 
  ServiceTicket,
  ConsumableStock,
  AssetStatus 
} from '@/types/inventory';

// Mock Users
export const mockUsers: User[] = [
  { id: 'u1', name: 'Sarah Chen', email: 'sarah.chen@company.com', department: 'Engineering', avatarUrl: '' },
  { id: 'u2', name: 'Marcus Johnson', email: 'marcus.j@company.com', department: 'Design', avatarUrl: '' },
  { id: 'u3', name: 'Emily Rodriguez', email: 'emily.r@company.com', department: 'Marketing', avatarUrl: '' },
  { id: 'u4', name: 'David Kim', email: 'david.kim@company.com', department: 'Operations', avatarUrl: '' },
  { id: 'u5', name: 'Lisa Thompson', email: 'lisa.t@company.com', department: 'Finance', avatarUrl: '' },
];

// Mock Products
export const mockProducts: Product[] = [
  { 
    id: 'p1', 
    name: 'MacBook Pro 16"', 
    sku: 'LAPTOP-MBP16', 
    kind: 'ASSET', 
    defaultCost: 2499, 
    reorderLevel: 5,
    category: 'Computers',
    description: 'Apple MacBook Pro 16-inch with M3 Pro chip',
    createdAt: new Date('2024-01-15'), 
    updatedAt: new Date('2024-01-15') 
  },
  { 
    id: 'p2', 
    name: 'Dell UltraSharp 27"', 
    sku: 'MONITOR-DELL27', 
    kind: 'ASSET', 
    defaultCost: 549, 
    reorderLevel: 10,
    category: 'Monitors',
    description: 'Dell UltraSharp 27" 4K USB-C Hub Monitor',
    createdAt: new Date('2024-01-15'), 
    updatedAt: new Date('2024-01-15') 
  },
  { 
    id: 'p3', 
    name: 'Logitech MX Master 3S', 
    sku: 'MOUSE-MXMASTER', 
    kind: 'ASSET', 
    defaultCost: 99, 
    reorderLevel: 15,
    category: 'Peripherals',
    createdAt: new Date('2024-01-15'), 
    updatedAt: new Date('2024-01-15') 
  },
  { 
    id: 'p4', 
    name: 'Standing Desk Pro', 
    sku: 'DESK-STAND-PRO', 
    kind: 'ASSET', 
    defaultCost: 799, 
    reorderLevel: 3,
    category: 'Furniture',
    createdAt: new Date('2024-02-01'), 
    updatedAt: new Date('2024-02-01') 
  },
  { 
    id: 'p5', 
    name: 'USB-C Cable 2m', 
    sku: 'CABLE-USBC-2M', 
    kind: 'CONSUMABLE', 
    defaultCost: 15, 
    reorderLevel: 50,
    category: 'Cables',
    createdAt: new Date('2024-01-20'), 
    updatedAt: new Date('2024-01-20') 
  },
  { 
    id: 'p6', 
    name: 'HP Toner Cartridge', 
    sku: 'TONER-HP-BLK', 
    kind: 'CONSUMABLE', 
    defaultCost: 89, 
    reorderLevel: 10,
    category: 'Printing',
    createdAt: new Date('2024-01-20'), 
    updatedAt: new Date('2024-01-20') 
  },
  { 
    id: 'p7', 
    name: 'AA Batteries (Pack of 4)', 
    sku: 'BATTERY-AA-4PK', 
    kind: 'CONSUMABLE', 
    defaultCost: 8, 
    reorderLevel: 100,
    category: 'Batteries',
    createdAt: new Date('2024-01-25'), 
    updatedAt: new Date('2024-01-25') 
  },
  { 
    id: 'p8', 
    name: 'ThinkPad X1 Carbon', 
    sku: 'LAPTOP-TPX1', 
    kind: 'ASSET', 
    defaultCost: 1899, 
    reorderLevel: 5,
    category: 'Computers',
    createdAt: new Date('2024-02-10'), 
    updatedAt: new Date('2024-02-10') 
  },
];

// Mock Assets
export const mockAssets: Asset[] = [
  { 
    id: 'a1', 
    productId: 'p1', 
    tagNumber: 'AST-001', 
    serialNumber: 'C02ZW1YZMD6M',
    purchaseDate: new Date('2024-01-20'), 
    purchaseCost: 2499, 
    status: 'ASSIGNED',
    currentLocation: 'HQ - Floor 3',
    createdAt: new Date('2024-01-20'), 
    updatedAt: new Date('2024-06-15') 
  },
  { 
    id: 'a2', 
    productId: 'p1', 
    tagNumber: 'AST-002', 
    serialNumber: 'C02ZW1YZMD6N',
    purchaseDate: new Date('2024-01-20'), 
    purchaseCost: 2499, 
    status: 'AVAILABLE',
    currentLocation: 'IT Storage',
    createdAt: new Date('2024-01-20'), 
    updatedAt: new Date('2024-01-20') 
  },
  { 
    id: 'a3', 
    productId: 'p2', 
    tagNumber: 'AST-003',
    purchaseDate: new Date('2024-02-01'), 
    purchaseCost: 549, 
    status: 'ASSIGNED',
    currentLocation: 'HQ - Floor 3',
    createdAt: new Date('2024-02-01'), 
    updatedAt: new Date('2024-06-15') 
  },
  { 
    id: 'a4', 
    productId: 'p2', 
    tagNumber: 'AST-004',
    purchaseDate: new Date('2024-02-01'), 
    purchaseCost: 549, 
    status: 'IN_SERVICE',
    currentLocation: 'Repair Center',
    notes: 'Screen flickering issue',
    createdAt: new Date('2024-02-01'), 
    updatedAt: new Date('2024-11-01') 
  },
  { 
    id: 'a5', 
    productId: 'p3', 
    tagNumber: 'AST-005',
    purchaseDate: new Date('2024-03-01'), 
    purchaseCost: 99, 
    status: 'ASSIGNED',
    currentLocation: 'HQ - Floor 2',
    createdAt: new Date('2024-03-01'), 
    updatedAt: new Date('2024-07-10') 
  },
  { 
    id: 'a6', 
    productId: 'p3', 
    tagNumber: 'AST-006',
    purchaseDate: new Date('2024-03-01'), 
    purchaseCost: 99, 
    status: 'BROKEN',
    currentLocation: 'IT Storage',
    notes: 'Scroll wheel not working',
    createdAt: new Date('2024-03-01'), 
    updatedAt: new Date('2024-10-15') 
  },
  { 
    id: 'a7', 
    productId: 'p4', 
    tagNumber: 'AST-007',
    purchaseDate: new Date('2024-04-01'), 
    purchaseCost: 799, 
    status: 'AVAILABLE',
    currentLocation: 'Warehouse',
    createdAt: new Date('2024-04-01'), 
    updatedAt: new Date('2024-04-01') 
  },
  { 
    id: 'a8', 
    productId: 'p8', 
    tagNumber: 'AST-008', 
    serialNumber: 'PF3K8Y7A',
    purchaseDate: new Date('2024-05-15'), 
    purchaseCost: 1899, 
    status: 'SCRAPPED',
    currentLocation: 'Disposed',
    notes: 'Water damage - beyond repair',
    createdAt: new Date('2024-05-15'), 
    updatedAt: new Date('2024-09-20') 
  },
];

// Mock Asset Assignments
export const mockAssignments: AssetAssignment[] = [
  { 
    id: 'assign1', 
    assetId: 'a1', 
    userId: 'u1', 
    startAt: new Date('2024-06-15'),
    startNote: 'New hire equipment'
  },
  { 
    id: 'assign2', 
    assetId: 'a3', 
    userId: 'u1', 
    startAt: new Date('2024-06-15'),
    startNote: 'Monitor for workstation'
  },
  { 
    id: 'assign3', 
    assetId: 'a5', 
    userId: 'u2', 
    startAt: new Date('2024-07-10'),
    startNote: 'Ergonomic mouse request'
  },
  { 
    id: 'assign4', 
    assetId: 'a2', 
    userId: 'u3', 
    startAt: new Date('2024-03-01'),
    endAt: new Date('2024-08-15'),
    startNote: 'Temporary project assignment',
    returnReason: 'PROJECT_COMPLETE',
    returnNote: 'Project ended, returned in good condition'
  },
];

// Mock Service Tickets
export const mockServiceTickets: ServiceTicket[] = [
  {
    id: 'st1',
    assetId: 'a4',
    issue: 'Screen flickering intermittently',
    vendor: 'Dell Support',
    openedAt: new Date('2024-11-01'),
    cost: 150,
  },
  {
    id: 'st2',
    assetId: 'a6',
    issue: 'Scroll wheel malfunction',
    vendor: 'Logitech RMA',
    openedAt: new Date('2024-10-15'),
    closedAt: new Date('2024-10-25'),
    resolution: 'Replaced under warranty',
    cost: 0,
  },
];

// Mock Consumable Stock
export const mockConsumableStock: ConsumableStock[] = [
  { id: 'cs1', productId: 'p5', quantity: 45, unitCost: 15 },
  { id: 'cs2', productId: 'p6', quantity: 8, unitCost: 89 },
  { id: 'cs3', productId: 'p7', quantity: 120, unitCost: 8 },
];

// Helper functions
export function getProductById(id: string): Product | undefined {
  return mockProducts.find(p => p.id === id);
}

export function getUserById(id: string): User | undefined {
  return mockUsers.find(u => u.id === id);
}

export function getAssetById(id: string): Asset | undefined {
  return mockAssets.find(a => a.id === id);
}

export function getAssetsWithProducts(): (Asset & { product: Product })[] {
  return mockAssets.map(asset => ({
    ...asset,
    product: getProductById(asset.productId)!
  })).filter(a => a.product);
}

export function getActiveAssignments(): (AssetAssignment & { asset: Asset; user: User; product: Product })[] {
  return mockAssignments
    .filter(a => !a.endAt)
    .map(assignment => {
      const asset = getAssetById(assignment.assetId)!;
      const user = getUserById(assignment.userId)!;
      const product = getProductById(asset.productId)!;
      return { ...assignment, asset, user, product };
    })
    .filter(a => a.asset && a.user && a.product);
}

export function getAssetStatusCounts(): Record<AssetStatus, number> {
  const counts: Record<AssetStatus, number> = {
    AVAILABLE: 0,
    ASSIGNED: 0,
    IN_SERVICE: 0,
    BROKEN: 0,
    SCRAPPED: 0,
  };
  mockAssets.forEach(asset => {
    counts[asset.status]++;
  });
  return counts;
}

export function calculateTotalAssetValue(): number {
  const multipliers: Record<AssetStatus, number> = {
    AVAILABLE: 1.0,
    ASSIGNED: 1.0,
    IN_SERVICE: 0.8,
    BROKEN: 0.5,
    SCRAPPED: 0.0,
  };
  return mockAssets.reduce((total, asset) => {
    return total + (asset.purchaseCost * multipliers[asset.status]);
  }, 0);
}

export function calculateTotalConsumableValue(): number {
  return mockConsumableStock.reduce((total, stock) => {
    return total + (stock.quantity * stock.unitCost);
  }, 0);
}

export function getLowStockConsumables(): (ConsumableStock & { product: Product })[] {
  return mockConsumableStock
    .map(stock => ({
      ...stock,
      product: getProductById(stock.productId)!
    }))
    .filter(stock => stock.product && stock.quantity <= stock.product.reorderLevel);
}
