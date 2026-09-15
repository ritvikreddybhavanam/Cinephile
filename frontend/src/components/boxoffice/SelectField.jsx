function SelectField({
                         label,
                         value,
                         onChange,
                         icon,
                         options
                     }) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="font-metadata text-metadata text-on-surface">
                {label}
            </label>

            <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3.5 text-text-dim text-[18px]">
                    {icon}
                </span>

                <select
                    value={value}
                    onChange={onChange}
                    className="w-full pl-11 pr-10 py-3 bg-surface-deep rounded-lg text-text-main font-body-sm text-body-sm focus:outline-none focus:bg-surface-container appearance-none cursor-pointer transition-all"
                >
                    {options.map((option) => (
                        <option
                            key={option.value}
                            value={option.value}
                        >
                            {option.label}
                        </option>
                    ))}
                </select>

                <span className="material-symbols-outlined absolute right-3 pointer-events-none text-text-dim text-[18px]">
                    expand_more
                </span>
            </div>
        </div>
    );
}

export default SelectField;