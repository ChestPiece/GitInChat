'use client'

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Github, ArrowRight, Zap, Shield, Search, Terminal, GitBranch, GitCommit, FileText, Database, Code, MessageSquare } from "lucide-react"
import { FeatureCard } from "./landing/feature-card"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"

export function LandingPage() {
  const [typedText, setTypedText] = useState("")
  const [commandIndex, setCommandIndex] = useState(0)
  
  const commands = [
      { cmd: "create_repository name='finance-app' public=false", output: "Repository 'finance-app' created successfully." },
      { cmd: "search_issues query='auth bug' state='open'", output: "Found 3 open issues matching 'auth bug'." },
      { cmd: "explain_file path='lib/auth.ts'", output: "Analyzing 'lib/auth.ts' using RAG index..." }
  ]

  useEffect(() => {
    let charIndex = 0
    let currentCommand = commands[commandIndex]
    
    // Typing effect
    const interval = setInterval(() => {
      if (charIndex <= currentCommand.cmd.length) {
          setTypedText(currentCommand.cmd.slice(0, charIndex))
          charIndex++
      } else {
          // Pause before next command
          clearInterval(interval)
          setTimeout(() => {
              setCommandIndex((prev) => (prev + 1) % commands.length)
          }, 3000)
      }
    }, 50)
    
    return () => clearInterval(interval)
  }, [commandIndex])

  return (
    <div className="min-h-screen bg-[#0d1117] text-white flex flex-col font-sans selection:bg-blue-500/30">
        {/* Navigation */}
        <header className="fixed top-0 z-50 w-full border-b border-white/5 bg-[#0d1117]/80 backdrop-blur-md">
            <div className="flex h-16 items-center justify-between px-6 md:px-8 max-w-7xl mx-auto">
                <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-[#0d1117]">
                        <Github className="w-5 h-5" />
                    </div>
                    <span>GitHub Chat</span>
                </div>
                <nav className="hidden md:flex items-center gap-8 text-[14px] font-medium text-gray-400">
                    <Link href="#" className="hover:text-white transition-colors">Features</Link>
                    <Link href="#" className="hover:text-white transition-colors">Pricing</Link>
                    <Link href="#" className="hover:text-white transition-colors">Blog</Link>
                    <Link href="/login" className="text-white">Sign In</Link>
                </nav>
            </div>
        </header>

        <main className="flex-1 pt-32 pb-20">
            {/* Hero Section */}
            <section className="text-center px-4 md:px-8 max-w-5xl mx-auto mb-32">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center gap-2 border border-blue-500/30 bg-blue-500/10 rounded-full px-3 py-1 text-blue-400 text-xs font-semibold mb-8 hover:bg-blue-500/20 transition-colors cursor-default"
                >
                    <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
                    Public Beta
                </motion.div>

                <motion.h1 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="text-5xl md:text-7xl font-bold tracking-tight mb-8 text-white"
                >
                    Your GitHub, <br className="hidden md:block" />
                    <span className="text-gray-400">but smarter.</span>
                </motion.h1>
                
                <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed font-normal"
                >
                    Manage repositories, track issues, and chat with your codebase using natural language. 
                    No more context switching.
                </motion.p>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4"
                >
                    <Link href="/auth/login">
                        <Button size="lg" className="bg-white text-[#0d1117] hover:bg-gray-200 font-bold px-8 h-12 text-base rounded-md">
                            Get Early Access
                        </Button>
                    </Link>
                </motion.div>

                {/* Hero Terminal Visual */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="mt-20 max-w-3xl mx-auto rounded-xl overflow-hidden border border-white/10 shadow-2xl bg-[#0d1117]"
                >
                    <div className="bg-[#161b22] px-4 py-2 border-b border-white/5 flex items-center gap-2">
                        <div className="flex gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                            <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
                        </div>
                        <div className="ml-4 text-xs text-gray-500 font-mono">github-chat — -zsh — 80x24</div>
                    </div>
                    <div className="p-6 text-left font-mono text-sm min-h-[200px]">
                        <div className="text-blue-400 mb-2">➜  ~  <span className="text-white">gh chat</span></div>
                        <div className="text-gray-300 mb-4">GitHub Chat Agent v0.1.0-beta initialized.</div>
                        
                        <div className="flex items-center gap-2 text-green-400">
                             <span>?</span>
                             <span className="text-white">What would you like to do?</span>
                        </div>
                        <div className="mt-2 text-gray-400 pl-4">
                             &gt; {typedText}<span className="animate-pulse">_</span>
                        </div>
                        
                        {(typedText === commands[commandIndex].cmd) && (
                            <div className="mt-2 pl-4 text-blue-300 animate-in fade-in duration-300">
                                {commands[commandIndex].output}
                            </div>
                        )}
                    </div>
                </motion.div>
            </section>

            {/* Feature Grid */}
            <section className="max-w-7xl mx-auto w-full px-4 mb-32">
                 <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold mb-4">Everything you need.</h2>
                    <p className="text-gray-400">Powerful tools integrated directly into your workflow.</p>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <FeatureCard 
                        title="Repository Intelligence" 
                        description="Search, filter, and manage repositories using natural language. 'Find all private repos with > 100 stars'."
                        icon={Search}
                        color="blue"
                    />
                    <FeatureCard 
                        title="Smart Issue Management" 
                        description="Draft issues, assign labels, and close tickets without leaving the chat interface."
                        icon={Zap}
                        color="purple"
                    />
                    <FeatureCard 
                        title="Codebase RAG" 
                        description="Index your entire codebase. Ask complex questions about architecture and get cited answers."
                        icon={Database}
                        color="green"
                    />
                    <FeatureCard 
                        title="Commit Analysis" 
                        description="Summarize commit history, compare branches, and generate release notes automatically."
                        icon={GitCommit}
                        color="orange"
                    />
                    <FeatureCard 
                        title="File Context" 
                        description="Read file contents directly. 'Explain lines 50-100 of auth.ts' gives you instant context."
                        icon={FileText}
                        color="blue"
                    />
                    <FeatureCard 
                        title="Branch Operations" 
                        description="Create, delete, and merge branches with simple commands. Safer than the CLI."
                        icon={GitBranch}
                        color="purple"
                    />
                 </div>
            </section>
            
            {/* CTA */}
            <section className="max-w-3xl mx-auto text-center px-4 mb-32">
                <div className="p-8 rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent">
                    <h2 className="text-3xl font-bold mb-4">Ready to ship faster?</h2>
                    <p className="text-gray-400 mb-8">Join the beta and start managing your GitHub workflow with AI today.</p>
                     <Link href="/auth/login">
                        <Button size="lg" className="bg-white text-[#0d1117] hover:bg-gray-200 font-bold px-8">
                            Start for free
                        </Button>
                    </Link>
                </div>
            </section>
        </main>

        <footer className="border-t border-white/10 bg-[#0d1117] py-12 px-4 md:px-8 text-center text-sm text-gray-500">
            <p>© 2024 GitHub Chat Interface. All rights reserved.</p>
        </footer>
    </div>
  )
}
