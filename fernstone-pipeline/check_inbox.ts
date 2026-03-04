import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // use service role to bypass RLS to see all messages
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    const { data: messages, error } = await supabase
        .from('messages')
        .select(`*`);
    console.log("ALL MESSAGES:", messages?.length, messages);
    if (error) console.error("Error:", error);
}
main();
