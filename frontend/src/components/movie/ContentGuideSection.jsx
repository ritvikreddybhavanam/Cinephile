import React, { useState, useEffect } from "react";
import {
    getContentGuide,
    submitContentAdvisory,
    getUserWarningPreferences,
    saveUserWarningPreferences,
    ADVISORY_CATEGORIES,
    SEVERITY_LEVELS
} from "../../services/contentGuideService";
import ContentAdvisoryModal from "./ContentAdvisoryModal";
import { useToast } from "../../context/ToastContext";

export default function ContentGuideSection({
    movieId,
    movieTitle,
    sectionRef
}) {
    const { success, error } = useToast();
    const [guide, setGuide] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPrefsOpen, setIsPrefsOpen] = useState(false);
    const [userPrefs, setUserPrefs] = useState(getUserWarningPreferences());
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        if (!movieId) return;
        loadGuide();
    }, [movieId]);

    const loadGuide = async () => {
        try {
            setLoading(true);
            const data = await getContentGuide(movieId);
            setGuide(data);
        } catch (err) {
            console.error("Failed to load content guide:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddAdvisory = async (payload) => {
        try {
            await submitContentAdvisory(payload);
            success("Thank you! Content advisory reported.");
            await loadGuide();
        } catch (err) {
            error(err.response?.data?.error || "Failed to submit advisory");
            throw err;
        }
    };

    const togglePref = (catId) => {
        const next = userPrefs.includes(catId)
            ? userPrefs.filter((c) => c !== catId)
            : [...userPrefs, catId];
        setUserPrefs(next);
        saveUserWarningPreferences(next);
    };

    const summaries = guide?.summaries || [];
    const totalReports = guide?.totalReports || 0;

    // Check which community advisories match the user's active preferences
    const matchingWarnings = summaries.filter((s) => {
        const hasSeverity = s.dominantSeverity && s.dominantSeverity !== "NONE";
        return hasSeverity && userPrefs.includes(s.category);
    });

    const getSeverityStyle = (sev) => {
        const item = SEVERITY_LEVELS.find((s) => s.id === sev);
        return item ? item.color : "text-text-3 bg-surface border-border";
    };

    const getCategoryMeta = (catId) => {
        return ADVISORY_CATEGORIES.find((c) => c.id === catId) || {
            id: catId,
            label: catId.replace("_", " "),
            emoji: "⚠️",
            desc: ""
        };
    };

    return (
        <section
            ref={sectionRef}
            id="content-guide"
            className="page-container pb-8 md:pb-12 scroll-mt-24"
        >
            {/* Preference Alert Banner (Non-blocking warning banner) */}
            {matchingWarnings.length > 0 && (
                <div className="mb-4 rounded-xl border border-amber-500/40 bg-amber-500/10 p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
                    <div className="flex items-center gap-2.5">
                        <span className="material-symbols-outlined text-amber-400 text-xl shrink-0">
                            warning
                        </span>
                        <div className="text-xs text-text">
                            <span className="font-bold text-amber-300">
                                {matchingWarnings.length} Content Advisory {matchingWarnings.length === 1 ? "match" : "matches"} your preferences:
                            </span>{" "}
                            <span className="text-text-2">
                                {matchingWarnings.map(m => getCategoryMeta(m.category).label).join(", ")}
                            </span>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => {
                            const el = document.getElementById("content-guide-card");
                            if (el) el.scrollIntoView({ behavior: "smooth" });
                            setExpanded(true);
                        }}
                        className="text-xs font-semibold text-amber-300 hover:underline shrink-0 text-left sm:text-right cursor-pointer"
                    >
                        View Content Details ↓
                    </button>
                </div>
            )}

            {/* Main Compact Content Guide Card */}
            <div id="content-guide-card" className="rounded-2xl border border-border bg-surface p-5 sm:p-6 transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
                    <div className="flex items-center gap-2.5">
                        <div className="h-9 w-9 rounded-xl bg-accent/15 border border-accent/20 flex items-center justify-center text-accent">
                            <span className="material-symbols-outlined text-xl">shield</span>
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-serif text-base sm:text-lg font-bold text-text">
                                    Content & Sensory Guide
                                </h3>
                                <span className="rounded-full bg-surface-2 border border-border px-2 py-0.5 text-[10px] text-text-3 font-mono">
                                    Community Reported
                                </span>
                            </div>
                            <p className="text-[11px] text-text-3">
                                {totalReports > 0
                                    ? `Based on ${totalReports} community contributor ${totalReports === 1 ? "report" : "reports"}`
                                    : "No community reports filed yet. Help other film lovers by submitting the first advisory."}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                        {/* Configure Warnings */}
                        <button
                            type="button"
                            onClick={() => setIsPrefsOpen((prev) => !prev)}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface-2 px-3 py-1.5 text-xs text-text-2 hover:text-text hover:border-accent transition-colors cursor-pointer"
                        >
                            <span className="material-symbols-outlined text-[15px]">tune</span>
                            <span>My Preferences</span>
                        </button>

                        {/* Add Advisory Report */}
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(true)}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-accent/15 border border-accent/30 px-3 py-1.5 text-xs font-semibold text-accent hover:bg-accent/25 transition-colors cursor-pointer"
                        >
                            <span className="material-symbols-outlined text-[15px]">add_moderator</span>
                            <span>+ Report Advisory</span>
                        </button>
                    </div>
                </div>

                {/* User Warning Preferences Panel (Collapsible) */}
                {isPrefsOpen && (
                    <div className="my-4 p-4 rounded-xl bg-surface-2 border border-border animate-in fade-in">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs uppercase font-semibold text-accent tracking-wider">
                                Always notify me if a film contains:
                            </span>
                            <span className="text-[11px] text-text-3">Saved locally</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {ADVISORY_CATEGORIES.map((cat) => {
                                const checked = userPrefs.includes(cat.id);
                                return (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        onClick={() => togglePref(cat.id)}
                                        className={`p-2 rounded-lg border text-left text-xs transition-all cursor-pointer flex items-center justify-between ${
                                            checked
                                                ? "bg-accent/15 border-accent text-accent font-semibold"
                                                : "bg-surface border-border text-text-3 hover:text-text"
                                        }`}
                                    >
                                        <div className="flex items-center gap-1.5 truncate">
                                            <span>{cat.emoji}</span>
                                            <span className="truncate">{cat.label}</span>
                                        </div>
                                        {checked && <span className="material-symbols-outlined text-sm">check</span>}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Summaries Grid */}
                {summaries.length === 0 ? (
                    <div className="py-6 text-center text-xs text-text-3">
                        <p>No content warnings reported for this title yet.</p>
                        <p className="mt-1 opacity-70">
                            Know something viewers should be mindful of? Click <strong>+ Report Advisory</strong> above.
                        </p>
                    </div>
                ) : (
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {(expanded ? summaries : summaries.slice(0, 6)).map((sum) => {
                            const meta = getCategoryMeta(sum.category);
                            return (
                                <div
                                    key={sum.category}
                                    className="rounded-xl border border-border/70 bg-surface-2 p-3 flex flex-col justify-between gap-2"
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <span className="text-lg">{meta.emoji}</span>
                                            <span className="text-xs font-semibold text-text truncate">
                                                {meta.label}
                                            </span>
                                        </div>
                                        <span className={`px-2 py-0.5 rounded-md border text-[10px] font-bold uppercase tracking-wider shrink-0 ${getSeverityStyle(sum.dominantSeverity)}`}>
                                            {sum.dominantSeverity}
                                        </span>
                                    </div>

                                    <div className="text-[11px] text-text-3 flex items-center justify-between">
                                        <span>Based on {sum.reportCount} {sum.reportCount === 1 ? "report" : "reports"}</span>
                                        {sum.details && sum.details.length > 0 && (
                                            <span className="italic truncate max-w-[140px]" title={sum.details[0]}>
                                                "{sum.details[0]}"
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {summaries.length > 6 && (
                    <div className="mt-4 pt-3 border-t border-border/60 flex justify-center">
                        <button
                            type="button"
                            onClick={() => setExpanded((prev) => !prev)}
                            className="text-xs font-semibold text-accent hover:underline cursor-pointer flex items-center gap-1"
                        >
                            <span>{expanded ? "Show Less" : `View All ${summaries.length} Categories`}</span>
                            <span className="material-symbols-outlined text-[14px]">
                                {expanded ? "expand_less" : "expand_more"}
                            </span>
                        </button>
                    </div>
                )}
            </div>

            {/* Modal */}
            <ContentAdvisoryModal
                movieId={movieId}
                movieTitle={movieTitle}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmitSuccess={handleAddAdvisory}
            />
        </section>
    );
}
