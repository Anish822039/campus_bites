import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Order, CartItem } from '@/types';
import { toast } from 'sonner';
import { useAuth } from './useAuth';

const generateOrderNumber = (): string => {
  const prefix = 'FC';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
  return `${prefix}${timestamp}${random}`;
};

export const useOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    if (!user) {
      setOrders([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data: ordersData, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (ordersError) {
      console.error('Error fetching orders:', ordersError);
      setLoading(false);
      return;
    }

    // Fetch order items for each order
    const ordersWithItems: Order[] = await Promise.all(
      ordersData.map(async (order) => {
        const { data: itemsData } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', order.id);

        const items: CartItem[] = (itemsData || []).map((item) => ({
          id: item.food_item_id || item.id,
          name: item.name,
          description: '',
          price: Number(item.price),
          image: item.image || '',
          category: '',
          isAvailable: true,
          preparationTime: 10,
          quantity: item.quantity,
        }));

        return {
          id: order.id,
          orderNumber: order.order_number,
          items,
          totalAmount: Number(order.total_amount),
          status: order.status as Order['status'],
          paymentMethod: order.payment_method,
          paymentStatus: order.payment_status as Order['paymentStatus'],
          createdAt: new Date(order.created_at),
          updatedAt: new Date(order.updated_at),
          userId: order.user_id || '',
          userName: order.user_name,
          estimatedTime: order.estimated_time,
        };
      })
    );

    setOrders(ordersWithItems);
    setLoading(false);
  };

  const createOrder = async (
    items: CartItem[],
    paymentMethod: string,
    userName: string
  ): Promise<Order | null> => {
    if (!user) {
      toast.error('Please sign in to place an order');
      return null;
    }

    const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const estimatedTime = Math.max(...items.map((item) => item.preparationTime)) + 5;
    const orderNumber = generateOrderNumber();

    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        user_id: user.id,
        user_name: userName,
        total_amount: totalAmount,
        payment_method: paymentMethod,
        payment_status: 'completed',
        estimated_time: estimatedTime,
      })
      .select()
      .single();

    if (orderError) {
      toast.error('Failed to create order');
      console.error('Error creating order:', orderError);
      return null;
    }

    // Insert order items
    const orderItems = items.map((item) => ({
      order_id: orderData.id,
      food_item_id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image,
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems);

    if (itemsError) {
      console.error('Error inserting order items:', itemsError);
    }

    const newOrder: Order = {
      id: orderData.id,
      orderNumber: orderData.order_number,
      items,
      totalAmount: Number(orderData.total_amount),
      status: orderData.status as Order['status'],
      paymentMethod: orderData.payment_method,
      paymentStatus: orderData.payment_status as Order['paymentStatus'],
      createdAt: new Date(orderData.created_at),
      updatedAt: new Date(orderData.updated_at),
      userId: orderData.user_id || '',
      userName: orderData.user_name,
      estimatedTime: orderData.estimated_time,
    };

    setOrders((prev) => [newOrder, ...prev]);
    return newOrder;
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId);

    if (error) {
      toast.error('Failed to update order status');
      console.error('Error updating order status:', error);
      return false;
    }

    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status, updatedAt: new Date() } : order
      )
    );
    return true;
  };

  const getOrderByNumber = (orderNumber: string): Order | undefined => {
    return orders.find((order) => order.orderNumber === orderNumber);
  };

  // Subscribe to realtime updates
  useEffect(() => {
    const channel = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
        },
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  useEffect(() => {
    fetchOrders();
  }, [user]);

  return {
    orders,
    loading,
    createOrder,
    updateOrderStatus,
    getOrderByNumber,
    refetch: fetchOrders,
  };
};
