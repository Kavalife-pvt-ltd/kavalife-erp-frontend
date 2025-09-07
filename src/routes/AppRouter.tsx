import { Routes, Route } from 'react-router-dom';
import Login from '@/pages/Login';
import ProtectedLayout from '@/components/protected/ProtectedLayout';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { DashboardHome } from '@/pages/dashboard/Home';
import { Inventory } from '@/pages/dashboard/Inventory';
import { TaskList } from '@/pages/dashboard/Tasks';
import { VehicleInspection } from '@/pages/dashboard/VehicleInspection';
import { GoodsReceivedNote } from '@/pages/dashboard/GoodsReceivedNote';
import ExtractionPage from '@/pages/dashboard/Extraction';
import ExtractionFormPage from '@/components/forms/ExtractionFormPage';
import StrippingPage from '@/pages/dashboard/Stripping';
import StrippingFormPage from '@/components/forms/StrippingFormPage';
import PurificationPage from '@/pages/dashboard/Purification';
import PurificationFormPage from '@/components/forms/PurificationFormPage';

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
          <Route path="extraction" element={<ExtractionPage />} />
          <Route path="extraction/form" element={<ExtractionFormPage />} />
          <Route path="stripping" element={<StrippingPage />} />
          <Route path="stripping/form" element={<StrippingFormPage />} />
          <Route path="purification" element={<PurificationPage />} />
          <Route path="purification/form" element={<PurificationFormPage />} />
          <Route path="decolorisation" element={<GoodsReceivedNote />} />
          <Route path="decolorisation/form" element={<GoodsReceivedNote />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRouter;
