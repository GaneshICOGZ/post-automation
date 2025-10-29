'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PostAutomationPlatformIcon } from '@/components/app/post-automation-platform-icon';
import { ThemeToggle } from '@/components/app/theme-toggle';
import UserNav from '@/components/app/user-nav';
import { ArrowLeft, User } from 'lucide-react';
import AnalyticsDashboard from "@/components/app/analytics-dashboard";
import { useAuthCheck } from '@/hooks/use-auth-check';
import { AuthUtils } from '@/lib/services/authService';

export default function AnalyticsPage() {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Check authentication on page load
    useAuthCheck({
        checkOnMount: true,
        showToast: true
    });

    // Set authentication state after component mounts
    useEffect(() => {
        setIsAuthenticated(AuthUtils.isAuthenticated());
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
            {/* Background decorative elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-blue-400/15 to-purple-400/15 rounded-full blur-3xl animate-pulse" />
                <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-gradient-to-br from-indigo-400/15 to-cyan-400/15 rounded-full blur-3xl animate-pulse delay-1000" />
                <div className="absolute top-1/3 left-1/3 w-48 h-48 bg-gradient-to-br from-purple-400/8 to-pink-400/8 rounded-full blur-3xl animate-pulse delay-500" />
            </div>

            <div className="relative z-10">
                {/* Header */}
                <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 px-4 backdrop-blur-sm md:px-6 lg:px-8">
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
                            className="whitespace-nowrap transition-all duration-300 bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl"
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
                        <ThemeToggle />
                        <UserNav />
                    </div>
                </header>

                {/* Main Content */}
                <div className="container mx-auto p-4 md:p-6 lg:p-8">
                    {isAuthenticated ? (
                        <AnalyticsDashboard />
                    ) : (
                        <div className="flex items-center justify-center h-64">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                                <p className="text-slate-600 dark:text-slate-300">Redirecting to login...</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
