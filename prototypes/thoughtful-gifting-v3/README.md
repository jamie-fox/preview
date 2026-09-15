# Thoughtful Gifting — Landing Page (concept prototype)

A single, static landing page for Photobox built around the **Thoughtful Gift**
job-to-be-done, for moderated user testing. Desktop-only. Vanilla HTML/CSS/JS —
no build step, no backend, no dependencies.

The centrepiece is the **"Who's this gift for?" recipient picker** (Section 3):
pick a recipient and the 4-up product grid updates client-side to show gift
ideas tailored to them.

## Structure

```
thoughtful-gifting/
├── index.html        ← the page (nav → hero → 6 sections → footer)
├── css/styles.css    ← design system + all section styles
├── js/app.js         ← recipient data + picker logic + image fallback
└── README.md         ← this file
```

## Running locally

No build step. Serve the **repo root** (not this folder) with any static server:

```bash
python3 -m http.server 8765
```

Then browse to `/prototypes/thoughtful-gifting/` on `localhost:8765`.
Hard-reload (`Cmd+Shift+R`) to bypass cache after edits. Don't open the files
directly off disk — relative paths behave differently than on GitHub Pages.

## Deploying

This repo auto-publishes to GitHub Pages on every push to `main` (see the root
`CLAUDE.md`). Once pushed, the page is live at:

`https://albumprinter.github.io/Tools-StorioPrototypes/prototypes/thoughtful-gifting/`

## Imagery — known limitation (read before testing)

All images are **placeholder stock photos** served from
[Lorem Picsum](https://picsum.photos) (Unsplash-sourced), referenced by a stable
`seed` so they can be swapped 1:1 later:

- **Product-card images** — in `js/app.js`, each product has a `seed` (and an
  `icon`/title used for the fallback). Swap `stockUrl(...)` or the `seed` to
  point at curated imagery.
- **Hero collage, occasions, gallery, avatars** — in `index.html`, each
  `<img src="https://picsum.photos/seed/…">` inside a `.media` block. Replace the
  `src` with a real asset path (e.g. `assets/…`).

**Why this matters:** the research is explicit that *generic imagery actively
breaks the gifting mindset*. These stock images are a deliberate placeholder for
early moderated sessions. **Final / validation testing should use curated or
AI-generated imagery** that shows real gifts, real moments, and real people.

### Graceful degradation

Every image sits on top of a neutral fallback block (gradient + icon + label).
If an image fails to load — e.g. no network during a moderated session — the
card/collage tile still renders cleanly with its label, never a broken-image
icon.

## Content fidelity

All recipient products, copy, prices and badges in Section 3 are
researcher-validated (Tanvi) and reproduced **verbatim** in `js/app.js`. The
occasion-card and testimonial descriptions/quotes (not provided verbatim in the
spec) are placeholder copy written in-tone and can be revised freely.

## Scope notes

- Desktop layout only — no responsive/mobile work.
- SEO/GEO out of scope (the page carries `noindex, nofollow`).
- Structured so a second concept (e.g. *Holiday Feelings*) and AI imagery can be
  slotted in later with minimal rework.
