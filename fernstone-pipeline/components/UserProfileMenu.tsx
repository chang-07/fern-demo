"use client"

import { User, LogOut, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { signOutAction } from "@/actions/auth"

export function UserProfileMenu() {
    const { setTheme, theme } = useTheme()

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-4 cursor-pointer hover:bg-slate-800/50 p-2 rounded-full transition-colors group">
                    <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 group-hover:border-slate-600 transition-colors">
                        <User className="h-4 w-4 text-slate-400 group-hover:text-slate-300 transition-colors" />
                    </div>
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-slate-900 border-slate-800 text-slate-200">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-800" />
                <DropdownMenuItem
                    className="cursor-pointer hover:bg-slate-800 focus:bg-slate-800 focus:text-slate-100"
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                >
                    {theme === 'dark' ? (
                        <><Sun className="mr-2 h-4 w-4" /> Light Mode</>
                    ) : (
                        <><Moon className="mr-2 h-4 w-4" /> Dark Mode</>
                    )}
                </DropdownMenuItem>
                <DropdownMenuItem
                    className="cursor-pointer text-red-400 hover:bg-red-950/50 hover:text-red-300 focus:bg-red-950/50 focus:text-red-300"
                    onClick={() => signOutAction()}
                >
                    <LogOut className="mr-2 h-4 w-4" /> Log out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
