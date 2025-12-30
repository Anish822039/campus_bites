import React from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import OrderCard from '@/components/order/OrderCard';
import { useOrders } from '@/context/OrderContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ClipboardList } from 'lucide-react';

const Orders: React.FC = () => {
  const { orders } = useOrders();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-6">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">My Orders</h1>
        </div>

        {orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 animate-slide-up">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-4">
              <ClipboardList className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">No orders yet</h2>
            <p className="text-muted-foreground mb-6">Your order history will appear here</p>
            <Link to="/">
              <Button variant="default" size="lg" className="gap-2">
                <ArrowLeft className="h-5 w-5" />
                Browse Menu
              </Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
};

export default Orders;
