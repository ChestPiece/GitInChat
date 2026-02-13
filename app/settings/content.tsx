'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useTheme } from "next-themes"
import { LogOut, Moon, Sun, Palette, ShieldAlert } from "lucide-react"
import { signOut } from "@/lib/auth" 
import { PageHeader } from "@/components/page-header"
import { motion } from "framer-motion"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      staggerChildren: 0.1 
    }
  }
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 24 }
  }
}

export function SettingsContent() {
  const { setTheme, theme } = useTheme()

  return (
    <div className="flex h-full bg-[#0d1117] text-white font-sans overflow-hidden">
      
      <main className="flex-1 overflow-auto bg-gradient-to-b from-[#0d1117] to-[#161b22]">
        <div className="p-8 max-w-3xl mx-auto">
            <PageHeader 
                title="Settings" 
                description="Manage your workspace preferences"
            />
            
            <motion.div 
              className="space-y-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Appearance Section */}
              <motion.div variants={itemVariants}>
                <Card className="bg-[#161b22]/50 backdrop-blur-sm border-[#30363d] text-[#c9d1d9] hover:border-[#58a6ff]/50 transition-colors">
                    <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-4">
                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                        <Palette className="w-5 h-5" />
                    </div>
                    <div>
                        <CardTitle className="text-lg">Appearance</CardTitle>
                        <CardDescription className="text-[#8b949e]">Customize your interface theme</CardDescription>
                    </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                    <div className="flex items-center justify-between p-4 bg-[#0d1117]/50 rounded-lg border border-[#30363d]/50">
                        <div className="flex items-center space-x-4">
                            <div className="p-2 rounded-full bg-[#30363d]/30">
                                {theme === 'dark' ? <Moon className="h-4 w-4 text-purple-400" /> : <Sun className="h-4 w-4 text-yellow-400" />}
                            </div>
                            <div className="space-y-0.5">
                                <Label htmlFor="theme-mode" className="text-base font-medium block">Dark Mode</Label>
                                <span className="text-xs text-[#8b949e]">Adjust the color scheme for your environment</span>
                            </div>
                        </div>
                        <Switch 
                            id="theme-mode" 
                            checked={theme === 'dark'}
                            onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                            className="data-[state=checked]:bg-blue-600"
                        />
                    </div>
                    </CardContent>
                </Card>
              </motion.div>

              {/* Danger Zone */}
              <motion.div variants={itemVariants}>
                <Card className="bg-[#161b22]/50 backdrop-blur-sm border-red-900/30 text-[#c9d1d9] hover:border-red-500/30 transition-colors">
                    <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-4">
                        <div className="p-2 bg-red-500/10 rounded-lg text-red-400">
                            <ShieldAlert className="w-5 h-5" />
                        </div>
                        <div>
                            <CardTitle className="text-lg text-red-400">Danger Zone</CardTitle>
                            <CardDescription className="text-red-400/60">Irreversible account actions</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <div className="flex items-center justify-between p-4 bg-red-950/10 rounded-lg border border-red-900/20">
                            <div>
                                <div className="font-medium text-white">Sign out</div>
                                <div className="text-sm text-[#8b949e]">End your current session securely</div>
                            </div>
                            <Button 
                                variant="destructive" 
                                onClick={() => signOut()}
                                className="bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/50"
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                Sign Out
                            </Button>
                        </div>
                    </CardContent>
                </Card>
              </motion.div>
            </motion.div>
        </div>
      </main>
    </div>
  )
}
