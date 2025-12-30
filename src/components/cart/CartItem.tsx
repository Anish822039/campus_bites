import React from 'react';
import { CartItem as CartItemType } from '@/types';
import { Button } from '@/components/ui/button';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';

interface CartItemProps {
  item: CartItemType;
}

const CartItem: React.FC<CartItemProps> = ({ item }) => {
  const { updateQuantity, removeItem } = useCart();

  return (
    <div className="flex gap-4 rounded-xl bg-card p-4 shadow-card animate-slide-up">
      <img
        src={item.image}
        alt={item.name}
        className="h-20 w-20 rounded-lg object-cover"
      />
      <div className="flex flex-1 flex-col justify-between">
        <div>
          <h3 className="font-semibold text-foreground">{item.name}</h3>
          <p className="text-sm text-muted-foreground">₹{item.price} each</p>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => updateQuantity(item.id, item.quantity - 1)}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="w-8 text-center font-semibold">{item.quantity}</span>
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-bold text-primary">₹{item.price * item.quantity}</span>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => removeItem(item.id)}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
