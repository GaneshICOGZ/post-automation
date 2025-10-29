
'use client';

import { PostAutomationPlatformIcon } from '@/components/app/post-automation-platform-icon';
import { ThemeToggle } from '@/components/app/theme-toggle';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  const handleCreatePost = () => {
    // Check if user is authenticated by checking multiple storage types
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') || document.cookie.split('token=')[1]?.split(';')[0] : null;
    const accessToken = typeof window !== 'undefined' ? localStorage.getItem('access_token') || document.cookie.split('access_token=')[1]?.split(';')[0] : null;

    if (token || accessToken) {
      router.push('/create-post');
    } else {
      router.push('/login');
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex flex-col">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-blue-400/15 to-purple-400/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-gradient-to-br from-indigo-400/15 to-cyan-400/15 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/3 left-1/3 w-48 h-48 bg-gradient-to-br from-purple-400/8 to-pink-400/8 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center flex-1 p-3 sm:p-4 md:p-6">
        <div className="w-full max-w-4xl space-y-6 sm:space-y-8 text-center">

          <h1 className="font-headline text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-slate-800 dark:text-slate-200 bg-gradient-to-r from-slate-800 via-blue-800 to-slate-800 dark:from-slate-200 dark:via-blue-200 dark:to-slate-200 bg-clip-text text-transparent leading-tight">
            Welcome to the Post Automation Platform
          </h1>
          <p className="mt-4 sm:mt-6 text-base sm:text-lg md:text-xl lg:text-2xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed px-2 sm:px-4">
            Your AI-powered partner for creating and scheduling engaging social media content.
          </p>
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4 sm:px-0">
            <Button asChild size="lg" className="w-full sm:w-auto min-w-[200px] bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-full">
              <Link href="/login">Get Started</Link>
            </Button>
            <Button onClick={handleCreatePost} variant="outline" size="lg" className="w-full sm:w-auto min-w-[200px] border-2 border-slate-200 dark:border-slate-600 hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-slate-700 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-full">
              Create Post
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
