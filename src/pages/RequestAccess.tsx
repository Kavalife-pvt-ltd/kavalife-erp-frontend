import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { createNewUser } from '@/api/users';

const RequestAccess = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [mobNumber, setMobNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const normalizedMobile = useMemo(() => mobNumber.replace(/\D/g, ''), [mobNumber]);

  const validate = () => {
    if (!name.trim()) return 'Please enter your name';
    if (!username.trim()) return 'Please enter a username';
    if (normalizedMobile.length !== 10) return 'Mobile number must be exactly 10 digits';
    if (!password) return 'Please enter a password';
    if (password.length < 6) return 'Password must be at least 6 characters';
    if (password !== confirmPassword) return 'Passwords do not match';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const err = validate();
    if (err) {
      toast.error(err);
      return;
    }

    setLoading(true);
    try {
      await createNewUser({
        username: username.trim(),
        name: name.trim(),
        email: email.trim() || undefined,
        password,
        mob_number: normalizedMobile,
      });

      toast.success('Request submitted. You’ll receive an email once approved.');
      navigate('/login');
    } catch (error: unknown) {
      if (error instanceof Error) toast.error(error.message);
      else toast.error('An unknown error occurred.');
    } finally {
      setLoading(false);
    }
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

      <section className="m-auto w-full max-w-sm p-6 bg-gray-100 rounded-lg shadow-md dark:bg-gray-100">
        <h1 className="text-2xl font-bold text-center mb-2 text-black">Request Access</h1>
        <p className="text-sm text-center mb-6 text-gray-600">
          Fill this form. Admin will approve your account, then you can log in.
        </p>

        <form onSubmit={handleSubmit} aria-label="Request access form">
          {/* Name */}
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Full name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              className="mt-1 block w-full px-3 py-2 border text-black border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Username */}
          <div className="mb-4">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Username / ID
            </label>
            <input
              type="text"
              id="username"
              name="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose a username (used for login)"
              className="mt-1 block w-full px-3 py-2 border text-black border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Mobile */}
          <div className="mb-4">
            <label htmlFor="mob_number" className="block text-sm font-medium text-gray-700">
              Mobile number
            </label>
            <input
              type="tel"
              id="mob_number"
              name="mob_number"
              required
              value={mobNumber}
              onChange={(e) => setMobNumber(e.target.value)}
              placeholder="10-digit mobile number"
              className="mt-1 block w-full px-3 py-2 border text-black border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="mt-1 text-xs text-gray-500">
              Digits only (we’ll validate 10 digits).
            </div>
          </div>

          {/* Email (optional) */}
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email (optional)
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email (for approval email)"
              className="mt-1 block w-full px-3 py-2 border text-black border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Password */}
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              className="mt-1 block w-full px-3 py-2 border text-black border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Confirm Password */}
          <div className="mb-6">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirm password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password"
              className="mt-1 block w-full px-3 py-2 border text-black border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            disabled={loading}
          >
            {loading ? 'Submitting…' : 'Submit request'}
          </button>

          {/* Back to login */}
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="mt-3 w-full px-4 py-2 text-blue-600 bg-transparent rounded-md hover:underline"
            disabled={loading}
          >
            Back to login
          </button>
        </form>
      </section>
    </main>
  );
};

export default RequestAccess;
