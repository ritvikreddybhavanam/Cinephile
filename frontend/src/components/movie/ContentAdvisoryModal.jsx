import React, { useState } from "react";
import { ADVISORY_CATEGORIES, SEVERITY_LEVELS } from "../../services/contentGuideService";

export default function ContentAdvisoryModal({
    movieId,
    movieTitle,
    isOpen,
    onClose,
    onSubmitSuccess
}) {
    const [selectedCategory, setSelectedCategory] = useState("VIOLENCE_GORE");
    const [selectedSeverity, setSelectedSeverity] = useState("MODERATE");
    const [details, setDetails] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg("");
        setSubmitting(true);
        try {
            await onSubmitSuccess({
                movieId,
                category: selectedCategory,
                severity: selectedSeverity,
                details: details.trim(),
            });
            onClose();
        } catch (err) {
            setErrorMsg(err.response?.data?.error || err.message || "Failed to submit advisory report");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="relative w-full max-w-lg rounded-2xl border border-border bg-surface p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between pb-3 border-b border-border">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-accent">shield</span>
                        <h3 className="font-serif text-lg font-bold text-text">
                            Report Content Advisory
                        </h3>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-1.5 text-text-3 hover:bg-surface-2 hover:text-text transition-colors cursor-pointer"
                    >
                        <span className="material-symbols-outlined text-lg">close</span>
                    </button>
                </div>

                <p className="text-xs text-text-3 mt-2">
                    Help fellow viewers understand sensory and thematic content for <strong className="text-text">{movieTitle}</strong>. Please avoid plot spoilers.
                </p>

                {errorMsg && (
                    <div className="mt-3 p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                        {errorMsg}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    {/* Category Selection */}
                    <div>
                        <label className="block text-xs uppercase tracking-wider text-text-3 font-semibold mb-2">
                            Select Category
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                            {ADVISORY_CATEGORIES.map((cat) => {
                                const isSelected = selectedCategory === cat.id;
                                return (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        onClick={() => setSelectedCategory(cat.id)}
                                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2 text-xs ${
                                            isSelected
                                                ? "bg-accent/15 border-accent text-accent font-semibold"
                                                : "bg-surface-2 border-border text-text-2 hover:border-text-3"
                                        }`}
                                    >
                                        <span className="text-base">{cat.emoji}</span>
                                        <span className="truncate">{cat.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Severity Selection */}
                    <div>
                        <label className="block text-xs uppercase tracking-wider text-text-3 font-semibold mb-2">
                            Severity / Frequency
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                            {SEVERITY_LEVELS.map((sev) => {
                                const isSelected = selectedSeverity === sev.id;
                                return (
                                    <button
                                        key={sev.id}
                                        type="button"
                                        onClick={() => setSelectedSeverity(sev.id)}
                                        className={`px-2 py-2 rounded-lg border text-center transition-all cursor-pointer text-xs font-semibold ${
                                            isSelected
                                                ? "bg-accent text-white border-accent shadow-sm"
                                                : "bg-surface-2 border-border text-text-3 hover:text-text"
                                        }`}
                                    >
                                        {sev.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Non-Spoiler Details */}
                    <div>
                        <label className="block text-xs uppercase tracking-wider text-text-3 font-semibold mb-1">
                            Brief Details <span className="text-[10px] font-normal lowercase">(optional, no spoilers)</span>
                        </label>
                        <input
                            type="text"
                            maxLength={150}
                            value={details}
                            onChange={(e) => setDetails(e.target.value)}
                            placeholder="e.g. Rapid flashing strobe in club sequence (around 45 min mark)"
                            className="w-full rounded-xl bg-surface-2 border border-border px-3.5 py-2.5 text-xs text-text placeholder:text-text-3/60 focus:border-accent focus:outline-none"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn-secondary text-xs py-2 px-4 cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="btn-primary text-xs py-2 px-5 cursor-pointer disabled:opacity-50"
                        >
                            {submitting ? "Submitting..." : "Submit Report"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
