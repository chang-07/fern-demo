import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    console.log("Seeding GC profiles for existing job postings...");

    // Get distinct gc_ids from job postings
    const { data: jobs, error: jobsError } = await supabase
        .from('job_postings')
        .select('gc_id');

    if (jobsError) {
        console.error("Error fetching jobs:", jobsError);
        return;
    }

    const uniqueGcIds = [...new Set(jobs.map(j => j.gc_id))];
    console.log(`Found ${uniqueGcIds.length} unique GC IDs in job postings.`);

    for (const gcId of uniqueGcIds) {
        // Check if profile exists
        const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', gcId)
            .single();

        if (!profile) {
            // Get email from auth.users
            const { data: userData, error: userError } = await supabase.auth.admin.getUserById(gcId);

            const email = userData?.user?.email || `gc-${gcId.substring(0, 8)}@example.com`;

            console.log(`Creating GC profile for ${email}...`);

            // Generate a random-looking company name based on ID
            const companies = ["Apex Builders", "Skyline Construction", "Summit General", "Vanguard Builders", "Horizon GC", "BuildRight"];
            const companyIndex = gcId.charCodeAt(0) % companies.length;
            const companyName = companies[companyIndex];

            const { error: insertError } = await supabase
                .from('profiles')
                .insert({
                    id: gcId,
                    email: email,
                    role: 'GC',
                    company_name: companyName,
                    industry: 'General Contractor',
                    description: `A premier general contracting firm committed to excellence.`,
                    gl_limit: 1000000,
                    auto_limit: 1000000,
                    wc_limit: 1000000,
                    umbrella_limit: 5000000,
                    has_additional_insured: true
                });

            if (insertError) {
                console.error("Failed to insert GC profile:", insertError);
            } else {
                console.log(`Successfully created GC profile for ${gcId}`);
            }
        } else {
            // Force the role to be 'GC' just in case
            await supabase.from('profiles').update({ role: 'GC', company_name: 'Existing GC Corp' }).eq('id', gcId);
            console.log(`Profile already existed for ${gcId}, updated role to GC.`);
        }
    }

    console.log("Finished seeding GCs.");
}

main();
