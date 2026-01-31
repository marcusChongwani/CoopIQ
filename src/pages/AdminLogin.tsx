import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { z } from 'zod';
import Header from '@/components/Header';
import { supabase } from '@/integrations/supabase/client';

const authSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type AuthMode = 'signin' | 'signup' | 'forgot';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>('signin');
  const { signIn, signUp, isAdmin, loading, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && user && isAdmin) {
      navigate('/admin');
    }
  }, [user, isAdmin, loading, navigate]);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const emailValidation = z.string().email('Invalid email address').safeParse(email);
    if (!emailValidation.success) {
      toast({
        title: 'Validation Error',
        description: emailValidation.error.errors[0].message,
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/admin/login`,
      });
      
      if (error) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Check your email',
          description: 'We sent you a password reset link.',
        });
        setAuthMode('signin');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (authMode === 'forgot') {
      return handleForgotPassword(e);
    }
    
    const validation = authSchema.safeParse({ email, password });
    if (!validation.success) {
      toast({
        title: 'Validation Error',
        description: validation.error.errors[0].message,
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      if (authMode === 'signup') {
        const { error } = await signUp(email, password);
        if (error) {
          toast({
            title: 'Sign up failed',
            description: error.message,
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Account created!',
            description: 'Your account has been created. Now sign in to continue.',
          });
          setAuthMode('signin');
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            title: 'Login Failed',
            description: error.message,
            variant: 'destructive',
          });
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="py-28 sm:py-16 bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              {authMode === 'signup' 
                ? "Create an admin account" 
                : authMode === 'forgot' 
                ? "Reset your password"
                : "Welcome back"}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {authMode === 'signup'
                ? "Request access to the admin dashboard."
                : authMode === 'forgot'
                ? "Enter your email and we'll send you a reset link."
                : "Sign in to manage content and settings."}
            </p>
          </div>

          {/* Card */}
          <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 rounded-xl"
                />
              </div>

              {authMode !== 'forgot' && (
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="h-12 rounded-xl"
                  />
                </div>
              )}

              {authMode === 'signin' && (
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => setAuthMode('forgot')}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-12 rounded-xl text-base font-medium"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {authMode === 'signup' 
                      ? "Creating account…" 
                      : authMode === 'forgot'
                      ? "Sending reset link…"
                      : "Signing in…"}
                  </>
                ) : authMode === 'signup' ? (
                  "Create account"
                ) : authMode === 'forgot' ? (
                  "Send reset link"
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>
          </div>

          {/* Footer switch */}
          <div className="mt-6 text-center space-y-2">
            {authMode === 'forgot' ? (
              <button
                type="button"
                onClick={() => setAuthMode('signin')}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Back to{" "}
                <span className="font-medium underline underline-offset-4">
                  Sign in
                </span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {authMode === 'signup' ? (
                  <>
                    Already have an account?{" "}
                    <span className="font-medium underline underline-offset-4">
                      Sign in
                    </span>
                  </>
                ) : (
                  <>
                    Don't have an account?{" "}
                    <span className="font-medium underline underline-offset-4">
                      Sign up
                    </span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
