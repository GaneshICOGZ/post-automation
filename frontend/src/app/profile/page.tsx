'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, Mail, User, Shield } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import apiClient from '@/lib/apiClient';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PostAutomationPlatformIcon } from '@/components/app/post-automation-platform-icon';
import { ThemeToggle } from '@/components/app/theme-toggle';
import { ArrowLeft } from 'lucide-react';
import UserNav from '@/components/app/user-nav';
import UserProfile from '@/components/app/user-profile';
import { fbAuthUrl, igAuthUrl, linkedinAuthUrl, xAuthUrl, generateCodeChallenge } from '@/lib/oauth';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function ProfilePage() {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();

  // Backend user data state
  const [userData, setUserData] = useState<{
    id: string;
    name: string;
    email: string;
    preferences: string[];
  } | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [userError, setUserError] = useState<string | null>(null);

  // Dialog state for connect instructions
  const [openDialog, setOpenDialog] = useState<string | null>(null);

  // Function to open OAuth popup
  const openOAuthPopup = (platform: string) => {
    let url: string;
    switch (platform) {
      case 'facebook':
        url = fbAuthUrl({
          appId: process.env.NEXT_PUBLIC_FB_APP_ID!,
          redirectUri: process.env.NEXT_PUBLIC_FB_REDIRECT_URI!,
          userId: userData!.id
        });
        break;
      case 'instagram':
        url = igAuthUrl({
          appId: process.env.NEXT_PUBLIC_IG_APP_ID!,
          redirectUri: process.env.NEXT_PUBLIC_IG_REDIRECT_URI!,
          userId: userData!.id
        });
        break;
      case 'linkedin':
        url = linkedinAuthUrl({
          clientId: process.env.NEXT_PUBLIC_LI_CLIENT_ID!,
          redirectUri: process.env.NEXT_PUBLIC_LI_REDIRECT_URI!,
          state: JSON.stringify({ user_id: userData!.id }),
          scopes: ["r_liteprofile", "w_member_social", "r_emailaddress"]
        });
        break;
      case 'twitter':
        url = xAuthUrl({
          clientId: process.env.NEXT_PUBLIC_X_CLIENT_ID!,
          redirectUri: process.env.NEXT_PUBLIC_X_REDIRECT_URI!,
          userId: userData!.id,
          codeChallenge: generateCodeChallenge()
        });
        break;
      default:
        return;
    }
    window.open(url, 'oauth-popup', 'width=500,height=600,scrollbars=yes,resizable=yes');
    setOpenDialog(null);
  };

  // Get authentication tokens
  const token = typeof window !== 'undefined' ? document.cookie.split(';').find(row => row.trim().startsWith('token='))?.split('=')[1] : null;
  const accessToken = typeof window !== 'undefined' ? document.cookie.split(';').find(row => row.trim().startsWith('access_token='))?.split('=')[1] : null;

  // Authentication check and API call
  useEffect(() => {
    const checkAuthAndLoadUser = async () => {
      // Check authentication via cookies
      console.log('🔐 Profile auth check:', {
        hasToken: !!token,
        tokenLength: token?.length || 0,
        hasAccessToken: !!accessToken,
        accessTokenLength: accessToken?.length || 0,
        allCookies: document.cookie.split(';').filter(c => c.trim()).map(c => {
          const [name, value] = c.split('=');
          return { name: name?.trim(), length: value?.length || 0 };
        })
      });

      if (!token && !accessToken) {
        console.log('🚫 No authentication found, redirecting to login');
        const loginUrl = new URL('/login', window.location.origin);
        loginUrl.searchParams.set('t', Date.now().toString());
        loginUrl.searchParams.set('expired', 'true');
        window.location.href = loginUrl.toString();
        return;
      }

      console.log('✅ Authentication found, fetching user data from API...');

      // Load user data from backend
      try {
        setIsLoadingUser(true);
        setUserError(null);
        const response = await apiClient.get<{
          id: string;
          name: string;
          email: string;
          preferences: string[];
        }>('/auth/me');

        console.log('📋 Profile API response:', response);
        setUserData(response);
      } catch (error: any) {
        console.error('❌ Error fetching user data:', error);
        setUserError(error?.message || 'Failed to load user data');
        toast({
          variant: 'destructive',
          title: 'Error loading profile',
          description: 'Could not load user information. Please try again.',
        });
      } finally {
        setIsLoadingUser(false);
      }
    };

    checkAuthAndLoadUser();
  }, [token, accessToken, router, toast]);

  if (isLoadingUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-300">Loading profile...</p>
          {userError && (
            <p className="text-red-500 text-sm mt-2">{userError}</p>
          )}
        </div>
      </div>
    );
  }

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length > 1) {
      return names[0][0] + names[names.length - 1][0];
    }
    return name[0];
  };

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 overflow-hidden flex flex-col">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-blue-400/15 to-purple-400/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-gradient-to-br from-indigo-400/15 to-cyan-400/15 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/3 left-1/3 w-48 h-48 bg-gradient-to-br from-purple-400/8 to-pink-400/8 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <header className="flex-shrink-0 flex h-16 items-center gap-4 border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 px-6 backdrop-blur-sm md:px-8 lg:px-12">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-800 dark:text-slate-300 dark:hover:text-slate-100 transition-colors duration-300"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </Button>

          <Link href="/">
            <div className="flex items-center gap-2 mr-4 cursor-pointer">
              <div className="h-8 w-8 md:h-10 md:w-10">
                <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="font-headline text-lg md:text-xl font-semibold hidden sm:inline-block text-slate-800 dark:text-slate-200">
                Post Automation Platform
              </span>
            </div>
          </Link>

          <nav className="flex items-center gap-2 overflow-x-auto">
            <Button
              variant="ghost"
              asChild
              className="whitespace-nowrap transition-all duration-300"
            >
              <Link href="/create-post">Create Post</Link>
            </Button>
            <Button
              variant="ghost"
              asChild
              className="whitespace-nowrap transition-all duration-300"
            >
              <Link href="/analytics">Analytics</Link>
            </Button>
          </nav>

          <div className="ml-auto flex items-center gap-2 md:gap-4">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="w-9 h-9 p-0"
            >
              <Link href="/profile">
                <User className="w-4 h-4" />
              </Link>
            </Button>
            <UserProfile />
            <UserNav />
            <ThemeToggle />
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="container mx-auto p-2 md:p-3 lg:p-4 h-full">
            <div className="max-w-3xl mx-auto space-y-4 h-full">
              {/* Header */}
              <div className="text-center space-y-1 flex-shrink-0">
                <h1 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-200">
                  User Profile
                </h1>
                <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400">
                  Manage your account information and settings
                </p>
              </div>

              {/* Profile Card */}
              <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm flex-1 flex flex-col min-h-0">
                <CardHeader className="text-center pb-3 flex-shrink-0">
                  <div className="flex flex-col items-center space-y-3">
                    <Avatar className="h-16 w-16 md:h-20 md:w-20">
                      <AvatarFallback className="text-lg md:text-xl">
                        {getInitials(userData.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <CardTitle className="text-lg md:text-xl text-slate-800 dark:text-slate-200">
                        {userData.name}
                      </CardTitle>
                      
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 overflow-auto space-y-4">
                  <Separator />

                  {/* User Information */}
                  <div className="space-y-3 flex-shrink-0">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-slate-500" />
                      <div>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                          Display Name
                        </p>
                        <p className="text-sm text-slate-800 dark:text-slate-200">
                          {userData.name}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-slate-500" />
                      <div>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                          Email Address
                        </p>
                        <p className="text-sm text-slate-800 dark:text-slate-200">
                          {userData.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Social Media Connections */}
                  <div className="space-y-3 flex-shrink-0">
                    <h3 className="text-base md:text-lg font-semibold text-slate-800 dark:text-slate-200">
                      Connect Social Accounts
                    </h3>
                    <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400">
                      Connect your social media accounts to automate posts and track performance
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <Button
                        variant="outline"
                        className="flex items-center justify-center gap-2 h-12 hover:bg-blue-50 hover:border-blue-200 dark:hover:bg-blue-900/20 transition-colors duration-300"
                        onClick={() => setOpenDialog('facebook')}
                      >
                        <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                        <span className="text-sm font-medium">Facebook</span>
                      </Button>

                      <Button
                        variant="outline"
                        className="flex items-center justify-center gap-2 h-12 hover:bg-pink-50 hover:border-pink-200 dark:hover:bg-pink-900/20 transition-colors duration-300"
                        onClick={() => setOpenDialog('instagram')}
                      >
                        <svg className="w-5 h-5 text-pink-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                        </svg>
                        <span className="text-sm font-medium">Instagram</span>
                      </Button>

                      <Button
                        variant="outline"
                        className="flex items-center justify-center gap-2 h-12 hover:bg-blue-50 hover:border-blue-200 dark:hover:bg-blue-900/20 transition-colors duration-300"
                        onClick={() => setOpenDialog('linkedin')}
                      >
                        <svg className="w-5 h-5 text-blue-700" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                        <span className="text-sm font-medium">LinkedIn</span>
                      </Button>

                      <Button
                        variant="outline"
                        className="flex items-center justify-center gap-2 h-12 hover:bg-gray-50 hover:border-gray-200 dark:hover:bg-gray-900/20 transition-colors duration-300"
                        onClick={() => setOpenDialog('twitter')}
                      >
                        <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                        <span className="text-sm font-medium">X</span>
                      </Button>
                    </div>
                  </div>

                  {/* Preferences Section */}
                  {userData.preferences && userData.preferences.length > 0 && (
                    <>
                      <Separator />
                      <div className="space-y-2 flex-shrink-0">
                        <h3 className="text-sm md:text-base font-semibold text-slate-800 dark:text-slate-200">
                          Preferences
                        </h3>
                        <div className="flex flex-wrap gap-1">
                          {userData.preferences.map((preference, index) => (
                            <Badge key={index} variant="secondary" className="text-xs bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300">
                              {preference}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Dialogs for Connect Instructions */}
      {/* Facebook Dialog */}
      <Dialog open={openDialog === 'facebook'} onOpenChange={() => setOpenDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect Facebook Account</DialogTitle>
            <DialogDescription>
              Connect your Facebook account to enable automated posting to pages you manage.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">
              <p><strong>What will happen:</strong></p>
              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>You'll be redirected to Facebook to log in and authorize this app</li>
                <li>We'll request permission to manage posts on pages you administer</li>
                <li>After authorization, you'll be redirected back to this platform</li>
                <li>Your connection will be securely stored for future use</li>
              </ul>
            </div>
            <div className="text-xs bg-blue-50 p-2 rounded border">
              <strong>Note:</strong> Make sure you're logged into Facebook and have admin access to the pages you want to manage.
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialog(null)}>
              Cancel
            </Button>
            <Button onClick={() => openOAuthPopup('facebook')}>
              Continue to Facebook
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Instagram Dialog */}
      <Dialog open={openDialog === 'instagram'} onOpenChange={() => setOpenDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect Instagram Account</DialogTitle>
            <DialogDescription>
              Connect your Instagram business account to enable automated content publishing.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">
              <p><strong>What will happen:</strong></p>
              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>You'll be redirected to Facebook (Instagram's parent platform) to authorize</li>
                <li>We'll request permission to publish content on your behalf</li>
                <li>Select your Instagram business account during authorization</li>
                <li>After authorization, you'll be redirected back to this platform</li>
              </ul>
            </div>
            <div className="text-xs bg-pink-50 p-2 rounded border">
              <strong>Requirement:</strong> Your Instagram account must be connected to a Facebook Page and set as a business account.
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialog(null)}>
              Cancel
            </Button>
            <Button onClick={() => openOAuthPopup('instagram')}>
              Continue to Instagram
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* LinkedIn Dialog */}
      <Dialog open={openDialog === 'linkedin'} onOpenChange={() => setOpenDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect LinkedIn Account</DialogTitle>
            <DialogDescription>
              Connect your LinkedIn account to enable professional networking post automation.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">
              <p><strong>What will happen:</strong></p>
              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>You'll be redirected to LinkedIn to log in and grant permissions</li>
                <li>We'll request access to read your profile and publish posts</li>
                <li>Choose what permissions to grant during the authorization flow</li>
                <li>After authorization, your connection will be securely saved</li>
              </ul>
            </div>
            <div className="text-xs bg-blue-50 p-2 rounded border">
              <strong>Permissions requested:</strong> Read profile info, post on your behalf, and access your email.
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialog(null)}>
              Cancel
            </Button>
            <Button onClick={() => openOAuthPopup('linkedin')}>
              Continue to LinkedIn
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* X (Twitter) Dialog */}
      <Dialog open={openDialog === 'twitter'} onOpenChange={() => setOpenDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect X (Twitter) Account</DialogTitle>
            <DialogDescription>
              Connect your X account to enable automated tweeting and social media management.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">
              <p><strong>What will happen:</strong></p>
              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>You'll be redirected to X (Twitter) to authorize this application</li>
                <li>We'll request permission to read and write tweets on your behalf</li>
                <li>Review the permissions and click "Authorize app" to continue</li>
                <li>Your connection will be established once authorization is complete</li>
              </ul>
            </div>
            <div className="text-xs bg-gray-50 p-2 rounded border">
              <strong>Permissions requested:</strong> Read tweets, write tweets, read profile, and offline access for automation.
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialog(null)}>
              Cancel
            </Button>
            <Button onClick={() => openOAuthPopup('twitter')}>
              Continue to X
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
