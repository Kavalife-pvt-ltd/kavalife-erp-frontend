import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { loginUser } from '@/api/auth';
import { useAuthContext } from '@/hooks/useAuthContext';
import { useBootstrapStore } from '@/store/bootstrap';

const Login = () => {
  const isDev = import.meta.env.DEV;
  const [username, setUsername] = useState(isDev ? (import.meta.env.VITE_DEV_EMAIL ?? '') : '');
  const [password, setPassword] = useState(isDev ? (import.meta.env.VITE_DEV_PASSWORD ?? '') : '');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setAuthUser } = useAuthContext();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await loginUser(username, password);
      await useBootstrapStore.getState().load();
      setAuthUser(user.data);
      navigate('/');
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('An unknown error occurred.');
      }
    }

    setLoading(false);
  };

  return (
    <main className="flex h-screen w-screen bg-white dark:bg-slate-400">
      {/* Company Logo */}
      <header className="absolute top-4 left-4">
        <img
          src="https://kavalife.in/wp-content/uploads/2024/05/logo.png"
          alt="Kavalife logo"
          className="h-12 w-auto"
        />
      </header>

      {/* Login Section */}
      <section className="m-auto w-full max-w-sm p-6 bg-gray-100 rounded-lg shadow-md dark:bg-gray-100">
        <h1 className="text-2xl font-bold text-center mb-6 text-black ">Login</h1>

        <form onSubmit={handleLogin} aria-label="Login form">
          {/* username/ID */}
          <div className="mb-4">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              username / ID
            </label>
            <input
              type="text"
              id="username"
              name="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username or ID"
              className="mt-1 block w-full px-3 py-2 border text-black border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Password */}
          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 ">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="mt-1 block w-full px-3 py-2 border text-black border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            disabled={loading}
          >
            {loading ? 'Logging in…' : 'Login'}
          </button>
        </form>
      </section>
    </main>
  );
};

export default Login;
