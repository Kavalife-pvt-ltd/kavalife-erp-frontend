import { Navigate, Outlet } from 'react-router-dom';
import { useAuthContext } from '@/hooks/useAuthContext';
import { Loader } from '@/components/ui/Loader';

const ProtectedLayout = () => {
  const { authUser, isLoading } = useAuthContext();

  if (isLoading) {
    return <Loader />;
  }

  if (!authUser) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedLayout;
