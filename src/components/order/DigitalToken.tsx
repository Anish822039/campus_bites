import React from 'react';
import { Order } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Clock, CreditCard, Calendar, Hash } from 'lucide-react';
import { format } from 'date-fns';

interface DigitalTokenProps {
  order: Order;
}

const statusConfig = {
  ordered: { label: 'Order Placed', variant: 'ordered' as const },
  preparing: { label: 'Preparing', variant: 'preparing' as const },
  ready: { label: 'Ready for Pickup', variant: 'ready' as const },
  completed: { label: 'Completed', variant: 'completed' as const },
};

const DigitalToken: React.FC<DigitalTokenProps> = ({ order }) => {
  const status = statusConfig[order.status];

  return (
    <div className="relative overflow-hidden rounded-2xl bg-card shadow-lg animate-scale-in">
      {/* Header with gradient */}
      <div className="gradient-primary p-6 text-primary-foreground">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-90">Order Token</p>
            <h2 className="text-3xl font-bold tracking-wider">{order.orderNumber}</h2>
          </div>
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-foreground/20 backdrop-blur">
            <Hash className="h-8 w-8" />
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center justify-center py-4 bg-muted/50">
        <Badge variant={status.variant} className="text-sm px-4 py-1">
          {status.label}
        </Badge>
      </div>

      {/* Order Details */}
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{format(order.createdAt, 'dd MMM yyyy, hh:mm a')}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>Est. {order.estimatedTime} mins</span>
          </div>
          <div className="flex items-center gap-2 text-sm col-span-2">
            <CreditCard className="h-4 w-4 text-muted-foreground" />
            <span className="capitalize">{order.paymentMethod.replace('_', ' ')}</span>
          </div>
        </div>

        <Separator />

        {/* Items */}
        <div className="space-y-2">
          <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Items</h4>
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span>
                {item.name} × {item.quantity}
              </span>
              <span className="font-medium">₹{item.price * item.quantity}</span>
            </div>
          ))}
        </div>

        <Separator />

        {/* Total */}
        <div className="flex justify-between text-lg font-bold">
          <span>Total Paid</span>
          <span className="text-primary">₹{order.totalAmount}</span>
        </div>
      </div>

      {/* Decorative circles */}
      <div className="absolute -left-4 top-1/2 h-8 w-8 rounded-full bg-background" />
      <div className="absolute -right-4 top-1/2 h-8 w-8 rounded-full bg-background" />
    </div>
  );
};

export default DigitalToken;
