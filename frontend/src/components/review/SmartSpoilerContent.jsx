import React, { useState } from "react";

// Parses content containing [spoiler:Category]hidden text[/spoiler] or ||hidden text||
export default function SmartSpoilerContent({
    content = "",
    globalSpoilerPref = "hide_blocks", // 'hide_blocks' | 'hide_major' | 'show_all'
    spoilerTypes = []
}) {
    // Map of revealed inline block indexes
    const [revealedBlocks, setRevealedBlocks] = useState({});

    const toggleBlock = (index) => {
        setRevealedBlocks((prev) => ({
            ...prev,
            [index]: !prev[index],
        }));
    };

    if (!content) return null;

    // Check if entire review is hidden by preference
    const isMajor = spoilerTypes.includes("ENDING") || spoilerTypes.includes("MAJOR_TWIST") || spoilerTypes.includes("CHARACTER_DEATH");
    if (globalSpoilerPref === "hide_major" && isMajor) {
        // Render coarse spoiler blocker
        return (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-center">
                <p className="text-xs font-semibold text-amber-300 mb-1 flex items-center justify-center gap-1.5">
                    <span className="material-symbols-outlined text-base">lock</span>
                    Review Hidden by Your Preferences (Contains Major Spoilers)
                </p>
                <p className="text-[11px] text-text-3">
                    Spoilers: {spoilerTypes.map(s => s.replace("_", " ")).join(", ")}
                </p>
            </div>
        );
    }

    // Regex to detect [spoiler:Category]...[/spoiler], [spoiler]...[/spoiler], or ||...||
    const spoilerRegex = /(?:\[spoiler(?::([^\]]+))?\]([\s\S]*?)\[\/spoiler\])|(?:\|\|([\s\S]*?)\|\|)/gi;

    const parts = [];
    let lastIndex = 0;
    let match;
    let blockIndex = 0;

    while ((match = spoilerRegex.exec(content)) !== null) {
        // Push preceding plain text
        if (match.index > lastIndex) {
            parts.push({
                type: "text",
                value: content.substring(lastIndex, match.index),
            });
        }

        const category = match[1] ? match[1].trim() : "Spoiler";
        const spoilerBody = match[2] !== undefined ? match[2] : match[3];

        parts.push({
            type: "spoiler",
            index: blockIndex,
            category,
            body: spoilerBody,
        });

        blockIndex++;
        lastIndex = spoilerRegex.lastIndex;
    }

    if (lastIndex < content.length) {
        parts.push({
            type: "text",
            value: content.substring(lastIndex),
        });
    }

    // If no inline tags found, render plain text
    if (parts.length === 1 && parts[0].type === "text") {
        return (
            <p className="whitespace-pre-line text-sm leading-relaxed text-text-2">
                {content}
            </p>
        );
    }

    return (
        <div className="space-y-2 text-sm leading-relaxed text-text-2">
            {parts.map((part, idx) => {
                if (part.type === "text") {
                    return (
                        <span key={idx} className="whitespace-pre-line">
                            {part.value}
                        </span>
                    );
                }

                const isRevealed = globalSpoilerPref === "show_all" || Boolean(revealedBlocks[part.index]);

                if (isRevealed) {
                    return (
                        <span
                            key={idx}
                            className="inline-block my-1 rounded-lg border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 text-text transition-all"
                        >
                            <span className="mr-1.5 text-[10px] uppercase font-bold text-amber-400 font-mono">
                                [{part.category}]:
                            </span>
                            <span className="whitespace-pre-line">{part.body}</span>
                            <button
                                type="button"
                                onClick={() => toggleBlock(part.index)}
                                className="ml-2 text-[10px] text-text-3 hover:text-text cursor-pointer underline"
                                title="Hide this section again"
                            >
                                (hide)
                            </button>
                        </span>
                    );
                }

                return (
                    <button
                        key={idx}
                        type="button"
                        onClick={() => toggleBlock(part.index)}
                        className="inline-flex items-center gap-1.5 my-1 mx-1 rounded-lg border border-border bg-surface-2 hover:border-accent hover:bg-surface px-2.5 py-1 text-xs font-semibold text-accent transition-all cursor-pointer select-none"
                    >
                        <span className="material-symbols-outlined text-[14px]">lock</span>
                        <span>🔒 {part.category} Spoiler — Reveal</span>
                    </button>
                );
            })}
        </div>
    );
}
