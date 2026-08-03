import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type Mode = 'login' | 'forgot' | 'setup';

export default function AdminLogin() {
  const { signIn, resetPassword, session, isStaff, loading } = useAdminAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>('login');
  const [needsSetup, setNeedsSetup] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && session && isStaff) navigate('/admin/dashboard', { replace: true });
  }, [loading, session, isStaff, navigate]);

  useEffect(() => {
    supabase.functions
      .invoke('admin-bootstrap', { method: 'GET' })
      .then(({ data }) => {
        if (data?.needs_setup) {
          setNeedsSetup(true);
          setMode('setup');
        }
      })
      .catch(() => undefined);
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');

    if (mode === 'forgot') {
      const { error } = await resetPassword(email);
      setBusy(false);
      if (error) return setError(error);
      toast.success('Password reset link sent. Check your inbox.');
      setMode('login');
      return;
    }

    if (mode === 'setup') {
      const { data, error } = await supabase.functions.invoke('admin-bootstrap', {
        body: { email, password, full_name: fullName },
      });
      if (error || data?.error) {
        setBusy(false);
        return setError(
          typeof data?.error === 'string' ? data.error : (error?.message ?? 'Could not create the account.'),
        );
      }
      const signInResult = await signIn(email, password, remember);
      setBusy(false);
      if (signInResult.error) return setError(signInResult.error);
      toast.success('Owner account created.');
      navigate('/admin/dashboard', { replace: true });
      return;
    }

    const { error } = await signIn(email, password, remember);
    setBusy(false);
    if (error) return setError(error);
    navigate('/admin/dashboard', { replace: true });
  };

  const input =
    'w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-foreground placeholder:text-muted-foreground';

  const heading =
    mode === 'login' ? 'Sign In' : mode === 'forgot' ? 'Reset Password' : 'Create Owner Account';

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-16 font-body text-foreground">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm"
      >
        <div className="mb-12 text-center">
          <p className="text-xl font-bold tracking-[0.4em]">SIGMA</p>
          <p className="mt-2 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            Admin Portal
          </p>
        </div>

        <h1 className="mb-2 text-xl font-bold uppercase tracking-[-0.03em]">{heading}</h1>
        {mode === 'setup' && (
          <p className="mb-6 text-xs text-muted-foreground">
            No admin exists yet. Create the owner account — this can only be done once.
          </p>
        )}

        <form onSubmit={submit} className="mt-6 space-y-4">
          {mode === 'setup' && (
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Full name"
              className={input}
              autoComplete="name"
            />
          )}

          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            autoComplete="email"
            className={input}
          />

          {mode !== 'forgot' && (
            <input
              type="password"
              required
              minLength={mode === 'setup' ? 8 : undefined}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === 'setup' ? 'Password (min 8 characters)' : 'Password'}
              autoComplete={mode === 'setup' ? 'new-password' : 'current-password'}
              className={input}
            />
          )}

          {mode === 'login' && (
            <div className="flex items-center justify-between pt-1">
              <label className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-3.5 w-3.5 accent-current"
                />
                Remember me
              </label>
              <button
                type="button"
                onClick={() => {
                  setMode('forgot');
                  setError('');
                }}
                className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                Forgot password?
              </button>
            </div>
          )}

          {error && <p className="text-xs text-destructive">{error}</p>}

          <button
            type="submit"
            disabled={busy}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-foreground py-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-background transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {busy
              ? 'Please wait'
              : mode === 'login'
                ? 'Sign In'
                : mode === 'forgot'
                  ? 'Send Reset Link'
                  : 'Create Account'}
            <ArrowRight className="h-4 w-4" strokeWidth={1.6} />
          </button>

          {mode !== 'login' && !(mode === 'setup' && needsSetup) && (
            <button
              type="button"
              onClick={() => setMode('login')}
              className="w-full pt-2 text-center text-xs text-muted-foreground hover:text-foreground"
            >
              Back to sign in
            </button>
          )}
        </form>
      </motion.div>
    </div>
  );
}
