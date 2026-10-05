function HistoricalCompCard({
  image,
  badge,
  badgeColor = "text-accent",
  title,
  details,
  revenue,
  description,
}) {
  return (
    <div className="bg-surface border border-border rounded-lg overflow-hidden group hover:-translate-y-1 transition-all duration-300">
      <div className="relative h-44 w-full overflow-hidden bg-surface-2">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/40 to-transparent" />

        <span
          className={`absolute top-3 left-3 bg-surface/90 backdrop-blur-md px-2 py-0.5 rounded badge badge-accent text-[10px] ${badgeColor}`}
        >
          {badge}
        </span>
      </div>

      <div className="p-4 flex flex-col gap-2.5">
        <div className="flex justify-between items-start gap-3">
          <div>
            <h3 className="font-serif text-base font-semibold text-text">
              {title}
            </h3>

            <p className="text-xs text-text-3">
              {details}
            </p>
          </div>

          <span
            className={`text-sm font-semibold whitespace-nowrap text-accent`}
          >
            {revenue}
          </span>
        </div>

        <p className="text-xs text-text-2 leading-relaxed line-clamp-3">
          {description}
        </p>
      </div>
    </div>
  );
}

export default HistoricalCompCard;
