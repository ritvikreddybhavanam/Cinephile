function TerritoryCard({ icon, title, description, iconClass = "text-accent" }) {
    return (
        <div className="bg-surface border border-border p-3.5 rounded-lg flex items-center gap-3">
            <span className={`material-symbols-outlined text-[20px] ${iconClass}`}>
                {icon}
            </span>

            <div>
                <p className="text-xs font-semibold text-text">
                    {title}
                </p>

                <p className="label-caps text-[10px]">
                    {description}
                </p>
            </div>
        </div>
    );
}

export default TerritoryCard;