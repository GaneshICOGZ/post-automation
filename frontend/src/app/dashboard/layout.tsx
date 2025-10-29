
import { Suspense } from 'react';
import DashboardClient from '@/components/app/dashboard-client';
import LoadingSkeleton from '@/components/app/loading-skeleton';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="relative z-10 h-full">
        <Suspense fallback={<LoadingSkeleton />}>
          <DashboardClient>
            {children}
          </DashboardClient>
        </Suspense>
      </div>
    </div>
  );
}
