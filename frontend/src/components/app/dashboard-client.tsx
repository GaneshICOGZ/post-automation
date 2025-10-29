'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { generateInitialPosts } from '@/ai/flows/generate-initial-posts';
import { regeneratePostWithEdits } from '@/ai/flows/regenerate-post-with-edits';
import type { Post, Platform, Topic } from '@/lib/types';
import PostPreview from './post-preview';
import LoadingSkeleton from './loading-skeleton';
import placeholderData from '@/lib/placeholder-images.json';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Terminal, ChevronDown, ChevronUp, Smartphone, Monitor, X, FileText, Image as ImageIcon, ArrowLeft, Send, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/app/theme-toggle';
import UserNav from '@/components/app/user-nav';
import UserProfile from '@/components/app/user-profile';
import { PostService } from '@/lib/services/postService';
import { cn } from '@/lib/utils';


const allPlatforms: Platform[] = ['Facebook', 'X', 'Instagram', 'LinkedIn'];
const { placeholderImages } = placeholderData;
const defaultTopics: Topic[] = ['Technology', 'Health & Wellness'];

interface DashboardClientProps {
  children: React.ReactNode;
}

export default function DashboardClient({
  children,
}: DashboardClientProps) {
  const pathname = usePathname();
  const router = useRouter();

  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const userDocRef = useMemo(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);
  const { data: userData } = useDoc(userDocRef);

  const topics = useMemo(() => {
    // First check if we have selected topics from localStorage (client-side only)
    if (typeof window !== 'undefined') {
      const localStorageTopics = localStorage.getItem('selectedTopics');
      if (localStorageTopics) {
        try {
          const parsedTopics = JSON.parse(localStorageTopics);
          if (parsedTopics.length > 0) {
            return parsedTopics;
          }
        } catch (error) {
          console.warn('Error parsing selectedTopics from localStorage:', error);
        }
      }
    }

    // Fall back to Firestore data
    if (user?.isAnonymous) {
      return defaultTopics;
    }
    if (userData?.preferenceIds?.length > 0) {
      return userData.preferenceIds;
    }
    return defaultTopics;
  }, [user, userData]);

  const [posts, setPosts] = useState<Post[]>([]);
  const [publishedPosts, setPublishedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Persist posts to localStorage whenever posts change
  useEffect(() => {
    if (posts.length > 0 && typeof window !== 'undefined') {
      localStorage.setItem('dashboardPosts', JSON.stringify(posts));
    }
  }, [posts]);

  const [openPostId, setOpenPostId] = useState<string | null>(null);
  const [expandAllMode, setExpandAllMode] = useState(true);
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');

  // Editing panel state
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editingMode, setEditingMode] = useState<'text' | 'image' | null>(null);
  const [editingDescription, setEditingDescription] = useState('');
  const [isGeneratingEdit, setIsGeneratingEdit] = useState(false);
  const [regeneratingImagePostId, setRegeneratingImagePostId] = useState<string | null>(null);
  const [loadingImages, setLoadingImages] = useState<Set<string>>(new Set());

  // Store platform IDs for API calls
  const [platformIds, setPlatformIds] = useState<{[key: string]: string}>({});

  // Initialize platform IDs and summary ID from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Get summary ID from generated summary data (keeping for backward compatibility)
      const generatedSummaryData = localStorage.getItem('generatedSummaryData');
      if (generatedSummaryData) {
        try {
          const parsed = JSON.parse(generatedSummaryData);
          // Keep for backward compatibility but not used in regeneration
          console.log('Summary ID available:', parsed.summaryId || '');
        } catch (error) {
          console.warn('Error parsing generatedSummaryData:', error);
        }
      }

      // Get platform IDs from dashboard platform content
      const platformContentData = localStorage.getItem('dashboardPlatformContent');
      if (platformContentData) {
        try {
          const parsed = JSON.parse(platformContentData);
          const ids: {[key: string]: string} = {};
          parsed.platforms?.forEach((platform: any) => {
            const platformKey = platform.platform_name.toLowerCase();
            ids[platformKey] = platform.platform_id || platform.id || '';
          });
          setPlatformIds(ids);
        } catch (error) {
          console.warn('Error parsing platform content data:', error);
        }
      }
    }
  }, []);

  // Get selected platforms from localStorage or use all platforms as fallback
  const [platforms, setPlatforms] = useState<Platform[]>(allPlatforms);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedPlatforms = localStorage.getItem('dashboardSelectedPlatforms');
      if (savedPlatforms) {
        try {
          const parsedPlatforms = JSON.parse(savedPlatforms);
          if (parsedPlatforms.length > 0) {
            // Convert platform IDs to Platform type
            const platformMap: Record<string, Platform> = {
              'twitter': 'X',
              'linkedin': 'LinkedIn',
              'instagram': 'Instagram',
              'facebook': 'Facebook'
            };
            const mappedPlatforms = parsedPlatforms.map((id: string) => platformMap[id]).filter(Boolean) as Platform[];
            setPlatforms(mappedPlatforms);
          } else {
            setPlatforms(allPlatforms);
          }
        } catch (error) {
          console.warn('Error parsing selected platforms from localStorage:', error);
          setPlatforms(allPlatforms);
        }
      } else {
        setPlatforms(allPlatforms);
      }
    }
  }, []);

  const isGeneratorPage = pathname === '/dashboard';

  useEffect(() => {
    if (isUserLoading) {
      return; // Wait until user auth state is resolved
    }

    // Check authentication via cookies
    const checkAuthAndLoad = async () => {
      if (typeof window !== 'undefined') {
        const token = document.cookie.split(';').find(row => row.trim().startsWith('token='))?.split('=')[1];
        const accessToken = document.cookie.split(';').find(row => row.trim().startsWith('access_token='))?.split('=')[1];

        console.log('🔐 Dashboard auth check:', {
          hasToken: !!token,
          tokenLength: token?.length || 0,
          hasAccessToken: !!accessToken,
          accessTokenLength: accessToken?.length || 0,
          userExists: !!user,
          isUserLoading,
          allCookies: document.cookie.split(';').filter(c => c.trim()).map(c => {
            const [name, value] = c.split('=');
            return { name: name?.trim(), length: value?.length || 0 };
          })
        });

        if (!token && !accessToken && !user) {
          console.log('🚫 No authentication found, redirecting to login');
          const loginUrl = new URL('/login', window.location.origin);
          loginUrl.searchParams.set('t', Date.now().toString());
          loginUrl.searchParams.set('expired', 'true');
          window.location.href = loginUrl.toString();
          return;
        }
      }

      if (isGeneratorPage && posts.length === 0) {
        setLoading(true);
        setError(null);

        // Check if posts are already generated and cached
        if (typeof window !== 'undefined') {
          // First, try to load existing posts from persistent storage
          const existingPostsData = localStorage.getItem('dashboardPosts');
          if (existingPostsData) {
            try {
              const existingPosts = JSON.parse(existingPostsData);
              console.log('Dashboard: Loading existing posts from persistent storage:', existingPosts.length);

              // Update platform IDs for regeneration functionality
              const platformIds: {[key: string]: string} = {};
              existingPosts.forEach((post: Post) => {
                const platformKey = post.platform.toLowerCase();
                platformIds[platformKey] = post.id.split('-')[0] + '-platform-id'; // Fallback platform ID
              });
              setPlatformIds(platformIds);

              setPosts(existingPosts);

              // Set loading state for images
              const loadingImageSet = new Set<string>();
              existingPosts.forEach((post: Post) => {
                if (post.image) {
                  loadingImageSet.add(post.id);
                }
              });
              setLoadingImages(loadingImageSet);

              setLoading(false);

              // Simulate image loading time and clear loading state after 2 seconds
              setTimeout(() => {
                setLoadingImages(new Set());
              }, 2000);

              toast({
                title: 'Posts Restored!',
                description: `Restored ${existingPosts.length} posts from previous session.`,
              });

              return;
            } catch (error) {
              console.warn('Dashboard: Error parsing existing posts data:', error);
            }
          }

          // Check if we have platform content data from the generated-summary page
          const platformContentData = localStorage.getItem('dashboardPlatformContent');
          if (platformContentData) {
            try {
              const contentData = JSON.parse(platformContentData);
              console.log('Dashboard: Using platform content data from generated-summary page:', contentData);

              // Convert platform content to posts format
              const newPosts: Post[] = contentData.platforms
                .map((platform: any) => {
                  // Map platform names to match the expected format
                  const platformNameMap: Record<string, Platform> = {
                    'twitter': 'X',
                    'facebook': 'Facebook',
                    'instagram': 'Instagram',
                    'linkedin': 'LinkedIn'
                  };

                  const platformName = platformNameMap[platform.platform_name.toLowerCase()] || platform.platform_name;
                  console.log('Dashboard: Processing platform:', platform.platform_name, '->', platformName);

                  return {
                    id: `${platform.platform_name.toLowerCase()}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    platform: platformName as Platform,
                    content: platform.post_text,
                    image: platform.image_url,
                    imageHint: `Post for ${platform.platform_name}`,
                    author: {
                      name: user?.displayName || 'Post Automation Platform User',
                      avatar: user?.photoURL || 'https://picsum.photos/seed/user/40/40',
                    },
                  };
                });

              console.log('Dashboard: Generated posts from stored data:', newPosts);

              // Update platform IDs for regeneration functionality
              const platformIds: {[key: string]: string} = {};
              contentData.platforms.forEach((platform: any) => {
                const platformKey = platform.platform_name.toLowerCase();
                platformIds[platformKey] = platform.platform_id || platform.id || '';
              });
              setPlatformIds(platformIds);

              setPosts(newPosts);

              // Set loading state for images
              const loadingImageSet = new Set<string>();
              newPosts.forEach(post => {
                if (post.image) {
                  loadingImageSet.add(post.id);
                }
              });
              setLoadingImages(loadingImageSet);

              setLoading(false);

              // Store posts persistently for navigation between pages
              localStorage.setItem('dashboardPosts', JSON.stringify(newPosts));

              // Clear the platform content data after using it
              localStorage.removeItem('dashboardPlatformContent');

              // Simulate image loading time and clear loading state after 2 seconds
              setTimeout(() => {
                setLoadingImages(new Set());
              }, 2000);

              // Prevent auto-scroll by setting focus to body after posts are loaded
              setTimeout(() => {
                if (document.body) {
                  document.body.focus();
                }
              }, 100);

              toast({
                title: 'Posts Loaded Successfully!',
                description: `Loaded ${newPosts.length} posts from generated content.`,
              });

              return;
            } catch (error) {
              console.warn('Dashboard: Error parsing platform content data:', error);
            }
          }
        }

        // If no data available, show simple message
        console.log('Dashboard: No data found, showing message');
        setLoading(false);
        return;
      } else {
        setLoading(false);
      }
    };

    checkAuthAndLoad();
  }, [isUserLoading, user, isGeneratorPage, topics, router, toast, posts.length]);


  const memoizedChildren = useMemo(
    () =>
      React.isValidElement(children)
        ? React.cloneElement(children as React.ReactElement<any>, {
            publishedPosts,
          })
        : children,
    [children, publishedPosts]
  );

  const handleDelete = useCallback(
    (postId: string) => {
      setPosts(prev => prev.filter(p => p.id !== postId));
      toast({
        variant: 'destructive',
        title: 'Post Deleted',
        description: 'The post has been removed.',
      });
    },
    [toast]
  );

  const handleRegenerate = useCallback(
    async (postId: string, edits: string) => {
      const postIndex = posts.findIndex(p => p.id === postId);
      if (postIndex === -1) return;

      const originalPost = posts[postIndex];

      // Set loading state with animated content
      setPosts(prev =>
        prev.map(p => (p.id === postId ? {
          ...p,
          content: 'Generating content...',
          image: p.image // Keep original image during regeneration
        } : p))
      );

      try {
        const result = await regeneratePostWithEdits({
          originalPost: originalPost.content,
          userEdits: edits,
          topic: topics[0] || 'general',
          platform: originalPost.platform,
          imageUri: undefined,
        });

        const updatedImage = originalPost.image;

        setPosts(prev =>
          prev.map(p =>
            p.id === postId
              ? {
                  ...originalPost,
                  content: result.regeneratedPost,
                  image: updatedImage,
                }
              : p
          )
        );

        toast({
          title: 'Post Regenerated!',
          description: `A new version for ${originalPost.platform} has been created.`,
        });
      } catch (e) {
        console.error(e);
        toast({
          variant: 'destructive',
          title: 'Regeneration Error',
          description: 'Could not regenerate post. Please try again.',
        });
        setPosts(prev =>
          prev.map(p => (p.id === postId ? originalPost : p))
        );
      }
    },
    [posts, topics, toast]
  );

  const handlePublish = (post: Post) => {
    setPublishedPosts(prev => {
      if (prev.find(p => p.id === post.id)) {
        return prev;
      }
      return [...prev, post];
    });
    toast({
      title: 'Post Published!',
      description: `Your post for ${post.platform} has been published.`,
    });
  };

  const handlePostToPlatform = (post: Post) => {
    toast({
      title: 'Post Sent!',
      description: `Your post has been sent to ${post.platform}. (API integration pending)`,
    });
  };

  const handlePostAllToPlatforms = () => {
    const postCount = posts.length;
    toast({
      title: 'All Posts Sent!',
      description: `All ${postCount} posts have been sent to their respective platforms. (API integration pending)`,
    });
  };

  // Editing panel handlers
  const handleStartEditing = (postId: string, mode: 'text' | 'image') => {
    setEditingPostId(postId);
    setEditingMode(mode);
    setEditingDescription('');
  };

  const handleCloseEditing = () => {
    setEditingPostId(null);
    setEditingMode(null);
    setEditingDescription('');
  };

  const handleGenerateEdit = async () => {
    if (!editingPostId || !editingMode || !editingDescription.trim()) return;

    const postIndex = posts.findIndex(p => p.id === editingPostId);
    if (postIndex === -1) return;

    const originalPost = posts[postIndex];
    const platformKey = originalPost.platform.toLowerCase();

    setIsGeneratingEdit(true);

    try {
      if (editingMode === 'text') {
        // Handle text editing with API call and enhanced loading animation
        setPosts(prev =>
          prev.map(p => (p.id === editingPostId ? {
            ...p,
            content: 'Generating content...',
            image: p.image // Keep original image during text regeneration
          } : p))
        );

        try {
          // Get platform ID for the current post
          const platformId = platformIds[platformKey];

          if (!platformId) {
            throw new Error(`Platform ID not found for ${originalPost.platform}`);
          }

          console.log('Calling regeneratePostText with:', {
            platformId: platformId,
            userSuggestions: editingDescription,
            contentType: 'post'
          });

          const response = await PostService.regeneratePostText(platformId, editingDescription);

          console.log('regeneratePostText response:', response);

          setPosts(prev =>
            prev.map(p =>
              p.id === editingPostId
                ? {
                    ...originalPost,
                    content: response.regenerated_content,
                  }
                : p
            )
          );

          toast({
            title: 'Content Updated!',
            description: `Post content has been updated based on your instructions.`,
          });
        } catch (error: any) {
          console.error('Text regeneration error details:', {
            error: error,
            message: error?.message,
            response: error?.response,
            status: error?.response?.status,
            data: error?.response?.data,
            stack: error?.stack
          });

          let errorMessage = 'Could not update post content. Please try again.';

          if (error?.code === 'NETWORK_ERROR' || error?.message?.includes('Network Error')) {
            errorMessage = 'Cannot connect to server. Please check if your backend is running.';
          } else if (error?.response?.status === 404) {
            errorMessage = 'API endpoint not found. Please check your backend configuration.';
          } else if (error?.response?.status === 422) {
            errorMessage = 'Invalid data provided. Please check your input and try again.';
          } else if (error?.response?.status >= 500) {
            errorMessage = 'Server error. Please check your backend logs.';
          } else if (error?.response?.data?.detail) {
            errorMessage = error.response.data.detail || errorMessage;
          } else if (error?.response?.data?.message) {
            errorMessage = error.response.data.message || errorMessage;
          } else if (error?.message) {
            errorMessage = error.message;
          } else if (typeof error === 'string') {
            errorMessage = error;
          } else {
            errorMessage = 'An unknown error occurred. Please check the console for details.';
          }

          toast({
            variant: 'destructive',
            title: 'Content Update Failed',
            description: errorMessage,
          });

          // Reset loading state
          setPosts(prev =>
            prev.map(p => (p.id === editingPostId ? originalPost : p))
          );
        }
      } else if (editingMode === 'image') {
        // Handle image editing with API call
        setRegeneratingImagePostId(editingPostId);

        try {
          // Get platform ID for the current post
          const platformId = platformIds[platformKey];

          if (!platformId) {
            throw new Error(`Platform ID not found for ${originalPost.platform}`);
          }

          console.log('Calling regeneratePostImage with:', {
            platformId: platformId,
            userSuggestions: editingDescription,
            platformKey: platformKey
          });

          const response = await PostService.regeneratePostImage(platformId, editingDescription);

          console.log('regeneratePostImage response:', response);

          // Normalize possible response shapes and fall back to the original image if none returned
          const newImageUrl =
            (response as any).image_url ||
            (response as any).regenerated_image_url ||
            (response as any).regenerated_image;

          setPosts(prev =>
            prev.map(p =>
              p.id === editingPostId
                ? {
                    ...originalPost,
                    image: newImageUrl || originalPost.image,
                  }
                : {
                    ...p,
                    image: newImageUrl || p.image,
                  }
            )
          );

          toast({
            title: 'Image Updated!',
            description: `Post image has been updated based on your description.`,
          });
        } catch (error: any) {
          console.error('Image regeneration error details:', {
            error: error,
            message: error?.message,
            response: error?.response,
            status: error?.response?.status,
            data: error?.response?.data,
            stack: error?.stack
          });

          let errorMessage = 'Could not update post image. Please try again.';

          if (error?.code === 'NETWORK_ERROR' || error?.message?.includes('Network Error')) {
            errorMessage = 'Cannot connect to server. Please check if your backend is running.';
          } else if (error?.response?.status === 404) {
            errorMessage = 'API endpoint not found. Please check your backend configuration.';
          } else if (error?.response?.status === 422) {
            errorMessage = 'Invalid data provided. Please check your input and try again.';
          } else if (error?.response?.status >= 500) {
            errorMessage = 'Server error. Please check your backend logs.';
          } else if (error?.response?.data?.detail) {
            errorMessage = error.response.data.detail || errorMessage;
          } else if (error?.response?.data?.message) {
            errorMessage = error.response.data.message || errorMessage;
          } else if (error?.message) {
            errorMessage = error.message;
          } else if (typeof error === 'string') {
            errorMessage = error;
          } else {
            errorMessage = 'An unknown error occurred. Please check the console for details.';
          }

          toast({
            variant: 'destructive',
            title: 'Image Update Failed',
            description: errorMessage,
          });
        }
      }

      handleCloseEditing();
    } catch (e) {
      console.error('General Error:', e);
      toast({
        variant: 'destructive',
        title: 'Generation Error',
        description: 'Could not process your request. Please try again.',
      });

      // Reset loading state
      if (editingMode === 'text') {
        setPosts(prev =>
          prev.map(p => (p.id === editingPostId ? originalPost : p))
        );
      }
    } finally {
      setIsGeneratingEdit(false);
      setRegeneratingImagePostId(null);
    }
  };

  if (loading || isUserLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <Terminal className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!isGeneratorPage) {
    return <>{memoizedChildren}</>;
  }

  const allPostsClosed = openPostId === null && !expandAllMode;

  const handleToggleAll = () => {
    if (allPostsClosed) {
      setExpandAllMode(true);
      setOpenPostId(null);
    } else {
      setExpandAllMode(false);
      setOpenPostId(null);
    }
  };



  // Get the current post being edited
  const editingPost = editingPostId ? posts.find(p => p.id === editingPostId) : null;

  // If no posts (no platform content data), show simple message
  if (posts.length === 0) {
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
          <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 px-6 backdrop-blur-sm md:px-8 lg:px-12">
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
              className={cn(
                "whitespace-nowrap transition-all duration-300",
                pathname?.includes('/analytics') ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl" : ""
              )}
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

          {/* Simple Message */}
          <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4">
            <div className="text-center">
              <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-200 mb-2">
                posts are not fetched
              </h1>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
        <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 px-6 backdrop-blur-sm md:px-8 lg:px-12">
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
              className={cn(
                "whitespace-nowrap transition-all duration-300",
                pathname?.includes('/analytics') && "bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl"
              )}
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
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
              <div className="md:col-span-2 space-y-8">
                {/* View Mode Toggle and Post All */}
                <div className="flex justify-between items-center flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="flex items-center gap-1">
                      {viewMode === 'desktop' ? (
                        <>
                          <Monitor className="h-3 w-3" />
                          Desktop View
                        </>
                      ) : (
                        <>
                          <Smartphone className="h-3 w-3" />
                          Mobile View
                        </>
                      )}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handlePostAllToPlatforms}
                      disabled={posts.length === 0}
                      className="flex items-center gap-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 hover:from-green-600 hover:to-emerald-700"
                    >
                      <Send className="h-3 w-3" />
                      Post All ({posts.length})
                    </Button>
                    <Button
                      variant={viewMode === 'desktop' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('desktop')}
                      className="flex items-center gap-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 hover:from-blue-600 hover:to-purple-700"
                    >
                      <Monitor className="h-3 w-3" />
                      Desktop
                    </Button>
                    <Button
                      variant={viewMode === 'mobile' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('mobile')}
                      className="flex items-center gap-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-0 hover:from-emerald-600 hover:to-teal-700"
                    >
                      <Smartphone className="h-3 w-3" />
                      Mobile
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleToggleAll}
                      className="flex items-center gap-2"
                    >
                      {allPostsClosed ? (
                        <>
                          <ChevronDown className="h-4 w-4" />
                          Expand All
                        </>
                      ) : (
                        <>
                          <ChevronUp className="h-4 w-4" />
                          Collapse All
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {posts.map(post => (
                  <PostPreview
                    key={post.id}
                    post={post}
                    onRegenerate={handleRegenerate}
                    onDelete={handleDelete}
                    onPublish={handlePublish}
                    onPost={handlePostToPlatform}
                    globalImageUri={undefined}
                    isOpen={expandAllMode || openPostId === post.id}
                    onToggle={() => {
                      if (expandAllMode) {
                        setExpandAllMode(false);
                        setOpenPostId(post.id);
                      } else if (openPostId === post.id) {
                        setOpenPostId(null);
                      } else {
                        setOpenPostId(post.id);
                      }
                    }}
                    viewMode={viewMode}
                    onStartEditing={handleStartEditing}
                    isImageLoading={regeneratingImagePostId === post.id || loadingImages.has(post.id)}
                  />
                ))}
              </div>

              {/* Editing Panel */}
              {editingPost && (
                <div className="md:col-span-1">
                  <Card className="backdrop-blur-sm bg-white/80 dark:bg-slate-800/80 border-0 shadow-2xl shadow-slate-200/50 dark:shadow-slate-900/50 sticky top-24">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Edit {editingPost.platform} Post</CardTitle>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleCloseEditing}
                          className="h-8 w-8 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Mode Selection */}
                      <div className="space-y-3">
                        <p className="text-sm text-muted-foreground">What would you like to edit?</p>
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            variant="outline"
                            onClick={() => handleStartEditing(editingPost.id, 'text')}
                            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 hover:from-blue-600 hover:to-purple-700"
                          >
                            <FileText className="h-4 w-4" />
                            Text
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => handleStartEditing(editingPost.id, 'image')}
                            className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-0 hover:from-emerald-600 hover:to-teal-700"
                          >
                            <ImageIcon className="h-4 w-4" />
                            Image
                          </Button>
                        </div>
                      </div>

                      {/* Text Editing Mode */}
                      {editingMode === 'text' && (
                        <div className="space-y-3">
                          <div>
                            <label className="text-sm font-medium mb-2 block">
                              Describe the text changes you want:
                            </label>
                            <Textarea
                              placeholder="e.g., 'Make it funnier,' 'add three hashtags,' 'target a younger audience'"
                              value={editingDescription}
                              onChange={e => setEditingDescription(e.target.value)}
                              className="min-h-[100px]"
                            />
                          </div>
                          <Button
                            onClick={handleGenerateEdit}
                            disabled={!editingDescription.trim() || isGeneratingEdit}
                            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 hover:from-blue-600 hover:to-purple-700"
                          >
                            {isGeneratingEdit && editingMode === 'text' ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                Generating Content...
                              </>
                            ) : (
                              'Generate Updated Content'
                            )}
                          </Button>
                        </div>
                      )}

                      {/* Image Editing Mode */}
                      {editingMode === 'image' && (
                        <div className="space-y-3">
                          <div>
                            <label className="text-sm font-medium mb-2 block">
                              Describe the image you want:
                            </label>
                            <Textarea
                              placeholder="e.g., 'A modern office workspace,' 'a happy family scene,' 'a futuristic cityscape'"
                              value={editingDescription}
                              onChange={e => setEditingDescription(e.target.value)}
                              className="min-h-[100px]"
                            />
                          </div>
                          <Button
                            onClick={handleGenerateEdit}
                            disabled={!editingDescription.trim() || isGeneratingEdit}
                            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-0 hover:from-emerald-600 hover:to-teal-700"
                          >
                            {isGeneratingEdit && editingMode === 'image' ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                Generating Image...
                              </>
                            ) : (
                              'Generate New Image'
                            )}
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
