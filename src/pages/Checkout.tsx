import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import CartSummary from '@/components/cart/CartSummary';
import { useCart } from '@/context/CartContext';
import { useOrders } from '@/hooks/useOrders';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ArrowLeft, CreditCard, Wallet, Building, Smartphone, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const paymentMethods = [
  { id: 'upi', label: 'UPI', icon: Smartphone, description: 'Pay using any UPI app' },
  { id: 'card', label: 'Debit/Credit Card', icon: CreditCard, description: 'Visa, Mastercard, Rupay' },
  { id: 'wallet', label: 'Wallet', icon: Wallet, description: 'Paytm, PhonePe, etc.' },
  { id: 'counter', label: 'Pay at Counter', icon: Building, description: 'Pay cash when collecting' },
];

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { items, totalAmount, clearCart } = useCart();
  const { createOrder } = useOrders();
  const { user, loading: authLoading } = useAuth();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      toast.error('Please sign in to checkout');
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Please enter your name');
      return;
    }

    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    if (!user) {
      toast.error('Please sign in to place an order');
      navigate('/login');
      return;
    }

    setIsProcessing(true);

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const order = await createOrder(items, paymentMethod, name);
    
    if (order) {
      clearCart();
      toast.success('Order placed successfully!');
      navigate(`/order/${order.orderNumber}`);
    }
    
    setIsProcessing(false);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-16 text-center">
          <p className="text-muted-foreground mb-4">Your cart is empty</p>
          <Link to="/">
            <Button>Go to Menu</Button>
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-6">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/cart">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Checkout</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Form Section */}
            <div className="lg:col-span-2 space-y-6">
              {/* Customer Details */}
              <div className="rounded-xl bg-card p-6 shadow-card animate-slide-up">
                <h2 className="text-lg font-semibold mb-4">Your Details</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      placeholder="Enter your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email (Optional)</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="For digital receipt"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="rounded-xl bg-card p-6 shadow-card animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <h2 className="text-lg font-semibold mb-4">Payment Method</h2>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {paymentMethods.map((method) => {
                      const Icon = method.icon;
                      return (
                        <label
                          key={method.id}
                          className={`flex items-center gap-4 rounded-xl border-2 p-4 cursor-pointer transition-all ${
                            paymentMethod === method.id
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <RadioGroupItem value={method.id} id={method.id} />
                          <div className="flex items-center gap-3 flex-1">
                            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                              paymentMethod === method.id ? 'bg-primary text-primary-foreground' : 'bg-muted'
                            }`}>
                              <Icon className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-medium">{method.label}</p>
                              <p className="text-xs text-muted-foreground">{method.description}</p>
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </RadioGroup>
              </div>
            </div>

            {/* Summary */}
            <div className="space-y-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <CartSummary />
              <Button
                type="submit"
                variant="hero"
                size="lg"
                className="w-full gap-2"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Place Order • ₹{totalAmount + Math.round(totalAmount * 0.05)}
                  </>
                )}
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                By placing this order, you agree to our terms of service
              </p>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
};

export default Checkout;
