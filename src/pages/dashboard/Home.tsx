import { Button } from '@/components/ui/button';

// pages/dashboard/Home.tsx
export const DashboardHome = () => {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Welcome to your dashboard</h1>
        <Button className="bg-primary text-white hover:bg-blue-600">Create New Entry</Button>
      </div>
      <p className="text-captionPlaceholder">
        Here you'll find an overview of your activity, stats, and quick actions.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow border border-stroke">
          <h2 className="text-lg font-semibold mb-2">Recent Activity</h2>
          <p className="text-sm text-muted">No recent actions yet.</p>
        </div>
        <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow border border-stroke">
          <h2 className="text-lg font-semibold mb-2">System Status</h2>
          <p className="text-sm text-muted">All systems operational.</p>
        </div>
      </div>
    </section>
  );
};
