// src/pages/dashboard/admin/EmployeePanel.tsx
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { listNewUsers, listUsers } from '@/api/users';
import type { NewUser, User } from '@/types/users';
import ApproveUserModal from '@/components/ApproveUserModal';
import { useAuthContext } from '@/hooks/useAuthContext';

type Tab = 'pending' | 'employees';

export default function EmployeePanel() {
  const { authUser } = useAuthContext() as { authUser?: { role?: string } };
  const isAdmin = (authUser?.role ?? 'user') === 'admin';

  const [tab, setTab] = useState<Tab>('pending');
  const [loading, setLoading] = useState(false);

  const [pending, setPending] = useState<NewUser[]>([]);
  const [employees, setEmployees] = useState<User[]>([]);

  const [search, setSearch] = useState('');
  const [approveTarget, setApproveTarget] = useState<NewUser | null>(null);

  const filteredPending = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return pending;
    return pending.filter((u) =>
      [u.name, u.username, u.email, u.mob_number].some((x) => (x ?? '').toLowerCase().includes(q))
    );
  }, [pending, search]);

  const filteredEmployees = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return employees;
    return employees.filter((u) =>
      [u.name, u.username, u.email, u.phone_num, u.role, u.department].some((x) =>
        (x ?? '').toLowerCase().includes(q)
      )
    );
  }, [employees, search]);

  const refresh = async () => {
    setLoading(true);
    try {
      const [p, e] = await Promise.all([listNewUsers(), listUsers()]);
      setPending(p);
      setEmployees(e);
    } catch (err: unknown) {
      if (err instanceof Error) toast.error(err.message);
      else toast.error('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAdmin) return;
    refresh();
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-stroke bg-background p-6 text-primaryText">
          <div className="text-lg font-semibold">Not authorized</div>
          <div className="mt-1 text-sm opacity-80">Only admins can access Employee Panel.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-primaryText">Employee Panel</h1>
          <p className="text-sm text-primaryText/70">
            Approve new employees and view active users.
          </p>
        </div>

        <button
          onClick={refresh}
          disabled={loading}
          className={clsx(
            'rounded-lg border border-stroke px-3 py-2 text-sm text-primaryText',
            'hover:bg-accent/10 disabled:opacity-60'
          )}
        >
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {/* Tabs + Search */}
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          <button
            className={clsx(
              'rounded-lg px-3 py-2 text-sm border border-stroke',
              tab === 'pending'
                ? 'bg-stroke text-primaryText'
                : 'bg-transparent text-primaryText hover:bg-accent/10'
            )}
            onClick={() => setTab('pending')}
          >
            Pending Requests ({pending.length})
          </button>

          <button
            className={clsx(
              'rounded-lg px-3 py-2 text-sm border border-stroke',
              tab === 'employees'
                ? 'bg-stroke text-primaryText'
                : 'bg-transparent text-primaryText hover:bg-accent/10'
            )}
            onClick={() => setTab('employees')}
          >
            Employees ({employees.length})
          </button>
        </div>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name / username / email / phone…"
          className="w-full sm:w-80 rounded-lg border border-stroke bg-background px-3 py-2 text-sm text-primaryText focus:outline-none focus:ring-0"
        />
      </div>

      {/* Content Card */}
      <div className="mt-4 rounded-xl border border-stroke bg-background">
        {tab === 'pending' ? (
          <div className="p-3">
            {filteredPending.length === 0 ? (
              <div className="p-8 text-sm text-primaryText/70">
                No pending requests. Everyone’s either employed… or escaped.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="border-b border-stroke">
                    <tr className="text-left text-primaryText/80">
                      <th className="p-3">Name</th>
                      <th className="p-3">Username</th>
                      <th className="p-3">Email</th>
                      <th className="p-3">Mobile</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredPending.map((u) => (
                      <tr key={u.id} className="border-b border-stroke/60">
                        <td className="p-3 text-primaryText">{u.name}</td>
                        <td className="p-3 text-primaryText">{u.username}</td>
                        <td className="p-3 text-primaryText">{u.email || '-'}</td>
                        <td className="p-3 text-primaryText">{u.mob_number || '-'}</td>
                        <td className="p-3 text-right">
                          <button
                            className="rounded-lg bg-blue-600 px-3 py-2 text-xs text-white hover:bg-blue-700"
                            onClick={() => setApproveTarget(u)}
                          >
                            Approve
                          </button>
                          {/* Reject later when endpoint exists */}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div className="p-3">
            {filteredEmployees.length === 0 ? (
              <div className="p-8 text-sm text-primaryText/70">No employees found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="border-b border-stroke">
                    <tr className="text-left text-primaryText/80">
                      <th className="p-3">Name</th>
                      <th className="p-3">Username</th>
                      <th className="p-3">Email</th>
                      <th className="p-3">Phone</th>
                      <th className="p-3">Role</th>
                      <th className="p-3">Department</th>
                      <th className="p-3">Created</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredEmployees.map((u) => (
                      <tr key={u.id} className="border-b border-stroke/60">
                        <td className="p-3 text-primaryText">{u.name}</td>
                        <td className="p-3 text-primaryText">{u.username}</td>
                        <td className="p-3 text-primaryText">{u.email || '-'}</td>
                        <td className="p-3 text-primaryText">{u.phone_num || '-'}</td>
                        <td className="p-3 text-primaryText">{u.role}</td>
                        <td className="p-3 text-primaryText">{u.department}</td>
                        <td className="p-3 text-primaryText/80">
                          {u.created_at ? new Date(u.created_at).toLocaleString() : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Approve Modal */}
      {approveTarget && (
        <ApproveUserModal
          user={approveTarget}
          onClose={() => setApproveTarget(null)}
          onApproved={async () => {
            setApproveTarget(null);
            await refresh();
          }}
        />
      )}
    </div>
  );
}
