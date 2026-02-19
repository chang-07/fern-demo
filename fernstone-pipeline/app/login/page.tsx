
import Image from "next/image"
import { login, signup } from './actions'
import { ShieldCheck, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"

export default async function LoginPage(props: { searchParams: Promise<{ error?: string }> }) {
    const searchParams = await props.searchParams
    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <Card className="w-full max-w-md bg-slate-900 border-slate-800 text-slate-50">
                <CardHeader className="space-y-1">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="relative h-8 w-8">
                            <Image
                                src="/logo.avif"
                                alt="Fernstone Logo"
                                fill
                                className="object-contain"
                            />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-white">Fernstone</span>
                    </div>
                    <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
                    <CardDescription className="text-slate-400">
                        Enter your email to sign in to your account
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    {searchParams.error && (
                        <div className="bg-red-900/20 border border-red-900 p-3 rounded flex items-center gap-2 text-red-200 text-sm">
                            <AlertCircle className="w-4 h-4" />
                            {searchParams.error}
                        </div>
                    )}
                    <form className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email" className="text-slate-200">Email</Label>
                            <Input id="email" name="email" type="email" placeholder="m@example.com" required className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-500" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password" className="text-slate-200">Password</Label>
                            <Input id="password" name="password" type="password" required className="bg-slate-950 border-slate-800 text-white" />
                        </div>
                        <div className="flex flex-col gap-2 mt-4">
                            <Button formAction={login} className="w-full bg-emerald-600 hover:bg-emerald-700 font-semibold">
                                Sign In
                            </Button>
                            <Button formAction={signup} variant="outline" className="w-full border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white">
                                Sign Up
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
