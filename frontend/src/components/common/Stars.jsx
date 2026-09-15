function Stars({ rating }) {
    return (
        <div className="flex text-[#43fe6d] text-sm">
            {[1, 2, 3, 4, 5].map((star) => (
                <span
                    key={star}
                    className={`material-symbols-outlined text-[16px] ${
    star <= rating ? "" : "text-[#262626]"
}`}
                    style={{
                        fontVariationSettings: "'FILL' 1",
                    }}
                >
                    star
                </span>
            ))}
        </div>
    );
}

export default Stars;
