import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from '@/pages/Login';
import ProtectedLayout from '@/components/protected/ProtectedLayout';
import Dashboard from '@/pages/Dashboard';

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />

        {/* Protected */}
        <Route element={<ProtectedLayout />}>
          <Route index element={<Dashboard />} />
          {/* Add nested routes here later, like:
                <Route path="inventory" element={<Inventory />} /> */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
