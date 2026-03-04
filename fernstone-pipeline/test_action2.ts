import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
// Set env vars directly so imported files have them
process.env.NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
process.env.SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

import { messageGC } from './actions/contact-gc';

async function main() {
    try {
        console.log("Calling messageGC...");
        // Use a dummy UUID
        const result = await messageGC('a38d55cf-fa5f-41f9-849e-2ff9b2cf80d8', 'b38d55cf-fa5f-41f9-849e-2ff9b2cf80d8', null, 'test', 'test');
        console.log("Result:", result);
    } catch (e) {
        console.error("Caught error:", e);
    }
}
main();
