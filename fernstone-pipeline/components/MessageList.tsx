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
    project?: { name: string }
    job_posting?: { title: string }
}

export function MessageList({ initialMessages }: { initialMessages: Message[] }) {
    const router = useRouter()
    const [messages, setMessages] = useState<Message[]>(initialMessages)
    const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
    const [replyBody, setReplyBody] = useState("")
    const [isReplying, setIsReplying] = useState(false)
    const [showReplyBox, setShowReplyBox] = useState(false)

    useEffect(() => {
        setMessages(initialMessages)
    }, [initialMessages])

    const handleReply = async () => {
        if (!selectedMessage || !replyBody.trim()) return

        setIsReplying(true)
        const result = await replyToMessage(selectedMessage.id, replyBody)
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

    if (messages.length === 0) {
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
                            {messages.filter(m => !m.is_read).length} New
                        </Badge>
                    </CardTitle>
                </CardHeader>
                <ScrollArea className="flex-1">
                    <div className="flex flex-col">
                        {messages.map((message) => (
                            <button
                                key={message.id}
                                onClick={() => {
                                    setSelectedMessage(message)
                                    setShowReplyBox(false)
                                    setReplyBody("")
                                }}
                                className={`text-left p-4 border-b border-slate-800/50 transition-colors last:border-0 hover:bg-slate-800/50 ${selectedMessage?.id === message.id ? 'bg-slate-800' : ''}`}
                            >
                                <div className="flex justify-between items-start mb-1 gap-2">
                                    <span className={`font-medium truncate ${!message.is_read ? 'text-white' : 'text-slate-300'}`}>
                                        {message.subject}
                                    </span>
                                    {!message.is_read && (
                                        <div className="h-2 w-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                                    )}
                                </div>
                                <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                                    <span className="truncate">{message.sender?.email || "System"}</span>
                                    <span>&bull;</span>
                                    <span className="shrink-0">{formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </ScrollArea>
            </Card>

            {/* Reading Pane */}
            <Card className="md:col-span-2 bg-slate-900 border-slate-800 flex flex-col h-full overflow-hidden">
                {selectedMessage ? (
                    <>
                        <CardHeader className="border-b border-slate-800 bg-slate-800/10 p-6 md:p-8">
                            <div className="flex flex-col gap-4">
                                <div className="flex justify-between items-start">
                                    <CardTitle className="text-xl text-white leading-tight">
                                        {selectedMessage.subject}
                                    </CardTitle>
                                    <span className="text-xs text-slate-400 tabular-nums shrink-0 mt-1">
                                        {new Date(selectedMessage.created_at).toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400">
                                    <div className="flex items-center gap-1.5 bg-slate-800 rounded-md px-2 py-1">
                                        <Mail className="h-3.5 w-3.5 text-slate-500" />
                                        <span className="truncate max-w-[200px]">{selectedMessage.sender?.email || "System Message"}</span>
                                    </div>
                                    {selectedMessage.project && (
                                        <div className="flex items-center gap-1.5 bg-slate-800 rounded-md px-2 py-1">
                                            <Building2 className="h-3.5 w-3.5 text-slate-500" />
                                            <span className="truncate max-w-[200px]">{selectedMessage.project.name}</span>
                                        </div>
                                    )}
                                    {selectedMessage.job_posting && (
                                        <div className="flex items-center gap-1.5 bg-slate-800 rounded-md px-2 py-1">
                                            <Briefcase className="h-3.5 w-3.5 text-slate-500" />
                                            <span className="truncate max-w-[200px]">{selectedMessage.job_posting.title}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardHeader>
                        <div className="flex-1 overflow-y-auto min-h-0">
                            <div className="p-6 md:p-8 pb-12">
                                <div className="prose prose-invert max-w-none text-slate-300 whitespace-pre-wrap leading-relaxed font-sans">
                                    {selectedMessage.body}
                                </div>

                                {/* Reply Section */}
                                <div className="mt-12 pt-8 pb-8 border-t border-slate-800/50">
                                    {!showReplyBox ? (
                                        <Button
                                            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 gap-2 h-11 px-6 shadow-sm transition-all"
                                            onClick={() => setShowReplyBox(true)}
                                        >
                                            <Reply className="h-4 w-4" /> Reply
                                        </Button>
                                    ) : (
                                        <div className="space-y-4 animate-in slide-in-from-top-2 duration-200 bg-slate-900/50 p-6 rounded-xl border border-slate-800/80 mb-12">
                                            <h4 className="text-sm font-medium text-slate-300 flex items-center gap-2 mb-2 font-sans tracking-tight">
                                                <Reply className="h-4 w-4 text-blue-400" />
                                                Replying to {selectedMessage.sender?.email || "System Message"}
                                            </h4>
                                            <Textarea
                                                placeholder="Write your reply here..."
                                                className="min-h-[160px] bg-slate-950 border-slate-700 text-slate-200 focus-visible:ring-blue-500 rounded-lg p-4 text-sm font-sans resize-y"
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
                                                    className="bg-blue-600 hover:bg-blue-700 text-white gap-2 h-11 px-8 shadow-lg shadow-blue-900/20 font-medium"
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
                        <p>Select a message to read</p>
                    </div>
                )}
            </Card>
        </div>
    )
}
