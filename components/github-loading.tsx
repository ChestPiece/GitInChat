'use client'

import { useEffect, useState } from 'react'

export function GithubLoading() {
  const [dots, setDots] = useState('')

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.')
    }, 500)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] w-full bg-[#0d1117]">
      {/* Pixel Cat CSS Animation */}
      <div className="relative w-16 h-16 mb-8 animate-bounce">
        <svg 
          viewBox="0 0 32 32" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full text-[#c9d1d9]"
        >
          {/* Pixel Art Cat Body */}
          <path d="M11 4H21V8H24V12H26V20H24V28H8V20H6V12H8V8H11V4Z" fill="currentColor"/>
          {/* Eyes */}
          <rect x="10" y="14" width="4" height="4" fill="#0d1117" />
          <rect x="18" y="14" width="4" height="4" fill="#0d1117" />
        </svg>
        {/* Tentacles/Ghost bottom effect */}
        <div className="absolute -bottom-2 left-0 w-full flex justify-between px-2">
          <div className="w-2 h-2 bg-[#c9d1d9] rounded-full animate-pulse delay-75"></div>
          <div className="w-2 h-2 bg-[#c9d1d9] rounded-full animate-pulse delay-150"></div>
          <div className="w-2 h-2 bg-[#c9d1d9] rounded-full animate-pulse delay-300"></div>
        </div>
      </div>
      
      <p className="text-[#8b949e] font-medium text-lg">
        One moment please{dots}
      </p>
    </div>
  )
}
