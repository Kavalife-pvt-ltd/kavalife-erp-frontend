// pages/dashboard/Inventory.tsx
export const Inventory = () => {
  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold">Inventory Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow border border-stroke">
          <h2 className="text-lg font-semibold">Chilli Powder</h2>
          <p className="text-sm text-muted">Items: 12 | Weight: 8.2 kg</p>
        </div>
        <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow border border-stroke">
          <h2 className="text-lg font-semibold">Ginseng</h2>
          <p className="text-sm text-muted">Items: 7 | Weight: 5.5 kg</p>
        </div>
      </div>
    </section>
  );
};
