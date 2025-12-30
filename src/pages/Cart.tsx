import React from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import CartItem from '@/components/cart/CartItem';
import CartSummary from '@/components/cart/CartSummary';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { ShoppingBag, ArrowLeft, ArrowRight } from 'lucide-react';

const Cart: React.FC = () => {
  const { items, totalAmount } = useCart();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-6">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Your Cart</h1>
        </div>

        {items.length > 0 ? (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}
            </div>

            {/* Summary & Checkout */}
            <div className="space-y-4">
              <CartSummary />
              <Link to="/checkout">
                <Button variant="hero" size="lg" className="w-full gap-2">
                  Proceed to Checkout
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="text-center py-16 animate-slide-up">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-4">
              <ShoppingBag className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">Add some delicious items to get started!</p>
            <Link to="/">
              <Button variant="default" size="lg" className="gap-2">
                <ArrowLeft className="h-5 w-5" />
                Browse Menu
              </Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
};

export default Cart;
