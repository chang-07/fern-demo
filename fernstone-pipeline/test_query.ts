import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    console.log("Starting query test...");
    try {
        const { data: messages, error } = await supabase
            .from('messages')
            .select(`
                *,
                sender:sender_id ( email ),
                project:project_id ( name ),
                job_posting:job_posting_id ( title )
            `);
        if (error) {
            console.error("Query Error:", error);
        } else {
            console.log("Query Success. Messages count:", messages?.length);
        }
    } catch (e) {
        console.error("Caught error:", e);
    }
}
main();
