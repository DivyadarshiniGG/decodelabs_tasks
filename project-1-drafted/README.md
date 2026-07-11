# Drafted — Studio Dashboard
**DecodeLabs Full Stack Internship — Project 1: Responsive Frontend Interface**

A responsive, mobile-first dashboard concept for "Drafted," a lightweight studio-operations
tool used here by a fictional design/architecture practice, Hollow & Finch. Built with plain
HTML5, CSS3, and vanilla JavaScript — no frameworks.

## Files
- `index.html` — semantic markup and content
- `styles.css` — all styling, tokens, and responsive rules
- `script.js` — interactivity and state

Open `index.html` directly in a browser — no build step required.

## How this meets the brief

**Semantic HTML5**
`<header>`, `<nav aria-label="Primary">`, `<main>`, multiple `<section>`/`<article>` landmarks,
and `<footer>` are used deliberately, not `<div>` soup — matching "Pillar 3: Implementation"
from the training deck.

**Mobile-first, responsive layout**
Base styles are single-column. `min-width` media queries expand the layout at the two
breakpoints specified in the brief:
- `768px` (tablet) — an icon-only navigation rail appears, search bar reveals, stat cards go 2-up
- `1024px` (desktop) — full labeled sidebar, 4-up stat cards, two-column content grid

**CSS Grid + Flexbox**
CSS Grid drives the macro page shell (`header / nav / main / footer`). Flexbox handles every
component-level layout: the nav items, stat cards, chart bars, project rows, and forms.

**Fluid typography**
Headline and stat sizes use `clamp()` so type scales smoothly between breakpoints instead of
jumping at fixed points.

**2025 palette & type system (locked to the brief)**
- Mocha Mousse `#A5856F` — primary accent (active nav state, bar chart, icon backgrounds); a
  darkened `#8A6B55` variant is used specifically where white text sits on it (buttons, avatars),
  since the base tone alone didn't clear AA contrast for text
- Ethereal Blue `#A0D4E0` — secondary accent (charts, focus states, signature blueprint ticks)
- Moonlit Grey `#F2F0EA` — base background
- Headlines: Montserrat 600/700 · Body: Roboto 400 — 2 families, 3 weights total

**Signature design element**
The dashed corner "dimension ticks" on the hero panel are a deliberate nod back to the
blueprint/drafting motif used throughout the training deck itself ("You Are The Architect")
— used once, sparingly, rather than decorating the whole page.

**Accessibility (WCAG 2.1 AA)**
Skip-to-content link, visible focus states (`:focus-visible`), `aria-expanded`/`aria-pressed`/
`aria-controls` on all interactive toggles, a live region announcing chart and search updates,
a hidden data-table alternative to the visual bar chart, and `prefers-reduced-motion` support.

Every text/background pairing in the palette was checked against the WCAG contrast formula
(not eyeballed) — see `contrast-check.py` if you want to re-run it. Two colors from the initial
palette draft didn't actually clear 4.5:1 (a muted label color and the badge/status text), so
the CSS uses slightly darker "-text" variants of those hues for anything rendered as text,
while keeping the original lighter tones for decorative bars, dots, and fills:

| Pairing | Ratio |
|---|---|
| Heading ink on Moonlit Grey | 12.2:1 |
| Body text on white card | 10.1:1 |
| Muted label text on white/card | 5.2–5.5:1 |
| Mocha-dark text/button on white | 4.9:1 |
| Status/badge text (sky, success, warning variants) | 4.6–4.8:1 |

All ≥ 4.5:1, the AA threshold for normal-size text.

**JavaScript interactivity / state**
1. Mobile navigation drawer (open/close, backdrop, Escape to close, auto-close on resize)
2. Notifications dropdown (toggle, outside-click close, "mark all read" state)
3. Studio Output chart — Week/Month/Year toggle re-renders bar heights and an accessible summary
4. Live project search/filter (searches the card's own visible text, so it's always in sync — result count + empty state)
5. Quick task entry — add a task, check it off, double-click to remove
6. Settings profile form with real validation (required name, email format) and inline error/success messages
7. Light/Dark appearance toggle — swaps the whole dashboard's surface colors; contrast-checked independently for the dark theme

## Testing the responsive breakpoints
The sidebar becomes a slide-in drawer (with a hamburger toggle in the header) only below
768px — above that it's meant to be a permanent rail/sidebar, so there's nothing to toggle
on a normal desktop window. To see the mobile layout: shrink the actual browser window
narrower than 768px, or open DevTools' device toolbar (Ctrl+Shift+I, then the phone/tablet
icon) and pick a mobile size.

## Possible next steps
- Wire the chart and project list to a real API
- Persist tasks and settings with `localStorage` or a backend
