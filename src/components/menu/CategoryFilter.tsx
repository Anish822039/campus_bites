import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Category {
  id: string;
  name: string;
  icon: string;
}

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {categories.map((category) => (
        <Button
          key={category.id}
          variant={selectedCategory === category.id ? 'default' : 'outline'}
          size="sm"
          onClick={() => onSelectCategory(category.id)}
          className={cn(
            'flex-shrink-0 gap-2 rounded-full px-4',
            selectedCategory === category.id && 'shadow-md'
          )}
        >
          <span className="text-base">{category.icon}</span>
          <span>{category.name}</span>
        </Button>
      ))}
    </div>
  );
};

export default CategoryFilter;
