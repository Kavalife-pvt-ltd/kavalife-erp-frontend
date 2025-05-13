import { Button } from '@/components/ui/button';

const Dashboard = () => {
  return (
    <section className="space-y-6">
      {/* Page Header */}
      <header className="flex justify-between items-center text-black">
        <h1 className="text-2xl font-bold">Dashboard Overview</h1>
        <Button className="bg-primary text-white hover:bg-blue-600">Create New Entry</Button>
      </header>

      {/* Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 text-black">
        <article className="bg-white dark:bg-gray-100 p-6 rounded-xl shadow-lg border border-border">
          <h2 className="text-lg font-semibold mb-2">Items Overview</h2>
          <p className="text-muted">Current stock, availability, etc.</p>
        </article>

        <article className="bg-white dark:bg-gray-100 p-6 rounded-xl shadow-lg border border-border">
          <h2 className="text-lg font-semibold mb-2">Task Reminders</h2>
          <p className="text-muted">Pending tasks and deadlines.</p>
        </article>
      </section>
    </section>
  );
};

export default Dashboard;
