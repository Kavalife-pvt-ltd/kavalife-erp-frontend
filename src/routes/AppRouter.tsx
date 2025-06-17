import { Routes, Route } from 'react-router-dom';
import Login from '@/pages/Login';
import ProtectedLayout from '@/components/protected/ProtectedLayout';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { DashboardHome } from '@/pages/dashboard/Home';
import { Inventory } from '@/pages/dashboard/Inventory';
import { TaskList } from '@/pages/dashboard/Tasks';
import { VehicleInspection } from '@/pages/dashboard/VehicleInspection';
import { GoodsReceivedNote } from '@/pages/dashboard/GoodsReceivedNote';

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedLayout />}>
        <Route element={<DashboardLayout />}>
          <Route index element={<DashboardHome />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="tasks" element={<TaskList />} />
          <Route path="vir" element={<VehicleInspection />} />
          <Route path="grn" element={<GoodsReceivedNote />} />
          <Route path="extraction" element={<GoodsReceivedNote />} />
          <Route path="purification" element={<GoodsReceivedNote />} />
          <Route path="stripping" element={<GoodsReceivedNote />} />
          <Route path="decolorisation" element={<GoodsReceivedNote />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRouter;
