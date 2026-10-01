import { createClient } from '@supabase/supabase-js';

const s = createClient(
  'https://ugwqfvwclwctzgtxcakp.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnd3FmdndjbHdjdHpndHhjYWtwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjI0ODg5OCwiZXhwIjoyMDgxODI0ODk4fQ.yG2xL8MS-1X4oknvGIoBY3r5cbIQAVqzu4VSuYM92TE'
);

async function run() {
  const { data } = await s.from('email_templates').select('template_key, subject').order('template_key');
  console.log('Tous les templates :');
  data?.forEach(t => console.log(`  - ${t.template_key} | "${t.subject}"`));
}
run();
