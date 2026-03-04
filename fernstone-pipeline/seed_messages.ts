import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function seedMessages() {
    console.log("Starting message seeding...")

    // 1. Fetch some users
    const { data: profiles, error: profileErr } = await supabase
        .from('profiles')
        .select('*')
        .limit(10)

    if (profileErr) {
        console.error("Error fetching profiles:", profileErr)
        return
    }

    const testUsers = profiles?.filter(p => p.email === 'test@test.com' || p.email === 'chang@test.com' || p.email === 'sub@test.com') || []
    const otherUsers = profiles?.filter(p => p.email !== 'test@test.com' && p.email !== 'chang@test.com' && p.email !== 'sub@test.com') || []

    if (testUsers.length === 0 || otherUsers.length === 0) {
        console.log("Not enough profiles found.", testUsers.length, otherUsers.length)
        return
    }

    const mainUser = testUsers[0]
    const subUser = testUsers.find(u => u.email === 'sub@test.com') || otherUsers[0]

    // 2. Fetch some projects and job postings
    const { data: projects } = await supabase.from('projects').select('*').limit(5)
    const { data: jobs } = await supabase.from('job_postings').select('*').limit(5)

    const project1 = projects?.[0]
    const job1 = jobs?.[0]

    if (!project1 || !job1) {
        console.log("Not enough projects or jobs found.")
        return
    }

    // 3. Create realistic conversation threads

    // Thread 1: Job Application Inquiry
    const messages = [
        {
            sender_id: subUser.id,
            receiver_id: mainUser.id,
            project_id: project1.id,
            job_posting_id: job1.id,
            subject: `Question regarding Job Posting: ${job1.title}`,
            body: `Hi,\n\nI saw your posting for ${job1.title} on the ${project1.name} project. I'm very interested, but I was wondering if there are specific phased deadlines for this component, or if it's a continuous block of work?\n\nThanks,\n${subUser.company_name || 'Subcontractor'}`,
            is_read: true,
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString() // 2 days ago
        },
        {
            sender_id: mainUser.id,
            receiver_id: subUser.id,
            project_id: project1.id,
            job_posting_id: job1.id,
            subject: `Re: Question regarding Job Posting: ${job1.title}`,
            body: `Hello,\n\nThanks for reaching out! Yes, this work will be phased. The first rough-in phase is scheduled for early next month, followed by a two-week gap before final finishes are required.\n\nLet me know if you need any more details before applying.\n\nBest,\nFernstone GC`,
            is_read: true,
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() // 1 day ago
        },
        {
            sender_id: subUser.id,
            receiver_id: mainUser.id,
            project_id: project1.id,
            job_posting_id: job1.id,
            subject: `Re: Question regarding Job Posting: ${job1.title}`,
            body: `Perfect, that schedule works great for us. We just submitted our application directly through the portal with our COI attached. Looking forward to hearing back!`,
            is_read: false, // Leave unread to show up prominently
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() // 2 hours ago
        },
    ]

    // Thread 2: Compliance Discussion
    const company2 = otherUsers[1] || otherUsers[0]
    const project2 = projects?.[1] || project1

    if (company2) {
        messages.push({
            sender_id: mainUser.id,
            receiver_id: company2.id,
            project_id: project2.id,
            job_posting_id: null as any,
            subject: `Action Required: Expiring COI on ${project2.name}`,
            body: `Hello,\n\nWe noticed that your General Liability insurance on file is set to expire at the end of this month. Please upload a renewed COI to the Fernstone portal as soon as possible to ensure there are no delays in your upcoming payments for the ${project2.name} project.\n\nThanks,\nThe Compliance Team`,
            is_read: true,
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString() // 5 days ago
        })
        messages.push({
            sender_id: company2.id,
            receiver_id: mainUser.id,
            project_id: project2.id,
            job_posting_id: null as any,
            subject: `Re: Action Required: Expiring COI on ${project2.name}`,
            body: `Hi there,\n\nWe just received the renewed policy from our broker today. I'm uploading it to the portal right now. Please let me know if it gets approved.\n\nThanks!`,
            is_read: false,
            created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString() // 30 mins ago
        })
    }

    console.log(`Inserting ${messages.length} messages...`)
    const { error: insertError } = await supabase
        .from('messages')
        .insert(messages)

    if (insertError) {
        console.error("Failed to insert messages:", insertError)
    } else {
        console.log("Successfully seeded mock conversations!")
    }
}

seedMessages()
