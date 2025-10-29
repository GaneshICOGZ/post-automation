'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { TopicsSelection } from '@/components/app/topics-selection';
import { PostAutomationPlatformIcon } from '@/components/app/post-automation-platform-icon';
import { ThemeToggle } from '@/components/app/theme-toggle';
import UserNav from '@/components/app/user-nav';
import { ArrowLeft } from 'lucide-react';

export default function TopicsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex flex-col">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-blue-400/15 to-purple-400/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-gradient-to-br from-indigo-400/15 to-cyan-400/15 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/3 left-1/3 w-48 h-48 bg-gradient-to-br from-purple-400/8 to-pink-400/8 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      <div className="relative z-10 flex flex-col h-full">
        {/* Dashboard-style Header */}
        <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 px-4 backdrop-blur-sm md:px-6 lg:px-8">
          {/* Back Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-800 dark:text-slate-300 dark:hover:text-slate-100 transition-colors duration-300"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </Button>

          <div className="flex items-center gap-2 mr-4">
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

          <nav className="flex items-center gap-2 overflow-x-auto">
            <Button
              variant="ghost"
              asChild
              className="whitespace-nowrap transition-all duration-300 bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl"
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
            <ThemeToggle />
            <UserNav />
          </div>
        </header>

        <div className="flex flex-col items-center justify-center flex-1 p-4">
          <div className="w-full max-w-5xl space-y-8 md:space-y-12 relative">
          {/* Header Section */}
          <div className="text-center space-y-4 md:space-y-6">
            <div className="mx-auto mb-4 md:mb-6 h-20 w-20 md:h-24 md:w-24">
              <PostAutomationPlatformIcon />
            </div>
            <div className="space-y-4 md:space-y-6">
              <h1 className="font-headline text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-slate-800 dark:text-slate-200 bg-gradient-to-r from-slate-800 via-blue-800 to-slate-800 dark:from-slate-200 dark:via-blue-200 dark:to-slate-200 bg-clip-text text-transparent">
                Discover Trending Topics
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed px-4">
                Explore what's hot in content creation! Join thousands of creators who are leveraging these trending topics to make engaging content.
              </p>

              {/* Trending Stats - Responsive */}
              <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6 md:space-x-8 text-sm text-slate-600 dark:text-slate-300">
                <div className="text-center">
                  <div className="font-semibold text-blue-600 dark:text-blue-400 text-lg md:text-xl">2.1K+</div>
                  <div className="text-sm md:text-base">Creators Active</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-blue-600 dark:text-blue-400 text-lg md:text-xl">50+</div>
                  <div className="text-sm md:text-base">Trending Topics</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-blue-600 dark:text-blue-400 text-lg md:text-xl">25%</div>
                  <div className="text-sm md:text-base">Avg Engagement ↑</div>
                </div>
              </div>
            </div>
          </div>

          {/* Topics Selection Card */}
          <div className="flex justify-center px-4">
            <div className="w-full max-w-4xl">
              <TopicsSelection />
            </div>
          </div>

          {/* Footer hint */}
          <div className="text-center px-4">
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
              Don't worry, you can always update your preferences in your profile settings.
            </p>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
