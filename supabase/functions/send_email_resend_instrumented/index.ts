import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )
  
  console.log("=== DÉBUT DU TRAITEMENT DES EMAILS ===");

  // 1. On cherche les mails 'pending' dans la queue
  const { data: queue, error: fetchError } = await supabase
    .from('email_queue')
    .select('*, clients(email, first_name)')
    .eq('status', 'pending')
    .lte('scheduled_for', new Date().toISOString());

  if (fetchError) {
    console.error("Erreur de lecture DB:", fetchError.message);
    return new Response(JSON.stringify({ error: fetchError.message }), { status: 500 });
  }
  
  console.log(`Mails trouvés à envoyer : ${queue?.length || 0}`);

  const results = [];

  // 2. On envoie chaque mail via Resend
  for (const item of (queue || [])) {
    console.log(`Envoi en cours pour : ${item.clients?.email}`);
    
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
      },
      body: JSON.stringify({
        from: "Nicolas Di Stefano <nicolas@nicolas-distefano-edf.fr>",
        to: item.clients?.email || "ndsedf@gmail.com",
        subject: "Votre étude solaire EDF",
        html: `Bonjour ${item.clients?.first_name || ''}, voici votre synthèse.`,
      }),
    });

    const resData = await res.json();
    
    // 3. Si l'envoi réussit, on marque comme 'sent'
    if (res.ok) {
        await supabase.from('email_queue')
          .update({ status: 'sent', sent_at: new Date().toISOString() })
          .eq('id', item.id);
        console.log(`Mail envoyé avec succès à ${item.clients?.email}`);
    } else {
        console.error(`Échec Resend pour ${item.id}:`, resData);
    }
    
    results.push({ id: item.id, resData });
  }

  return new Response(JSON.stringify({ processed: queue?.length, results }), { 
    headers: { "Content-Type": "application/json" } 
  });
})
