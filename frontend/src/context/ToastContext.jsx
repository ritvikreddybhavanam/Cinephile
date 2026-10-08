import React, { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const showToast = useCallback((message, type = "info", duration = 4000) => {
        if (!message) return;
        const id = Date.now() + Math.random().toString(36).substring(2, 7);
        setToasts((prev) => [...prev, { id, message, type }]);

        if (duration > 0) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }
    }, [removeToast]);

    const success = useCallback((msg, duration) => showToast(msg, "success", duration), [showToast]);
    const error = useCallback((msg, duration) => showToast(msg, "error", duration), [showToast]);
    const info = useCallback((msg, duration) => showToast(msg, "info", duration), [showToast]);
    const warning = useCallback((msg, duration) => showToast(msg, "warning", duration), [showToast]);

    return (
        <ToastContext.Provider value={{ showToast, success, error, info, warning, removeToast }}>
            {children}
            <div className="fixed top-6 right-6 z-[9999] flex max-w-sm w-full flex-col gap-3 pointer-events-none px-4 sm:px-0">
                {toasts.map((t) => {
                    let bg = "bg-primary-light border-slate-700 text-text-primary";
                    let iconBg = "bg-accent/20 text-accent";
                    let icon = (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    );

                    if (t.type === "success") {
                        bg = "bg-emerald-950/90 border-emerald-500/40 text-emerald-100";
                        iconBg = "bg-emerald-500/20 text-emerald-400";
                        icon = (
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                        );
                    } else if (t.type === "error") {
                        bg = "bg-rose-950/90 border-rose-500/40 text-rose-100";
                        iconBg = "bg-rose-500/20 text-rose-400";
                        icon = (
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        );
                    } else if (t.type === "warning") {
                        bg = "bg-amber-950/90 border-amber-500/40 text-amber-100";
                        iconBg = "bg-amber-500/20 text-amber-400";
                        icon = (
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        );
                    }

                    return (
                        <div
                            key={t.id}
                            className={`pointer-events-auto flex items-start gap-3 rounded-2xl border p-4 shadow-2xl backdrop-blur-xl transition-all duration-300 animate-in fade-in slide-in-from-top-4 ${bg}`}
                        >
                            <div className={`mt-0.5 shrink-0 rounded-full p-1.5 ${iconBg}`}>
                                {icon}
                            </div>
                            <div className="flex-1 text-sm font-medium leading-relaxed break-words">
                                {t.message}
                            </div>
                            <button
                                onClick={() => removeToast(t.id)}
                                className="shrink-0 rounded-lg p-1 text-slate-400 hover:text-white transition-colors"
                            >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    );
                })}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
}
