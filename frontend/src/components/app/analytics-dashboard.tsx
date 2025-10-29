
'use client';

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { platformIcons, defaultEngagementMetrics } from '@/lib/types';
import type { Post, AnalyticsPost, EngagementMetric, Platform } from '@/lib/types';
import Image from 'next/image';
import { TrendingUp, TrendingDown, Info, Calendar, User, CheckCircle, XCircle, Clock, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import placeholderData from '@/lib/placeholder-images.json';
import apiClient from '@/lib/apiClient';

// Types for the API response
interface SummaryData {
  topic: string;
  summary_text: string;
  summary_approved: boolean;
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

interface PlatformData {
  platform_name: string;
  post_text: string;
  image_url: string;
  approved: boolean;
  published: boolean;
  published_at: string | null;
  error_message: string | null;
  id: string;
  summary_id: string;
  created_at: string;
  updated_at: string;
}

interface PostHistoryItem {
  summary: SummaryData;
  platforms: PlatformData[];
}

const { placeholderImages } = placeholderData;

const platformIconColors: { [key in Platform]: string } = {
    Facebook: 'bg-blue-100 dark:bg-blue-900/50',
    X: 'bg-sky-100 dark:bg-sky-900/50',
    Instagram: 'bg-rose-100 dark:bg-rose-900/50',
    LinkedIn: 'bg-indigo-100 dark:bg-indigo-900/50',
};


function MetricCard({ metric, platform }: { metric: EngagementMetric, platform: Platform }) {
    const ChangeIcon = metric.changeType === 'positive' ? TrendingUp : TrendingDown;
    const changeColor = metric.changeType === 'positive' ? 'text-emerald-500' : 'text-red-500';

    return (
        <div className="flex items-center gap-2 rounded-md bg-muted/30 p-2 min-h-[48px]">
            <div className={cn("flex size-6 items-center justify-center rounded-full border", platformIconColors[platform])}>
                <metric.icon className="size-3 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[10px] text-muted-foreground leading-none truncate">{metric.label}</p>
                <p className="text-sm font-semibold leading-none truncate">{metric.value}</p>
                {metric.change && (
                    <div className={cn("flex items-center gap-0.5 text-[9px] leading-none", changeColor)}>
                        <ChangeIcon className="size-2.5" />
                        <span>{metric.change}</span>
                    </div>
                )}
            </div>
        </div>
    );
}


// Helper function to format dates
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Helper function to get platform icon component
const getPlatformIcon = (platformName: string) => {
  // Handle case-insensitive matching and common variations
  const normalizedName = platformName.toLowerCase().trim();

  // Map common variations to canonical platform names
  const platformNameMap: { [key: string]: Platform } = {
    'facebook': 'Facebook',
    'fb': 'Facebook',
    'twitter': 'X',
    'x': 'X', // Twitter rebranded to X
    'instagram': 'Instagram',
    'ig': 'Instagram',
    'linkedin': 'LinkedIn',
    'li': 'LinkedIn',
  };

  const canonicalName = platformNameMap[normalizedName] || platformName;
  const platformKey = canonicalName as Platform;
  return platformIcons[platformKey] || platformIcons.Facebook;
};

// Helper function to get platform color
const getPlatformColor = (platformName: string) => {
  const platformKey = platformName as Platform;
  return platformIconColors[platformKey] || platformIconColors.Facebook;
};

// Platform Post Card Component
function PlatformPostCard({ platform, summary }: { platform: PlatformData; summary: SummaryData }) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const PlatformIcon = getPlatformIcon(platform.platform_name);

  // Truncate text to 2 lines (approximately 100 characters)
  const shouldTruncate = platform.post_text.length > 100;
  const truncatedText = shouldTruncate ? platform.post_text.substring(0, 100) + '...' : platform.post_text;

  return (
    <Card className="backdrop-blur-sm bg-white/80 dark:bg-slate-800/80 border-0 shadow-2xl shadow-slate-200/50 dark:shadow-slate-900/50 overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn("p-1.5 rounded-full", getPlatformColor(platform.platform_name))}>
              <PlatformIcon className="size-4 text-current" />
            </div>
            <span className="font-semibold capitalize text-sm">{platform.platform_name}</span>
          </div>
          <div className="flex items-center gap-1">
            <Badge
              variant={platform.approved ? "default" : "secondary"}
              className="text-xs"
            >
              {platform.approved ? (
                <>
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Approved
                </>
              ) : (
                <>
                  <XCircle className="w-3 h-3 mr-1" />
                  Pending
                </>
              )}
            </Badge>
            {platform.published && (
              <Badge variant="outline" className="text-xs">
                Published
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {platform.image_url && (
          <div className="relative w-full h-24 overflow-hidden rounded-lg border">
            <Image
              src={platform.image_url}
              alt={`${platform.platform_name} post image`}
              fill
              className="object-cover"
              sizes="200px"
            />
          </div>
        )}

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {isExpanded ? platform.post_text : truncatedText}
          </p>

          {shouldTruncate && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-auto p-0 text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              {isExpanded ? 'Show less' : 'Read more'}
            </Button>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDate(platform.created_at)}
          </span>

          {platform.published_at && (
            <span className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-green-500" />
              Published
            </span>
          )}
        </div>

        {platform.error_message && (
          <Alert variant="destructive" className="text-xs">
            <XCircle className="h-3 w-3" />
            <AlertDescription className="text-xs">
              {platform.error_message}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

// Main Dashboard Component
export default function AnalyticsDashboard() {
  const [postHistory, setPostHistory] = React.useState<PostHistoryItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedPlatform, setSelectedPlatform] = React.useState<string>('All');

  // Fetch post history data
  React.useEffect(() => {
    const fetchPostHistory = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiClient.get<PostHistoryItem[]>('/posts/history');
        setPostHistory(data);
      } catch (err: any) {
        console.error('Error fetching post history:', err);
        setError(err.message || 'Failed to fetch post history');
      } finally {
        setLoading(false);
      }
    };

    fetchPostHistory();
  }, []);

  // Flatten all platform posts for display
  const allPlatformPosts = React.useMemo(() => {
    return postHistory.flatMap(item =>
      item.platforms.map(platform => ({
        platform,
        summary: item.summary
      }))
    );
  }, [postHistory]);

  // Filter data based on selected platform
  const filteredPosts = React.useMemo(() => {
    if (selectedPlatform === 'All') {
      return allPlatformPosts;
    }
    return allPlatformPosts.filter(({ platform }) => platform.platform_name === selectedPlatform);
  }, [allPlatformPosts, selectedPlatform]);

  // Get unique platform options
  const platformOptions = React.useMemo(() => {
    const platforms = new Set<string>();
    postHistory.forEach(item => {
      item.platforms.forEach(platform => {
        platforms.add(platform.platform_name);
      });
    });
    return ['All', ...Array.from(platforms)];
  }, [postHistory]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-muted-foreground">Loading analytics data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <XCircle className="h-4 w-4" />
        <AlertTitle>Error Loading Analytics</AlertTitle>
        <AlertDescription>
          {error}
        </AlertDescription>
      </Alert>
    );
  }

  if (postHistory.length === 0) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>No Post History</AlertTitle>
        <AlertDescription>
          You haven't created any posts yet. Go to the "Create Post" section to generate and publish your first post.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Analytics Dashboard</h2>
          <p className="text-muted-foreground">
            Monitor your post performance and history ({postHistory.length} total posts)
          </p>
        </div>
        <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select platform" />
          </SelectTrigger>
          <SelectContent>
            {platformOptions.map(platform => (
              <SelectItem key={platform} value={platform}>
                {platform}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPosts.map(({ platform, summary }) => (
          <PlatformPostCard key={platform.id} platform={platform} summary={summary} />
        ))}
      </div>
    </div>
  );
}
