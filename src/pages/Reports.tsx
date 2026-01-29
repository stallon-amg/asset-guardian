import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import { StatusBadge } from '@/components/ui/status-badge';
import {
  DollarSign,
  Monitor,
  Boxes,
  Users,
  FileBarChart,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';
import {
  mockAssets,
  mockProducts,
  mockConsumableStock,
  getAssetStatusCounts,
  calculateTotalAssetValue,
  calculateTotalConsumableValue,
  getActiveAssignments,
  getLowStockConsumables,
  getProductById,
} from '@/data/mockData';
import type { AssetStatus } from '@/types/inventory';
import { STATUS_MULTIPLIERS } from '@/types/inventory';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export default function Reports() {
  const statusCounts = getAssetStatusCounts();
  const totalAssetValue = calculateTotalAssetValue();
  const totalConsumableValue = calculateTotalConsumableValue();
  const totalInventoryValue = totalAssetValue + totalConsumableValue;
  const activeAssignments = getActiveAssignments();
  const lowStockItems = getLowStockConsumables();

  // Calculate value by status
  const valueByStatus: Record<AssetStatus, number> = {
    AVAILABLE: 0,
    ASSIGNED: 0,
    IN_SERVICE: 0,
    BROKEN: 0,
    SCRAPPED: 0,
  };

  mockAssets.forEach(asset => {
    valueByStatus[asset.status] += asset.purchaseCost * STATUS_MULTIPLIERS[asset.status];
  });

  return (
    <div className="p-6 lg:p-8 space-y-8 animate-fade-in">
      <PageHeader
        title="Reports"
        description="Inventory analytics and valuation reports"
      />

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Total Inventory Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatCurrency(totalInventoryValue)}</p>
            <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
              <span>Assets: {formatCurrency(totalAssetValue)}</span>
              <span>Consumables: {formatCurrency(totalConsumableValue)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Monitor className="w-4 h-4" />
              Total Assets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{mockAssets.length}</p>
            <p className="text-sm text-muted-foreground mt-2">
              Across {mockProducts.filter(p => p.kind === 'ASSET').length} product types
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Boxes className="w-4 h-4" />
              Consumable Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {mockConsumableStock.reduce((acc, s) => acc + s.quantity, 0)}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Across {mockProducts.filter(p => p.kind === 'CONSUMABLE').length} product types
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Asset Status Report */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileBarChart className="w-5 h-5" />
            Asset Valuation by Status
          </CardTitle>
          <CardDescription>
            Assets are valued with status-based multipliers to reflect current usability
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium text-right">Count</th>
                  <th className="pb-3 font-medium text-right">Purchase Value</th>
                  <th className="pb-3 font-medium text-right">Multiplier</th>
                  <th className="pb-3 font-medium text-right">Adjusted Value</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {(Object.keys(statusCounts) as AssetStatus[]).map(status => {
                  const purchaseValue = mockAssets
                    .filter(a => a.status === status)
                    .reduce((acc, a) => acc + a.purchaseCost, 0);
                  return (
                    <tr key={status} className="hover:bg-muted/50">
                      <td className="py-3">
                        <StatusBadge status={status} />
                      </td>
                      <td className="py-3 text-right font-medium">{statusCounts[status]}</td>
                      <td className="py-3 text-right text-muted-foreground">
                        {formatCurrency(purchaseValue)}
                      </td>
                      <td className="py-3 text-right text-muted-foreground">
                        {(STATUS_MULTIPLIERS[status] * 100).toFixed(0)}%
                      </td>
                      <td className="py-3 text-right font-semibold">
                        {formatCurrency(valueByStatus[status])}
                      </td>
                    </tr>
                  );
                })}
                <tr className="bg-muted/50 font-bold">
                  <td className="py-3">Total</td>
                  <td className="py-3 text-right">{mockAssets.length}</td>
                  <td className="py-3 text-right">
                    {formatCurrency(mockAssets.reduce((acc, a) => acc + a.purchaseCost, 0))}
                  </td>
                  <td className="py-3 text-right">—</td>
                  <td className="py-3 text-right">{formatCurrency(totalAssetValue)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Two Column Reports */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Active Assignments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Currently Assigned Assets
            </CardTitle>
            <CardDescription>
              Assets currently assigned to employees
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activeAssignments.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No active assignments</p>
            ) : (
              <div className="space-y-3">
                {activeAssignments.map(assignment => (
                  <div
                    key={assignment.id}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{assignment.user.name}</p>
                      <p className="text-sm text-muted-foreground">{assignment.user.department}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{assignment.product.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {assignment.asset.tagNumber}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Low Stock Report */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              Low Stock Consumables
            </CardTitle>
            <CardDescription>
              Items below their reorder threshold
            </CardDescription>
          </CardHeader>
          <CardContent>
            {lowStockItems.length === 0 ? (
              <div className="text-center py-8">
                <TrendingUp className="w-12 h-12 mx-auto text-success/50 mb-3" />
                <p className="font-medium">All stock levels healthy</p>
                <p className="text-sm text-muted-foreground">No items below reorder level</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="pb-2 font-medium">Product</th>
                      <th className="pb-2 font-medium text-right">Current</th>
                      <th className="pb-2 font-medium text-right">Reorder At</th>
                      <th className="pb-2 font-medium text-right">Short</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {lowStockItems.map(item => (
                      <tr key={item.id} className="hover:bg-muted/50">
                        <td className="py-2">{item.product.name}</td>
                        <td className="py-2 text-right font-semibold text-warning">
                          {item.quantity}
                        </td>
                        <td className="py-2 text-right text-muted-foreground">
                          {item.product.reorderLevel}
                        </td>
                        <td className="py-2 text-right text-destructive font-medium">
                          {item.product.reorderLevel - item.quantity}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
