'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useFirebase } from '@/firebase';
import { User, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function UserProfile() {
  const { user } = useFirebase();
  const { toast } = useToast();

  // Mock hashed password display (since Firebase handles auth)
  const getHashedPassword = () => {
    // Create a mock hash display using asterisks and dots
    return 'sha256$' + '•'.repeat(16) + '*' + '•'.repeat(16);
  };

  const handleConnectPlatform = (platform: string) => {
    toast({
      title: `${platform} Connection`,
      description: `${platform} integration coming soon. API connection pending.`,
    });
  };

  if (!user) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center gap-2 border-slate-200 dark:border-slate-600 hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200"
        >
          <User className="h-4 w-4" />
          <span className="hidden sm:inline">Profile</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end" forceMount sideOffset={8}>
        <DropdownMenuLabel className="font-normal p-4">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-5 w-5 text-blue-600" />
            <span className="font-semibold text-lg">User Profile</span>
          </div>
          <div className="space-y-2">
            <div>
              <p className="text-sm text-muted-foreground">Email Address</p>
              <p className="font-medium text-base">{user.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Password Hash</p>
              <p className="font-medium text-sm font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-700 dark:text-slate-300">
                {getHashedPassword()}
              </p>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup className="p-2">
          <p className="text-sm font-medium text-muted-foreground px-2 py-1 mb-2">Social Media Connections</p>
          <div className="grid grid-cols-1 gap-2">
            <DropdownMenuItem
              onClick={() => handleConnectPlatform('Facebook')}
              className="cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 p-3 rounded-lg flex items-center gap-3"
            >
              <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                <span className="text-white font-bold text-xs">f</span>
              </div>
              <span className="font-medium">Connect to Facebook</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleConnectPlatform('Instagram')}
              className="cursor-pointer hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50 dark:hover:from-pink-900/20 dark:hover:to-purple-900/20 p-3 rounded-lg flex items-center gap-3"
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-xs">i</span>
              </div>
              <span className="font-medium">Connect to Instagram</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleConnectPlatform('Instagram')}
              className="cursor-pointer hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50 dark:hover:from-pink-900/20 dark:hover:to-purple-900/20 p-3 rounded-lg flex items-center gap-3"
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-xs">i</span>
              </div>
              <span className="font-medium">Connect to Instagram</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleConnectPlatform('X')}
              className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 p-3 rounded-lg flex items-center gap-3"
            >
              <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center">
                <span className="text-white font-bold text-xs">X</span>
              </div>
              <span className="font-medium">Connect to X</span>
            </DropdownMenuItem>
          </div>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
