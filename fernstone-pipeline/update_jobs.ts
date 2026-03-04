import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    console.log("Updating job postings created_at...");
    
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    const { error } = await supabase
        .from('job_postings')
        .update({ created_at: oneDayAgo })
        .neq('status', 'DRAFT'); // Target open postings
        
    if (error) {
        console.error("Error updating postings:", error);
    } else {
        console.log("Job postings successfully updated to recent dates.");
    }
}
main();
