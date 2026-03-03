"use client"

import { useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
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
            <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-slate-700 rounded-lg p-8 text-center bg-slate-800/50 hover:bg-slate-800 transition-colors cursor-pointer relative">
                    <input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                        <UploadCloud className="w-10 h-10 text-emerald-500" />
                        <p className="font-medium text-slate-300">
                            {file ? file.name : "Click to upload or drag & drop"}
                        </p>
                        <p className="text-xs">PDF only</p>
                    </div>
                </div>

                {file && (
                    <div className="flex items-center gap-2 p-3 bg-slate-800 rounded border border-slate-700">
                        <FileText className="w-4 h-4 text-emerald-400" />
                        <span className="text-sm text-slate-200 truncate flex-1">{file.name}</span>
                        <button onClick={() => setFile(null)} className="text-slate-400 hover:text-white">
                            &times;
                        </button>
                    </div>
                )}

                <Button
                    onClick={handleUpload}
                    disabled={!file || uploading}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 focus:ring-emerald-500/50 focus:ring-offset-slate-950 font-semibold"
                >
                    {uploading ? "Uploading & Analyzing..." : "Extract Coverage Limits"}
                </Button>
            </CardContent>
        </Card>
    )
}
