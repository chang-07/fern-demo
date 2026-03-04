import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { MessageList } from "@/components/MessageList"

export default async function GCInboxPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect("/login")
    }

    // Fetch messages where this GC is the receiver or sender
    const { data: messages, error } = await (supabase as any)
        .from('messages')
        .select(`
            *,
            sender:sender_id ( email ),
            receiver:receiver_id ( email ),
            project:project_id ( name ),
            job_posting:job_posting_id ( title )
        `)
        .or(`receiver_id.eq.${user.id},sender_id.eq.${user.id}`)
        .order('created_at', { ascending: false })

    if (error) {
        console.error("Error fetching inbox:", error)
    }

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight text-white">Inbox</h2>
            </div>

            <div className="mt-6">
                <MessageList initialMessages={messages || []} currentUserId={user.id} />
            </div>
        </div>
    )
}
