import React from 'react';
import { Order } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

interface OrderCardProps {
  order: Order;
}

const statusConfig = {
  ordered: { label: 'Ordered', variant: 'ordered' as const },
  preparing: { label: 'Preparing', variant: 'preparing' as const },
  ready: { label: 'Ready', variant: 'ready' as const },
  completed: { label: 'Completed', variant: 'completed' as const },
};

const OrderCard: React.FC<OrderCardProps> = ({ order }) => {
  const status = statusConfig[order.status];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl bg-card p-4 shadow-card animate-slide-up">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-primary text-primary-foreground font-bold">
          {order.orderNumber.slice(-4)}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{order.orderNumber}</h3>
            <Badge variant={status.variant}>{status.label}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {order.items.length} items • ₹{order.totalAmount} • {format(order.createdAt, 'dd MMM, hh:mm a')}
          </p>
        </div>
      </div>
      <Link to={`/order/${order.orderNumber}`}>
        <Button variant="outline" size="sm" className="gap-2">
          <Eye className="h-4 w-4" />
          View Details
        </Button>
      </Link>
    </div>
  );
};

export default OrderCard;
