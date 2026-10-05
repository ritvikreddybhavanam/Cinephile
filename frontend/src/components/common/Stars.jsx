function Stars({ rating }) {
    return (
        <div className="flex items-center gap-0.5" role="img" aria-label={`${rating} out of 5 stars`}>
            {[1, 2, 3, 4, 5].map((star) => (
                <span
                    key={star}
                    className="material-symbols-outlined text-[16px]"
                    style={{
                        fontVariationSettings: "'FILL' 1",
                        color: star <= rating ? "var(--color-accent)" : "var(--color-border)",
                    }}
                >
                    star
                </span>
            ))}
        </div>
    );
}

export default Stars;
