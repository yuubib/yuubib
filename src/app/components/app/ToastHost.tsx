import { AnimatePresence, motion } from "motion/react";
import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";
import type { ToastMessage } from "../../state/AppStateContext";
import { useAppState } from "../../state/AppStateContext";

function getToastToneClasses(tone: ToastMessage["tone"]) {
  if (tone === "success") {
    return "border-emerald-400/70 text-emerald-100";
  }

  if (tone === "warning") {
    return "border-amber-300/70 text-amber-100";
  }

  return "border-white/60 text-white";
}

function ToastToneIcon({ tone }: { tone: ToastMessage["tone"] }) {
  if (tone === "success") {
    return <CheckCircle2 className="w-4 h-4 text-emerald-300" aria-hidden="true" />;
  }

  if (tone === "warning") {
    return <AlertTriangle className="w-4 h-4 text-amber-300" aria-hidden="true" />;
  }

  return <Info className="w-4 h-4 text-white/80" aria-hidden="true" />;
}

export function ToastHost() {
  const { toasts, dismissToast } = useAppState();

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[120] flex w-[min(92vw,360px)] flex-col gap-3 sm:right-5 sm:top-5">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            className={`wf-panel pointer-events-auto px-4 py-3 ${getToastToneClasses(toast.tone)}`}
            initial={{ opacity: 0, y: -12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            role="status"
            aria-live="polite"
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                <ToastToneIcon tone={toast.tone} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-mono text-xs tracking-wide">{toast.title}</div>
                {toast.description && (
                  <div className="mt-1 text-[11px] leading-relaxed text-white/70">{toast.description}</div>
                )}
              </div>
              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                aria-label="Dismiss toast"
                className="border border-white/40 p-1 text-white/70 hover:bg-white/10 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
