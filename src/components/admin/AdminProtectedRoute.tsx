import { Navigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/useAdminAuth';

export function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, isStaff, loading } = useAdminAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">Loading</p>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/admin" state={{ from: location.pathname }} replace />;
  }

  if (!isStaff) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background px-6 text-center">
        <p className="text-lg font-bold tracking-[-0.02em]">No admin access</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          This account is signed in but has not been granted staff access to the SIGMA admin portal.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
