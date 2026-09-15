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
            className={`flex flex-col justify-between rounded-xl border border-white/[0.08] bg-[#181c20]/70 p-4 transition-colors hover:border-[#00e054]/40 ${className}`}
        >
            <div className="mb-2 flex items-center justify-between text-[#8d9ba8]">
                <span className="font-mono text-[11px] uppercase tracking-wider">
                    {label}
                </span>

                <Icon
                    className={`text-[18px] ${iconClass}`}
                    style={
                        filledIcon
                            ? { fontVariationSettings: "'FILL' 1" }
                            : undefined
                    }
                >
                    {icon}
                </Icon>
            </div>

            <div>
                <div className="font-headline text-2xl font-bold text-white">
                    {value}

                    {suffix && (
                        <span
                            className={
                                suffix === "★"
                                    ? "ml-1 text-lg text-yellow-500"
                                    : "ml-1 font-sans text-xs font-normal text-[#8d9ba8]"
                            }
                        >
                            {suffix}
                        </span>
                    )}
                </div>

                <div className={`mt-1 font-mono text-[11px] ${footerClass}`}>
                    {footer}
                </div>
            </div>
        </div>
    );
}

export default LikedStatsCard;
