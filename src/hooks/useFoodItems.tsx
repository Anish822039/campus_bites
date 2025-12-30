import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FoodItem } from '@/types';
import { toast } from 'sonner';

export const useFoodItems = () => {
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFoodItems = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('food_items')
      .select('*')
      .order('category', { ascending: true });

    if (error) {
      toast.error('Failed to load menu items');
      console.error('Error fetching food items:', error);
    } else {
      const mappedItems: FoodItem[] = data.map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description || '',
        price: Number(item.price),
        image: item.image || '',
        category: item.category,
        isAvailable: item.is_available,
        preparationTime: item.preparation_time,
      }));
      setFoodItems(mappedItems);
    }
    setLoading(false);
  };

  const updateFoodItem = async (id: string, updates: Partial<FoodItem>) => {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.price !== undefined) dbUpdates.price = updates.price;
    if (updates.image !== undefined) dbUpdates.image = updates.image;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.isAvailable !== undefined) dbUpdates.is_available = updates.isAvailable;
    if (updates.preparationTime !== undefined) dbUpdates.preparation_time = updates.preparationTime;

    const { error } = await supabase
      .from('food_items')
      .update(dbUpdates)
      .eq('id', id);

    if (error) {
      toast.error('Failed to update item');
      console.error('Error updating food item:', error);
      return false;
    }

    setFoodItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
    toast.success('Item updated successfully');
    return true;
  };

  const toggleAvailability = async (id: string) => {
    const item = foodItems.find((i) => i.id === id);
    if (!item) return;

    const newAvailability = !item.isAvailable;
    await updateFoodItem(id, { isAvailable: newAvailability });
  };

  const addFoodItem = async (item: Omit<FoodItem, 'id'>) => {
    const { data, error } = await supabase
      .from('food_items')
      .insert({
        name: item.name,
        description: item.description,
        price: item.price,
        image: item.image,
        category: item.category,
        is_available: item.isAvailable,
        preparation_time: item.preparationTime,
      })
      .select()
      .single();

    if (error) {
      toast.error('Failed to add item');
      console.error('Error adding food item:', error);
      return null;
    }

    const newItem: FoodItem = {
      id: data.id,
      name: data.name,
      description: data.description || '',
      price: Number(data.price),
      image: data.image || '',
      category: data.category,
      isAvailable: data.is_available,
      preparationTime: data.preparation_time,
    };

    setFoodItems((prev) => [...prev, newItem]);
    toast.success('Item added successfully');
    return newItem;
  };

  const deleteFoodItem = async (id: string) => {
    const { error } = await supabase.from('food_items').delete().eq('id', id);

    if (error) {
      toast.error('Failed to delete item');
      console.error('Error deleting food item:', error);
      return false;
    }

    setFoodItems((prev) => prev.filter((item) => item.id !== id));
    toast.success('Item deleted successfully');
    return true;
  };

  useEffect(() => {
    fetchFoodItems();
  }, []);

  return {
    foodItems,
    loading,
    updateFoodItem,
    toggleAvailability,
    addFoodItem,
    deleteFoodItem,
    refetch: fetchFoodItems,
  };
};
