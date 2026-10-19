"use client";

import React, { useState } from "react";
import { ShieldAlert, X } from "lucide-react";
import { cn } from "@/lib/cn";

export interface HumanApprovalGateProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  command: string;
  risk?: "high" | "medium";
  onApprove?: () => void;
  onDeny?: () => void;
}

export const HumanApprovalGate = React.forwardRef<HTMLDivElement, HumanApprovalGateProps>(
  ({ title, command, risk = "high", onApprove, onDeny, className, ...props }, ref) => {
    const [status, setStatus] = useState<"pending" | "approved" | "denied">("pending");

    return (
      <div
        ref={ref}
        className={cn(
          "w-full max-w-xl rounded-xl border border-zinc-200 bg-white p-4 text-zinc-900 shadow-[0_1px_2px_rgba(0,0,0,0.03)]",
          className
        )}
        {...props}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#FFF3EE] text-[#FF4500] border border-[#FFD5C2]">
              <ShieldAlert className="h-4 w-4" />
            </span>
            <div>
              <h4 className="text-xs font-semibold text-zinc-900">{title}</h4>
              <p className="text-[11px] text-zinc-500">Execution paused waiting for user approval</p>
            </div>
          </div>

          <span className="rounded bg-[#FF4500] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
            {risk === "high" ? "High Risk" : "Review"}
          </span>
        </div>

        <div className="mt-3 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5 font-mono text-xs text-zinc-900">
          $ {command}
        </div>

        <div className="mt-4 flex items-center justify-end gap-2">
          {status === "pending" ? (
            <>
              <button
                type="button"
                onClick={() => {
                  setStatus("denied");
                  onDeny?.();
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
                Reject
              </button>

              {/* High-Contrast Dark Button with Logo */}
              <button
                type="button"
                onClick={() => {
                  setStatus("approved");
                  onApprove?.();
                }}
                className="inline-flex items-center gap-2 rounded-lg bg-zinc-950 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-zinc-800 transition-colors shadow-sm"
              >
                <img src="/logo.svg" alt="" className="h-3.5 w-3.5" />
                <span>Approve & Execute</span>
              </button>
            </>
          ) : (
            <span className="text-xs font-semibold text-[#FF4500]">
              Decision recorded: {status.toUpperCase()}
            </span>
          )}
        </div>
      </div>
    );
  }
);
HumanApprovalGate.displayName = "HumanApprovalGate";