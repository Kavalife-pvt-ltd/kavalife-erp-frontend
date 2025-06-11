import { Routes, Route } from 'react-router-dom';
import Login from '@/pages/Login';
import ProtectedLayout from '@/components/protected/ProtectedLayout';
import Dashboard from '@/pages/Dashboard';

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedLayout />}>
        <Route index element={<Dashboard />} />
      </Route>
    </Routes>
  );
};

export default AppRouter;
