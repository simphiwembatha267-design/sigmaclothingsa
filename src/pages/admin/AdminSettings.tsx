import { Eye, EyeOff, Lock } from 'lucide-react';
import { PageHeader, Panel } from '@/components/admin/AdminUI';
import { useSiteGateAdmin } from '@/lib/site-settings';
import { toast } from 'sonner';

export default function AdminSettings() {
  const { enabled, isLoading, setEnabled, isSaving } = useSiteGateAdmin();

  const toggle = async () => {
    try {
      await setEnabled(!enabled);
      toast.success(enabled ? 'Password gate hidden' : 'Password gate visible', {
        description: enabled
          ? 'Visitors now go straight into the site.'
          : 'Visitors will see the early-access screen again.',
      });
    } catch {
      toast.error('Could not update the setting', { description: 'Please try again.' });
    }
  };

  return (
    <div>
      <PageHeader
        title="Settings"
        subtitle="Store visibility and configuration."
      />

      <Panel className="max-w-xl p-6">
        <div className="flex items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border">
              <Lock className="h-4 w-4" strokeWidth={1.5} />
            </span>
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] font-semibold">
                Password Gate
              </p>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground max-w-sm">
                When on, visitors see the early-access screen and must enter the password
                before browsing the store. Turn it off to open the site to everyone.
              </p>
              <p className="mt-3 text-[11px] font-semibold">
                {isLoading ? (
                  <span className="text-muted-foreground">Loading…</span>
                ) : enabled ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Eye className="h-3.5 w-3.5" /> Visible to visitors
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                    <EyeOff className="h-3.5 w-3.5" /> Hidden — site is open
                  </span>
                )}
              </p>
            </div>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={enabled}
            aria-label="Toggle password gate"
            disabled={isLoading || isSaving}
            onClick={toggle}
            className={`relative h-7 w-12 shrink-0 rounded-full transition-colors disabled:opacity-50 ${
              enabled ? 'bg-foreground' : 'bg-muted-foreground/30'
            }`}
          >
            <span
              className={`absolute top-1 h-5 w-5 rounded-full bg-background transition-all ${
                enabled ? 'left-6' : 'left-1'
              }`}
            />
          </button>
        </div>
      </Panel>
    </div>
  );
}
