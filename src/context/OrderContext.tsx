import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Order, CartItem } from '@/types';

interface OrderContextType {
  orders: Order[];
  currentOrder: Order | null;
  createOrder: (items: CartItem[], paymentMethod: string, userName: string) => Order;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  getOrderByNumber: (orderNumber: string) => Order | undefined;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

const generateOrderNumber = (): string => {
  const prefix = 'FC';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
  return `${prefix}${timestamp}${random}`;
};

export const OrderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);

  const createOrder = (items: CartItem[], paymentMethod: string, userName: string): Order => {
    const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const estimatedTime = Math.max(...items.map((item) => item.preparationTime)) + 5;

    const newOrder: Order = {
      id: crypto.randomUUID(),
      orderNumber: generateOrderNumber(),
      items,
      totalAmount,
      status: 'ordered',
      paymentMethod,
      paymentStatus: 'completed',
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: crypto.randomUUID(),
      userName,
      estimatedTime,
    };

    setOrders((prev) => [newOrder, ...prev]);
    setCurrentOrder(newOrder);
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? { ...order, status, updatedAt: new Date() }
          : order
      )
    );
    if (currentOrder?.id === orderId) {
      setCurrentOrder((prev) =>
        prev ? { ...prev, status, updatedAt: new Date() } : null
      );
    }
  };

  const getOrderByNumber = (orderNumber: string): Order | undefined => {
    return orders.find((order) => order.orderNumber === orderNumber);
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        currentOrder,
        createOrder,
        updateOrderStatus,
        getOrderByNumber,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};
