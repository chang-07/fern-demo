"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { seedData } from "@/actions/seed-data"
import { Database } from "lucide-react"
import { useRouter } from "next/navigation"

export function SeedDataButton() {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleSeed = async () => {
        setLoading(true)
        try {
            const result = await seedData()
            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success("Synthetic data injected accurately.")
                router.refresh()
            }
        } catch (error) {
            toast.error("Failed to seed data.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button
            variant="outline"
            onClick={handleSeed}
            disabled={loading}
            className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10 hover:text-blue-300"
        >
            <Database className="w-4 h-4 mr-2" />
            {loading ? "Generating..." : "Generate Synthetic Data"}
        </Button>
    )
}
