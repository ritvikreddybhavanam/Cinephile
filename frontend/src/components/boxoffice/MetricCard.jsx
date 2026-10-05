function MetricCard({ label, value, suffix }) {
    return (
        <div className="px-4 py-3 bg-surface border border-border rounded-lg">
            <p className="label-caps mb-1">{label}</p>
            <p className="text-lg font-semibold text-text">
                {value}
                {suffix && (
                    <span className="text-accent text-xs font-normal ml-1">{suffix}</span>
                )}
            </p>
        </div>
    );
}

export default MetricCard;