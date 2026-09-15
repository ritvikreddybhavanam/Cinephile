function Icon({ children, className = "", style }) {
    return (
        <span
            className={`material-symbols-outlined ${className}`}
            style={style}
        >
            {children}
        </span>
    );
}

export default Icon;

