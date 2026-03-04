import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function check() {
    console.log("Checking DB...");
    const { data: subs, error: subError } = await supabase.from('subcontractors').select('id, email, status, project_id');
    const { data: projs, error: projError } = await supabase.from('projects').select('id, name, status');
    console.log("Error:", subError, projError);
    console.log("Subs:", subs);
    console.log("Projects:", projs);
}
check().catch(console.error);
