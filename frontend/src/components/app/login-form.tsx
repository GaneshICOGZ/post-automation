
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, LogIn, KeyRound } from 'lucide-react';
import { AuthService } from '@/lib/services/authService';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import { Separator } from '../ui/separator';

const loginSchema = z.object({
    email: z.string().email({ message: 'Please enter a valid email address.' }),
    password: z.string().min(1, { message: 'Password is required.' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;


export default function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setLoading(true);
    try {
      const response = await AuthService.login(data.email, data.password);

      // Store token in cookies and localStorage
      document.cookie = `token=${response.access_token}; path=/; max-age=${7 * 24 * 60 * 60}; samesite=strict`; // 7 days
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', response.access_token);
        localStorage.setItem('user', JSON.stringify(response.user));
        localStorage.setItem('isAuthenticated', 'true');
      }

      toast({
        title: 'Login Successful!',
        description: 'Welcome back!',
      });

      router.push('/create-post');
    } catch (error: any) {
      // Don't log to console to avoid popup errors - error handling is done via toast

      let errorMessage = 'Could not sign in. Please check your credentials.';

      if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
        errorMessage = 'Cannot connect to server. Please check if your FastAPI backend is running.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Login endpoint not found. Please check your backend URL and endpoints.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Invalid email or password. Please check your credentials and try again.';
      } else if (error.response?.status === 422) {
        errorMessage = 'Invalid login data. Please check your email format and try again.';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Server error. Please check your FastAPI backend logs.';
      } else if (error.response?.data?.detail) {
        errorMessage = (error.response.data as any)?.detail || errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    toast({
      title: 'Forgot Password',
      description: 'Password reset functionality will be available soon. Please contact support if you need help.',
    });
  };
  
  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="john.doe@example.com" {...field} />
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
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
              {loading ? 'Logging In...' : 'Login'}
            </Button>
          </form>
        </Form>
        <div className="mt-4 text-center">
          <Button onClick={handleForgotPassword} variant="ghost" className="text-sm text-slate-600 hover:text-slate-800 dark:text-slate-300 dark:hover:text-slate-100">
            <KeyRound className="mr-2 h-4 w-4" />
            Forgot Password?
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
