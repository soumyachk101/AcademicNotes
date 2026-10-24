# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A static, no-build HTML/CSS/JS site: the "Academic Study Notes — MAKAUT B.Tech CSE" digital repository (curated revision notes, solved question banks, syllabus mappings for Semesters 4 & 5, plus a PPS question bank). Open `index.html` in a browser to run it — no server, no package.json, no test suite. This directory is its own git repo.

## Design system

**Target palette (in-progress redesign):** chocolate-brown base, cream paper surfaces, and a **single neon accent — burnt orange** — as the one chromatic color across the whole site. No other accent colors (no green, no multi-color semantic system). This is the direction of the uncommitted working tree (see below); it is not yet committed.

**Current on-disk state of the shared CSS:** `site.css`, `qa-styles.css`, and root `notes.css` still define their `:root` as a **dark macOS-style theme** (`--mac-base: #0d0d12` charcoal surfaces) with a **green neon accent** (`--accent: #30D158`, `--accent-bright: #57E878`, `--accent-glow: rgba(48,209,88,…)`). `git diff` against HEAD shows the earlier cream token set (`--cream-50`…`--cream-600`) has already been removed, and the tree is mid-swap to the new chocolate/cream/burnt-orange tokens. **Follow the working-tree state, not `git HEAD`, when reasoning about which tokens exist.**

**Single-accent invariant:** whatever value `--accent` is set to, it is the only chromatic accent. `site.css` aliases `--success`, `--warning`, `--danger` and legacy names (`--accent-blue`, `--accent-terra`, `--accent-gold`, `--accent-cyan`, `--accent-pink`, `--accent-amethyst`, `--accent-ivy`) all to `var(--accent)` — do not reintroduce a multi-color semantic system.

**Custom fonts:** each CSS file `@import`s its own Google Fonts set at the top rather than sharing one. Currently Playfair Display (display) + Inter (body) + JetBrains Mono (code). All four main CSS files redeclare their own `:root` token sets, so a token change must be applied in **every** file that defines it.

| File | Role | Notes |
|---|---|---|
| `site.css` | Root layout, nav, hero, subject cards, exam-pattern section | Dark macOS theme + green accent on disk; redesign target is cream/burnt-orange |
| `qa-styles.css` | Q&A / question-bank pages | Redefines the full token set (duplicated `:root`) |
| `notes.css` (root) | Reading-experience `.sheet` for study-note pages | Light-themed, hardcodes accent hex values (`#30D158`) in several rules — update these to match the new accent, not just `:root` |
| `premium.css` | Enhancement layer only — scroll reveal, 3D card tilt, toasts, nav-dots, progress bars, enhanced TOC. Uses `var(--name, fallback)` throughout with **no** token definitions. Fallbacks are the old green defaults. |
| `notes-notebook.css` | Notebook-style pages; own navy/amber `--nb-*` palette | Deliberate exception to the single-accent rule |
| `Semester_4/{algorithms,architecture,automata}/notes.css` | 20KB near-identical copies of an older "editorial book" paper/desk light-theme CSS predating the redesign | Subject pages load `../../premium.css` on top of these |

**Relative CSS paths:** pages at different nesting depths load the shared files with relative `href`s (`../site.css`, `../../qa-styles.css`, `../../premium.css`, etc.). Keep paths depth-correct when adding pages — a past commit ("Fix broken CSS paths") exists for exactly this failure mode.

**Per-page subject colors:** content pages under `Semester_4/` carry inline `<style>` blocks defining `--color-u1`…`--color-uN` (one per module/unit) with a mixed palette (blues, oranges, reds, e.g. `#3b82f6`, `#0A84FF`, `#f97316`) that drifts from the single-accent rule. When touching these pages, unify toward the accent/burnt-orange family.

## Diagram rules

Diagrams must be **meaningful, exam-grade technical SVGs** — not generic illustration. Examples: pipeline timing diagrams with stages and hazards, ER/schema diagrams, automata transition diagrams, cache-mapping tables, DFDs. They live in `<div class="diagram-container">` wrappers (with `.diagram-caption` below, italic, explaining what the diagram demonstrates), inside `.qa-card` or `.figure` sections. Match the page's current surface styling (cream/parchment on light pages, charcoal glass on dark) — don't hardcode a theme that clashes with the wrapper CSS.

## Conventions

- Pages are plain HTML with inline `<style>` blocks for page-scoped tokens, plus the shared external CSS. `!important` overrides inside inline blocks (e.g. `Semester_4/architecture/pipelining.html`'s `.diagram-container` rules) exist to win against the subject `notes.css` — leave that pattern intact.
- `site.css.bak`, `site.css.bak2`, `premium.css.bak` are pre-redesign snapshots — do not edit or commit them.
- `.playwright-mcp/` and `.kilo/` are agent tooling artifacts, not site content.
- The repo is mid-redesign: `git status` shows `site.css`, `qa-styles.css`, `notes.css`, `premium.css`, and most HTML pages modified against HEAD. When editing, match the working-tree direction (cream + single burnt-orange neon accent, premium custom fonts, meaningful diagrams).
