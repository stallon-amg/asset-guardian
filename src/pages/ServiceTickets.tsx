import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Plus, ArrowUpDown, CheckCircle2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { mockServiceTickets, getAssetById, getProductById } from '@/data/mockData';
import type { ServiceTicket, Asset, Product } from '@/types/inventory';
import { format } from 'date-fns';

type TicketWithDetails = ServiceTicket & { asset: Asset; product: Product };

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
};

const ticketsWithDetails: TicketWithDetails[] = mockServiceTickets
  .map(ticket => {
    const asset = getAssetById(ticket.assetId)!;
    const product = asset ? getProductById(asset.productId)! : null;
    return { ...ticket, asset, product: product! };
  })
  .filter(t => t.asset && t.product);

const columns: ColumnDef<TicketWithDetails>[] = [
  {
    accessorKey: 'id',
    header: 'Ticket ID',
    cell: ({ row }) => (
      <span className="font-mono text-sm">{row.getValue('id')}</span>
    ),
  },
  {
    accessorKey: 'asset.tagNumber',
    header: 'Asset',
    cell: ({ row }) => (
      <div>
        <p className="font-medium">{row.original.product.name}</p>
        <p className="text-xs text-muted-foreground font-mono">
          {row.original.asset.tagNumber}
        </p>
      </div>
    ),
  },
  {
    accessorKey: 'issue',
    header: 'Issue',
    cell: ({ row }) => (
      <p className="max-w-[300px] truncate">{row.getValue('issue')}</p>
    ),
  },
  {
    id: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const isOpen = !row.original.closedAt;
      return (
        <Badge 
          variant="outline" 
          className={isOpen 
            ? 'text-warning border-warning/50 bg-warning/10' 
            : 'text-success border-success/50 bg-success/10'
          }
        >
          {isOpen ? (
            <>
              <Clock className="w-3 h-3 mr-1" />
              Open
            </>
          ) : (
            <>
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Closed
            </>
          )}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'vendor',
    header: 'Vendor',
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {row.getValue('vendor') || '—'}
      </span>
    ),
  },
  {
    accessorKey: 'openedAt',
    header: 'Opened',
    cell: ({ row }) => format(new Date(row.getValue('openedAt')), 'MMM d, yyyy'),
  },
  {
    accessorKey: 'cost',
    header: 'Cost',
    cell: ({ row }) => {
      const cost = row.getValue('cost') as number | undefined;
      return cost !== undefined ? formatCurrency(cost) : '—';
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const isOpen = !row.original.closedAt;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>View Details</DropdownMenuItem>
            {isOpen && <DropdownMenuItem>Close Ticket</DropdownMenuItem>}
            <DropdownMenuItem>View Asset</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export default function ServiceTickets() {
  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <PageHeader
        title="Service Tickets"
        description="Track repairs and service for assets"
      >
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Ticket
        </Button>
      </PageHeader>

      <DataTable
        columns={columns}
        data={ticketsWithDetails}
        searchKey="issue"
        searchPlaceholder="Search tickets..."
      />
    </div>
  );
}
