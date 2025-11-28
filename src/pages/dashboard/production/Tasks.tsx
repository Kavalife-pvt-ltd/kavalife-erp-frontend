// pages/dashboard/Tasks.tsx
import { TaskCard } from '@/components/ui/task-card';

export const TaskList = () => {
  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold">Tasks</h1>
      <TaskCard
        imageUrl="https://kavalife.in/wp-content/uploads/2024/05/img01.png"
        title="Pack kitchen items"
        description="Advance manufacturing facility based on outskirts of Bangalore"
        time="Due today at 3:00 PM"
        status="pending"
      />
      <TaskCard
        imageUrl="https://kavalife.in/wp-content/uploads/2024/05/img03.png"
        title="Label boxes by room"
        description="Diverse products portfolio"
        time="Due today at 5:00 PM"
        status="in-progress"
      />
    </section>
  );
};
