function MetricCard({ label, value, suffix }) {
    return (
        <div className="px-4 py-2 bg-surface-container rounded-lg">
            <p className="font-label-caps text-label-caps text-text-dim uppercase">
                {label}
            </p>

            <p className="font-title-md text-title-md font-bold text-text-main">
                {value}

                {suffix && (
                    <span className="text-primary text-[12px] font-normal ml-1">
                        {suffix}
                    </span>
                )}
            </p>
        </div>
    );
}

export default MetricCard;