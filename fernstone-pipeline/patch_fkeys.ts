import { Client } from 'pg';

async function main() {
    // Replace brackets with URL encoding if needed, though pg might hand it fine.
    // The password is 'ChangLovestSupabase'
    const connectionString = 'postgresql://postgres:ChangLovestSupabase@db.cbmuhqtufylwodhlmgms.supabase.co:5432/postgres';

    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log("Connected to DB.");

        const sql = `
            ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_sender_id_fkey;
            ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_receiver_id_fkey;

            ALTER TABLE messages
                ADD CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES profiles(id) ON DELETE CASCADE,
                ADD CONSTRAINT messages_receiver_id_fkey FOREIGN KEY (receiver_id) REFERENCES profiles(id) ON DELETE CASCADE;
        `;

        await client.query(sql);
        console.log("Successfully altered foreign keys!");
    } catch (e) {
        console.error("Error running SQL:", e);
    } finally {
        await client.end();
    }
}

main();
