import Icon from "../common/Icon";

function LikedStatsCard({
    label,
    icon,
    iconClass,
    value,
    suffix,
    footer,
    footerClass,
    filledIcon = false,
    className = "",
}) {
    return (
        <div
            className={`flex flex-col justify-between rounded-lg border border-border bg-surface p-4 transition-all duration-200 hover:border-accent/30 hover:shadow-card ${className}`}
        >
            <div className="mb-3 flex items-center justify-between text-text-3">
                <span className="text-[10px] font-semibold uppercase tracking-widest">
                    {label}
                </span>
                <Icon
                    className={`text-[18px] ${iconClass}`}
                    style={filledIcon ? { fontVariationSettings: "'FILL' 1" } : undefined}
                >
                    {icon}
                </Icon>
            </div>

            <div>
                <div className="font-serif text-2xl font-semibold text-text">
                    {value}
                    {suffix && (
                        <span
                            className={
                                suffix === "★"
                                    ? "ml-1 text-lg text-accent"
                                    : "ml-1 text-xs font-normal text-text-3"
                            }
                        >
                            {suffix}
                        </span>
                    )}
                </div>
                <div className={`mt-1 text-[11px] text-text-3 ${footerClass}`}>
                    {footer}
                </div>
            </div>
        </div>
    );
}

export default LikedStatsCard;
