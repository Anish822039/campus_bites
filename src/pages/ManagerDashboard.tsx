import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { 
  ChefHat, 
  ClipboardList, 
  Clock, 
  CheckCircle, 
  UtensilsCrossed,
  LogOut,
  Search,
  RefreshCw,
  Pencil,
  Loader2,
  Shield,
  Brain
} from 'lucide-react';
import { useOrders } from '@/hooks/useOrders';
import { useFoodItems } from '@/hooks/useFoodItems';
import { useAuth } from '@/hooks/useAuth';
import { useAIPredictions } from '@/hooks/useAIPredictions';
import { format } from 'date-fns';
import { toast } from 'sonner';
import EditMenuItemDialog from '@/components/menu/EditMenuItemDialog';
import AIPredictionsPanel from '@/components/dashboard/AIPredictionsPanel';
import { FoodItem } from '@/types';

const ManagerDashboard: React.FC = () => {
  const { orders, loading: ordersLoading, updateOrderStatus, refetch: refetchOrders } = useOrders();
  const { foodItems: menuItems, loading: menuLoading, updateFoodItem, toggleAvailability } = useFoodItems();
  const { role } = useAuth();
  const { predictions, rawData, loading: aiLoading, error: aiError, fetchPredictions } = useAIPredictions();
  const [searchQuery, setSearchQuery] = useState('');
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Fetch AI predictions on mount
  useEffect(() => {
    fetchPredictions();
  }, [fetchPredictions]);

  const isAdmin = role === 'admin';

  const pendingOrders = orders.filter((o) => o.status === 'ordered');
  const preparingOrders = orders.filter((o) => o.status === 'preparing');
  const readyOrders = orders.filter((o) => o.status === 'ready');

  const handleStatusUpdate = async (orderId: string, newStatus: 'preparing' | 'ready' | 'completed') => {
    const success = await updateOrderStatus(orderId, newStatus);
    if (success) {
      toast.success(`Order status updated to ${newStatus}`);
    }
  };

  const handleToggleAvailability = async (itemId: string) => {
    const item = menuItems.find((i) => i.id === itemId);
    await toggleAvailability(itemId);
    toast.success(`${item?.name} is now ${!item?.isAvailable ? 'available' : 'unavailable'}`);
  };

  const handleEditItem = (item: FoodItem) => {
    setEditingItem(item);
    setEditDialogOpen(true);
  };

  const handleSaveItem = async (id: string, updates: Partial<FoodItem>) => {
    await updateFoodItem(id, updates);
  };

  const filteredMenuItems = menuItems.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
                <ChefHat className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-lg font-bold">Manager Dashboard</h1>
                <p className="text-xs text-muted-foreground">Food Court Operations • Real-time</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <Link to="/admin">
                <Button variant="outline" size="sm" className="gap-2">
                  <Shield className="h-4 w-4" />
                  Admin Panel
                </Button>
              </Link>
            )}
            <Button variant="outline" size="sm" className="gap-2" onClick={() => refetchOrders()}>
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Link to="/admin-login">
              <Button variant="ghost" size="sm" className="gap-2 text-destructive">
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Pending', count: pendingOrders.length, icon: ClipboardList, color: 'text-info' },
            { label: 'Preparing', count: preparingOrders.length, icon: Clock, color: 'text-warning' },
            { label: 'Ready', count: readyOrders.length, icon: CheckCircle, color: 'text-success' },
            { label: "Today's Total", count: orders.length, icon: UtensilsCrossed, color: 'text-primary' },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl bg-card p-4 shadow-card">
              <div className="flex items-center justify-between">
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
                <span className={`text-2xl font-bold ${stat.color}`}>{stat.count}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        <Tabs defaultValue="ai-predictions" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="ai-predictions" className="gap-2">
              <Brain className="h-4 w-4" />
              AI Predictions
            </TabsTrigger>
            <TabsTrigger value="orders" className="gap-2">
              <ClipboardList className="h-4 w-4" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="menu" className="gap-2">
              <UtensilsCrossed className="h-4 w-4" />
              Menu Management
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ai-predictions">
            <div className="rounded-xl bg-card p-6 shadow-card">
              <AIPredictionsPanel
                predictions={predictions}
                rawData={rawData}
                loading={aiLoading}
                error={aiError}
                onRefresh={fetchPredictions}
              />
            </div>
          </TabsContent>

          <TabsContent value="orders">
            {ordersLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Pending Orders */}
                <div className="rounded-xl bg-card p-4 shadow-card">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-3 w-3 rounded-full bg-info animate-pulse" />
                    <h3 className="font-semibold">New Orders ({pendingOrders.length})</h3>
                  </div>
                  <div className="space-y-3">
                    {pendingOrders.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-8">No pending orders</p>
                    ) : (
                      pendingOrders.map((order) => (
                        <div key={order.id} className="rounded-lg border bg-background p-3">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-semibold">{order.orderNumber}</p>
                              <p className="text-xs text-muted-foreground">{order.userName}</p>
                            </div>
                            <Badge variant="ordered">New</Badge>
                          </div>
                          <div className="text-xs text-muted-foreground mb-2">
                            {order.items.map((i) => `${i.name} ×${i.quantity}`).join(', ')}
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-muted-foreground">
                              {format(order.createdAt, 'hh:mm a')}
                            </span>
                            <Button size="sm" onClick={() => handleStatusUpdate(order.id, 'preparing')}>
                              Start Preparing
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Preparing */}
                <div className="rounded-xl bg-card p-4 shadow-card">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-3 w-3 rounded-full bg-warning animate-pulse" />
                    <h3 className="font-semibold">Preparing ({preparingOrders.length})</h3>
                  </div>
                  <div className="space-y-3">
                    {preparingOrders.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-8">Nothing being prepared</p>
                    ) : (
                      preparingOrders.map((order) => (
                        <div key={order.id} className="rounded-lg border bg-background p-3">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-semibold">{order.orderNumber}</p>
                              <p className="text-xs text-muted-foreground">{order.userName}</p>
                            </div>
                            <Badge variant="preparing">Cooking</Badge>
                          </div>
                          <div className="text-xs text-muted-foreground mb-2">
                            {order.items.map((i) => `${i.name} ×${i.quantity}`).join(', ')}
                          </div>
                          <Button size="sm" variant="success" className="w-full" onClick={() => handleStatusUpdate(order.id, 'ready')}>
                            Mark Ready
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Ready */}
                <div className="rounded-xl bg-card p-4 shadow-card">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-3 w-3 rounded-full bg-success" />
                    <h3 className="font-semibold">Ready for Pickup ({readyOrders.length})</h3>
                  </div>
                  <div className="space-y-3">
                    {readyOrders.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-8">No orders ready</p>
                    ) : (
                      readyOrders.map((order) => (
                        <div key={order.id} className="rounded-lg border bg-background p-3">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-semibold">{order.orderNumber}</p>
                              <p className="text-xs text-muted-foreground">{order.userName}</p>
                            </div>
                            <Badge variant="ready">Ready</Badge>
                          </div>
                          <div className="text-xs text-muted-foreground mb-2">
                            {order.items.map((i) => `${i.name} ×${i.quantity}`).join(', ')}
                          </div>
                          <Button size="sm" variant="outline" className="w-full" onClick={() => handleStatusUpdate(order.id, 'completed')}>
                            Mark Collected
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="menu">
            <div className="rounded-xl bg-card p-6 shadow-card">
              <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
                <h3 className="text-lg font-semibold">Menu Items</h3>
                <div className="relative max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search items..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              {menuLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredMenuItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div className="flex items-center gap-3">
                        <img src={item.image} alt={item.name} className="h-12 w-12 rounded-lg object-cover" />
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">₹{item.price} • {item.category} • {item.preparationTime} mins</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditItem(item)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <span className="text-sm text-muted-foreground hidden sm:block">
                          {item.isAvailable ? 'In Stock' : 'Out of Stock'}
                        </span>
                        <Switch
                          checked={item.isAvailable}
                          onCheckedChange={() => handleToggleAvailability(item.id)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <EditMenuItemDialog
        item={editingItem}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSave={handleSaveItem}
      />
    </div>
  );
};

export default ManagerDashboard;
