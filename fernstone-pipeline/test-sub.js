const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function test() {
    const { data: sub, error } = await supabase
        .from('subcontractors')
        .select(`
        *,
        projects (
            id,
            req_gl_occurrence,
            req_additional_insured,
            req_auto_limit,
            req_wc_limit,
            req_umbrella_limit
        )
    `)
        .eq('id', '0ed3d167-2d70-4219-9ad0-05adf3fbf066')
        .single();
    console.log("Error:", error);
    console.log("Data:", JSON.stringify(sub, null, 2));
}
test();
