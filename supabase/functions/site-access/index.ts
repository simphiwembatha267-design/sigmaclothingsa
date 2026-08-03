import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { z } from 'npm:zod@3.23.8';

const BodySchema = z.object({
  password: z.string().min(1).max(200),
});

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  try {
    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) return json({ valid: false }, 400);

    const expected = Deno.env.get('SITE_ACCESS_PASSWORD') ?? '';
    if (!expected) return json({ error: 'Access gate is not configured.' }, 500);

    return json({ valid: parsed.data.password === expected });
  } catch {
    return json({ error: 'Unexpected error' }, 500);
  }
});
