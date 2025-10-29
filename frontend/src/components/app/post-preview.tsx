'use client';


import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Skeleton } from '@/components/ui/skeleton';

import type { Post, platformDimensions, defaultEngagementMetrics } from '@/lib/types';
import { platformDimensions as dimensions, defaultEngagementMetrics as metrics } from '@/lib/types';
import { Sparkles, Repeat, MessageCircle, Heart, Share2, Upload, ChevronDown, Send } from 'lucide-react';

// Social media platform icons - using provided image URLs
const platformIcons = {
  Facebook: (
    <Image
      src="https://static.vecteezy.com/system/resources/previews/021/460/448/non_2x/facebook-logo-free-png.png"
      alt="Facebook"
      width={32}
      height={32}
      className="w-8 h-8"
    />
  ),
  X: (
    <Image
      src="https://static.vecteezy.com/system/resources/previews/027/395/710/original/twitter-brand-new-logo-3-d-with-new-x-shaped-graphic-of-the-world-s-most-popular-social-media-free-png.png"
      alt="X (Twitter)"
      width={32}
      height={32}
      className="w-8 h-8"
    />
  ),
  Instagram: (
    <Image
      src="https://static.vecteezy.com/system/resources/previews/018/910/697/original/instagram-mobile-app-logo-instagram-app-icon-ig-app-free-free-vector.jpg"
      alt="Instagram"
      width={32}
      height={32}
      className="w-8 h-8"
    />
  ),
  LinkedIn: (
    <Image
      src="https://static.vecteezy.com/system/resources/previews/018/910/715/non_2x/linkedin-logo-linkedin-symbol-linkedin-icon-free-free-vector.jpg"
      alt="LinkedIn"
      width={32}
      height={32}
      className="w-8 h-8"
    />
  ),
};


interface PostPreviewProps {
  post: Post;
  onRegenerate: (postId: string, edits: string) => Promise<void>;
  onDelete: (postId: string) => void;
  onPublish: (post: Post) => void;
  onPost?: (post: Post) => void;
  globalImageUri: string | undefined;
  isOpen: boolean;
  onToggle: () => void;
  viewMode?: 'desktop' | 'mobile';
  onStartEditing?: (postId: string, mode: 'text' | 'image') => void;
  isImageLoading?: boolean;
}

export default function PostPreview({ post, onRegenerate, onDelete, onPublish, onPost, globalImageUri, isOpen, onToggle, viewMode = 'desktop', onStartEditing, isImageLoading = false }: PostPreviewProps) {
  const handleRegenerateClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent event bubbling to CollapsibleTrigger
    // Instead of directly regenerating, open the editing panel
    if (onStartEditing) {
      onStartEditing(post.id, 'text');
    } else {
      // Fallback to direct regeneration if no editing panel
      onRegenerate(post.id, '');
    }
  };

  const handlePublishClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent event bubbling to CollapsibleTrigger
    onPublish(post);
  };

  const handlePostClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent event bubbling to CollapsibleTrigger
    if (onPost) {
      onPost(post);
    }
  };


  
  const isContentLoading = post.content === '...';
  const displayImage = globalImageUri || post.image;

  // Mobile view layout
  if (viewMode === 'mobile') {
    return (
      <Card className="backdrop-blur-sm bg-white/80 dark:bg-slate-800/80 border-0 shadow-2xl shadow-slate-200/50 dark:shadow-slate-900/50 w-full max-w-sm mx-auto overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
        <Collapsible open={isOpen} onOpenChange={onToggle}>
          <CollapsibleTrigger asChild>
            <CardHeader className="flex flex-row items-start justify-between space-x-0 p-3 cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex flex-row items-center space-x-3 flex-1">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={post.author.avatar} alt={post.author.name} />
                  <AvatarFallback className="text-xs">{post.author.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  {post.author.name === 'Post Automation Platform User' ? (
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8">
                        {platformIcons[post.platform]}
                      </div>
                      <span className="font-semibold text-sm">{post.platform}</span>
                    </div>
                  ) : (
                    <p className="font-semibold text-sm truncate">{post.author.name}</p>
                  )}

                </div>
              </div>
              <div className="flex items-center gap-1 ml-2">
                <Button
                  onClick={handleRegenerateClick}
                  variant="outline"
                  size="sm"
                  className="h-7 w-7 p-0"
                >
                  <Sparkles className="h-3 w-3" />
                </Button>
                <Button
                  onClick={handlePostClick}
                  variant="outline"
                  size="sm"
                  className="h-7 w-7 p-0 bg-gradient-to-r from-green-500 to-emerald-600 text-white border-green-500"
                  title="Post"
                >
                  <Send className="h-3 w-3" />
                </Button>
                <Button
                  onClick={handlePublishClick}
                  variant="outline"
                  size="sm"
                  className="h-7 w-7 p-0"
                >
                  <Upload className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="sm" className="p-1 h-6 w-6">
                  <ChevronDown className={cn("h-3 w-3 transition-transform duration-200", isOpen && "transform rotate-180")} />
                </Button>
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="p-3 pt-0 space-y-3">
            {isContentLoading || post.content === 'Generating content...' ? (
                <div className="space-y-2">
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm text-slate-500 dark:text-slate-400 animate-pulse">
                            Generating your content...
                        </span>
                    </div>
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-[90%]" />
                    <Skeleton className="h-3 w-[80%]" />
                </div>
            ) : (
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{post.content}</p>
            )}

              {displayImage && (
                <div className="relative w-full overflow-hidden rounded-lg border" style={{
                  aspectRatio: dimensions[post.platform]?.aspectRatio.replace(':', '/') || '16:9'
                }}>
                  <Image
                    src={displayImage}
                    alt={post.imageHint}
                    fill
                    className="object-cover"
                    data-ai-hint={post.imageHint}
                    priority
                    sizes="100vw"
                  />
                </div>
              )}

              <div className="text-xs text-muted-foreground pt-2">
                {post.platform === 'Instagram' ? (
                  <div className="space-y-1">
                    <div className="flex items-center gap-1">
                      <span className="font-semibold">{metrics[post.platform][0].value}</span>
                      <span>{metrics[post.platform][0].label}</span>
                    </div>
                    <div className="pt-1">
                      <p className="text-xs">View all {metrics[post.platform][1].value} comments</p>
                    </div>
                  </div>
                ) : post.platform === 'Facebook' ? (
                  <div className="flex justify-between items-center">
                    <div className="flex gap-3">
                      <div className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        <span className="text-xs">{metrics[post.platform][0].value}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="h-3 w-3" />
                        <span className="text-xs">{metrics[post.platform][1].value}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Share2 className="h-3 w-3" />
                        <span className="text-xs">{metrics[post.platform][2].value}</span>
                      </div>
                    </div>
                    <div className="text-xs">
                      {metrics[post.platform][3].value} {metrics[post.platform][3].label}
                    </div>
                  </div>
                ) : post.platform === 'X' ? (
                  <div className="flex justify-between items-center">
                    <div className="flex gap-4">
                      <div className="flex items-center gap-1">
                        <MessageCircle className="h-3 w-3" />
                        <span className="text-xs">{metrics[post.platform][2].value}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Repeat className="h-3 w-3" />
                        <span className="text-xs">{metrics[post.platform][1].value}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        <span className="text-xs">{metrics[post.platform][0].value}</span>
                      </div>
                    </div>
                    <div className="text-xs">
                      {metrics[post.platform][3].value} {metrics[post.platform][3].label}
                    </div>
                  </div>
                ) : post.platform === 'LinkedIn' ? (
                  <div className="flex justify-between items-center">
                    <div className="flex gap-3">
                      <div className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        <span className="text-xs">{metrics[post.platform][0].value}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="h-3 w-3" />
                        <span className="text-xs">{metrics[post.platform][1].value}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Share2 className="h-3 w-3" />
                        <span className="text-xs">{metrics[post.platform][2].value}</span>
                      </div>
                    </div>
                    <div className="text-xs">
                      {metrics[post.platform][3].value} {metrics[post.platform][3].label}
                    </div>
                  </div>
                ) : null}
              </div>
            </CardContent>

          </CollapsibleContent>
        </Collapsible>
      </Card>
    );
  }

  // Desktop view layout (original)
  return (
    <Card className="backdrop-blur-sm bg-white/80 dark:bg-slate-800/80 border-0 shadow-2xl shadow-slate-200/50 dark:shadow-slate-900/50 w-full max-w-2xl mx-auto overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <Collapsible open={isOpen} onOpenChange={onToggle}>
        <CollapsibleTrigger asChild>
          <CardHeader className="flex flex-row items-start justify-between space-x-0 p-4 cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex flex-row items-center space-x-4 flex-1">
              <Avatar>
                <AvatarImage src={post.author.avatar} alt={post.author.name} />
                <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                {post.author.name === 'Post Automation Platform User' ? (
                  <div className="flex items-center gap-2">
                      <div className="w-8 h-8">
                        {platformIcons[post.platform]}
                      </div>
                    <span className="font-semibold">{post.platform}</span>
                  </div>
                ) : (
                  <p className="font-semibold">{post.author.name}</p>
                )}

                <p className="text-xs text-muted-foreground mt-1">
                  Recommended: {dimensions[post.platform]?.recommended || 'Standard'} • {dimensions[post.platform]?.aspectRatio || '16:9'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <Button
                onClick={handleRegenerateClick}
                variant="outline"
                size="sm"
                className="h-8"
              >
                <Sparkles className="h-3 w-3" />
              </Button>
              <Button
                onClick={handlePostClick}
                variant="outline"
                size="sm"
                className="h-8 bg-gradient-to-r from-green-500 to-emerald-600 text-white border-green-500"
                title="Post"
              >
                <Send className="h-3 w-3" />
              </Button>
              <Button
                onClick={handlePublishClick}
                variant="outline"
                size="sm"
                className="h-8"
              >
                <Upload className="h-3 w-3" />
              </Button>
              <Button variant="ghost" size="sm" className="p-1 h-8 w-8">
                <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", isOpen && "transform rotate-180")} />
              </Button>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="p-4 pt-0 space-y-4">
            {isContentLoading || post.content === 'Generating content...' ? (
                <div className="space-y-2">
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm text-slate-500 dark:text-slate-400 animate-pulse">
                            Generating your content...
                        </span>
                    </div>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-[90%]" />
                    <Skeleton className="h-4 w-[80%]" />
                </div>
            ) : (
                <p className="whitespace-pre-wrap">{post.content}</p>
            )}

            {isImageLoading ? (
              <div className="relative w-full overflow-hidden rounded-lg border" style={{
                aspectRatio: dimensions[post.platform]?.aspectRatio.replace(':', '/') || '16:9'
              }}>
                <div className="absolute inset-0 flex items-center justify-center bg-muted">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm text-slate-500 dark:text-slate-400 animate-pulse">
                      Generating your image...
                    </span>
                  </div>
                </div>
              </div>
            ) : displayImage ? (
              <div className="relative w-full overflow-hidden rounded-lg border" style={{
                aspectRatio: dimensions[post.platform]?.aspectRatio.replace(':', '/') || '16:9'
              }}>
                <Image
                  src={displayImage}
                  alt={post.imageHint}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  data-ai-hint={post.imageHint}
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
            ) : null}

            <div className="text-sm text-muted-foreground pt-2">
              {post.platform === 'Instagram' ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-1">
                    <span className="font-semibold">{metrics[post.platform][0].value}</span>
                    <span>{metrics[post.platform][0].label}</span>
                  </div>
                  <div className="pt-1">
                    <p className="text-xs">View all {metrics[post.platform][1].value} comments</p>
                  </div>
                </div>
              ) : post.platform === 'Facebook' ? (
                <div className="flex justify-between items-center">
                  <div className="flex gap-4">
                    <div className="flex items-center gap-1">
                      <Heart className="h-4 w-4" />
                      <span>{metrics[post.platform][0].value}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="h-4 w-4" />
                      <span>{metrics[post.platform][1].value}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Share2 className="h-4 w-4" />
                      <span>{metrics[post.platform][2].value}</span>
                    </div>
                  </div>
                  <div className="text-xs">
                    {metrics[post.platform][3].value} {metrics[post.platform][3].label}
                  </div>
                </div>
              ) : post.platform === 'X' ? (
                <div className="flex justify-between items-center">
                  <div className="flex gap-6">
                    <div className="flex items-center gap-1">
                      <MessageCircle className="h-4 w-4" />
                      <span className="text-xs">{metrics[post.platform][2].value}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Repeat className="h-4 w-4" />
                      <span className="text-xs">{metrics[post.platform][1].value}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="h-4 w-4" />
                      <span className="text-xs">{metrics[post.platform][0].value}</span>
                    </div>
                  </div>
                  <div className="text-xs">
                    {metrics[post.platform][3].value} {metrics[post.platform][3].label}
                  </div>
                </div>
              ) : post.platform === 'LinkedIn' ? (
                <div className="flex justify-between items-center">
                  <div className="flex gap-4">
                    <div className="flex items-center gap-1">
                      <Heart className="h-4 w-4" />
                      <span>{metrics[post.platform][0].value}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="h-4 w-4" />
                      <span>{metrics[post.platform][1].value}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Share2 className="h-4 w-4" />
                      <span>{metrics[post.platform][2].value}</span>
                    </div>
                  </div>
                  <div className="text-xs">
                    {metrics[post.platform][3].value} {metrics[post.platform][3].label}
                  </div>
                </div>
              ) : null}
            </div>
          </CardContent>

        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
