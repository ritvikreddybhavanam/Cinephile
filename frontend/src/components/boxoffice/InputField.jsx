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
      <label className="text-xs font-medium text-text flex items-center justify-between">
        <span>{label}</span>

        {badge && (
          <span className="label-caps">
            {badge}
          </span>
        )}

        {required && (
          <span className="text-[10px] uppercase font-semibold text-text-3 tracking-wider">
            Required
          </span>
        )}
      </label>

      <div className="relative flex items-center">
        <span className="material-symbols-outlined absolute left-3.5 text-text-3 text-[18px]">
          {icon}
        </span>

        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className="w-full pl-11 pr-4 py-2.5 bg-surface border border-border rounded-lg text-text text-sm placeholder:text-text-3/60 outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
        />
      </div>
    </div>
  );
}

export default InputField;
