function HistoricalCompCard({
  image,
  badge,
  badgeColor = "text-primary",
  title,
  details,
  revenue,
  description,
}) {
  return (
    <div className="bg-surface-container-low rounded-xl overflow-hidden group hover:-translate-y-1 transition-all duration-300">
      <div className="relative h-48 w-full overflow-hidden bg-surface-deep">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-85"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-surface-container-low via-surface-container-low/40 to-transparent" />

        <span
          className={`absolute top-3 left-3 bg-surface-deep/90 backdrop-blur-md px-2.5 py-1 rounded font-label-caps text-[11px] font-bold ${badgeColor}`}
        >
          {badge}
        </span>
      </div>

      <div className="p-5 flex flex-col gap-3">
        <div className="flex justify-between items-start gap-4">
          <div>
            <h3 className="font-title-md text-title-md font-bold text-text-main">
              {title}
            </h3>

            <p className="font-metadata text-metadata text-text-dim">
              {details}
            </p>
          </div>

          <span
            className={`font-title-md text-title-md font-extrabold whitespace-nowrap ${badgeColor}`}
          >
            {revenue}
          </span>
        </div>

        <p className="font-body-sm text-body-sm text-text-dim leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}

export default HistoricalCompCard;
