import React from 'react';
import { useCart } from '@/context/CartContext';
import { Separator } from '@/components/ui/separator';

const CartSummary: React.FC = () => {
  const { items, totalAmount } = useCart();
  
  const tax = Math.round(totalAmount * 0.05);
  const grandTotal = totalAmount + tax;

  return (
    <div className="rounded-xl bg-card p-6 shadow-card">
      <h3 className="text-lg font-semibold text-foreground mb-4">Order Summary</h3>
      
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {item.name} × {item.quantity}
            </span>
            <span className="font-medium">₹{item.price * item.quantity}</span>
          </div>
        ))}
      </div>
      
      <Separator className="my-4" />
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium">₹{totalAmount}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">GST (5%)</span>
          <span className="font-medium">₹{tax}</span>
        </div>
      </div>
      
      <Separator className="my-4" />
      
      <div className="flex justify-between text-lg font-bold">
        <span>Total</span>
        <span className="text-primary">₹{grandTotal}</span>
      </div>
    </div>
  );
};

export default CartSummary;
