"use client"

import { Button } from "@/components/ui/button"

export function SendReminderButton() {
    return (
        <Button
            size="sm"
            variant="outline"
            className="w-full text-xs text-slate-300 border-slate-700 hover:bg-slate-800"
            onClick={(e) => {
                e.stopPropagation();
                alert("Reminder sent! (Demo)");
            }}
        >
            Send Reminder
        </Button>
    )
}
