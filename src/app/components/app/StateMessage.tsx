import { AlertTriangle, CircleOff, LoaderCircle } from "lucide-react";
import type { ReactNode } from "react";

type StateTone = "loading" | "empty" | "error";

interface StateMessageProps {
  tone: StateTone;
  title: string;
  description: string;
  action?: ReactNode;
  compact?: boolean;
}

function ToneIcon({ tone }: { tone: StateTone }) {
  if (tone === "loading") {
    return <LoaderCircle className="h-5 w-5 animate-spin text-white/80" aria-hidden="true" />;
  }

  if (tone === "empty") {
    return <CircleOff className="h-5 w-5 text-white/70" aria-hidden="true" />;
  }

  return <AlertTriangle className="h-5 w-5 text-red-200" aria-hidden="true" />;
}

export function StateMessage({ tone, title, description, action, compact = false }: StateMessageProps) {
  return (
    <div
      className={`wf-panel mx-auto w-full ${compact ? "max-w-xl p-5" : "max-w-2xl p-7 md:p-8"}`}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <ToneIcon tone={tone} />
        <div className="min-w-0 flex-1">
          <h2 className="wf-title text-base md:text-lg">{title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-white/70">{description}</p>
          {action && <div className="mt-4">{action}</div>}
        </div>
      </div>
    </div>
  );
}
