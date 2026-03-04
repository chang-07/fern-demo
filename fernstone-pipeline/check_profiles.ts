import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
async function main() {
  const { data: profiles, error } = await supabase.from('profiles').select('id, email, role');
  console.log('All Profiles:', profiles);
  if (error) console.error(error);
}
main();
