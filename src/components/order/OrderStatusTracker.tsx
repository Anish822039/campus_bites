import React from 'react';
import { Order } from '@/types';
import { cn } from '@/lib/utils';
import { ClipboardList, ChefHat, Bell, CheckCircle2 } from 'lucide-react';

interface OrderStatusTrackerProps {
  order: Order;
}

const steps = [
  { key: 'ordered', label: 'Order Placed', icon: ClipboardList },
  { key: 'preparing', label: 'Preparing', icon: ChefHat },
  { key: 'ready', label: 'Ready', icon: Bell },
  { key: 'completed', label: 'Picked Up', icon: CheckCircle2 },
];

const OrderStatusTracker: React.FC<OrderStatusTrackerProps> = ({ order }) => {
  const currentIndex = steps.findIndex((step) => step.key === order.status);

  return (
    <div className="rounded-xl bg-card p-6 shadow-card">
      <h3 className="text-lg font-semibold text-foreground mb-6">Order Status</h3>
      
      <div className="relative">
        {/* Progress Line */}
        <div className="absolute left-6 top-0 h-full w-0.5 bg-muted">
          <div
            className="w-full gradient-primary transition-all duration-500"
            style={{ height: `${(currentIndex / (steps.length - 1)) * 100}%` }}
          />
        </div>

        {/* Steps */}
        <div className="space-y-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = index <= currentIndex;
            const isCurrent = index === currentIndex;

            return (
              <div key={step.key} className="relative flex items-center gap-4">
                <div
                  className={cn(
                    'relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all duration-300',
                    isCompleted
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-muted bg-card text-muted-foreground',
                    isCurrent && 'ring-4 ring-primary/20 animate-pulse-slow'
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p
                    className={cn(
                      'font-semibold transition-colors',
                      isCompleted ? 'text-foreground' : 'text-muted-foreground'
                    )}
                  >
                    {step.label}
                  </p>
                  {isCurrent && (
                    <p className="text-sm text-primary animate-slide-up">
                      {step.key === 'ordered' && 'Your order has been received'}
                      {step.key === 'preparing' && 'Chef is preparing your food'}
                      {step.key === 'ready' && 'Please collect your order'}
                      {step.key === 'completed' && 'Thank you for ordering!'}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default OrderStatusTracker;
