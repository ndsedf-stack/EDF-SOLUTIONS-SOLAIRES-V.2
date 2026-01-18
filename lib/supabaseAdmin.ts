import { createClient } from "@supabase/supabase-js";

/**
 * ⚠️ ADMIN CLIENT - Contourne RLS (Row Level Security)
 * À utiliser UNIQUEMENT côté serveur ou pour des opérations système
 * Ne JAMAIS exposer la service_role_key côté client
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
