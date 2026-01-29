import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Plus, ArrowUpDown, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { mockConsumableStock, getProductById } from '@/data/mockData';
import type { ConsumableStock, Product } from '@/types/inventory';
import { cn } from '@/lib/utils';

type ConsumableWithProduct = ConsumableStock & { product: Product };

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
};

const consumablesWithProducts: ConsumableWithProduct[] = mockConsumableStock
  .map(stock => ({
    ...stock,
    product: getProductById(stock.productId)!
  }))
  .filter(s => s.product);

const columns: ColumnDef<ConsumableWithProduct>[] = [
  {
    accessorKey: 'product.sku',
    header: 'SKU',
    cell: ({ row }) => (
      <span className="font-mono text-sm">{row.original.product.sku}</span>
    ),
  },
  {
    accessorKey: 'product.name',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="-ml-4"
      >
        Product
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <p className="font-medium">{row.original.product.name}</p>
    ),
  },
  {
    accessorKey: 'quantity',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="-ml-4"
      >
        Quantity
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const quantity = row.getValue('quantity') as number;
      const reorderLevel = row.original.product.reorderLevel;
      const isLow = quantity <= reorderLevel;

      return (
        <div className="flex items-center gap-2">
          <span className={cn('font-semibold', isLow && 'text-warning')}>
            {quantity}
          </span>
          {isLow && (
            <Badge variant="outline" className="text-warning border-warning/50 bg-warning/10">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Low
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'product.reorderLevel',
    header: 'Reorder Level',
    cell: ({ row }) => row.original.product.reorderLevel,
  },
  {
    accessorKey: 'unitCost',
    header: 'Unit Cost',
    cell: ({ row }) => formatCurrency(row.getValue('unitCost')),
  },
  {
    id: 'totalValue',
    header: 'Total Value',
    cell: ({ row }) => formatCurrency(row.original.quantity * row.original.unitCost),
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>View Details</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <TrendingUp className="w-4 h-4 mr-2" />
            Receive Stock
          </DropdownMenuItem>
          <DropdownMenuItem>
            <TrendingDown className="w-4 h-4 mr-2" />
            Issue Stock
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>View Movements</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];

export default function Consumables() {
  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <PageHeader
        title="Consumables"
        description="Manage consumable inventory and stock levels"
      >
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Consumable
        </Button>
      </PageHeader>

      <DataTable
        columns={columns}
        data={consumablesWithProducts}
        searchKey="product.name"
        searchPlaceholder="Search consumables..."
      />
    </div>
  );
}
