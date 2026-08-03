import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { z } from 'npm:zod@3.23.8';

const admin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

const BodySchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(200),
  full_name: z.string().max(120).optional(),
});

async function adminExists() {
  const { count } = await admin
    .from('user_roles')
    .select('id', { count: 'exact', head: true })
    .eq('role', 'admin');
  return (count ?? 0) > 0;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  try {
    if (req.method === 'GET') {
      return json({ needs_setup: !(await adminExists()) });
    }

    if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

    if (await adminExists()) {
      return json({ error: 'An admin account already exists.' }, 409);
    }

    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return json({ error: parsed.error.flatten().fieldErrors }, 400);
    }
    const { email, password, full_name } = parsed.data;

    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: full_name ?? null },
    });
    if (createError || !created.user) {
      return json({ error: createError?.message ?? 'Could not create the account.' }, 400);
    }

    const { error: roleError } = await admin
      .from('user_roles')
      .insert({ user_id: created.user.id, role: 'admin' });
    if (roleError) return json({ error: roleError.message }, 400);

    return json({ ok: true });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : 'Unexpected error' }, 500);
  }
});
