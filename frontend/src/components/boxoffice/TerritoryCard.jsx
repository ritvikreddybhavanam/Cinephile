function TerritoryCard({ icon, title, description, iconClass = "text-primary" }) {
    return (
        <div className="bg-surface-container p-4 rounded-lg flex items-center gap-3">
            <span className={`material-symbols-outlined text-[22px] ${iconClass}`}>
                {icon}
            </span>

            <div>
                <p className="font-metadata text-metadata font-bold text-text-main">
                    {title}
                </p>

                <p className="font-label-caps text-[11px] text-text-dim">
                    {description}
                </p>
            </div>
        </div>
    );
}

export default TerritoryCard;