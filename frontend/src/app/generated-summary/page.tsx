'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import UserNav from '@/components/app/user-nav';
import { PostAutomationPlatformIcon } from '@/components/app/post-automation-platform-icon';
import { ThemeToggle } from '@/components/app/theme-toggle';
import { PostService } from '@/lib/services/postService';
import { useToast } from '@/hooks/use-toast';
import {
  Sparkles,
  Wand2,
  Edit3,
  RefreshCw,
  Twitter,
  Linkedin,
  Instagram,
  Facebook,
  CheckCircle,
  Copy,
  Share2,
  ArrowLeft,
  User
} from 'lucide-react';
import { useAuthCheck } from '@/hooks/use-auth-check';
// Simple markdown renderer component - Mobile-optimized
const SimpleMarkdownRenderer = ({ content }: { content: string }) => {
  // Split content by lines and process each line
  const lines = content.split('\n');

  const renderLine = (line: string, index: number) => {
    // Handle headers (lines starting with #) - Reduced sizes for mobile
    if (line.startsWith('# ')) {
      return (
        <h1 key={index} className="text-lg sm:text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-200 mb-3 sm:mb-4 mt-4 sm:mt-6 first:mt-0">
          {line.substring(2)}
        </h1>
      );
    }
    if (line.startsWith('## ')) {
      return (
        <h2 key={index} className="text-base sm:text-lg md:text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2 sm:mb-3 mt-3 sm:mt-5 first:mt-0">
          {line.substring(3)}
        </h2>
      );
    }
    if (line.startsWith('### ')) {
      return (
        <h3 key={index} className="text-sm sm:text-base md:text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2 mt-3 sm:mt-4 first:mt-0">
          {line.substring(4)}
        </h3>
      );
    }

    // Handle bullet points - Smaller, more compact
    if (line.trim().startsWith('• ')) {
      return (
        <div key={index} className="flex items-start space-x-2 mb-1 sm:mb-2">
          <span className="text-blue-500 mt-1 flex-shrink-0 text-sm">•</span>
          <span className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">{line.substring(2)}</span>
        </div>
      );
    }

    // Handle numbered lists - Smaller, more compact
    if (/^\d+\.\s/.test(line.trim())) {
      const match = line.match(/^(\d+)\.\s(.*)$/);
      if (match) {
        return (
          <div key={index} className="flex items-start space-x-2 mb-1 sm:mb-2">
            <span className="text-blue-500 font-medium flex-shrink-0 text-sm sm:text-base">{match[1]}.</span>
            <span className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">{match[2]}</span>
          </div>
        );
      }
    }

    // Handle bold text (**text**) - Smaller, more compact
    if (line.includes('**') && line.trim()) {
      const parts = line.split('**');
      return (
        <p key={index} className="mb-2 sm:mb-3 leading-relaxed">
          {parts.map((part, i) =>
            i % 2 === 1 ? (
              <strong key={i} className="font-semibold text-slate-900 dark:text-slate-100 text-sm sm:text-base">
                {part}
              </strong>
            ) : (
              <span key={i} className="text-sm sm:text-base">{part}</span>
            )
          )}
        </p>
      );
    }

    // Handle empty lines
    if (!line.trim()) {
      return <br key={index} />;
    }

    // Regular paragraph - Smaller, more compact for mobile
    if (line.trim()) {
      return (
        <p key={index} className="mb-2 sm:mb-3 leading-relaxed text-sm sm:text-base text-slate-700 dark:text-slate-300">
          {line}
        </p>
      );
    }

    return null;
  };

  return (
    <div className="h-full p-3 sm:p-4 bg-slate-50 dark:bg-slate-700/30 rounded-lg animate-fade-in">
      {lines.map((line, index) => renderLine(line, index))}
    </div>
  );
};

export default function GeneratedSummaryPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingPosts, setIsCreatingPosts] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [editedSummary, setEditedSummary] = useState('');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [generatedSummary, setGeneratedSummary] = useState('');
  const [summaryId, setSummaryId] = useState<string>('');
  const [hasLoadedData, setHasLoadedData] = useState(false);

  // Check authentication on page load
  useAuthCheck({ checkOnMount: true });

  // Load data from localStorage and generate summary
  useEffect(() => {
    const loadData = async () => {
      // Prevent multiple executions
      if (hasLoadedData) {
        console.log('Data already loaded, skipping');
        return;
      }

      setIsLoading(true);
      console.log('Starting data load process...');

      if (typeof window !== 'undefined') {
        const savedData = localStorage.getItem('generatedSummaryData');
        if (savedData) {
          try {
            const parsed = JSON.parse(savedData);
            console.log('Loading saved data from localStorage:', parsed);
            setSelectedTopics(parsed.selectedTopics || []);

            // If we have a summary from the API response, use it exactly as stored
            if (parsed.summary && parsed.summary.trim()) {
              console.log('Using stored summary, no API call needed');
              setGeneratedSummary(parsed.summary);
              setEditedSummary(parsed.summary);
              setSummaryId(parsed.summaryId || '');
              setHasLoadedData(true);
            } else {
              console.log('No valid summary found in localStorage, calling backend API');
              // Only fallback to backend API if no summary available in localStorage
              await generateSummaryWithBackend(parsed.selectedTopics || [], '');
              setHasLoadedData(true);
            }
          } catch (error) {
            console.warn('Error loading saved data:', error);
            setSelectedTopics([]);
            setHasLoadedData(true);
          }
        } else {
          // If no saved data, try to generate summary from topics
          const finalSummaryData = localStorage.getItem('finalSummaryData');
          if (finalSummaryData) {
            const parsed = JSON.parse(finalSummaryData);
            console.log('Using finalSummaryData:', parsed);
            setSelectedTopics(parsed.selectedTopics || []);
            setGeneratedSummary(parsed.summary || '');
            setEditedSummary(parsed.summary || '');
            setSummaryId(''); // No summaryId for finalSummaryData
          } else {
            console.log('No data found in localStorage');
            // Only generate new summary if no data exists at all
            setSelectedTopics([]);
            setGeneratedSummary('');
            setEditedSummary('');
            setSummaryId('');
          }
          setHasLoadedData(true);
        }
      }

      // Simulate loading time for smooth animation
      setTimeout(() => {
        setIsLoading(false);
      }, 1500);
    };

    loadData();
  }, [hasLoadedData]);

  const generateSummaryWithBackend = async (topics: string[], desc: string) => {
    try {
      // Call the FastAPI backend to generate summary
      const response = await PostService.generateSummary(topics);

      // Update state with the backend response
      const summaryText = (response as any).summary_text ?? response.summary ?? '';
      setGeneratedSummary(summaryText);
      setEditedSummary(summaryText);
      setSummaryId(response.summaryId || '');

      // Update localStorage with the backend response
      if (typeof window !== 'undefined') {
        localStorage.setItem('generatedSummaryData', JSON.stringify({
          selectedTopics: topics,
          summary: summaryText,
          summaryId: response.summaryId,
          timestamp: new Date().toISOString()
        }));
      }
    } catch (error: any) {
      // Don't log to console to avoid popup errors - error handling is done via toast

      let errorMessage = 'Could not generate summary. Please try again.';

      if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
        errorMessage = 'Cannot connect to server. Please check if your FastAPI backend is running.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Generate summary endpoint not found. Please check your backend URL and endpoints.';
      } else if (error.response?.status === 422) {
        errorMessage = 'Invalid topic data. Please check your selected topics and try again.';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Server error. Please check your FastAPI backend logs.';
      } else if (error.response?.data?.detail) {
        errorMessage = (error.response.data as any)?.detail || errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: errorMessage,
      });

      // Fallback to sample summary if backend fails
      generateFallbackSummary(topics, desc);
    }
  };

  const generateFallbackSummary = (topics: string[], desc: string) => {
    const topicText = topics.length > 0 ? topics.join(' and ') : 'the selected topics';
    const summary = `🚀 Exciting insights about ${topicText}!

${desc || 'Exploring the latest trends and innovations that are shaping our digital future.'}

Key takeaways:
• Revolutionary approaches to modern challenges
• Enhanced productivity and efficiency gains
• Improved experiences across platforms
• Sustainable solutions for long-term growth

The future holds immense potential for those ready to embrace these innovations. Stay ahead of the curve!

#Innovation #${topics.join(' #').replace(/\s+/g, '')} #Future`;

    setGeneratedSummary(summary);
    setEditedSummary(summary);
    setSummaryId(''); // Clear summaryId for fallback summaries since they can't be regenerated
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    setGeneratedSummary(editedSummary);
    setIsEditing(false);

    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('generatedSummaryData', JSON.stringify({
        selectedTopics,
        summary: editedSummary,
        summaryId,
        timestamp: new Date().toISOString()
      }));
    }
  };

  const handleCancelEdit = () => {
    setEditedSummary(generatedSummary);
    setIsEditing(false);
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);

    try {
      let response;

      // If we have a summaryId, try to regenerate using the backend API first
      if (summaryId) {
        try {
          response = await PostService.regenerateText(summaryId);
        } catch (regenerateError: any) {
          // If regenerate fails, fallback to generate new summary
          console.warn('Regenerate failed, falling back to generate new summary');
          response = await PostService.generateSummary(selectedTopics);
        }
      } else {
        // No summaryId available, generate new summary
        response = await PostService.generateSummary(selectedTopics);
      }

      // Update the summary with the response content
      const summaryText = (response as any).summary_text ?? (response as any).summary ?? (response as any).regeneratedContent ?? '';
      setGeneratedSummary(summaryText);
      setEditedSummary(summaryText);

      // Update localStorage with the new content
      if (typeof window !== 'undefined') {
        localStorage.setItem('generatedSummaryData', JSON.stringify({
          selectedTopics,
          summary: summaryText,
          summaryId: (response as any).summaryId || summaryId,
          timestamp: new Date().toISOString()
        }));
      }

      toast({
        title: 'Summary Regenerated!',
        description: 'Your summary has been updated with fresh content.',
      });
    } catch (error: any) {
      // Don't log to console to avoid popup errors - error handling is done via toast

      let errorMessage = 'Could not regenerate summary. Please try again.';

      if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
        errorMessage = 'Cannot connect to server. Please check if your FastAPI backend is running.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Generate summary endpoint not found. Please check your backend URL and endpoints.';
      } else if (error.response?.status === 422) {
        errorMessage = 'Invalid topic data. Please check your selected topics and try again.';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Server error. Please check your FastAPI backend logs.';
      } else if (error.response?.data?.detail) {
        errorMessage = (error.response.data as any)?.detail || errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        variant: 'destructive',
        title: 'Regeneration Failed',
        description: errorMessage,
      });

      // Fallback to sample summary if all backend calls fail
      generateFallbackSummary(selectedTopics, '');
    } finally {
      setIsRegenerating(false);
    }
  };

  const handlePlatformToggle = (platform: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  const handleCopySummary = async () => {
    try {
      await navigator.clipboard.writeText(generatedSummary);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleShareToPlatforms = async () => {
    if (selectedPlatforms.length === 0) return;

    setIsCreatingPosts(true);

    console.log('Sharing to platforms:', selectedPlatforms);
    console.log('Summary:', generatedSummary);
    console.log('Summary ID:', summaryId);

    // Debug authentication state before API calls
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token') || localStorage.getItem('access_token');
      console.log('Authentication state before API calls:', {
        hasToken: !!token,
        tokenLength: token?.length || 0,
        localStorageKeys: Object.keys(localStorage),
        cookies: document.cookie
      });
    }

    try {
      // Step 1: Map selected platforms to the correct format
      const platformMapping: { [key: string]: string } = {
        'twitter': 'X',
        'linkedin': 'LinkedIn',
        'instagram': 'Instagram',
        'facebook': 'Facebook'
      };

      const mappedPlatforms = selectedPlatforms.map(platform => platformMapping[platform] || platform);
      console.log('Mapped platforms:', mappedPlatforms);

      // Step 2: Call approve summary API first
      console.log('Calling approve summary API...');
      await PostService.approveSummary(generatedSummary, summaryId);

      // Step 3: Call generate content API second
      console.log('Calling generate content API...');
      const contentResponse = await PostService.generateContent(summaryId, mappedPlatforms);
      console.log('Content generation response:', contentResponse);

      // Step 4: Clear old dashboard data and save new platform content data to localStorage for the dashboard
      if (typeof window !== 'undefined') {
        // Clear old dashboard data to prevent stale data issues
        localStorage.removeItem('dashboardPlatformContent');
        localStorage.removeItem('dashboardSelectedPlatforms');
        localStorage.removeItem('dashboardPosts');

        localStorage.setItem('finalSummaryData', JSON.stringify({
          selectedTopics,
          summary: generatedSummary,
          selectedPlatforms: mappedPlatforms,
          timestamp: new Date().toISOString()
        }));

        // Save platform content data for dashboard
        localStorage.setItem('dashboardPlatformContent', JSON.stringify(contentResponse));

        // Save selected platforms for dashboard post generation
        localStorage.setItem('dashboardSelectedPlatforms', JSON.stringify(mappedPlatforms));
      }

      toast({
        title: 'Posts Created Successfully!',
        description: `Your summary has been approved and posts generated for ${mappedPlatforms.join(', ')}.`,
      });

      // Step 5: Redirect to dashboard (always redirect, even if API calls fail)
      console.log('Redirecting to dashboard...');
      console.log('Current user state - checking if authenticated');

      // Check if user is authenticated before redirect
      if (typeof window !== 'undefined') {
        // Check for tokens in cookies (primary storage)
        const token = document.cookie.split(';').find(row => row.trim().startsWith('token='))?.split('=')[1];
        const accessToken = document.cookie.split(';').find(row => row.trim().startsWith('access_token='))?.split('=')[1];

        console.log('Auth check before redirect:', {
          hasToken: !!token,
          hasAccessToken: !!accessToken,
          tokenLength: token?.length || 0
        });

        if (token || accessToken) {
          console.log('User is authenticated, redirecting to dashboard');
          (window as any).location.href = '/dashboard';
        } else {
          console.log('No valid auth token found, redirecting to login');
          const loginUrl = new URL('/login', window.location.origin);
          loginUrl.searchParams.set('t', Date.now().toString());
          loginUrl.searchParams.set('expired', 'true');
          (window as any).location.href = loginUrl.toString();
        }
      } else {
        // Fallback redirect
        (window as any).location.href = '/dashboard';
      }

    } catch (error: any) {
      console.error('Error in handleShareToPlatforms:', error);

      let errorMessage = 'Could not create posts. Please try again.';

      if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
        errorMessage = 'Cannot connect to server. Please check if your FastAPI backend is running.';
      } else if (error.response?.status === 404) {
        errorMessage = 'API endpoint not found. Please check your backend URL and endpoints.';
      } else if (error.response?.status === 422) {
        errorMessage = 'Invalid data provided. Please check your summary and selected platforms.';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Server error. Please check your FastAPI backend logs.';
      } else if (error.response?.data?.detail) {
        errorMessage = (error.response.data as any)?.detail || errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        variant: 'destructive',
        title: 'Post Creation Failed',
        description: errorMessage,
      });
    } finally {
      setIsCreatingPosts(false);
    }
  };

  const platforms = [
    { id: 'x', name: 'X', icon: Twitter },
    { id: 'linkedin', name: 'LinkedIn', icon: Linkedin },
    { id: 'instagram', name: 'Instagram', icon: Instagram },
    { id: 'facebook', name: 'Facebook', icon: Facebook }
  ];

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex flex-col overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-blue-400/15 to-purple-400/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-gradient-to-br from-indigo-400/15 to-cyan-400/15 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/3 left-1/3 w-48 h-48 bg-gradient-to-br from-purple-400/8 to-pink-400/8 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      {/* Compact Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex h-14 sm:h-16 items-center gap-2 sm:gap-4 border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 px-3 sm:px-4 md:px-6 lg:px-8 backdrop-blur-sm">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="flex items-center gap-1 sm:gap-2 text-slate-600 hover:text-slate-800 dark:text-slate-300 dark:hover:text-slate-100 transition-colors duration-300 flex-shrink-0"
        >
          <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline text-sm sm:text-base">Back</span>
        </Button>

        <Link href="/">
          <div className="flex items-center gap-1 sm:gap-2 mr-1 sm:mr-2 md:mr-4 cursor-pointer min-w-0 flex-shrink-0">
            <div className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 flex-shrink-0">
              <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="font-headline text-sm sm:text-base md:text-lg lg:text-xl font-semibold hidden sm:inline-block text-slate-800 dark:text-slate-200 truncate">
              Post Automation Platform
            </span>
          </div>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto flex-1 min-w-0">
            <Button
              variant="ghost"
              asChild
              className="whitespace-nowrap text-xs sm:text-sm md:text-base px-1 sm:px-2 md:px-3 py-1 sm:py-2 transition-all duration-300 bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl flex-shrink-0"
            >
              <Link href="/create-post">Create Post</Link>
            </Button>
          <Button
            variant="ghost"
            asChild
            className="whitespace-nowrap text-xs sm:text-sm md:text-base px-1 sm:px-2 md:px-3 py-1 sm:py-2 transition-all duration-300 flex-shrink-0"
          >
            <Link href="/analytics">Analytics</Link>
          </Button>
        </nav>

        <div className="ml-auto flex items-center gap-1 sm:gap-2 flex-shrink-0">
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

      <div className="relative z-10 flex w-full h-full mt-14 sm:mt-16 gap-2 sm:gap-3 pb-3 sm:pb-4 overflow-hidden">
        {/* Main Content Area - Full Width Initially */}
        <div className={`${selectedTopics.length > 0 ? 'w-2/3' : 'w-full'} flex flex-col transition-all duration-500`}>
          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4" style={{ scrollbarWidth: 'none' }}>
            <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
              {/* Selected Topics - Compact Version */}
              {selectedTopics.length > 0 && (
                <Card className="backdrop-blur-sm bg-white/80 dark:bg-slate-800/80 border-0 shadow-lg">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-200">
                        Selected Topics
                      </h3>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {selectedTopics.length} topic{selectedTopics.length > 1 ? 's' : ''}
                      </span>
                    </div>
                    {isLoading ? (
                      <div className="flex flex-wrap gap-1 sm:gap-2">
                        {[1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className="h-5 sm:h-6 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 rounded-full animate-pulse"
                            style={{
                              width: `${60 + (i * 10)}px`,
                              animationDelay: `${i * 0.2}s`,
                              animationDuration: '1.5s'
                            }}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-1 sm:gap-2">
                        {selectedTopics.map((topic, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm animate-fade-in"
                            style={{ animationDelay: `${index * 0.1}s` }}
                          >
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Summary Card - Compact Design */}
              <Card className="backdrop-blur-sm bg-white/80 dark:bg-slate-800/80 border-0 shadow-xl flex flex-col h-[calc(100vh-16rem)] mb-8">
                <CardHeader className="pb-3 sm:pb-4 flex-shrink-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 flex-shrink-0 hidden sm:block" />
                      <div>
                        <CardTitle className="text-sm sm:text-base leading-tight">
                          Your Generated Summary
                        </CardTitle>
                        <CardDescription className="mt-1 text-sm hidden sm:block">
                          {isEditing ? 'Edit your summary content' : 'AI-generated summary ready for sharing'}
                        </CardDescription>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                      {isEditing ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCancelEdit}
                            className="text-xs px-2 py-1 h-7 sm:h-8"
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={handleSaveEdit}
                            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 text-xs px-2 py-1 h-7 sm:h-8"
                          >
                            <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 hidden sm:inline" />
                            Save
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleEdit}
                            className="text-xs px-2 py-1 h-7 sm:h-8"
                          >
                            <Edit3 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 hidden sm:inline" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRegenerate}
                            disabled={isRegenerating}
                            className="text-xs px-2 py-1 h-7 sm:h-8"
                          >
                            {isRegenerating ? (
                              <>
                                <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-1" />
                                <span className="hidden sm:inline">Regenerate</span>
                                <span className="sm:hidden">...</span>
                              </>
                            ) : (
                              <>
                                <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 hidden sm:inline" />
                                Regenerate
                              </>
                            )}
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0 flex-1 overflow-y-auto">
                  {isEditing ? (
                    <Textarea
                      value={editedSummary}
                      onChange={(e) => setEditedSummary(e.target.value)}
                      className="h-full text-base border-2 border-slate-200 dark:border-slate-600 focus:border-blue-500 bg-white dark:bg-slate-700 resize-none"
                      placeholder="Edit your summary..."
                    />
                  ) : isLoading ? (
                    <div className="h-full p-4 bg-slate-50 dark:bg-slate-700/30 rounded-lg space-y-4">
                      <div className="flex items-center space-x-3 mb-6">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full animate-pulse" />
                        <div className="h-6 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 rounded animate-pulse w-48" />
                      </div>

                      {/* Summary content skeleton */}
                      <div className="space-y-3">
                        {[
                          { width: '85%', delay: '0.1s' },
                          { width: '92%', delay: '0.2s' },
                          { width: '78%', delay: '0.3s' },
                          { width: '88%', delay: '0.4s' },
                          { width: '76%', delay: '0.5s' },
                          { width: '82%', delay: '0.6s' }
                        ].map((line, i) => (
                          <div
                            key={i}
                            className="h-4 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 rounded animate-pulse"
                            style={{
                              width: line.width,
                              animationDelay: line.delay,
                              animationDuration: '1.5s'
                            }}
                          />
                        ))}
                      </div>

                      {/* Hashtags section */}
                      <div className="flex space-x-2 mt-6">
                        {[
                          { width: '60px', delay: '0.2s' },
                          { width: '75px', delay: '0.4s' },
                          { width: '55px', delay: '0.6s' }
                        ].map((hashtag, i) => (
                          <div
                            key={i}
                            className="h-5 bg-gradient-to-r from-blue-200 to-purple-200 dark:from-blue-800 dark:to-purple-800 rounded-full animate-pulse"
                            style={{
                              width: hashtag.width,
                              animationDelay: hashtag.delay,
                              animationDuration: '1.5s'
                            }}
                          />
                        ))}
                      </div>

                      {/* Loading indicator */}
                      <div className="flex items-center justify-center mt-8 space-x-3">
                        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm text-slate-500 dark:text-slate-400 animate-pulse">
                          Generating your summary...
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="prose prose-lg max-w-none h-full">
                      <SimpleMarkdownRenderer content={generatedSummary} />
                      {/* End indicator */}
                      <div className="flex justify-center mt-8 mb-8">
                        <div className="flex items-center space-x-3 text-slate-400 dark:text-slate-500">
                          <div className="w-12 h-px bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-600 to-transparent"></div>
                          <span className="text-sm font-medium">End of Summary</span>
                          <div className="w-12 h-px bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-600 to-transparent"></div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Platform Selection - Shows when topics are selected */}
        {selectedTopics.length > 0 && (
          <div className="w-1/4 flex flex-col h-[calc(100vh-8rem)]">
            <div className="p-3 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
              <div className="text-center">
                <h2 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Choose Platforms
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Select where to share your summary
                </p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2" style={{ scrollbarWidth: 'none' }} >
              <div className="space-y-2 max-w-sm mx-auto ml-1">
                {platforms.map((platform) => {
                  const Icon = platform.icon;
                  const isSelected = selectedPlatforms.includes(platform.id);

                  return (
                    <div
                      key={platform.id}
                      className={`relative group cursor-pointer transition-all duration-300 hover:scale-105 ${
                        isSelected ? 'transform scale-105' : ''
                      }`}
                      onClick={() => handlePlatformToggle(platform.id)}
                    >
                      <div className={`p-2 border-2 transition-all duration-300 box-border ${
                        isSelected
                          ? 'bg-white dark:bg-slate-700 border-blue-300 dark:border-blue-600 shadow-md shadow-blue-500/20 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-sm w-[calc(100%-2px)]'
                          : 'bg-white/80 dark:bg-slate-700/80 border-slate-200 dark:border-slate-600 hover:border-blue-300 hover:bg-blue-50/50 dark:hover:bg-slate-600 rounded hover:w-[calc(100%-2px)]'
                      }`}>
                        <div className="flex items-center space-x-2">
                          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                            isSelected
                              ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white'
                              : 'bg-slate-100 dark:bg-slate-600 text-slate-600 dark:text-slate-300 group-hover:bg-blue-100 dark:group-hover:bg-slate-500'
                          }`}>
                            <Icon className="w-4 h-4" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <h3 className={`font-semibold text-xs transition-colors duration-300 truncate ${
                              isSelected ? 'text-slate-800 dark:text-slate-200' : 'text-slate-800 dark:text-slate-200'
                            }`}>
                              {platform.name}
                            </h3>
                            <p className={`text-xs transition-colors duration-300 ${
                              isSelected ? 'text-slate-600 dark:text-slate-300' : 'text-slate-500 dark:text-slate-400'
                            }`}>
                              {isSelected ? 'Selected' : 'Click to select'}
                            </p>
                          </div>

                          {/* Selection Indicator */}
                          {isSelected && (
                            <div className="flex-shrink-0">
                              <div className="w-4 h-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Selection Summary */}
                {selectedPlatforms.length > 0 && (
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-xs text-blue-800 dark:text-blue-200">
                      ✨ Ready to create posts on {selectedPlatforms.length} platform{selectedPlatforms.length > 1 ? 's' : ''}: {selectedPlatforms.join(', ')}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="p-3 border-t border-slate-200 dark:border-slate-700 flex-shrink-0">
              <div className="flex justify-center">
                <Button
                  onClick={handleShareToPlatforms}
                  disabled={selectedPlatforms.length === 0 || isCreatingPosts}
                  size="lg"
                  className="bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-700 hover:from-emerald-700 hover:via-green-700 hover:to-emerald-800 text-white border-0 shadow-xl hover:shadow-emerald-500/30 transition-all duration-300 transform hover:scale-105 px-4 py-2 text-sm font-semibold rounded-full w-full max-w-xs"
                >
                  {isCreatingPosts ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Creating Posts...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Approve and Create Posts
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
