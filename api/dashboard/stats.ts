import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: any, res: any) {
  const { filter } = req.query;

  try {
    let query = supabase
      .from('studies')
      .select(`
        id,
        status,
        created_at,
        clients (email, first_name, last_name),
        tracking_events (event_type, created_at),
        email_queue (status, email_type)
      `)
      .order('created_at', { ascending: false });

    if (filter === 'post_refus') query = query.eq('status', 'sent');
    if (filter === 'signed') query = query.eq('status', 'signed');

    const { data, error } = await query;

    if (error) throw error;

    res.status(200).json({ studies: data, stats: {} });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
