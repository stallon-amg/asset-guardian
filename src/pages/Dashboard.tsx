import {
  DollarSign,
  Monitor,
  Boxes,
  AlertTriangle,
  Users,
  TrendingUp,
  Wrench,
  ArrowRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { StatusBadge } from '@/components/ui/status-badge';
import { Link } from 'react-router-dom';
import {
  mockAssets,
  mockProducts,
  getAssetStatusCounts,
  calculateTotalAssetValue,
  calculateTotalConsumableValue,
  getActiveAssignments,
  getLowStockConsumables,
  getProductById,
} from '@/data/mockData';
import type { AssetStatus } from '@/types/inventory';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const statusColors: Record<AssetStatus, string> = {
  AVAILABLE: 'bg-status-available',
  ASSIGNED: 'bg-status-assigned',
  IN_SERVICE: 'bg-status-in-service',
  BROKEN: 'bg-status-broken',
  SCRAPPED: 'bg-status-scrapped',
};

export default function Dashboard() {
  const statusCounts = getAssetStatusCounts();
  const totalAssetValue = calculateTotalAssetValue();
  const totalConsumableValue = calculateTotalConsumableValue();
  const totalInventoryValue = totalAssetValue + totalConsumableValue;
  const activeAssignments = getActiveAssignments();
  const lowStockItems = getLowStockConsumables();

  const assetProducts = mockProducts.filter(p => p.kind === 'ASSET');
  const consumableProducts = mockProducts.filter(p => p.kind === 'CONSUMABLE');

  return (
    <div className="p-6 lg:p-8 space-y-8 animate-fade-in">
      <PageHeader
        title="Dashboard"
        description="Overview of your inventory and asset management"
      >
        <Button asChild>
          <Link to="/assets">
            View All Assets
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </Button>
      </PageHeader>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Inventory Value"
          value={formatCurrency(totalInventoryValue)}
          subtitle={`Assets: ${formatCurrency(totalAssetValue)} | Consumables: ${formatCurrency(totalConsumableValue)}`}
          icon={DollarSign}
          variant="primary"
        />
        <StatCard
          title="Total Assets"
          value={mockAssets.length}
          subtitle={`${assetProducts.length} product types`}
          icon={Monitor}
          variant="success"
        />
        <StatCard
          title="Active Assignments"
          value={activeAssignments.length}
          subtitle="Currently assigned to users"
          icon={Users}
          variant="default"
        />
        <StatCard
          title="Low Stock Alerts"
          value={lowStockItems.length}
          subtitle="Items below reorder level"
          icon={AlertTriangle}
          variant={lowStockItems.length > 0 ? 'warning' : 'default'}
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Asset Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Monitor className="w-5 h-5 text-muted-foreground" />
              Asset Status Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(Object.keys(statusCounts) as AssetStatus[]).map((status) => {
                const count = statusCounts[status];
                const percentage = mockAssets.length > 0 
                  ? (count / mockAssets.length) * 100 
                  : 0;
                return (
                  <div key={status} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <StatusBadge status={status} />
                      <span className="text-sm font-medium">{count}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full ${statusColors[status]} transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="w-5 h-5 text-muted-foreground" />
              Inventory Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold text-primary">{assetProducts.length}</p>
                <p className="text-sm text-muted-foreground">Asset Types</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold text-warning">{consumableProducts.length}</p>
                <p className="text-sm text-muted-foreground">Consumable Types</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold text-success">{statusCounts.AVAILABLE}</p>
                <p className="text-sm text-muted-foreground">Available Assets</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold text-destructive">{statusCounts.IN_SERVICE + statusCounts.BROKEN}</p>
                <p className="text-sm text-muted-foreground">Need Attention</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tables Row */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Active Assignments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="w-5 h-5 text-muted-foreground" />
              Active Assignments
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/assets">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {activeAssignments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No active assignments
              </p>
            ) : (
              <div className="space-y-3">
                {activeAssignments.slice(0, 5).map((assignment) => (
                  <div
                    key={assignment.id}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">
                          {assignment.user.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{assignment.user.name}</p>
                        <p className="text-xs text-muted-foreground">{assignment.product.name}</p>
                      </div>
                    </div>
                    <span className="text-xs font-mono text-muted-foreground">
                      {assignment.asset.tagNumber}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Low Stock Consumables */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Boxes className="w-5 h-5 text-muted-foreground" />
              Low Stock Alerts
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/consumables">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {lowStockItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mb-3">
                  <Boxes className="w-6 h-6 text-success" />
                </div>
                <p className="text-sm font-medium">All stock levels healthy</p>
                <p className="text-xs text-muted-foreground">No items below reorder level</p>
              </div>
            ) : (
              <div className="space-y-3">
                {lowStockItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-warning/5 border border-warning/20 rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-medium">{item.product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Reorder at: {item.product.reorderLevel}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-warning">{item.quantity}</p>
                      <p className="text-xs text-muted-foreground">in stock</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
