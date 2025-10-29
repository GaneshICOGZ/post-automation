  'use client';

import { usePathname } from 'next/navigation';
import { PostAutomationPlatformIcon } from '@/components/app/post-automation-platform-icon';
import Link from 'next/link';
import UserNav from '@/components/app/user-nav';
import { ThemeToggle } from '@/components/app/theme-toggle';
import { useFirebase } from '@/firebase';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useFirebase();

  const showHeader = user && !pathname.startsWith('/login');

  if (!showHeader) {
    return <>{children}</>;
  }

  const navLinks = [
    { href: '/create-post', label: 'Create Post', exact: true },
    { href: '/analytics', label: 'Analytics' },
    { href: '/profile', label: 'User Profile' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex flex-col">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-blue-400/15 to-purple-400/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-gradient-to-br from-indigo-400/15 to-cyan-400/15 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/3 left-1/3 w-48 h-48 bg-gradient-to-br from-purple-400/8 to-pink-400/8 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      <div className="relative z-10 flex flex-col h-full">
        <header className="sticky top-0 z-40 flex h-16 items-center gap-2 sm:gap-4 border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 px-3 sm:px-4 md:px-6 lg:px-8 backdrop-blur-sm">
          <Link href="/" className="flex items-center gap-2 mr-2 sm:mr-4 min-w-0 flex-shrink-0">
            <div className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0">
              <PostAutomationPlatformIcon />
            </div>
            <span className="font-headline text-base sm:text-lg md:text-xl font-semibold hidden sm:inline-block text-slate-800 dark:text-slate-200 truncate">
              Post Automation Platform
            </span>
          </Link>

          <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto flex-1 min-w-0">
              {navLinks.map(link => {
                  const isActive = link.exact ? pathname === link.href : pathname.startsWith(link.href);
                  return (
                      <Button
                        key={link.href}
                        variant="ghost"
                        asChild
                        className={cn(
                          "whitespace-nowrap text-sm sm:text-base px-2 sm:px-3 py-2 transition-all duration-300 flex-shrink-0",
                          isActive && "bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl"
                        )}
                      >
                          <Link href={link.href}>{link.label}</Link>
                      </Button>
                  )
              })}
          </nav>

          <div className="ml-auto flex items-center gap-1 sm:gap-2 md:gap-4 flex-shrink-0">
            <ThemeToggle />
            <UserNav />
          </div>
        </header>

        <main className="flex-1 overflow-hidden">{children}</main>
      </div>
    </div>
  );
}
