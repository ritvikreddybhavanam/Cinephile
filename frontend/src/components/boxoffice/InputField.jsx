function InputField({
  label,
  value,
  onChange,
  placeholder,
  icon,
  required = false,
  badge,
  type = "text",
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-metadata text-metadata text-on-surface flex items-center justify-between">
        <span>{label}</span>

        {badge && (
          <span className="text-text-dim font-label-caps text-[11px]">
            {badge}
          </span>
        )}

        {required && (
          <span className="text-text-dim font-label-caps text-[11px]">
            REQUIRED
          </span>
        )}
      </label>

      <div className="relative flex items-center">
        <span className="material-symbols-outlined absolute left-3.5 text-text-dim text-[18px]">
          {icon}
        </span>

        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className="w-full pl-11 pr-4 py-3 bg-surface-deep rounded-lg text-text-main font-body-sm text-body-sm placeholder:text-text-dim/50 focus:outline-none focus:bg-surface-container transition-all"
        />
      </div>
    </div>
  );
}

export default InputField;
