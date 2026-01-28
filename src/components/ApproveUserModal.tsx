import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import type { NewUser } from '@/types/users';
import { approveNewUser } from '@/api/users';

type Props = {
  user: NewUser;
  onClose: () => void;
  onApproved: () => Promise<void> | void;
};

const ROLE_OPTIONS = [
  { value: 'user', label: 'User' },
  { value: 'admin', label: 'Admin' },
] as const;

const DEPARTMENT_OPTIONS = [
  { value: 'sales', label: 'Sales' },
  { value: 'production', label: 'Production' },
  { value: 'purchase', label: 'Purchase' },
  { value: 'admin', label: 'Admin' },
] as const;

type Role = (typeof ROLE_OPTIONS)[number]['value'];
type Dept = (typeof DEPARTMENT_OPTIONS)[number]['value'];

export default function ApproveUserModal({ user, onClose, onApproved }: Props) {
  const [role, setRole] = useState<Role>('user');
  const [department, setDepartment] = useState<Dept>('production');
  const [customDepartment, setCustomDepartment] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (role === 'admin') {
      setDepartment('admin');
      setCustomDepartment('');
    } else if (department === 'admin') {
      setDepartment('production');
    }
  }, [department, role]);

  const finalDepartment = useMemo(() => {
    return (customDepartment.trim() || department).toLowerCase();
  }, [customDepartment, department]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const handleApprove = async () => {
    if (!finalDepartment) {
      toast.error('Please select a department');
      return;
    }

    setLoading(true);
    try {
      await approveNewUser({
        id: user.id,
        role,
        department: finalDepartment,
      });
      toast.success('User approved');
      await onApproved();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Approval failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md rounded-xl border border-stroke bg-background shadow-xl">
        {/* Header */}
        <div className="border-b border-stroke px-4 py-3">
          <h2 className="text-lg font-semibold text-primaryText">Approve Employee</h2>
          <p className="mt-1 text-sm text-primaryText/70">
            {user.name} ({user.username})
          </p>
        </div>

        {/* Body */}
        <div className="px-4 py-4 space-y-4">
          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-primaryText">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              disabled={loading}
              className="mt-1 w-full rounded-lg border border-stroke bg-background px-3 py-2 text-primaryText focus:outline-none focus:ring-0"
            >
              {ROLE_OPTIONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-primaryText/60">Admin has access to all sections.</p>
          </div>

          {/* Department */}
          <div>
            <label className="block text-sm font-medium text-primaryText">Department</label>

            <div className="mt-1 grid grid-cols-2 gap-2">
              <select
                value={department}
                onChange={(e) => {
                  setDepartment(e.target.value as Dept);
                  setCustomDepartment('');
                }}
                disabled={loading}
                className="rounded-lg border border-stroke bg-background px-3 py-2 text-primaryText focus:outline-none focus:ring-0"
              >
                {DEPARTMENT_OPTIONS.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>

              <input
                value={customDepartment}
                onChange={(e) => setCustomDepartment(e.target.value)}
                placeholder="Custom dept"
                disabled={loading}
                className={clsx(
                  'rounded-lg border bg-background px-3 py-2 text-primaryText focus:outline-none focus:ring-0',
                  customDepartment ? 'border-accent' : 'border-stroke'
                )}
              />
            </div>

            <p className="mt-1 text-xs text-primaryText/60">
              Stored as: <span className="font-medium">{finalDepartment}</span>
            </p>
          </div>

          {/* Summary */}
          <div className="rounded-lg border border-stroke bg-accent/5 p-3 text-sm text-primaryText">
            <div className="font-medium mb-1">Request details</div>
            <div>Name: {user.name}</div>
            <div>Username: {user.username}</div>
            <div>Email: {user.email || '-'}</div>
            <div>Mobile: {user.mob_number || '-'}</div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 border-t border-stroke px-4 py-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="rounded-lg border border-stroke px-4 py-2 text-sm text-primaryText hover:bg-accent/10"
          >
            Cancel
          </button>

          <button
            onClick={handleApprove}
            disabled={loading}
            className="rounded-lg bg-accent px-4 py-2 text-sm text-primaryText hover:opacity-90 disabled:opacity-60"
          >
            {loading ? 'Approving…' : 'Approve'}
          </button>
        </div>
      </div>
    </div>
  );
}
