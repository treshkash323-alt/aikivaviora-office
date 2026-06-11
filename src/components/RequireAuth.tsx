import { type ReactNode } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { IconLoader } from '../components/icons';
import { useAuth } from '../lib/auth';
import type { StaffRole } from '../lib/types';

export function RequireAuth({
  roles,
  children,
}: {
  roles?: StaffRole[];
  children?: ReactNode;
}) {
  const { loading, profile } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <IconLoader className="h-8 w-8 text-slate-500" />
      </div>
    );
  }

  if (!profile) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(profile.role)) {
    return <Navigate to="/app" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
