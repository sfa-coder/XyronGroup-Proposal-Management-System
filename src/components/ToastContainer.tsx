import React from "react";
import { ToastMessage } from "../types";
import { CheckCircle2, AlertCircle, Info, X, AlertTriangle } from "lucide-react";

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => {
        let bgClass = "bg-slate-900 text-white border-slate-700";
        let icon = <Info className="w-5 h-5 text-indigo-400 shrink-0" />;

        if (toast.type === "success") {
          bgClass = "bg-emerald-950 text-emerald-100 border-emerald-800/60";
          icon = <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
        } else if (toast.type === "warning") {
          bgClass = "bg-amber-950 text-amber-100 border-amber-800/60";
          icon = <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />;
        } else if (toast.type === "error") {
          bgClass = "bg-rose-950 text-rose-100 border-rose-800/60";
          icon = <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />;
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-xl backdrop-blur-md transition-all duration-300 animate-in slide-in-from-bottom-2 ${bgClass}`}
          >
            {icon}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold leading-snug">{toast.title}</h4>
              {toast.message && (
                <p className="text-xs opacity-80 mt-0.5 line-clamp-2">{toast.message}</p>
              )}
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-slate-400 hover:text-white transition-colors p-1 -mr-1 -mt-1 rounded-lg"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
