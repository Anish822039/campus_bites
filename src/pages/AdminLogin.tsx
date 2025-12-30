import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChefHat, ArrowLeft, Mail, Lock, Shield, Loader2, User } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const { signIn, signUp, user, role, loading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [pendingRequest, setPendingRequest] = useState<string | null>(null);

  useEffect(() => {
    if (user && !authLoading && role) {
      if (role === 'manager' || role === 'admin' || role === 'management') {
        navigate('/manager');
      } else {
        // Check if user has a pending request
        checkPendingRequest();
      }
    }
  }, [user, role, authLoading, navigate]);

  const checkPendingRequest = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('manager_requests')
      .select('status')
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (data) {
      setPendingRequest(data.status);
      if (data.status === 'pending') {
        toast.info('Your manager access request is pending approval.');
      } else if (data.status === 'rejected') {
        toast.error('Your manager access request was rejected.');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || (isSignUp && !name)) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);

    if (isSignUp) {
      const { error } = await signUp(email, password, name);
      if (error) {
        toast.error(error.message);
        setIsLoading(false);
        return;
      }
      
      // Wait for auth state to update
      setTimeout(async () => {
        const { data: { user: newUser } } = await supabase.auth.getUser();
        if (newUser) {
          // Create manager access request
          const { error: requestError } = await supabase
            .from('manager_requests')
            .insert({
              user_id: newUser.id,
              name: name,
              email: email
            });

          if (requestError) {
            if (requestError.code === '23505') {
              toast.error('You already have a pending request');
            } else {
              toast.error('Failed to submit access request');
            }
          } else {
            toast.success('Account created! Your manager access request has been submitted for approval.');
            setPendingRequest('pending');
          }
        }
        setIsLoading(false);
      }, 1000);
    } else {
      const { error } = await signIn(email, password);
      setIsLoading(false);

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast.error('Invalid email or password');
        } else {
          toast.error(error.message);
        }
      }
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show pending status if user is logged in but has pending request
  if (user && pendingRequest === 'pending') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8">
        <div className="w-full max-w-md text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground mx-auto mb-6">
            <Shield className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Request Pending</h2>
          <p className="text-muted-foreground mb-6">
            Your manager access request is awaiting approval from an administrator. You'll be notified once it's reviewed.
          </p>
          <Button variant="outline" onClick={() => supabase.auth.signOut()}>
            Sign Out
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-secondary to-secondary/80 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-secondary-foreground" />
          <div className="absolute -left-20 top-1/2 h-60 w-60 rounded-full bg-secondary-foreground" />
          <div className="absolute right-10 bottom-10 h-40 w-40 rounded-full bg-secondary-foreground" />
        </div>
        <div className="relative z-10 flex flex-col justify-center p-12 text-secondary-foreground">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary-foreground/20 backdrop-blur">
              <Shield className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">CampusBites</h1>
              <p className="text-sm opacity-80">Management Portal</p>
            </div>
          </div>
          
          <h2 className="text-4xl font-bold mb-4">
            Manage your<br />
            food court.
          </h2>
          <p className="text-lg opacity-90 mb-8">
            Access orders, update menu items, track sales, and manage operations.
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary-foreground/20">
                <ChefHat className="h-5 w-5" />
              </div>
              <span>Real-time order management</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary-foreground/20">
                <Shield className="h-5 w-5" />
              </div>
              <span>Secure admin access</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login/Signup Form */}
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8">
            <ArrowLeft className="h-4 w-4" />
            Back to Menu
          </Link>

          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">CampusBites</h1>
              <p className="text-sm text-muted-foreground">Management Portal</p>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold">{isSignUp ? 'Request Manager Access' : 'Management Login'}</h2>
            <p className="text-muted-foreground">
              {isSignUp 
                ? 'Create an account and request manager access' 
                : 'Sign in to access the management dashboard'}
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="name" 
                    type="text" 
                    placeholder="John Doe" 
                    className="pl-10"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required={isSignUp}
                  />
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="manager@college.edu" 
                  className="pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••" 
                  className="pl-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
            </div>
            <Button type="submit" variant="secondary" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {isSignUp ? 'Creating Account...' : 'Signing in...'}
                </>
              ) : (
                isSignUp ? 'Request Access' : 'Sign In to Dashboard'
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {isSignUp ? (
              <>
                Already have an account?{' '}
                <button 
                  type="button"
                  onClick={() => setIsSignUp(false)} 
                  className="text-primary hover:underline"
                >
                  Sign in
                </button>
              </>
            ) : (
              <>
                Need manager access?{' '}
                <button 
                  type="button"
                  onClick={() => setIsSignUp(true)} 
                  className="text-primary hover:underline"
                >
                  Request access
                </button>
              </>
            )}
          </p>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            Are you a student?{' '}
            <Link to="/login" className="text-primary hover:underline">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
