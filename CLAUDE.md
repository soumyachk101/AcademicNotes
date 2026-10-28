# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A static, no-build HTML/CSS/JS site: the "Academic Study Notes — MAKAUT B.Tech CSE" digital repository (curated revision notes, solved question banks, syllabus mappings for Semesters 4 & 5, plus a PPS question bank). Open `index.html` in a browser to run it — no server, no package.json, no test suite. This directory is its own git repo.

## Design system

**Palette (frozen):** mint-tinted paper page backgrounds (`#E7F4EC` / `#EEF7F1`), white card surfaces (`#FFFFFF`), navy-ink text (`#0E2A3D` / `#3C5B6A` / `#557079`), a **single teal accent** (`#14B3AD`, deep `#0A7470`, bright/glow `#6FE9E2`), gold (`#F0AC1B` / `#C8870A`) reserved for exam-note bands and highlights, and coral (`#EF5F5F`) for danger only. The palette is frozen — do not introduce new color values when editing pages; pick from this set (canonical copy in `.agents/design-spec.md`). No multi-color semantic system.

**Single-accent invariant:** whatever `--accent` is set to, it is the only chromatic accent. `notes.css` aliases `--success`/`--warning` to ink and `--danger` to coral; the legacy subject aliases in `site.css` (`--oxford-*`, `--terra-*`, `--ivy-*`, `--amethyst-*`, `--claret-*`, `--amber-*`, `--cyan-*`) all resolve to teal/ink tints, as do `qa-styles.css`'s `--oxford-blue`/`--cambridge-amber`/`--royal-purple` badges. Do not reintroduce per-subject colors.

**Fonts:** each CSS file `@import`s its own Google Fonts set at the top rather than sharing one. The site-wide stack is **Hanken Grotesk** (body *and* display, weights 400–800 — serif display fonts like Fraunces/Playfair/Cormorant are gone) + **JetBrains Mono** (code/eyebrows). All four shared CSS files redeclare their own `:root` token sets (now mint/navy/teal — not the old dark macOS/green or cream sets), so a token change must be applied in **every** file that defines it.

| File | Role | Notes |
|---|---|---|
| `site.css` | Root layout, nav, hero, subject cards, exam-pattern section; holds the landing/layout token set | `:root` = mint paper + navy ink + single teal accent; legacy subject aliases all point at teal tints |
| `qa-styles.css` | Q&A / question-bank pages | Duplicated `:root` with the full token set (navy text hierarchy, teal badges, gold/coral tokens) |
| `notes.css` (root) | Reading-experience `.sheet` for study-note pages | Light mint theme (`--canvas: #EEF7F1`); its light-mode block re-tints inks and the accent to the bright teal `#6FE9E2` |
| `premium.css` | Enhancement layer only — scroll reveal, 3D card tilt, toasts, nav-dots, progress bars, enhanced TOC | Uses `var(--name, fallback)` throughout with teal fallbacks; a small `:root` defines `--premium-accent` and legacy-named `--choco-*`/`--cream-*` tokens whose values are actually the navy-ink/mint scale |
| `notes-notebook.css` | Notebook-style pages; own navy/amber `--nb-*` palette | Deliberate exception to the single-accent rule |
| `Semester_4/{algorithms,architecture,automata}/notes.css` | "Editorial book" subject CSS (paper/desk light theme), near-identical copies, already on mint/navy/teal | Subject pages load `../../premium.css` on top; page inline blocks override with `!important` |

**Relative CSS paths:** pages at different nesting depths load the shared files with relative `href`s (`../site.css`, `../../qa-styles.css`, `../../premium.css`, etc.). Keep paths depth-correct when adding pages — a past commit ("Fix broken CSS paths") exists for exactly this failure mode.

**Per-page subject colors:** content pages under `Semester_4/` carry inline `<style>` blocks defining `--color-u1`…`--color-uN` (one per module/unit) mapped into the frozen teal/gold rotation — rotate through `#0A7470` / `#14B3AD` / `#6FE9E2` / `#F0AC1B` / `#C8870A` in u1, u2, u3… order so modules stay distinct but on-palette. Keep every inline hex within the frozen palette; do not reintroduce the old mixed blue/orange palette.

**Landing & exam-prep pages:** `index.html` is the premium landing page — sticky glass nav, card grid, with every color resolving to `site.css` tokens (the frozen hex inventory above; don't add new hexes). `Semester_5/os/os_exam_prep.html` and `Semester_5/compiler/compiler_exam_prep.html` are exam-prep pages with a sticky module rail (`.exam-rail`, desktop) / sticky chip bar (`.exam-chips`, narrow widths), wide tables wrapped in `.table-scroll`, and QA cards whose ids are `q<question>-<module>`.

## Diagram rules

Diagrams must be **meaningful, exam-grade technical SVGs** — not generic illustration. Examples: pipeline timing diagrams with stages and hazards, ER/schema diagrams, automata transition diagrams, cache-mapping tables, DFDs. They live in `<div class="diagram-container">` wrappers (with `.diagram-caption` below, italic, explaining what the diagram demonstrates), inside `.qa-card` or `.figure` sections. Match the page's current surface styling (cream/parchment on light pages, charcoal glass on dark) — don't hardcode a theme that clashes with the wrapper CSS.

## Conventions

- Pages are plain HTML with inline `<style>` blocks for page-scoped tokens, plus the shared external CSS. `!important` overrides inside inline blocks (e.g. `Semester_4/architecture/pipelining.html`'s `.diagram-container` rules) exist to win against the subject `notes.css` — leave that pattern intact.
- `site.css.bak`, `site.css.bak2`, `premium.css.bak` are pre-redesign snapshots — do not edit or commit them.
- `.playwright-mcp/` and `.kilo/` are agent tooling artifacts, not site content.
