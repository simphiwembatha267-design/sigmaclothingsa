import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const KEY = 'password_gate_enabled';
const CLOSED_KEY = 'store_closed';

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

/** Whether the store is temporarily closed to shoppers. Defaults to open. */
export function useStoreClosed() {
  const { data, isLoading } = useQuery({
    queryKey: ['site-settings', CLOSED_KEY],
    staleTime: 30_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('id, key, bool_value')
        .eq('key', CLOSED_KEY)
        .maybeSingle();
      if (error) throw error;
      return (data as SettingRow | null)?.bool_value ?? false;
    },
  });
  return { closed: data ?? false, isLoading };
}

/** Admin: read + update a boolean setting by key. */
export function useBooleanSetting(key: string, fallback = true) {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ['site-settings', key],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('id, key, bool_value')
        .eq('key', key)
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
        const { error } = await supabase.from('site_settings').insert({ key, bool_value: enabled });
        if (error) throw error;
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['site-settings', key] }),
  });

  return {
    enabled: query.data?.bool_value ?? fallback,
    isLoading: query.isLoading,
    setEnabled: mutation.mutateAsync,
    isSaving: mutation.isPending,
  };
}

/** Admin: read + update the gate setting. */
export function useSiteGateAdmin() {
  return useBooleanSetting(KEY, true);
}

/** Read + update a JSON settings blob stored under one key. */
export function useJsonSetting<T extends Record<string, unknown>>(key: string, fallback: T) {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ['site-settings-json', key],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('id, key, value')
        .eq('key', key)
        .maybeSingle();
      if (error) throw error;
      return data as { id: string; key: string; value: T | null } | null;
    },
  });

  const mutation = useMutation({
    mutationFn: async (value: T) => {
      if (query.data?.id) {
        const { error } = await supabase
          .from('site_settings')
          .update({ value: value as never })
          .eq('id', query.data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('site_settings')
          .insert({ key, value: value as never, bool_value: true });
        if (error) throw error;
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['site-settings-json', key] }),
  });

  return {
    value: { ...fallback, ...(query.data?.value ?? {}) } as T,
    isLoading: query.isLoading,
    save: mutation.mutateAsync,
    isSaving: mutation.isPending,
  };
}
