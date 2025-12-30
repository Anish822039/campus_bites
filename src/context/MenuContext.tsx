import React, { createContext, useContext, useState, ReactNode } from 'react';
import { FoodItem } from '@/types';
import { menuItems as initialMenuItems } from '@/data/menuData';

interface MenuContextType {
  menuItems: FoodItem[];
  updateMenuItem: (id: string, updates: Partial<FoodItem>) => void;
  addMenuItem: (item: Omit<FoodItem, 'id'>) => void;
  deleteMenuItem: (id: string) => void;
  toggleAvailability: (id: string) => void;
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

export const MenuProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [menuItems, setMenuItems] = useState<FoodItem[]>(initialMenuItems);

  const updateMenuItem = (id: string, updates: Partial<FoodItem>) => {
    setMenuItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const addMenuItem = (item: Omit<FoodItem, 'id'>) => {
    const newItem: FoodItem = {
      ...item,
      id: crypto.randomUUID(),
    };
    setMenuItems((prev) => [...prev, newItem]);
  };

  const deleteMenuItem = (id: string) => {
    setMenuItems((prev) => prev.filter((item) => item.id !== id));
  };

  const toggleAvailability = (id: string) => {
    setMenuItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isAvailable: !item.isAvailable } : item
      )
    );
  };

  return (
    <MenuContext.Provider
      value={{
        menuItems,
        updateMenuItem,
        addMenuItem,
        deleteMenuItem,
        toggleAvailability,
      }}
    >
      {children}
    </MenuContext.Provider>
  );
};

export const useMenu = () => {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error('useMenu must be used within a MenuProvider');
  }
  return context;
};
