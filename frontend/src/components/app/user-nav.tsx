'use client';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useFirebase } from '@/firebase';
import { LogOut, User, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';


export default function UserNav() {
  const { user, auth, isUserLoading } = useFirebase();
  const router = useRouter();

  // const handleSignOut = async () => {
  //   try {
  //     console.log('Attempting to sign out user:', user?.email);

  //     // Clear all authentication data
  //     if (typeof window !== 'undefined') {
  //       console.log('Clearing all authentication data...');

  //       // Clear all localStorage items
  //       localStorage.clear();

  //       // Clear sessionStorage
  //       sessionStorage.clear();

  //       // Clear all cookies by setting them to expire
  //       document.cookie.split(";").forEach(cookie => {
  //         const eqPos = cookie.indexOf("=");
  //         const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();

  //         // Set cookie to expire and clear it for all possible paths and domains
  //         document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
  //         document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=" + window.location.hostname;
  //         document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=." + window.location.hostname;
  //         document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=localhost";
  //         document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.localhost";
  //       });

  //       console.log('All authentication data cleared');
  //     }

  //     // Sign out from Firebase Auth
  //     await auth.signOut();
  //     console.log('Firebase sign out successful');

  //     // Force redirect to login page with cache bypass
  //     console.log('🔄 Redirecting to login page...');
  //     // Use replace to prevent back button access to protected pages
  //     // Add timestamp to force cache bypass and prevent caching issues
  //     const timestamp = Date.now().toString();
  //     const loginUrl = new URL('/login', window.location.origin);
  //     loginUrl.searchParams.set('t', timestamp);
  //     loginUrl.searchParams.set('logout', 'true');

  //     // Clear any cached authentication state by forcing a hard refresh
  //     window.location.replace(loginUrl.toString());

  //   } catch (error) {
  //     console.error('Error during sign out process:', error);

  //     // Force clear everything and redirect even if there's an error
  //     try {
  //       if (typeof window !== 'undefined') {
  //         // Clear all storage
  //         localStorage.clear();
  //         sessionStorage.clear();

  //         // Clear cookies for all possible paths and domains
  //         document.cookie.split(";").forEach(cookie => {
  //           const eqPos = cookie.indexOf("=");
  //           const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
  //           document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
  //           document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=" + window.location.hostname;
  //           document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=." + window.location.hostname;
  //           document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=localhost";
  //           document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.localhost";
  //         });

  //         // Force redirect with replace to prevent back button and add cache busting
  //         const loginUrl = new URL('/login', window.location.origin);
  //         loginUrl.searchParams.set('t', Date.now().toString());
  //         loginUrl.searchParams.set('logout', 'true');
  //         window.location.replace(loginUrl.toString());
  //       }
  //     } catch (fallbackError) {
  //       console.error('Fallback logout also failed:', fallbackError);
  //       // Last resort - redirect anyway with cache busting
  //       const loginUrl = new URL('/login', window.location.origin);
  //       loginUrl.searchParams.set('t', Date.now().toString());
  //       loginUrl.searchParams.set('logout', 'true');
  //       window.location.href = loginUrl.toString();
  //     }
  //   }
  // };
  const handleSignOut = async () => {
    const clearClientData = () => {
      try {
        // Clear local/session storage
        localStorage.clear();
        sessionStorage.clear();

        // Clear specific authentication cookies that middleware checks
        const authCookies = ['token', 'access_token', 'firebase:authUser:*:*'];
        const domains = [
          window.location.hostname,
          "." + window.location.hostname,
          "localhost",
          ".localhost"
        ];
        const paths = ['/', '/login', '/dashboard', '/create-post', '/analytics', '/generated-summary'];

        // Clear each auth cookie for all domains and paths
        authCookies.forEach(cookieName => {
          domains.forEach(domain => {
            paths.forEach(path => {
              document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=${path};domain=${domain};SameSite=Lax`;
            });
          });
        });

        // Also clear any other cookies (fallback)
        document.cookie.split(";").forEach(cookie => {
          const eqPos = cookie.indexOf("=");
          const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
          if (name && (name.includes('auth') || name.includes('token') || name.includes('firebase'))) {
            domains.forEach(domain => {
              document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${domain};SameSite=Lax`;
            });
          }
        });

        console.log("✅ Cleared all client-side auth data including specific auth cookies");
      } catch (err) {
        console.error("Error clearing local data:", err);
      }
    };

    try {
      console.log("Signing out user:", auth?.currentUser?.email);

      // 1️⃣ Sign out from Firebase first
      await auth.signOut();
      console.log("✅ Firebase sign out successful");

      // 2️⃣ Clear client data
      clearClientData();

      // 3️⃣ Redirect to login with cache busting
      const loginUrl = new URL("/login", window.location.origin);
      loginUrl.searchParams.set("logout", "true");
      loginUrl.searchParams.set("t", Date.now().toString());

      console.log("🔄 Redirecting to:", loginUrl.toString());
      window.location.replace(loginUrl.toString());

    } catch (error) {
      console.error("❌ Sign-out error:", error);

      // Always try to clear and redirect anyway
      clearClientData();
      const loginUrl = new URL("/login", window.location.origin);
      loginUrl.searchParams.set("logout", "true");
      loginUrl.searchParams.set("t", Date.now().toString());
      window.location.replace(loginUrl.toString());
    }
  };


  // Show loading state while checking authentication
  if (isUserLoading) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Button
          onClick={() => {
            router.push('/login');
            handleSignOut();
          }}
          className="bg-white hover:bg-gray-50 text-slate-700 border border-slate-300 hover:border-slate-400"
        >
          Logout
        </Button>
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
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="relative h-12 w-12 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-200 ring-2 ring-slate-200 dark:ring-slate-600 hover:ring-blue-300"
            title={`Logged in as ${user.displayName || user.email}`}
          >
            <Avatar className="h-10 w-10 border-2 border-white dark:border-slate-800">
              <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-lg">
                {getInitials(user.displayName)}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-72" align="end" forceMount sideOffset={8}>
          <DropdownMenuLabel className="font-normal p-4">
            <div className="flex flex-col space-y-3">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12 ring-2 ring-blue-200 dark:ring-blue-800">
                  <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold">
                    {getInitials(user.displayName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col flex-1">
                  <p className="text-base font-semibold leading-tight">{user.displayName || 'User'}</p>
                  <p className="text-sm leading-tight text-muted-foreground mt-1">
                    {user.email}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-green-600 font-medium">Online</span>
                  </div>
                </div>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup className="p-2">
            <DropdownMenuItem
              onClick={() => router.push('/profile')}
              className="cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 p-3 rounded-lg mb-1"
            >
              <User className="mr-3 h-5 w-5 text-blue-600" />
              <span className="font-semibold">View Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => router.push('/profile')}
              className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 p-3 rounded-lg"
            >
              <Settings className="mr-3 h-5 w-5 text-slate-600" />
              <span className="font-semibold">Account Settings</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <div className="p-2">
            <DropdownMenuItem
              onClick={handleSignOut}
              className="cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20 focus:bg-red-50 dark:focus:bg-red-900/20 p-3 rounded-lg bg-red-50/50 dark:bg-red-900/10"
            >
              <LogOut className="mr-3 h-5 w-5 text-red-600" />
              <span className="font-semibold text-red-600">Sign Out</span>
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
