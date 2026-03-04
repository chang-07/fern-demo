"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageSquare, Calendar, Building2, Briefcase, Mail, Reply, Send } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { replyToMessage } from "@/actions/reply-message"

type Message = {
    id: string
    created_at: string
    subject: string
    body: string
    is_read: boolean
    sender_id: string
    receiver_id: string
    project_id?: string
    job_posting_id?: string
    sender?: { email: string }
    receiver?: { email: string }
    project?: { name: string }
    job_posting?: { title: string }
}

type Thread = {
    id: string
    otherUserEmail: string
    subject: string
    project?: { name: string }
    job_posting?: { title: string }
    messages: Message[]
    lastMessageAt: string
    isUnread: boolean
}

export function MessageList({ initialMessages, currentUserId }: { initialMessages: Message[], currentUserId: string }) {
    const router = useRouter()
    const [threads, setThreads] = useState<Thread[]>([])
    const [selectedThread, setSelectedThread] = useState<Thread | null>(null)
    const [replyBody, setReplyBody] = useState("")
    const [isReplying, setIsReplying] = useState(false)
    const [showReplyBox, setShowReplyBox] = useState(false)

    useEffect(() => {
        // Group messages into threads
        const threadsMap = new Map<string, Thread>()

        initialMessages.forEach(msg => {
            const isSender = msg.sender_id === currentUserId
            const otherUserId = isSender ? msg.receiver_id : msg.sender_id
            const otherUserEmail = isSender ? msg.receiver?.email : msg.sender?.email

            // Clean subject for grouping (remove "Re: ")
            const cleanSubject = msg.subject.replace(/^(Re:\s*)+/i, '').trim()

            const threadId = `${otherUserId}-${msg.project_id || 'no-proj'}-${msg.job_posting_id || 'no-job'}-${cleanSubject}`

            if (!threadsMap.has(threadId)) {
                threadsMap.set(threadId, {
                    id: threadId,
                    otherUserEmail: otherUserEmail || "Unknown",
                    subject: cleanSubject,
                    project: msg.project,
                    job_posting: msg.job_posting,
                    messages: [],
                    lastMessageAt: msg.created_at,
                    isUnread: false
                })
            }

            const thread = threadsMap.get(threadId)!
            thread.messages.push(msg)

            if (new Date(msg.created_at) > new Date(thread.lastMessageAt)) {
                thread.lastMessageAt = msg.created_at
            }

            if (!msg.is_read && !isSender) {
                thread.isUnread = true
            }
        })

        // Sort threads by newest message first, and sort messages within threads oldest first
        const sortedThreads = Array.from(threadsMap.values()).sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime())
        sortedThreads.forEach(t => t.messages.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()))

        setThreads(sortedThreads)

        // If there was a selected thread, keep it updated
        if (selectedThread) {
            const updated = sortedThreads.find(t => t.id === selectedThread.id)
            if (updated) setSelectedThread(updated)
        }
    }, [initialMessages, currentUserId])

    const handleReply = async () => {
        if (!selectedThread || !replyBody.trim()) return

        setIsReplying(true)
        // Reply to the latest message in the thread
        const latestMessage = selectedThread.messages[selectedThread.messages.length - 1]
        const result = await replyToMessage(latestMessage.id, replyBody)
        setIsReplying(false)

        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success("Reply sent successfully")
            setReplyBody("")
            setShowReplyBox(false)
            router.refresh()
        }
    }

    if (threads.length === 0) {
        return (
            <Card className="bg-slate-900 border-slate-800">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="bg-slate-800/50 p-4 rounded-full mb-4">
                        <Mail className="h-8 w-8 text-slate-400" />
                    </div>
                    <CardTitle className="text-xl text-white mb-2">No messages yet</CardTitle>
                    <CardDescription className="text-slate-400">
                        When you receive internal messages, they will appear here.
                    </CardDescription>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="grid md:grid-cols-3 gap-6 h-[600px]">
            {/* Sidebar List */}
            <Card className="md:col-span-1 bg-slate-900 border-slate-800 flex flex-col overflow-hidden">
                <CardHeader className="border-b border-slate-800 pb-4">
                    <CardTitle className="text-lg text-white font-medium flex items-center justify-between">
                        Inbox
                        <Badge variant="secondary" className="bg-blue-900/40 text-blue-400 border-blue-800/50">
                            {threads.filter(t => t.isUnread).length} New
                        </Badge>
                    </CardTitle>
                </CardHeader>
                <ScrollArea className="flex-1">
                    <div className="flex flex-col">
                        {threads.map((thread) => (
                            <button
                                key={thread.id}
                                onClick={() => {
                                    setSelectedThread(thread)
                                    setShowReplyBox(false)
                                    setReplyBody("")
                                }}
                                className={`text-left p-4 border-b border-slate-800/50 transition-colors last:border-0 hover:bg-slate-800/50 ${selectedThread?.id === thread.id ? 'bg-slate-800' : ''}`}
                            >
                                <div className="flex justify-between items-start mb-1 gap-2">
                                    <span className={`font-medium truncate ${thread.isUnread ? 'text-white' : 'text-slate-300'}`}>
                                        {thread.subject}
                                    </span>
                                    {thread.isUnread && (
                                        <div className="h-2 w-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                                    )}
                                </div>
                                <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                                    <span className="truncate">{thread.otherUserEmail}</span>
                                    <span>&bull;</span>
                                    <span className="shrink-0">{formatDistanceToNow(new Date(thread.lastMessageAt), { addSuffix: true })}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </ScrollArea>
            </Card>

            {/* Reading Pane */}
            <Card className="md:col-span-2 bg-slate-900 border-slate-800 flex flex-col h-full overflow-hidden">
                {selectedThread ? (
                    <>
                        <CardHeader className="border-b border-slate-800 bg-slate-800/10 p-6 md:p-8 shrink-0">
                            <div className="flex flex-col gap-4">
                                <div className="flex justify-between items-start">
                                    <CardTitle className="text-xl text-white leading-tight">
                                        {selectedThread.subject}
                                    </CardTitle>
                                </div>
                                <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400">
                                    <div className="flex items-center gap-1.5 bg-slate-800 rounded-md px-2 py-1">
                                        <Mail className="h-3.5 w-3.5 text-slate-500" />
                                        <span className="truncate max-w-[200px]">{selectedThread.otherUserEmail}</span>
                                    </div>
                                    {selectedThread.project && (
                                        <div className="flex items-center gap-1.5 bg-slate-800 rounded-md px-2 py-1">
                                            <Building2 className="h-3.5 w-3.5 text-slate-500" />
                                            <span className="truncate max-w-[200px]">{selectedThread.project.name}</span>
                                        </div>
                                    )}
                                    {selectedThread.job_posting && (
                                        <div className="flex items-center gap-1.5 bg-slate-800 rounded-md px-2 py-1">
                                            <Briefcase className="h-3.5 w-3.5 text-slate-500" />
                                            <span className="truncate max-w-[200px]">{selectedThread.job_posting.title}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardHeader>
                        <div className="flex-1 overflow-y-auto min-h-0 bg-slate-950/30">
                            <div className="p-6 md:p-8 pb-12 flex flex-col gap-6">
                                {selectedThread.messages.map((msg, i) => {
                                    const isMe = msg.sender_id === currentUserId
                                    return (
                                        <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                            <div className="flex items-center gap-2 mb-1.5 px-1">
                                                <span className="text-xs font-semibold text-slate-400">
                                                    {isMe ? "You" : (msg.sender?.email || "User")}
                                                </span>
                                                <span className="text-xs text-slate-600">
                                                    {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                                                </span>
                                            </div>
                                            <div className={`p-4 rounded-2xl max-w-[85%] ${isMe
                                                    ? 'bg-blue-600/20 border border-blue-500/30 text-blue-50 rounded-tr-sm'
                                                    : 'bg-slate-800/80 border border-slate-700 text-slate-200 rounded-tl-sm'
                                                }`}>
                                                <div className="prose prose-invert max-w-none whitespace-pre-wrap text-sm leading-relaxed font-sans">
                                                    {msg.body}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}

                                {/* Reply Section */}
                                <div className="mt-8 pt-8 border-t border-slate-800/50">
                                    {!showReplyBox ? (
                                        <Button
                                            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 gap-2 h-11 px-6 shadow-sm transition-all"
                                            onClick={() => setShowReplyBox(true)}
                                        >
                                            <Reply className="h-4 w-4" /> Reply
                                        </Button>
                                    ) : (
                                        <div className="space-y-4 animate-in slide-in-from-top-2 duration-200 bg-slate-900/80 p-6 rounded-xl border border-slate-700/80 shadow-lg">
                                            <h4 className="text-sm font-medium text-slate-300 flex items-center gap-2 mb-2 font-sans tracking-tight">
                                                <Reply className="h-4 w-4 text-emerald-400" />
                                                Replying to {selectedThread.otherUserEmail}
                                            </h4>
                                            <Textarea
                                                placeholder="Write your reply here..."
                                                className="min-h-[120px] bg-slate-950 border-slate-700 text-slate-200 focus-visible:ring-emerald-500/50 rounded-lg p-4 text-sm font-sans resize-y placeholder:text-slate-600"
                                                value={replyBody}
                                                onChange={(e) => setReplyBody(e.target.value)}
                                            />
                                            <div className="flex gap-3 justify-end pt-2">
                                                <Button
                                                    variant="ghost"
                                                    className="text-slate-400 hover:text-white h-11 px-6"
                                                    onClick={() => {
                                                        setShowReplyBox(false)
                                                        setReplyBody("")
                                                    }}
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 h-11 px-8 shadow-lg shadow-emerald-900/20 font-medium"
                                                    disabled={isReplying || !replyBody.trim()}
                                                    onClick={handleReply}
                                                >
                                                    {isReplying ? "Sending..." : (
                                                        <><Send className="h-4 w-4 -ml-1" /> Send Message</>
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                        <MessageSquare className="h-10 w-10 mb-4 opacity-50" />
                        <p>Select a thread to view</p>
                    </div>
                )}
            </Card>
        </div>
    )
}
