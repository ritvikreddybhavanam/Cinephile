/**
 * ============================================================
 * "MIDNIGHT CINEMA" & "DAYLIGHT CINEMA" DESIGN TOKENS
 * Film logging & analytics theme inspired by Criterion, MUBI & Letterboxd.
 * ============================================================
 */

export const darkColors = {
    bg: '#0B0C10',
    surface: '#14161C',
    surface2: '#1B1E26',
    border: '#262A34',
    text: '#ECE8E1',
    text2: '#A6A29A',
    text3: '#6E6B65',
    accent: '#C9A86A',
    accentHover: '#DDBF85',
    accentSoft: 'rgba(201,168,106,0.12)',
    wine: '#7C3A4B',
    success: '#7FA88C',
    error: '#C4646F',
    chart: {
        gold: '#C9A86A',
        goldMid: '#8F7749',
        goldDark: '#5C4C2E',
        muted: '#A6A29A',
        darkMuted: '#6E6B65',
    },
};

export const lightColors = {
    bg: '#F8F6F0',
    surface: '#FFFFFF',
    surface2: '#F0ECE1',
    border: '#E2DDD3',
    text: '#191816',
    text2: '#545048',
    text3: '#8C867A',
    accent: '#B38628',
    accentHover: '#996F1D',
    accentSoft: 'rgba(179,134,40,0.12)',
    wine: '#872E44',
    success: '#2E7D52',
    error: '#C23847',
    chart: {
        gold: '#B38628',
        goldMid: '#996F1D',
        goldDark: '#6E4D0F',
        muted: '#545048',
        darkMuted: '#8C867A',
    },
};

export const colors = darkColors;

export const typography = {
    fontHeadings: '"Fraunces", Georgia, serif',
    fontBody: '"Inter", system-ui, -apple-system, sans-serif',
    headingWeights: {
        normal: 500,
        semibold: 600,
    },
    labelCaps: {
        fontFamily: '"Inter", sans-serif',
        fontSize: '11px',
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: '#C9A86A',
    },
};

export const components = {
    card: {
        background: 'var(--color-surface, #14161C)',
        border: '1px solid var(--color-border, #262A34)',
        borderRadius: '10px',
        boxShadow: 'var(--shadow-card)',
        hover: {
            transform: 'translateY(-4px)',
            boxShadow: 'var(--shadow-card-hover)',
            outline: '1px solid rgba(201,168,106,0.35)',
        },
    },
    buttonPrimary: {
        background: 'var(--color-accent, #C9A86A)',
        color: '#0B0C10',
        borderRadius: '9999px',
        hoverBackground: 'var(--color-accent-hover, #DDBF85)',
    },
    buttonSecondary: {
        background: 'transparent',
        border: '1px solid var(--color-accent, #C9A86A)',
        color: 'var(--color-accent, #C9A86A)',
        borderRadius: '9999px',
    },
    poster: {
        aspectRatio: '2/3',
        borderRadius: '10px',
    },
    starRating: {
        filled: 'var(--color-accent, #C9A86A)',
        empty: 'var(--color-border, #262A34)',
    },
};

export const layout = {
    maxWidth: '1200px',
    gridUnit: 8,
};

export const motion = {
    duration: '200ms',
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
};

export default {
    darkColors,
    lightColors,
    colors,
    typography,
    components,
    layout,
    motion,
};
