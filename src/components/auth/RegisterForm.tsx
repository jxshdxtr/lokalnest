
import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

// Form schema
const registerSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  accountType: z.enum(['buyer', 'seller']),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

interface RegisterFormProps {
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  showPassword: boolean;
  togglePasswordVisibility: () => void;
}

const RegisterForm = ({ isLoading, setIsLoading, showPassword, togglePasswordVisibility }: RegisterFormProps) => {
  const navigate = useNavigate();
  const [registrationError, setRegistrationError] = useState<string | null>(null);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      accountType: 'buyer',
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    setRegistrationError(null);

    try {
      // Sign up the user
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.name,
            account_type: data.accountType,
          },
          emailRedirectTo: `${window.location.origin}/verify`,
        },
      });
      
      if (error) {
        if (error.message === 'Error sending confirmation email') {
          // Handle email sending error with direct navigation approach
          toast.warning('Could not send verification email, but your account was created. Proceeding with direct login.');
          
          // Try to sign in the user directly
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email: data.email,
            password: data.password,
          });
          
          if (signInError) {
            throw signInError;
          }
          
          // If the seller profile needs to be created, do it here
          if (data.accountType === 'seller' && authData?.user) {
            const { error: sellerError } = await supabase
              .from('seller_profiles')
              .insert({
                id: authData.user.id,
                business_name: data.name,
              });
            
            if (sellerError) {
              console.error('Failed to create seller profile:', sellerError);
            }
          }
          
          // Redirect based on account type
          if (data.accountType === 'seller') {
            navigate('/seller/dashboard');
          } else {
            navigate('/');
          }
          return;
        } else {
          throw error;
        }
      }
      
      // If the user is a seller, create a seller profile
      if (data.accountType === 'seller' && authData?.user) {
        const { error: sellerError } = await supabase
          .from('seller_profiles')
          .insert({
            id: authData.user.id,
            business_name: data.name,
          });
        
        if (sellerError) {
          console.error('Failed to create seller profile:', sellerError);
          // Continue anyway since the user account was created
        }
      }
      
      toast.success('Account created! Please check your email for verification code.');
      
      // Redirect to OTP verification page
      navigate(`/verify?email=${encodeURIComponent(data.email)}`);
    } catch (error: any) {
      setRegistrationError(error.message || 'Failed to create account. Please try again.');
      toast.error(error.message || 'Failed to create account. Please try again.');
      console.error('Register error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent default button behavior
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      
      if (error) throw error;
      
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign up with Google. Please try again.');
      console.error('Google sign up error:', error);
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {registrationError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
            Error: {registrationError}
          </div>
        )}
        
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    placeholder="Enter your full name"
                    {...field}
                    disabled={isLoading}
                    className="pl-10"
                  />
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    placeholder="Enter your email"
                    {...field}
                    disabled={isLoading}
                    className="pl-10"
                  />
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a password"
                    {...field}
                    disabled={isLoading}
                    className="pl-10 pr-10"
                  />
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1 h-8 w-8 p-0"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="accountType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Account Type</FormLabel>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  type="button"
                  variant={field.value === 'buyer' ? 'default' : 'outline'}
                  className="w-full justify-center"
                  onClick={() => field.onChange('buyer')}
                >
                  Buyer
                </Button>
                <Button
                  type="button"
                  variant={field.value === 'seller' ? 'default' : 'outline'}
                  className="w-full justify-center"
                  onClick={() => field.onChange('seller')}
                >
                  Seller
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Creating account...' : 'Create Account'}
        </Button>

        <div className="relative flex items-center justify-center mt-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative bg-white px-4 text-sm text-muted-foreground">
            Or continue with
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          disabled={isLoading}
          onClick={handleGoogleSignUp}
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google logo"
            className="mr-2 h-4 w-4"
          />
          Google
        </Button>
      </form>
    </Form>
  );
};

export default RegisterForm;
