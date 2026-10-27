# UI Redesign Spec (ditto.site-inspired: colors, spacing, typography only)

## Color system
Light "paper" surfaces:
- page bg: `#E7F4EC` (mint paper), alt surface `#EEF7F1`, card `#FFFFFF`, soft tint `#C5E0D7`
- ink: primary `#0E2A3D`, secondary `#3C5B6A`, muted `#557079`, faint `#7FA6A8`
- accent (single chromatic accent, mint/teal): `#14B3AD` (bright variant `#6FE9E2`, deep `#0A7470`)
- secondary accent: gold `#F0AC1B` (deep `#C8870A`) for highlights, badges, progress
- danger only: coral `#EF5F5F`
Dark surfaces (nav, hero, footer, code blocks, dark cards):
- bg `#0C2334` / `#0E2A3D`, border `#1F4763`, text `#EAF6F2`, accent glow `#6FE9E2` / `#14B3AD`
Rules:
- The single-accent invariant still holds: whatever `--accent` is, it is the only chromatic accent. `--success`, `--warning`, `--danger`, and legacy aliases (`--accent-blue`, `--accent-terra`, `--accent-gold`, `--accent-cyan`, `--accent-pink`, `--accent-amethyst`, `--accent-ivy`) keep pointing to the accent or its tints — danger may use coral. Do not reintroduce a multi-color semantic system.
- Old chocolate/cream/burnt-orange values (e.g. `#FCFBF7`, `#F7F3EA`, `#EFE8D8`, `#EA580C`, `#C2410C`, `#7C2D12`, cream scale) → replace with the mint/teal values above. Old dark-green neon (`#30D158`, `#57E878`) → teal `#14B3AD` / `#6FE9E2`.
- Per-page inline `<style>` `--color-u1…--color-uN` unit colors: map each to values from this set so modules stay distinct but on-palette: teal `#0A7470`/`#14B3AD`/`#6FE9E2`, gold `#F0AC1B`/`#C8870A`, navy `#1F4763`/`#2A4F63`, mint-ink `#3C5B6A`/`#557079` (rotate through them in order u1,u2,u3…).

## Typography
- Replace all font @imports (Fraunces/Manrope/Inter/Playfair etc.) with: `@import url('https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');`
- `--font-sans`/`--font-body`/`--font-display` → `'Hanken Grotesk', -apple-system, 'Segoe UI', sans-serif` (display headings may use weight 700–800; drop serif display fonts).
- `--font-mono` → `'JetBrains Mono', ui-monospace, monospace` for code, eyebrows/labels, metadata chips.
- Eyebrow/micro-labels: mono, uppercase, letter-spacing ~0.08–0.12em, small size (0.7–0.8rem).
- H1 clamp ~2.6–3.6rem, H2 ~1.8–2.2rem, H3 ~1.3rem; body 16px, line-height ~1.6.

## Spacing & rhythm
- Section vertical padding ~96px desktop / 64px mobile; card padding ~24–32px; grid gaps ~24px.
- Prose max-width ~44–46rem centered.
- Radii: cards 16–20px, chips/buttons 10–12px. Soft layered shadows (e.g. `0 16px 40px -8px rgba(12,35,52,0.08)`), hover lift with subtle teal glow.
- Buttons/links: 150ms ease transitions.

## Content rules
- Do NOT copy any ditto.site elements, layout, copy, components, or pixel-art aesthetic — colors/spacing/typography suggestions only.
- Preserve all existing content text, links, diagram structure/captions. Diagrams stay exam-grade SVGs; recolor any hard-coded old accent hexes in SVGs to the new palette.
- Keep the relative CSS path scheme (../, ../../) depth-correct.
- Do not touch `*.bak` files, `notes-notebook.css` (deliberate navy/amber exception) or its pages.
