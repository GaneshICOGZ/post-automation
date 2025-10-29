'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PostAutomationPlatformIcon } from '@/components/app/post-automation-platform-icon';
import UserNav from '@/components/app/user-nav';
import { ThemeToggle } from '@/components/app/theme-toggle';
import { Sparkles, Wand2, Plus, ArrowLeft, User } from 'lucide-react';
import { PostService } from '@/lib/services/postService';
import { useToast } from '@/hooks/use-toast';
import { useAuthCheck } from '@/hooks/use-auth-check';

export default function CreatePostPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [manualTopic, setManualTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [addedTopics, setAddedTopics] = useState<string[]>([]);

  // Check authentication on page load
  useAuthCheck({ checkOnMount: true });

  const defaultTopics = [
    'Artificial Intelligence',
    'Climate Change',
    'Digital Marketing',
    'Remote Work',
    'Mental Health',
    'Sustainable Living',
    'Cryptocurrency',
    'Space Exploration',
    'Wellness & Fitness',
    'Personal Finance',
    'Future of Education',
    'Cybersecurity'
  ];

  const allTopics = [...defaultTopics, ...addedTopics];

  const handleTopicToggle = (topic: string) => {
    const isCurrentlySelected = selectedTopics.includes(topic);
    const isAddedTopic = addedTopics.includes(topic);

    if (isCurrentlySelected) {
      setSelectedTopics(prev => prev.filter(t => t !== topic));
      if (isAddedTopic) setAddedTopics(prev => prev.filter(t => t !== topic));
    } else {
      setSelectedTopics(prev => [...prev, topic]);
    }
  };

  const handleAddManualTopic = () => {
    const trimmedTopic = manualTopic.trim();
    if (trimmedTopic && !allTopics.includes(trimmedTopic)) {
      setAddedTopics(prev => [...prev, trimmedTopic]);
      setSelectedTopics(prev => [...prev, trimmedTopic]);
      setManualTopic('');
    }
  };

  const handleGenerateSummary = async () => {
    if (selectedTopics.length === 0 || isGenerating) return;

    console.log('Generate Summary button clicked - starting generation process');
    setIsGenerating(true);

    try {
      // Call the FastAPI backend to generate summary (only one call)
      console.log('Making API call to generate summary for topics:', selectedTopics);
      const response = await PostService.generateSummary(selectedTopics);
      console.log('API response received:', response);

      // Store the response data in localStorage for the next page
      if (typeof window !== 'undefined') {
        const summaryText = (response as any).summary_text ?? response.summary ?? '';
        console.log('Storing summary data in localStorage:', {
          selectedTopics,
          summary: summaryText,
          summaryId: (response as any).summary_id || response.summaryId,
          timestamp: new Date().toISOString(),
        });
        localStorage.setItem(
          'generatedSummaryData',
          JSON.stringify({
            selectedTopics,
            summary: summaryText,
            summaryId: (response as any).summary_id || response.summaryId,
            timestamp: new Date().toISOString(),
          })
        );
      }

      toast({
        title: 'Summary Generated!',
        description: 'Your AI-generated summary is ready.',
      });

      // Redirect to the generated summary page
      router.push('/generated-summary');
    } catch (error: any) {
      console.error('Error in handleGenerateSummary:', error);

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
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex flex-col">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-blue-400/15 to-purple-400/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-gradient-to-br from-indigo-400/15 to-cyan-400/15 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/3 left-1/3 w-48 h-48 bg-gradient-to-br from-purple-400/8 to-pink-400/8 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <header className="sticky top-0 z-40 flex h-14 sm:h-16 items-center gap-1 sm:gap-2 md:gap-4 border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 px-2 sm:px-3 md:px-4 lg:px-6 backdrop-blur-sm">
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

        {/* Main Content */}
        <div className="flex-1 px-3 sm:px-4 pb-4 sm:pb-6 overflow-hidden">
          <div className="max-w-3xl mx-auto h-full flex flex-col">
            {/* Header Section */}
            <div className="text-center py-3 sm:py-4 mb-2 sm:mb-3 flex-shrink-0">

              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-slate-800 via-blue-800 to-slate-800 dark:from-slate-200 dark:via-blue-200 dark:to-slate-200 bg-clip-text text-transparent mb-2 leading-tight">
                Select Your Topics
              </h1>
              <p className="text-xs sm:text-sm md:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto px-2">
                Select your topics and generate engaging summaries with AI
              </p>
            </div>

            {/* Card Section */}
            <Card className="backdrop-blur-sm bg-white/80 dark:bg-slate-800/80 border-0 shadow-2xl shadow-slate-200/50 dark:shadow-slate-900/50 flex-1 flex flex-col min-h-0">
              <CardHeader className="text-center pb-0">

              </CardHeader>

              <CardContent className="flex-1 overflow-y-auto space-y-3 sm:space-y-4 p-3 sm:p-4">
                {/* Topics Grid */}
                <div className="space-y-3">
                  <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">
                    {addedTopics.length > 0 ? 'All Topics' : 'Trending Topics'}
                  </h3>
                  <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-2 sm:gap-2 md:gap-3">
                    {allTopics.map((topic, index) => (
                      <div
                        key={index}
                        className={`relative group cursor-pointer transition-all duration-300 flex ${
                          selectedTopics.includes(topic)
                            ? 'transform scale-105'
                            : 'hover:shadow-lg'
                        }`}
                        onClick={() => handleTopicToggle(topic)}
                      >
                        <div
                          className={`relative p-2 sm:p-3 rounded-lg border-2 transition-all duration-300 overflow-hidden flex-1 min-h-[50px] sm:min-h-[60px] flex items-center justify-center ${
                            selectedTopics.includes(topic)
                              ? 'bg-white dark:bg-slate-700 border-blue-300 dark:border-blue-600 shadow-lg shadow-blue-500/20 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-900/20 dark:to-indigo-900/20'
                              : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 hover:border-blue-300 hover:bg-blue-50/30 dark:hover:bg-slate-600'
                          }`}
                        >
                          {selectedTopics.includes(topic) && (
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 animate-pulse" />
                          )}
                          <div className="relative w-full text-center">
                            <span
                              className={`font-medium transition-colors duration-300 block text-xs sm:text-sm leading-tight ${
                                selectedTopics.includes(topic)
                                  ? 'text-slate-800 dark:text-slate-200'
                                  : 'text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400'
                              }`}
                            >
                              {topic}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Add Custom Topic */}
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-base sm:text-lg font-semibold text-slate-800 dark:text-slate-200">
                    Add Custom Topic
                  </h3>
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                    <Input
                      placeholder="Enter your custom topic..."
                      value={manualTopic}
                      onChange={(e) => setManualTopic(e.target.value)}
                      className="flex-1 h-10 sm:h-12 bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-500/20 text-sm sm:text-base"
                      onKeyPress={(e) =>
                        e.key === 'Enter' && handleAddManualTopic()
                      }
                    />
                    <Button
                      onClick={handleAddManualTopic}
                      disabled={!manualTopic.trim()}
                      className="h-10 sm:h-12 px-4 sm:px-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add
                    </Button>
                  </div>
                </div>

                {/* Generate Button */}
                <div className="flex justify-center pt-4 sm:pt-8">
                  <Button
                    onClick={handleGenerateSummary}
                    disabled={selectedTopics.length === 0 || isGenerating}
                    size="lg"
                    className="bg-gradient-to-r from-blue-500 via-purple-600 to-indigo-600 hover:from-blue-600 hover:via-purple-700 hover:to-indigo-700 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed px-8 sm:px-12 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-full w-full sm:w-auto"
                  >
                    <div className="flex items-center justify-center space-x-2 sm:space-x-3">
                      {isGenerating ? (
                        <>
                          <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span className="text-sm sm:text-base">Generating Summary...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                          <span className="text-sm sm:text-base">Generate Summary</span>
                          <Wand2 className="w-4 h-4 sm:w-5 sm:h-5" />
                        </>
                      )}
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
