import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Plus, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { mockProducts } from '@/data/mockData';
import type { Product } from '@/types/inventory';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
};

const columns: ColumnDef<Product>[] = [
  {
    accessorKey: 'sku',
    header: 'SKU',
    cell: ({ row }) => (
      <span className="font-mono text-sm">{row.getValue('sku')}</span>
    ),
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="-ml-4"
      >
        Product Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div>
        <p className="font-medium">{row.getValue('name')}</p>
        {row.original.description && (
          <p className="text-xs text-muted-foreground truncate max-w-[300px]">
            {row.original.description}
          </p>
        )}
      </div>
    ),
  },
  {
    accessorKey: 'kind',
    header: 'Type',
    cell: ({ row }) => <StatusBadge kind={row.getValue('kind')} />,
  },
  {
    accessorKey: 'category',
    header: 'Category',
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {row.getValue('category') || '—'}
      </span>
    ),
  },
  {
    accessorKey: 'defaultCost',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="-ml-4"
      >
        Default Cost
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => formatCurrency(row.getValue('defaultCost')),
  },
  {
    accessorKey: 'reorderLevel',
    header: 'Reorder Level',
    cell: ({ row }) => row.getValue('reorderLevel'),
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
          <DropdownMenuItem>Edit Product</DropdownMenuItem>
          <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];

export default function Products() {
  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <PageHeader
        title="Products"
        description="Manage your product catalog for assets and consumables"
      >
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </PageHeader>

      <DataTable
        columns={columns}
        data={mockProducts}
        searchKey="name"
        searchPlaceholder="Search products..."
      />
    </div>
  );
}
