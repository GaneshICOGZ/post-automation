import { LucideIcon, Heart, MessageCircle, Share2, Linkedin, Twitter, Instagram, Facebook, Eye, Repeat, Bookmark, ThumbsUp, BarChart } from 'lucide-react';

export type Platform = 'Facebook' | 'X' | 'Instagram' | 'LinkedIn';

export type Topic =
  | 'Technology'
  | 'Health & Wellness'
  | 'Finance'
  | 'Travel'
  | 'Food & Cooking'
  | 'Fashion & Style';

export const topics: Topic[] = [
  'Technology',
  'Health & Wellness',
  'Finance',
  'Travel',
  'Food & Cooking',
  'Fashion & Style',
];

export type WritingStyle = 
  | 'Formal'
  | 'Casual'
  | 'Humorous'
  | 'Inspirational'
  | 'Educational';

export const writingStyles: WritingStyle[] = [
  'Formal',
  'Casual',
  'Humorous',
  'Inspirational',
  'Educational',
];


export interface Post {
  id: string;
  platform: Platform;
  content: string;
  image: string;
  imageHint: string;
  author: {
    name: string;
    avatar: string;
  };
}

export type PlatformIcon = {
  [key in Platform]: LucideIcon;
};

export interface EngagementMetric {
  label: string;
  value: string;
  icon: LucideIcon;
  change?: string;
  changeType?: 'positive' | 'negative';
}

export interface AnalyticsPost extends Post {
  engagement: EngagementMetric[];
}

export const platformIcons: { [key in Platform]: LucideIcon } = {
  Facebook: Facebook,
  X: Twitter,
  Instagram: Instagram,
  LinkedIn: Linkedin,
};

export interface PlatformDimensions {
  recommended: string;
  aspectRatio: string;
  usage: string;
  notes: string;
}

export const platformDimensions: { [key in Platform]: PlatformDimensions } = {
  Instagram: {
    recommended: '1080 × 1080 px',
    aspectRatio: '1:1',
    usage: 'Regular posts and carousel items',
    notes: 'Center the subject; avoid text near edges (safe zone ~90%)',
  },
  Facebook: {
    recommended: '1200 × 630 px',
    aspectRatio: '1.91:1',
    usage: 'Link preview and feed posts',
    notes: 'Wider aspect, emphasize main content horizontally',
  },
  LinkedIn: {
    recommended: '1200 × 627 px',
    aspectRatio: '1.91:1',
    usage: 'Feed posts and shared links',
    notes: 'Maintain professional composition; space for copy above/below',
  },
  X: {
    recommended: '1600 × 900 px',
    aspectRatio: '16:9',
    usage: 'Post preview images',
    notes: 'Prefer horizontal layouts; keep text minimal',
  },
};

export const defaultEngagementMetrics: { [key in Platform]: EngagementMetric[] } = {
  Facebook: [
    { label: 'Likes', value: '1.2k', icon: Heart, change: '+12%', changeType: 'positive' },
    { label: 'Comments', value: '48', icon: MessageCircle, change: '+5%', changeType: 'positive' },
    { label: 'Shares', value: '112', icon: Share2, change: '-3%', changeType: 'negative' },
    { label: 'Reach', value: '15.7k', icon: Eye, change: '+8%', changeType: 'positive' },
  ],
  X: [
    { label: 'Likes', value: '890', icon: Heart, change: '+15%', changeType: 'positive' },
    { label: 'Retweets', value: '230', icon: Repeat, change: '+20%', changeType: 'positive' },
    { label: 'Replies', value: '75', icon: MessageCircle, change: '+10%', changeType: 'positive' },
    { label: 'Impressions', value: '25.2k', icon: Eye, change: '+5%', changeType: 'positive' },
  ],
  Instagram: [
    { label: 'Likes', value: '3.4k', icon: Heart, change: '+18%', changeType: 'positive' },
    { label: 'Comments', value: '150', icon: MessageCircle, change: '-2%', changeType: 'negative' },
    { label: 'Saves', value: '450', icon: Bookmark, change: '+25%', changeType: 'positive' },
    { label: 'Reach', value: '45.1k', icon: Eye, change: '+11%', changeType: 'positive' },
  ],
  LinkedIn: [
    { label: 'Reactions', value: '560', icon: ThumbsUp, change: '+9%', changeType: 'positive' },
    { label: 'Comments', value: '90', icon: MessageCircle, change: '+14%', changeType: 'positive' },
    { label: 'Shares', value: '65', icon: Share2, change: '+7%', changeType: 'positive' },
    { label: 'Impressions', value: '18.9k', icon: BarChart, change: '+6%', changeType: 'positive' },
  ],
};
