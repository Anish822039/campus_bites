import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import DigitalToken from '@/components/order/DigitalToken';
import OrderStatusTracker from '@/components/order/OrderStatusTracker';
import { useOrders } from '@/hooks/useOrders';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home, Download, Share2, Bell, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Order } from '@/types';

const OrderConfirmation: React.FC = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const { getOrderByNumber, loading } = useOrders();
  const [order, setOrder] = useState<Order | undefined>(undefined);
  const [prevStatus, setPrevStatus] = useState<string | null>(null);

  // Get initial order
  useEffect(() => {
    if (orderNumber) {
      const foundOrder = getOrderByNumber(orderNumber);
      setOrder(foundOrder);
      if (foundOrder) {
        setPrevStatus(foundOrder.status);
      }
    }
  }, [orderNumber, getOrderByNumber]);

  // Subscribe to real-time updates for this specific order
  useEffect(() => {
    if (!order?.id) return;

    const channel = supabase
      .channel(`order-${order.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${order.id}`,
        },
        (payload) => {
          const newStatus = payload.new.status as Order['status'];
          
          // Show toast notification for status changes
          if (prevStatus && prevStatus !== newStatus) {
            if (newStatus === 'preparing') {
              toast.info('Your order is now being prepared! 👨‍🍳');
            } else if (newStatus === 'ready') {
              toast.success('Your order is ready for pickup! 🎉', {
                duration: 10000,
              });
            }
          }
          
          setPrevStatus(newStatus);
          setOrder((prev) =>
            prev
              ? {
                  ...prev,
                  status: newStatus,
                  updatedAt: new Date(payload.new.updated_at),
                }
              : prev
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [order?.id, prevStatus]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-16 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
          <p className="text-muted-foreground mb-6">
            We couldn't find an order with that number.
          </p>
          <Link to="/">
            <Button>Go to Menu</Button>
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link to="/orders">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-foreground">Order Details</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => toast.info('Download feature coming soon!')}>
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => toast.info('Share feature coming soon!')}>
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Digital Token */}
          <div>
            <DigitalToken order={order} />
          </div>

          {/* Order Status */}
          <div className="space-y-6">
            <OrderStatusTracker order={order} />

            {order.status === 'ready' && (
              <div className="rounded-xl bg-success/10 border border-success/30 p-4 animate-bounce-subtle">
                <div className="flex items-center gap-3">
                  <Bell className="h-6 w-6 text-success" />
                  <div>
                    <p className="font-semibold text-success">Your order is ready!</p>
                    <p className="text-sm text-muted-foreground">Please collect from the counter</p>
                  </div>
                </div>
              </div>
            )}

            <Link to="/">
              <Button variant="outline" size="lg" className="w-full gap-2">
                <Home className="h-5 w-5" />
                Back to Menu
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OrderConfirmation;