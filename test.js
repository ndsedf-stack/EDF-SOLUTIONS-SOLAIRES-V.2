const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://ugwqfvwclwctzgtxcakp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnd3FmdndjbHdjdHpndHhjYWtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyNDg4OTgsImV4cCI6MjA4MTgyNDg5OH0.sx9z3p3svG5V6djfzUXtzdOwbUU3wjIVaAyIjRoFzaE';
const supabase = createClient(supabaseUrl, supabaseKey);
async function run() {
  const { data, error } = await supabase.from('studies').select('*');
  const now = new Date();
  let secured = 0, delay = 0, expired = 0;
  
  data.forEach(s => {
    // Look at how CockpitScreen calculates "FilteredOpsData"
    const d = new Date(s.created_at);
    const isCurrentMonth = d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    if (!isCurrentMonth) return;
    if (s.status === 'archived' || s.archived) return;

    if (s.status === 'signed') {
      const daysSinceSigned = s.signed_at 
        ? Math.floor((now.getTime() - new Date(s.signed_at).getTime()) / 86400000) 
        : null;
      if (s.deposit_paid) { secured++; }
      else if (daysSinceSigned !== null && daysSinceSigned > 14) { expired++; }
      else { delay++; }
    }
  });

  console.log('Secured:', secured, 'Delay:', delay, 'Expired:', expired);
  console.log('Total Signed based on CREATED_AT (CockpitScreen logic):', secured + delay + expired);
}
run();
