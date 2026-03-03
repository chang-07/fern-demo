"use client"

import { useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { motion } from "framer-motion"
import { UploadCloud, FileText } from "lucide-react"
import { processGeneralDocument } from "@/actions/process-general-document"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function ProfileUploadCard({ userId }: { userId: string }) {
    const [file, setFile] = useState<File | null>(null)
    const [uploading, setUploading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0])
        }
    }

    const handleUpload = async () => {
        if (!file) return

        setUploading(true)
        const fileExt = file.name.split(".").pop()
        const filePath = `profiles/${userId}/${Date.now()}.${fileExt}`

        try {
            const { error: uploadError } = await supabase.storage
                .from("coi-documents")
                .upload(filePath, file)

            if (uploadError) {
                throw uploadError
            }

            toast.success("File uploaded successfully. Analyzing...")
            const result = await processGeneralDocument(userId, filePath)

            if (result.success) {
                toast.success("Coverage limits extracted and saved!")
                setFile(null)
                router.refresh()
            } else {
                toast.error(result.error || "Analysis failed")
            }

        } catch (error: any) {
            console.error(error)
            toast.error(error.message || "Upload failed")
        } finally {
            setUploading(false)
        }
    }

    return (
        <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
                <CardTitle className="text-white">Upload General Insurance Document</CardTitle>
                <CardDescription className="text-slate-400">
                    Upload your ACORD 25 COI (PDF) to automatically populate your coverage limits on your marketplace profile. Max size 5MB.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="border-2 border-dashed border-slate-700 rounded-xl p-8 text-center bg-slate-800/30 hover:bg-slate-800/60 hover:border-emerald-500/50 transition-all cursor-pointer relative group"
                >
                    <input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="flex flex-col items-center gap-3 text-slate-400">
                        <div className="p-3 bg-slate-900 rounded-full group-hover:bg-emerald-500/10 transition-colors">
                            <UploadCloud className="w-8 h-8 text-emerald-500 group-hover:scale-110 transition-transform" />
                        </div>
                        <div>
                            <p className="font-medium text-slate-200 text-lg">
                                {file ? file.name : "Select a document"}
                            </p>
                            <p className="text-sm mt-1">{file ? "Click to change file" : "or drag and drop here"}</p>
                        </div>
                        <Badge variant="outline" className="border-slate-700 bg-slate-800 text-slate-400 mt-2 text-xs">PDF formats only (Max 5MB)</Badge>
                    </div>
                </motion.div>

                {file && !uploading && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-3 p-4 bg-slate-800/80 rounded-lg border border-slate-700 shadow-sm"
                    >
                        <FileText className="w-5 h-5 text-emerald-400" />
                        <span className="text-sm font-medium text-slate-200 truncate flex-1">{file.name}</span>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setFile(null)}
                            className="h-8 w-8 text-slate-400 hover:text-white hover:bg-red-500/20"
                        >
                            &times;
                        </Button>
                    </motion.div>
                )}

                {uploading ? (
                    <div className="space-y-4 pt-4 border-t border-slate-800/50">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-emerald-400 font-medium flex items-center gap-2">
                                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                                    <UploadCloud className="w-4 h-4" />
                                </motion.div>
                                Processing Document...
                            </span>
                            <span className="text-slate-400">AI Analysis Active</span>
                        </div>
                        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden relative">
                            {/* Animated progress bar */}
                            <motion.div
                                className="absolute top-0 left-0 h-full bg-emerald-500 rounded-full"
                                initial={{ width: "0%" }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 4, ease: "circOut" }}
                            />
                            {/* Scanning effect overlay */}
                            <motion.div
                                className="absolute top-0 w-24 h-full bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-12"
                                initial={{ left: "-100%" }}
                                animate={{ left: "200%" }}
                                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                            />
                        </div>
                        <p className="text-xs text-slate-500 text-center animate-pulse">Extracting coverage limits and limits data</p>
                    </div>
                ) : (
                    <Button
                        onClick={handleUpload}
                        disabled={!file}
                        className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500/50 focus:ring-offset-slate-950 font-semibold text-white shadow-lg shadow-emerald-900/20"
                    >
                        Extract Coverage Limits
                    </Button>
                )}
            </CardContent>
        </Card>
    )
}
