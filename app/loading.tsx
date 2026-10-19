// app/loading.tsx
"use client";

import React from "react";

const LOADING_STYLES = `
@keyframes spin-pause {
  0% { transform: rotate(0deg); }
  45% { transform: rotate(360deg); }
  100% { transform: rotate(360deg); }
}

.animate-spin-pause {
  animation: spin-pause 1.6s cubic-bezier(0.65, 0, 0.35, 1) infinite;
}
`;

// Add "default" here
export default function Loading() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#FAFAFA]">
      <style>{LOADING_STYLES}</style>
      
      {/* Center Animated Logo */}
      <img 
        src="/logo.svg" 
        alt="Loading..." 
        width={48}
        height={48}
        className="size-12 animate-spin-pause drop-shadow-sm" 
      />

      {/* Bottom Right Sponsor Badge */}
      <div className="absolute bottom-6 right-6 flex items-center gap-2.5">
        <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-zinc-400">
          Sponsored by
        </span>
        
        <div className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.08)] ring-1 ring-zinc-200/60 transition-all hover:shadow-[0_4px_12px_-4px_rgba(0,0,0,0.12)]">
          <svg 
            width="14" 
            height="14" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="shrink-0"
          >
            <path 
              d="M11.6 22.84C11.23 16.71 6.51 12 0.38 11.63V11.27C6.51 10.9 11.23 6.19 11.6 0.0600004H11.96C12.33 6.19 17.05 10.9 23.18 11.27V11.63C17.05 12 12.33 16.71 11.96 22.84H11.6Z" 
              fill="url(#gemini-gradient)"
            />
            <defs>
              <linearGradient id="gemini-gradient" x1="0.38" y1="11.45" x2="23.18" y2="11.45" gradientUnits="userSpaceOnUse">
                <stop stopColor="#4285F4"/>
                <stop offset="0.5" stopColor="#9B72CB"/>
                <stop offset="1" stopColor="#D96570"/>
              </linearGradient>
            </defs>
          </svg>
          
          <span className="text-[12.5px] font-semibold tracking-tight text-zinc-800">
            Gemini
          </span>
        </div>
      </div>
    </div>
  );
}