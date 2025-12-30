import React from 'react';
import { FoodItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Clock } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { cn } from '@/lib/utils';

interface FoodCardProps {
  item: FoodItem;
}

const FoodCard: React.FC<FoodCardProps> = ({ item }) => {
  const { addItem } = useCart();

  return (
    <div
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-2xl bg-card shadow-card transition-all duration-300 hover:shadow-lg hover:-translate-y-1',
        !item.isAvailable && 'opacity-75'
      )}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={item.image}
          alt={item.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Availability Badge */}
        <Badge
          variant={item.isAvailable ? 'available' : 'unavailable'}
          className="absolute top-3 left-3"
        >
          {item.isAvailable ? 'Available' : 'Sold Out'}
        </Badge>

        {/* Prep Time */}
        <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-card/90 backdrop-blur px-2 py-1 text-xs font-medium">
          <Clock className="h-3 w-3 text-muted-foreground" />
          <span>{item.preparationTime} min</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-semibold text-foreground line-clamp-1">{item.name}</h3>
        <p className="mt-1 text-sm text-muted-foreground line-clamp-2 flex-1">
          {item.description}
        </p>
        
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xl font-bold text-primary">₹{item.price}</span>
          <Button
            size="sm"
            variant={item.isAvailable ? 'default' : 'outline'}
            disabled={!item.isAvailable}
            onClick={() => addItem(item)}
            className="gap-1"
          >
            <Plus className="h-4 w-4" />
            Add
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FoodCard;
