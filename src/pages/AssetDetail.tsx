import { useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import {
  ArrowLeft,
  Monitor,
  MapPin,
  Calendar,
  DollarSign,
  User,
  Wrench,
  History,
  FileText,
  UserPlus,
  RotateCcw,
  Settings,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import { StatusBadge } from '@/components/ui/status-badge';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  getAssetById,
  getProductById,
  mockAssignments,
  mockServiceTickets,
  getUserById,
} from '@/data/mockData';
import type { AssetAssignment, ServiceTicket, Maintenance } from '@/types/inventory';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
};

// Mock maintenance data for demo
const mockMaintenance: Maintenance[] = [
  {
    id: 'm1',
    assetId: 'a1',
    type: 'Battery Replacement',
    performedAt: new Date('2024-09-15'),
    nextDueAt: new Date('2025-09-15'),
    note: 'Replaced battery under AppleCare',
  },
  {
    id: 'm2',
    assetId: 'a1',
    type: 'System Update',
    performedAt: new Date('2024-11-01'),
    note: 'Updated to macOS Sequoia',
  },
];

export default function AssetDetail() {
  const { id } = useParams<{ id: string }>();
  const asset = id ? getAssetById(id) : undefined;
  const product = asset ? getProductById(asset.productId) : undefined;

  if (!asset || !product) {
    return (
      <div className="p-6 lg:p-8 animate-fade-in">
        <div className="text-center py-12">
          <Monitor className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Asset Not Found</h2>
          <p className="text-muted-foreground mb-4">The requested asset could not be found.</p>
          <Button asChild>
            <Link to="/assets">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Assets
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  // Get assignment history for this asset
  const assignmentHistory = mockAssignments
    .filter(a => a.assetId === asset.id)
    .map(a => ({
      ...a,
      user: getUserById(a.userId),
    }))
    .sort((a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime());

  // Get service tickets for this asset
  const serviceTickets = mockServiceTickets
    .filter(t => t.assetId === asset.id)
    .sort((a, b) => new Date(b.openedAt).getTime() - new Date(a.openedAt).getTime());

  // Get maintenance records for this asset
  const maintenanceRecords = mockMaintenance
    .filter(m => m.assetId === asset.id)
    .sort((a, b) => new Date(b.performedAt).getTime() - new Date(a.performedAt).getTime());

  const canAssign = asset.status === 'AVAILABLE';
  const canReturn = asset.status === 'ASSIGNED';

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      {/* Back Navigation */}
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link to="/assets">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Assets
        </Link>
      </Button>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">{product.name}</h1>
            <StatusBadge status={asset.status} />
          </div>
          <p className="text-muted-foreground font-mono">{asset.tagNumber}</p>
        </div>
        <div className="flex items-center gap-2">
          {canAssign && (
            <Button>
              <UserPlus className="w-4 h-4 mr-2" />
              Assign
            </Button>
          )}
          {canReturn && (
            <Button variant="outline">
              <RotateCcw className="w-4 h-4 mr-2" />
              Return
            </Button>
          )}
          <Button variant="outline" size="icon">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Asset Info Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Monitor className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Product</p>
                <p className="font-medium">{product.name}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-info/10">
                <MapPin className="w-5 h-5 text-info" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="font-medium">{asset.currentLocation || 'Unknown'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <DollarSign className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Purchase Cost</p>
                <p className="font-medium">{formatCurrency(asset.purchaseCost)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10">
                <Calendar className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Purchase Date</p>
                <p className="font-medium">{format(new Date(asset.purchaseDate), 'MMM d, yyyy')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Details Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Asset Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">Serial Number</p>
              <p className="font-mono">{asset.serialNumber || '—'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tag Number</p>
              <p className="font-mono">{asset.tagNumber}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Category</p>
              <p>{product.category || '—'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">SKU</p>
              <p className="font-mono">{product.sku}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Created</p>
              <p>{format(new Date(asset.createdAt), 'MMM d, yyyy')}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Last Updated</p>
              <p>{format(new Date(asset.updatedAt), 'MMM d, yyyy')}</p>
            </div>
          </div>
          {asset.notes && (
            <>
              <Separator className="my-4" />
              <div>
                <p className="text-sm text-muted-foreground mb-1">Notes</p>
                <p className="text-sm">{asset.notes}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Tabs for History, Service, Maintenance */}
      <Tabs defaultValue="history" className="space-y-4">
        <TabsList>
          <TabsTrigger value="history" className="gap-2">
            <History className="w-4 h-4" />
            Assignment History
          </TabsTrigger>
          <TabsTrigger value="service" className="gap-2">
            <Wrench className="w-4 h-4" />
            Service Tickets
          </TabsTrigger>
          <TabsTrigger value="maintenance" className="gap-2">
            <FileText className="w-4 h-4" />
            Maintenance
          </TabsTrigger>
        </TabsList>

        {/* Assignment History */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="w-5 h-5" />
                Assignment History
              </CardTitle>
              <CardDescription>
                Complete history of who has been assigned this asset
              </CardDescription>
            </CardHeader>
            <CardContent>
              {assignmentHistory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <History className="w-10 h-10 mx-auto mb-3 opacity-50" />
                  <p>No assignment history for this asset</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {assignmentHistory.map((assignment, index) => (
                    <div
                      key={assignment.id}
                      className="relative pl-6 pb-4 border-l-2 border-muted last:pb-0"
                    >
                      <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-background border-2 border-primary" />
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{assignment.user?.name || 'Unknown User'}</p>
                            {!assignment.endAt && (
                              <Badge variant="outline" className="text-success border-success/50 bg-success/10">
                                Current
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {assignment.user?.department}
                          </p>
                          {assignment.startNote && (
                            <p className="text-sm mt-1 text-muted-foreground italic">
                              "{assignment.startNote}"
                            </p>
                          )}
                          {assignment.endAt && assignment.returnNote && (
                            <p className="text-sm mt-1 text-muted-foreground">
                              Return note: {assignment.returnNote}
                            </p>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground sm:text-right">
                          <p>{format(new Date(assignment.startAt), 'MMM d, yyyy')}</p>
                          {assignment.endAt && (
                            <p>→ {format(new Date(assignment.endAt), 'MMM d, yyyy')}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Service Tickets */}
        <TabsContent value="service">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Wrench className="w-5 h-5" />
                Service Tickets
              </CardTitle>
              <CardDescription>
                Repair and service history for this asset
              </CardDescription>
            </CardHeader>
            <CardContent>
              {serviceTickets.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Wrench className="w-10 h-10 mx-auto mb-3 opacity-50" />
                  <p>No service tickets for this asset</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {serviceTickets.map(ticket => (
                    <div
                      key={ticket.id}
                      className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium">{ticket.issue}</p>
                            <Badge
                              variant="outline"
                              className={
                                ticket.closedAt
                                  ? 'text-success border-success/50 bg-success/10'
                                  : 'text-warning border-warning/50 bg-warning/10'
                              }
                            >
                              {ticket.closedAt ? 'Closed' : 'Open'}
                            </Badge>
                          </div>
                          {ticket.vendor && (
                            <p className="text-sm text-muted-foreground">
                              Vendor: {ticket.vendor}
                            </p>
                          )}
                          {ticket.resolution && (
                            <p className="text-sm mt-2">
                              Resolution: {ticket.resolution}
                            </p>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground sm:text-right">
                          <p>Opened: {format(new Date(ticket.openedAt), 'MMM d, yyyy')}</p>
                          {ticket.closedAt && (
                            <p>Closed: {format(new Date(ticket.closedAt), 'MMM d, yyyy')}</p>
                          )}
                          {ticket.cost !== undefined && (
                            <p className="font-medium text-foreground mt-1">
                              {formatCurrency(ticket.cost)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Maintenance */}
        <TabsContent value="maintenance">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Maintenance Records
              </CardTitle>
              <CardDescription>
                Scheduled and performed maintenance for this asset
              </CardDescription>
            </CardHeader>
            <CardContent>
              {maintenanceRecords.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-10 h-10 mx-auto mb-3 opacity-50" />
                  <p>No maintenance records for this asset</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {maintenanceRecords.map(record => (
                    <div
                      key={record.id}
                      className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                        <div>
                          <p className="font-medium">{record.type}</p>
                          {record.note && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {record.note}
                            </p>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground sm:text-right">
                          <p>Performed: {format(new Date(record.performedAt), 'MMM d, yyyy')}</p>
                          {record.nextDueAt && (
                            <p className="text-warning">
                              Next due: {format(new Date(record.nextDueAt), 'MMM d, yyyy')}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
