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
        email: 'estimating@summitsteel.com',
        company_name: 'Summit Structural Steel',
        industry: 'Structural Steel Erection',
        description: 'Tier 1 structural steel fabrication and erection for mid to high-rise commercial buildings. AISC certified.'
    },
    {
        email: 'bids@blueoceanmep.com',
        company_name: 'Blue Ocean Plumbing & HVAC',
        industry: 'Mechanical & Plumbing',
        description: 'Large-scale commercial plumbing, HVAC installation, and industrial piping. Union shop with 200+ technicians.'
    },
    {
        email: 'projects@vanguardelectric.net',
        company_name: 'Vanguard Electrical Systems',
        industry: 'Commercial Electrical',
        description: 'High-voltage systems, switchgear installation, telecommunications, and smart-building integrations.'
    },
    {
        email: 'dispatch@precisioncoring.io',
        company_name: 'Precision Concrete',
        industry: 'Concrete & Masonry',
        description: 'Concrete pouring, core drilling, foundation work, and heavy masonry for commercial developments.'
    },
    {
        email: 'info@cascaderoofing.co',
        company_name: 'Cascade Roofing Solutions',
        industry: 'Commercial Roofing',
        description: 'TPO, EPDM, and green roof installations. Focuses on LEED-certified weatherproofing.'
    },
    {
        email: 'ops@ironcladdemo.com',
        company_name: 'Ironclad Demolition',
        industry: 'Demolition & Abatement',
        description: 'Structural demolition, hazardous materials abatement, and site clearing services.'
    },
    {
        email: 'commercial@evergreenlandscapes.com',
        company_name: 'Evergreen Hardscapes',
        industry: 'Landscaping & Hardscape',
        description: 'Commercial retaining walls, paving, corporate park landscaping, and irrigation systems.'
    },
    {
        email: 'contracts@titanframing.llc',
        company_name: 'Titan Framing & Drywall',
        industry: 'Interior Build-out',
        description: 'Heavy-gauge metal framing, drywall installation, and acoustical ceilings for corporate offices.'
    }
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
