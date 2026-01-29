import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Plus, ArrowUpDown, UserPlus, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getAssetsWithProducts } from '@/data/mockData';
import type { Asset, Product } from '@/types/inventory';
import { format } from 'date-fns';

type AssetWithProduct = Asset & { product: Product };

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
};

const columns: ColumnDef<AssetWithProduct>[] = [
  {
    accessorKey: 'tagNumber',
    header: 'Asset Tag',
    cell: ({ row }) => (
      <span className="font-mono text-sm font-medium">{row.getValue('tagNumber')}</span>
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
      <div>
        <p className="font-medium">{row.original.product.name}</p>
        {row.original.serialNumber && (
          <p className="text-xs text-muted-foreground font-mono">
            S/N: {row.original.serialNumber}
          </p>
        )}
      </div>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <StatusBadge status={row.getValue('status')} />,
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  {
    accessorKey: 'currentLocation',
    header: 'Location',
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {row.getValue('currentLocation') || '—'}
      </span>
    ),
  },
  {
    accessorKey: 'purchaseDate',
    header: 'Purchase Date',
    cell: ({ row }) => format(new Date(row.getValue('purchaseDate')), 'MMM d, yyyy'),
  },
  {
    accessorKey: 'purchaseCost',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="-ml-4"
      >
        Cost
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => formatCurrency(row.getValue('purchaseCost')),
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const asset = row.original;
      const canAssign = asset.status === 'AVAILABLE';
      const canReturn = asset.status === 'ASSIGNED';

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>View Details</DropdownMenuItem>
            <DropdownMenuItem>Edit Asset</DropdownMenuItem>
            <DropdownMenuSeparator />
            {canAssign && (
              <DropdownMenuItem>
                <UserPlus className="w-4 h-4 mr-2" />
                Assign to User
              </DropdownMenuItem>
            )}
            {canReturn && (
              <DropdownMenuItem>
                <RotateCcw className="w-4 h-4 mr-2" />
                Return Asset
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem>View History</DropdownMenuItem>
            <DropdownMenuItem>Service Tickets</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export default function Assets() {
  const assetsWithProducts = getAssetsWithProducts();

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <PageHeader
        title="Assets"
        description="Track and manage all reusable inventory assets"
      >
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Asset
        </Button>
      </PageHeader>

      <DataTable
        columns={columns}
        data={assetsWithProducts}
        searchKey="tagNumber"
        searchPlaceholder="Search by tag number..."
      />
    </div>
  );
}
