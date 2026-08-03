import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function AdminResetPassword() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) return setError('Password must be at least 8 characters.');
    if (password !== confirm) return setError('Passwords do not match.');
    setBusy(true);
    setError('');
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) return setError(error.message);
    toast.success('Password updated.');
    navigate('/admin/dashboard', { replace: true });
  };

  const input =
    'w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-foreground placeholder:text-muted-foreground';

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 font-body text-foreground">
      <div className="w-full max-w-sm">
        <p className="mb-12 text-center text-xl font-bold tracking-[0.4em]">SIGMA</p>
        <h1 className="mb-8 text-xl font-bold uppercase tracking-[-0.03em]">Set New Password</h1>
        <form onSubmit={submit} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New password"
            className={input}
            autoComplete="new-password"
          />
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Confirm password"
            className={input}
            autoComplete="new-password"
          />
          {error && <p className="text-xs text-destructive">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="mt-4 w-full rounded-full bg-foreground py-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-background disabled:opacity-50"
          >
            {busy ? 'Saving' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
