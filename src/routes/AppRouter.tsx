import { Routes, Route } from 'react-router-dom';
import Login from '@/pages/Login';
import ProtectedLayout from '@/components/protected/ProtectedLayout';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { DashboardHome } from '@/pages/dashboard/production/Home';
import { Inventory } from '@/pages/dashboard/production/Inventory';
import { TaskList } from '@/pages/dashboard/production/Tasks';
import { VehicleInspection } from '@/pages/dashboard/production/VehicleInspection';
import { GoodsReceivedNote } from '@/pages/dashboard/production/GoodsReceivedNote';
import ExtractionPage from '@/pages/dashboard/production/Extraction';
import ExtractionFormPage from '@/components/forms/ExtractionFormPage';
import StrippingPage from '@/pages/dashboard/production/Stripping';
import StrippingFormPage from '@/components/forms/StrippingFormPage';
import PurificationPage from '@/pages/dashboard/production/Purification';
import PurificationFormPage from '@/components/forms/PurificationFormPage';
import Sales from '@/pages/dashboard/sales/Sales';
import EmployeePanel from '@/pages/dashboard/admin/EmployeePanel';
import RequestAccess from '@/pages/RequestAccess';

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/request-access" element={<RequestAccess />} />

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

          <Route path="sales" element={<Sales />} />

          <Route path="employees" element={<EmployeePanel />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRouter;
