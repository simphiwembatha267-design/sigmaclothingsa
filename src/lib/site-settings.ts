import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const KEY = 'password_gate_enabled';

type SettingRow = {
  id: string;
  key: string;
  bool_value: boolean;
};

/** Whether the storefront password gate is enabled. Defaults to enabled while loading. */
export function useSiteGate() {
  const { data, isLoading } = useQuery({
    queryKey: ['site-settings', KEY],
    staleTime: 30_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('id, key, bool_value')
        .eq('key', KEY)
        .maybeSingle();
      if (error) throw error;
      return (data as SettingRow | null)?.bool_value ?? true;
    },
  });
  // Default to showing the gate until we know otherwise (fail closed).
  return { gateEnabled: data ?? true, isLoading };
}

/** Admin: read + update the gate setting. */
export function useSiteGateAdmin() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ['site-settings', KEY],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('id, key, bool_value')
        .eq('key', KEY)
        .maybeSingle();
      if (error) throw error;
      return data as SettingRow | null;
    },
  });

  const mutation = useMutation({
    mutationFn: async (enabled: boolean) => {
      if (query.data?.id) {
        const { error } = await supabase
          .from('site_settings')
          .update({ bool_value: enabled })
          .eq('id', query.data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('site_settings')
          .insert({ key: KEY, bool_value: enabled });
        if (error) throw error;
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['site-settings'] }),
  });

  return {
    enabled: query.data?.bool_value ?? true,
    isLoading: query.isLoading,
    setEnabled: mutation.mutateAsync,
    isSaving: mutation.isPending,
  };
}
