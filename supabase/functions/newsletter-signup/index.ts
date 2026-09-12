import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { z } from 'npm:zod@3.23.8';

const BodySchema = z.object({
  email: z.string().trim().email().max(255),
  phone: z.string().trim().min(7).max(30).optional(),
  source: z.string().trim().max(50).optional(),
});

const OWNER_EMAIL = 'sigma.sa38@gmail.com';

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
    if (!parsed.success) {
      return json({ error: 'Please enter a valid email address and phone number.' }, 400);
    }

    const email = parsed.data.email.toLowerCase();
    const phone = parsed.data.phone?.replace(/\s+/g, ' ') ?? null;
    const source = parsed.data.source ?? 'menu';

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: existing } = await supabase
      .from('newsletter_subscribers')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (existing) {
      await supabase
        .from('newsletter_subscribers')
        .update({ ...(phone ? { phone } : {}), source })
        .eq('id', existing.id);
    } else {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert({ email, phone, source });
      if (error) {
        console.error('signup insert failed', error.message);
        return json({ error: 'Could not save your sign-up. Please try again.' }, 500);
      }
    }

    // Optional email notification (enabled once an email provider key is configured)
    let notified = false;
    const resendKey = Deno.env.get('RESEND_API_KEY');
    if (resendKey) {
      const from = Deno.env.get('RESEND_FROM') ?? 'SIGMA <onboarding@resend.dev>';
      const send = async (to: string, subject: string, html: string) => {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${resendKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ from, to: [to], subject, html }),
        });
        if (!res.ok) console.error('resend failed', await res.text());
        return res.ok;
      };

      notified = await send(
        OWNER_EMAIL,
        'New SIGMA sign-up',
        `<p>New sign-up from the ${source} form.</p><p><strong>Email:</strong> ${email}<br/><strong>Phone:</strong> ${phone}</p>`,
      );

      await send(
        email,
        "You're on the SIGMA list",
        `<p>Thank you for joining SIGMA.</p><p>You'll be the first to know about every drop.</p><p>Built for moguls.</p>`,
      );
    }

    return json({ ok: true, notified });
  } catch (err) {
    console.error('newsletter-signup error', err);
    return json({ error: 'Unexpected error. Please try again.' }, 500);
  }
});
