function SelectField({
    label,
    value,
    onChange,
    icon,
    options
}) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-text">
                {label}
            </label>

            <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3.5 text-text-3 text-[18px]">
                    {icon}
                </span>

                <select
                    value={value}
                    onChange={onChange}
                    className="w-full pl-11 pr-10 py-2.5 bg-surface border border-border rounded-lg text-text text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 appearance-none cursor-pointer transition-all"
                >
                    {options.map((option) => (
                        <option
                            key={option.value}
                            value={option.value}
                            className="bg-surface text-text"
                        >
                            {option.label}
                        </option>
                    ))}
                </select>

                <span className="material-symbols-outlined absolute right-3 pointer-events-none text-text-3 text-[18px]">
                    expand_more
                </span>
            </div>
        </div>
    );
}

export default SelectField;