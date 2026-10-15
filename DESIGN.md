# Midnight Cinema — Design System Specification

A comprehensive design language and UI foundation for cinematic, editorial web applications, media trackers, and creative portfolios. Inspired by Criterion Channel, MUBI, Letterboxd, and A24 editorial publications.

---

## 1. Design Philosophy

- **Cinematic & Immersive**: High-resolution movie posters, film backdrops, and video headers are the hero assets. The interface recedes gracefully into the background.
- **Editorial Typography**: Pairing an expressive variable serif (`Fraunces`) for titles with an ultra-clean, legible neo-grotesque sans-serif (`Inter`) for data, reviews, and microcopy.
- **Warm Contrast over Harsh Monochrome**: Instead of sterile pitch black (`#000000`) and pure white (`#FFFFFF`), the palette employs deep charcoal-obsidian (`#0B0C10`), warm slate surfaces, and champagne gold accents (`#C9A86A`).
- **Tactile Depth & Micro-interactions**: Smooth 4px card lifts, subtle 3.5% procedural film grain, delicate 1px border outlines, and frosted glass backdrops.
- **Accessibility by Default**: Strict adherence to WCAG 2.1 AA standards with high contrast tokens (minimum 4.5:1 for normal text) and full `prefers-reduced-motion` support.

---

## 2. Color System & Tokens

### 2.1 Dark Mode ("Midnight Cinema" — Default)

| Token Name | CSS Variable | Hex / RGBA | Role / Usage |
| :--- | :--- | :--- | :--- |
| **Background** | `--color-bg` | `#0B0C10` | Base page background (charcoal-obsidian) |
| **Surface** | `--color-surface` | `#14161C` | Cards, modals, sidebars, dropdowns |
| **Surface 2** | `--color-surface-2` | `#1B1E26` | Secondary surfaces, input fills, hover rows |
| **Border** | `--color-border` | `#262A34` | Subtle 1px dividers, cards, outlines |
| **Text Primary** | `--color-text` | `#ECE8E1` | High-contrast body, titles, headings |
| **Text Secondary** | `--color-text-2` | `#A6A29A` | Metadata, subtitles, active icons |
| **Text Muted** | `--color-text-3` | `#6E6B65` | Placeholders, keyboard hints, disabled labels |
| **Accent Gold** | `--color-accent` | `#C9A86A` | Champagne gold: Primary actions, ratings, active tabs |
| **Accent Hover** | `--color-accent-hover` | `#DDBF85` | Hover state for accent buttons & active links |
| **Accent Soft** | `--color-accent-soft` | `rgba(201, 168, 106, 0.12)` | Badge backgrounds, active pill highlights |
| **Cinematic Wine** | `--color-wine` | `#7C3A4B` | Editorial highlights, curated lists, favorites |
| **Success** | `--color-success` | `#7FA88C` | Logged status, success toasts, verified tags |
| **Error / Alert** | `--color-error` | `#C4646F` | Destructive actions, validation errors |

### 2.2 Light Mode ("Daylight Slate")

| Token Name | CSS Variable | Hex / RGBA | Role / Usage | Contrast vs Bg |
| :--- | :--- | :--- | :--- | :--- |
| **Background** | `--color-bg` | `#F8FAFC` | Clean slate background | — |
| **Surface** | `--color-surface` | `#FFFFFF` | Elevated cards, dialogs, sheets | — |
| **Surface 2** | `--color-surface-2` | `#F1F5F9` | Secondary controls, badge backgrounds | — |
| **Border** | `--color-border` | `#CBD5E1` | Crisp light borders | — |
| **Text Primary** | `--color-text` | `#0F172A` | Deep slate primary text | `15.8:1` (AAA) |
| **Text Secondary** | `--color-text-2` | `#334155` | Secondary slate | `9.7:1` (AAA) |
| **Text Muted** | `--color-text-3` | `#596780` | Muted labels, shortcut hints (`⌘K`) | `5.3:1` (AA) |
| **Accent Gold/Indigo**| `--color-accent` | `#4338CA` or `#B38628` | Primary buttons, links, interactive highlights | `5.5:1`+ (AA) |
| **Accent Soft** | `--color-accent-soft` | `rgba(67, 56, 202, 0.10)` | Chip & pill highlights | — |

---

## 3. Typography

### 3.1 Font Families

```css
/* Google Fonts Import */
@import url("https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,400;1,9..144,500&family=Inter:wght@300;400;500;600;700&display=swap");
```

- **Editorial Headings**: `"Fraunces", Georgia, serif`
  - Used for hero banners, movie titles, section headers, review headlines.
  - Optical sizes `opsz: 9..144` scale gracefully from display headlines down to sub-captions.
- **Body & Interface**: `"Inter", system-ui, -apple-system, sans-serif`
  - Used for body prose, reviews, navigation links, form inputs, button labels.
- **Metadata & Codes**: `ui-monospace, "JetBrains Mono", monospace`
  - Used for shortcuts (`⌘K`), timestamps, ratings, runtimes, aspect ratios.

### 3.2 Typography Scale

| Hierarchy | Font Family | Size | Weight | Line Height | Letter Spacing |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Display Hero** | Fraunces | `48px` - `64px` | 700 | `1.1` | `-0.02em` |
| **Headline LG** | Fraunces | `32px` - `40px` | 600 | `1.15` | `-0.015em` |
| **Section Title** | Fraunces | `22px` - `26px` | 600 | `1.25` | `-0.01em` |
| **Title MD** | Inter | `18px` | 600 | `1.35` | `0` |
| **Body Regular** | Inter | `15px` | 400 | `1.6` | `0` |
| **Body Small** | Inter | `13px` | 400 | `1.5` | `0` |
| **Label Caps** | Inter | `11px` | 600 | `1.4` | `0.12em (uppercase)` |
| **Badge / Mono** | Monospace | `10px` - `11px` | 600 | `1.2` | `0.05em` |

---

## 4. Spacing, Grid & Layout Foundation

- **Baseline Grid**: `8px` spatial rhythm (`8px`, `16px`, `24px`, `32px`, `40px`, `48px`, `64px`).
- **Container Max Width**:
  - Content views: `max-w-[1200px]`
  - Wide hero / catalogue browses: `max-w-[1440px]`
  - Focused forms / auth: `max-w-[480px]`
- **Theatrical Poster Aspect Ratio**: Strict `2:3` standard ratio (`aspect-[2/3]`).
- **Standard Border Radius**:
  - Extra Small (`--radius-sm`): `6px` (badges, input fields)
  - Default / Cards (`--radius-DEFAULT`): `10px` (posters, content cards)
  - Modals & Sheets (`--radius-lg`): `14px` - `16px`
  - Full Pill (`--radius-full`): `9999px` (buttons, tags, search bars)

---

## 5. Shadows, Elevation & Motion

### 5.1 Elevation Tokens

```css
--shadow-card:       0 8px 30px rgba(0, 0, 0, 0.45);
--shadow-card-hover: 0 12px 40px rgba(0, 0, 0, 0.6);
--shadow-elevated:   0 20px 60px rgba(0, 0, 0, 0.7);
```

### 5.2 Motion & Transitions

- **Fast** (`--duration-fast`): `150ms` (hover colors, button press, toggle switches)
- **Base** (`--duration-base`): `200ms` (dropdowns, card lifts, border glows)
- **Slow** (`--duration-slow`): `350ms` (modals, sheet slide-ins, page fades)
- **Easing Function**: `cubic-bezier(0.4, 0, 0.2, 1)`
- **Accessibility Safeguard**:
  ```css
  @media (prefers-reduced-motion: reduce) {
      *, ::before, ::after {
          animation-duration: 0.01ms !important;
          transition-duration: 0.01ms !important;
      }
  }
  ```

---

## 6. Core Reusable Component Patterns

### 6.1 Theatrical Movie Poster Card

```html
<div class="poster-card group">
    <img src="poster.jpg" alt="Film Title" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
    <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end">
        <span class="text-xs font-semibold text-accent font-serif">★ 8.5</span>
        <h4 class="text-sm font-semibold text-text truncate">Inception</h4>
        <span class="text-[11px] text-text-2">2010</span>
    </div>
</div>
```

```css
.poster-card {
    position: relative;
    aspect-ratio: 2 / 3;
    width: 100%;
    overflow: hidden;
    border-radius: var(--radius-DEFAULT);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    box-shadow: var(--shadow-card);
    cursor: pointer;
    transition: transform var(--duration-base) var(--ease-default),
                box-shadow var(--duration-base) var(--ease-default),
                border-color var(--duration-base) var(--ease-default);
}

.poster-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-card-hover), 0 0 0 1px rgba(201, 168, 106, 0.35);
    border-color: rgba(201, 168, 106, 0.35);
}
```

---

### 6.2 Button System

```css
/* Primary Action Button (Champagne Gold Pill) */
.btn-primary {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 10px 24px;
    border-radius: var(--radius-full);
    background: var(--color-accent);
    color: #0B0C10;
    font-family: var(--font-sans);
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 0.01em;
    border: none;
    cursor: pointer;
    transition: background var(--duration-base), transform var(--duration-fast), box-shadow var(--duration-base);
}

.btn-primary:hover {
    background: var(--color-accent-hover);
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(201, 168, 106, 0.35);
}

.btn-primary:active { transform: translateY(0); }

/* Secondary Outlined Pill */
.btn-secondary {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 10px 24px;
    border-radius: var(--radius-full);
    background: transparent;
    color: var(--color-accent);
    border: 1px solid var(--color-accent);
    font-family: var(--font-sans);
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: background var(--duration-base), color var(--duration-base), transform var(--duration-fast);
}

.btn-secondary:hover {
    background: var(--color-accent-soft);
    transform: translateY(-1px);
}
```

---

### 6.3 Input & Global Search Bar with Keyboard Hint

```html
<div class="relative w-full max-w-md">
    <span class="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-text-3">
        search
    </span>
    <input
        type="text"
        placeholder="Search films, cast, crew..."
        class="mc-input pl-11 pr-12"
    />
    <span class="hidden md:inline-flex absolute right-3 top-1/2 -translate-y-1/2 items-center rounded border border-border/80 bg-surface-2/80 px-1.5 py-0.5 text-[10px] font-mono font-semibold text-text-3">
        ⌘K
    </span>
</div>
```

```css
.mc-input {
    width: 100%;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    color: var(--color-text);
    font-family: var(--font-sans);
    font-size: 14px;
    padding: 10px 14px;
    outline: none;
    transition: border-color var(--duration-base), box-shadow var(--duration-base);
}

.mc-input::placeholder { color: var(--color-text-3); }

.mc-input:focus {
    border-color: var(--color-accent);
    box-shadow: 0 0 0 3px rgba(201, 168, 106, 0.15);
}
```

---

### 6.4 Frosted Glass Navigation Bar

```css
.navbar-blur {
    background: rgba(11, 12, 16, 0.85);
    backdrop-filter: blur(20px) saturate(150%);
    -webkit-backdrop-filter: blur(20px) saturate(150%);
    border-bottom: 1px solid var(--color-border);
}

html.light .navbar-blur {
    background: rgba(248, 250, 252, 0.92);
}
```

---

### 6.5 Subtle Film Grain Texture

Adds a tactile cinema projection feel across headers or the entire viewport without impacting performance:

```css
.film-grain::after {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23noise)' opacity='0.035'/%3E%3C/svg%3E");
    opacity: 0.035;
    mix-blend-mode: overlay;
    border-radius: inherit;
}
```

---

### 6.6 Theatrical Hero Backdrop Mask

Ensures text readability over dynamic, bright movie backdrops:

```css
.hero-gradient {
    background: linear-gradient(
        to top,
        #0B0C10 5%,
        rgba(11, 12, 16, 0.82) 40%,
        rgba(11, 12, 16, 0.40) 70%,
        transparent 100%
    );
}

.hero-gradient-side {
    background: linear-gradient(
        to right,
        #0B0C10 0%,
        rgba(11, 12, 16, 0.85) 35%,
        rgba(11, 12, 16, 0.30) 65%,
        transparent 100%
    );
}
```

---

## 7. How to Apply this Design System to Another Project

### Step 1: Install Fonts & Dependencies
Add Google Fonts (`Fraunces` and `Inter`) and Material Symbols Outlined to your `index.html` or CSS entrypoint:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;0,9..144,700;1,9..144,400&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet">
```

### Step 2: Configure Tailwind CSS v3 / v4 or CSS Variables
If using Tailwind CSS, map the design tokens into your `tailwind.config.js` or CSS `@theme`:
```javascript
// tailwind.config.js
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: 'var(--color-bg)',
        surface: 'var(--color-surface)',
        'surface-2': 'var(--color-surface-2)',
        border: 'var(--color-border)',
        text: 'var(--color-text)',
        'text-2': 'var(--color-text-2)',
        'text-3': 'var(--color-text-3)',
        accent: 'var(--color-accent)',
        'accent-hover': 'var(--color-accent-hover)',
        'accent-soft': 'var(--color-accent-soft)',
        wine: 'var(--color-wine)',
      },
      fontFamily: {
        serif: ['"Fraunces"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
    },
  },
};
```

### Step 3: Implement Theme Switching
Store the theme in `localStorage` (`'dark'` or `'light'`) and toggle the `light` class on the `<html>` root element. All CSS variables will automatically adapt seamlessly.
