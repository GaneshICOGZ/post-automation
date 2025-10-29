
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Sparkles, Loader2 } from 'lucide-react';
import { AuthService } from '@/lib/services/authService';
import { useToast } from '@/hooks/use-toast';

const trendingTopics = [
  'Technology',
  'Health & Wellness',
  'Business & Finance',
  'Lifestyle & Fashion',
  'Entertainment',
  'Sports',
  'Science',
  'Food & Cooking',
  'Travel',
  'Education',
  'Environment',
  'Art & Creativity'
];

const registrationSchema = z.object({
  fullName: z.string().min(2, { message: 'Full name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
  selectedTopics: z.array(z.string()).min(1, { message: 'Please select at least one interest.' }),
});

type RegistrationFormValues = z.infer<typeof registrationSchema>;

interface RegistrationFormProps {
    onRegisterSuccess: () => void;
}

export default function RegistrationForm({ onRegisterSuccess }: RegistrationFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const form = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      selectedTopics: [],
    },
  });

  const onSubmit = async (data: RegistrationFormValues) => {
    setLoading(true);
    try {
      const response = await AuthService.register(
        data.fullName, // Use fullName as name
        data.email,
        data.password,
        data.selectedTopics // Use selectedTopics as preferences
      );

      // Store token in cookies and localStorage
      document.cookie = `token=${response.access_token}; path=/; max-age=${7 * 24 * 60 * 60}; samesite=strict`; // 7 days
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', response.access_token);
        localStorage.setItem('user', JSON.stringify(response.user));
        localStorage.setItem('isAuthenticated', 'true');
      }

      toast({
        title: 'Registration Successful!',
        description: 'Welcome to the platform! Please log in with your new account.',
      });

      // Redirect to login page with fromRegister parameter to ensure login tab is shown
      const loginUrl = new URL('/login', window.location.origin);
      loginUrl.searchParams.set('fromRegister', 'true');
      router.push(loginUrl.pathname + loginUrl.search);
    } catch (error: any) {
      // Don't log to console to avoid popup errors - error handling is done via toast

      let description = 'An unexpected error occurred.';

      if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
        description = 'Cannot connect to server. Please check if your FastAPI backend is running.';
      } else if (error.response?.status === 404) {
        description = 'Registration endpoint not found. Please check your backend URL and endpoints.';
      } else if (error.response?.status === 409) {
        description = 'This email is already registered. Please log in or use a different email.';
      } else if (error.response?.status === 422) {
        description = 'Invalid registration data. Please check all fields are filled correctly.';
      } else if (error.response?.status === 401) {
        description = 'Unauthorized. Please check your registration data.';
      } else if (error.response?.status >= 500) {
        description = 'Server error. Please check your FastAPI backend logs.';
      } else if (error.response?.data?.detail) {
        description = (error.response.data as any)?.detail || description;
      } else if (error.message) {
        description = error.message;
      }

      toast({
        variant: 'destructive',
        title: 'Registration Failed',
        description,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
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

            {/* Topics Selection */}
            <div className="space-y-4">
              <div>
                <FormLabel>Select Your Interests (choose at least one)</FormLabel>
                <p className="text-sm text-muted-foreground mt-1">
                  Choose topics that interest you to personalize your experience
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {trendingTopics.map((topic) => (
                  <FormField
                    key={topic}
                    control={form.control}
                    name="selectedTopics"
                    render={({ field }) => (
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={topic}
                          checked={field.value?.includes(topic)}
                          onCheckedChange={(checked) => {
                            return checked
                              ? field.onChange([...field.value, topic])
                              : field.onChange(field.value?.filter((value) => value !== topic))
                          }}
                        />
                        <label
                          htmlFor={topic}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {topic}
                        </label>
                      </div>
                    )}
                  />
                ))}
              </div>
              <FormMessage className="text-sm">
                {form.formState.errors.selectedTopics?.message}
              </FormMessage>
            </div>

            <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105" disabled={loading}>
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              {loading ? 'Registering...' : 'Create Account'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
