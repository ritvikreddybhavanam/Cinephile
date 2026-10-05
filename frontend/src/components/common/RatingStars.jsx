function RatingStars({ rating = 0, max = 5 }) {
    return (
        <div
            className="flex items-center gap-0.5"
            aria-label={`${rating} out of ${max} stars`}
            role="img"
        >
            {Array.from({ length: max }, (_, index) => (
                <span
                    key={index}
                    className="material-symbols-outlined text-[16px]"
                    style={{
                        fontVariationSettings: "'FILL' 1",
                        color: index < rating ? "var(--color-accent)" : "var(--color-border)",
                    }}
                >
                    star
                </span>
            ))}
        </div>
    );
}

export default RatingStars;
