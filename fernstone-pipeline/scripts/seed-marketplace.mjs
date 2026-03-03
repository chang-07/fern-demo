import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing Supabase credentials in environment variables.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const mockSubs = [
    {
        email: 'sarah@apexbuilders.io',
        company_name: 'Apex Builders',
        industry: 'General Contracting',
        description: 'Full-service commercial construction and renovations.'
    },
    {
        email: 'david@reliableplumbing.co',
        company_name: 'Reliable Plumbing Co.',
        industry: 'Plumbing',
        description: 'Commercial and residential plumbing, pipe fitting, and HVAC.'
    },
    {
        email: 'carlos@skylineelectric.net',
        company_name: 'Skyline Electric',
        industry: 'Electrical',
        description: 'High-voltage wiring, panel upgrades, and smart building integration.'
    },
    {
        email: 'emily@horizonroofing.com',
        company_name: 'Horizon Roofing',
        industry: 'Roofing',
        description: 'Flat roofs, shingling, and commercial weatherproofing.'
    },
    {
        email: 'jackson@ironworkers.llc',
        company_name: 'Jackson Iron Works',
        industry: 'Steel Erection',
        description: 'Structural steel fabrication, welding, and erection.'
    },
];

async function seedMarketplace() {
    console.log("Staging synthetic marketplace data...");

    for (const sub of mockSubs) {
        try {
            // 1. Create the auth user (or skip if exists)
            const { data: authData, error: authError } = await supabase.auth.admin.createUser({
                email: sub.email,
                password: 'password123',
                email_confirm: true
            });

            let userId;

            if (authError) {
                if (authError.message.includes('User already registered') || authError.message.includes('already exists')) {
                    // Fetch existing user ID
                    const { data: existingUser } = await supabase.from('profiles').select('id').eq('email', sub.email).single();
                    if (existingUser) {
                        userId = existingUser.id;
                    } else {
                        // User exists in auth but not profile, let's fetch from auth
                        const { data: usersData, error: listError } = await supabase.auth.admin.listUsers();
                        const user = usersData?.users.find(u => u.email === sub.email);
                        if (user) {
                            userId = user.id;
                        } else {
                            console.error(`Could not find id for existing user ${sub.email}`);
                            continue;
                        }
                    }
                } else {
                    console.error(`Error creating auth user for ${sub.email}:`, authError.message);
                    continue;
                }
            } else {
                userId = authData.user.id;
            }

            // 2. Upsert the profile
            const { error: profileError } = await supabase
                .from('profiles')
                .upsert({
                    id: userId,
                    email: sub.email,
                    role: 'SUBCONTRACTOR',
                    company_name: sub.company_name,
                    industry: sub.industry,
                    description: sub.description
                });

            if (profileError) {
                console.error(`Error creating profile for ${sub.email}:`, profileError.message);
            } else {
                console.log(`Successfully staged profile for ${sub.company_name} (${sub.email})`);
            }

        } catch (e) {
            console.error(`Unexpected error processing ${sub.email}:`, e);
        }
    }

    console.log("Marketplace staging complete.");
}

seedMarketplace();
