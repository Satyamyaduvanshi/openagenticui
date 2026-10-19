"use client";

import * as React from "react";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/cn";

export type ApprovalRisk = "high" | "medium" | "low";
export type ApprovalStatus = "pending" | "approved" | "denied";
export type ApprovalDecision = Exclude<ApprovalStatus, "pending">;

export interface HumanApprovalGateProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title: string;
  command: string;
  risk?: ApprovalRisk;
  description?: string;
  operationId?: string;
  onApprove?: () => void | Promise<void>;
  onDeny?: () => void | Promise<void>;
  onDecision?: (decision: ApprovalDecision) => void;
  initialStatus?: ApprovalStatus;
  disabled?: boolean;
  allowReset?: boolean;
  onReset?: () => void;
  approveLabel?: string;
  denyLabel?: string;
  compact?: boolean;
}

const RISK_STYLES: Record<
  ApprovalRisk,
  { label: string; dot: string; badge: string }
> = {
  high: {
    label: "High risk",
    dot: "bg-red-500",
    badge: "border-red-500/25 bg-red-500/10 text-red-700 dark:text-red-400",
  },
  medium: {
    label: "Moderate",
    dot: "bg-amber-500",
    badge: "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  },
  low: {
    label: "Safe",
    dot: "bg-emerald-500",
    badge: "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  },
};

export const HumanApprovalGate = React.forwardRef<
  HTMLDivElement,
  HumanApprovalGateProps
>(function HumanApprovalGate(
  {
    title,
    command,
    risk = "high",
    description,
    operationId,
    onApprove,
    onDeny,
    onDecision,
    initialStatus = "pending",
    disabled = false,
    allowReset = false,
    onReset,
    approveLabel = "Approve",
    denyLabel = "Deny",
    compact = false,
    className,
    ...props
  },
  forwardedRef
) {
  const [status, setStatus] = React.useState<ApprovalStatus>(initialStatus);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const inFlight = React.useRef(false);
  const resultRef = React.useRef<HTMLDivElement>(null);
  const id = React.useId();

  const pending = status === "pending";
  const denied = status === "denied";
  const riskStyle = RISK_STYLES[risk];

  React.useEffect(() => {
    if (!pending) {
      resultRef.current?.focus({ preventScroll: true });
    }
  }, [pending]);

  const decide = React.useCallback(
    async (decision: ApprovalDecision) => {
      if (inFlight.current || status !== "pending" || disabled) return;

      inFlight.current = true;
      setBusy(true);
      setError(null);

      try {
        if (decision === "approved") {
          await onApprove?.();
        } else {
          await onDeny?.();
        }

        setStatus(decision);

        try {
          onDecision?.(decision);
        } catch (cause) {
          console.error("Approval notification failed:", cause);
        }
      } catch (cause: unknown) {
        setError(
          cause instanceof Error
            ? cause.message
            : "Action failed. Please try again."
        );
      } finally {
        inFlight.current = false;
        setBusy(false);
      }
    },
    [status, disabled, onApprove, onDeny, onDecision]
  );

  const reset = React.useCallback(() => {
    if (!allowReset || busy || pending) return;

    setError(null);
    setStatus("pending");
    onReset?.();
  }, [allowReset, busy, pending, onReset]);

  return (
    <div
      ref={forwardedRef}
      data-approval-status={status}
      data-approval-risk={risk}
      data-operation-id={operationId}
      className={cn("w-full min-w-0 text-zinc-900 dark:text-[#F4F2EA]", className)}
      {...props}
    >
      <div
        className={cn(
          "overflow-hidden rounded-xl border bg-white dark:bg-[#1D1D1D]",
          "shadow-[0_4px_20px_-14px_rgba(0,0,0,0.16)]",
          "transition-[border-color,box-shadow] duration-200 ease-out",
          "motion-reduce:transition-none",
          denied
            ? "border-red-500/25"
            : status === "approved"
              ? "border-emerald-500/25"
              : "border-zinc-200 dark:border-white/10"
        )}
      >
        {/* Completed state */}
        <div
          className={cn(
            "grid transition-[grid-template-rows,opacity] duration-300 ease-out",
            "motion-reduce:transition-none",
            pending
              ? "grid-rows-[0fr] opacity-0"
              : "grid-rows-[1fr] opacity-100"
          )}
          aria-hidden={pending}
        >
          <div className="min-h-0 overflow-hidden">
            <div
              ref={resultRef}
              role="status"
              tabIndex={-1}
              aria-label={`${title}: ${status}`}
              className="flex min-h-12 min-w-0 items-center gap-3 px-4 py-3 outline-none sm:px-5"
            >
              <span
                className={cn(
                  "min-w-0 flex-1 text-[12px] font-medium leading-5 tracking-tight",
                  "transition-opacity duration-300 text-zinc-900 dark:text-[#F4F2EA]",
                  denied && "opacity-60"
                )}
              >
                {denied ? (
                  <span className="relative inline">
                    {title}
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-zinc-400/80 dark:bg-zinc-500/80"
                    />
                  </span>
                ) : (
                  title
                )}
              </span>

              <span
                className={cn(
                  "inline-flex shrink-0 items-center gap-1.5 text-[11px] font-medium",
                  denied
                    ? "text-red-600 dark:text-red-400"
                    : "text-emerald-700 dark:text-emerald-400"
                )}
              >
                <span
                  className={cn(
                    "flex size-[18px] items-center justify-center rounded-full",
                    denied ? "bg-red-500/10" : "bg-emerald-500/10"
                  )}
                  aria-hidden="true"
                >
                  {denied ? (
                    <X className="size-3" strokeWidth={2.4} />
                  ) : (
                    <Check className="size-3" strokeWidth={2.4} />
                  )}
                </span>
                {denied ? "Denied" : "Approved"}
              </span>

              {allowReset && (
                <button
                  type="button"
                  onClick={reset}
                  disabled={busy}
                  className="shrink-0 rounded-md px-1.5 py-1 text-[10px] text-zinc-500 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:text-[#A5A39A] dark:hover:text-white"
                >
                  Reopen
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Pending state */}
        <div
          className={cn(
            "grid transition-[grid-template-rows,opacity] duration-300 ease-out",
            "motion-reduce:transition-none",
            pending
              ? "grid-rows-[1fr] opacity-100"
              : "grid-rows-[0fr] opacity-0"
          )}
          aria-hidden={!pending}
        >
          <div className="min-h-0 overflow-hidden">
            <div className="flex min-w-0 items-start justify-between gap-3 px-4 pb-3 pt-4 sm:px-5">
              <div className="min-w-0 flex-1">
                <h3 className="break-words text-[13px] font-medium leading-5 tracking-tight text-zinc-900 dark:text-[#F4F2EA]">
                  {title}
                </h3>
                <p className="mt-1 text-[11px] text-zinc-500 dark:text-[#A5A39A]">
                  {description || "Human approval required"}
                </p>
              </div>

              <span
                className={cn(
                  "inline-flex shrink-0 items-center gap-1.5 rounded-md",
                  "border px-2 py-1 text-[10px] font-medium",
                  riskStyle.badge
                )}
              >
                <span className={cn("size-1.5 rounded-full", riskStyle.dot)} />
                {riskStyle.label}
              </span>
            </div>

            {!compact && (
              <div
                id={`${id}-command`}
                className="mx-4 overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100 dark:border-white/10 dark:bg-[#181818] sm:mx-5"
              >
                <div className="px-3 py-3">
                  <code className="block whitespace-pre-wrap break-words font-mono text-[11px] leading-[1.8] text-zinc-600 dark:text-[#A5A39A] [overflow-wrap:anywhere]">
                    <span className="mr-2 select-none opacity-70" aria-hidden="true">
                      {"›"}
                    </span>
                    {command}
                  </code>
                </div>
              </div>
            )}

            <div className="flex min-w-0 flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <div className="min-w-0 flex-1">
                {error ? (
                  <p
                    id={`${id}-error`}
                    role="alert"
                    className="break-words text-[11px] text-red-600 dark:text-red-400"
                  >
                    {error}
                  </p>
                ) : (
                  <span className="text-[11px] text-zinc-500 dark:text-[#A5A39A]">
                    Review before execution
                  </span>
                )}
              </div>

              <div className="flex w-full shrink-0 items-center gap-2 sm:w-auto">
                <button
                  type="button"
                  disabled={disabled || busy || !pending}
                  onClick={() => void decide("denied")}
                  aria-describedby={error ? `${id}-error` : undefined}
                  className={cn(
                    "inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg border px-3",
                    "text-xs font-medium transition-colors duration-200",
                    "border-zinc-200 bg-white text-zinc-600 dark:border-white/12 dark:bg-[#1D1D1D] dark:text-[#B8B6AC]",
                    "hover:border-red-500/30 hover:bg-red-500/[0.05] hover:text-red-600 dark:hover:text-red-400",
                    "active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/50",
                    "sm:flex-none motion-reduce:transition-none motion-reduce:transform-none"
                  )}
                >
                  <X className="size-3.5" strokeWidth={1.8} />
                  {denyLabel}
                </button>

                <button
                  type="button"
                  disabled={disabled || busy || !pending}
                  onClick={() => void decide("approved")}
                  aria-describedby={error ? `${id}-error` : undefined}
                  className={cn(
                    "inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg px-3.5",
                    "text-xs font-medium transition-colors duration-200",
                    "bg-zinc-900 text-white dark:bg-[#F4F2EA] dark:text-[#1D1D1D]",
                    "hover:opacity-80 active:scale-[0.98]",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50",
                    "sm:flex-none motion-reduce:transition-none motion-reduce:transform-none"
                  )}
                >
                  {busy ? (
                    <span
                      aria-hidden="true"
                      className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none"
                    />
                  ) : (
                    <Check className="size-3.5" strokeWidth={2} />
                  )}
                  {busy ? "Processing" : approveLabel}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

HumanApprovalGate.displayName = "HumanApprovalGate";