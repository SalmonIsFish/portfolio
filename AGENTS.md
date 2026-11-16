# Portfolio Repository Guidelines

## Overview
Static personal portfolio site (HTML/CSS/JS only). No build tools, package manager, or framework.

## Development
- Open `index.html` directly in browser, or use any local HTTP server (e.g., `python -m http.server`)
- No install step, no dependencies to manage (Font Awesome loaded via CDN)
- No linting, typecheck, or test suite configured

## Structure
- `index.html` — single-page entry point
- `style.css` — all styles. "Control room" theme: colour and font tokens in `:root` (sky blue `--accent` is the only accent; green/red are reserved for pass/fail; UI palette from colorhunt.co/palette/02152603346e6eacdae2e2b6; space decorations use the `--space-*` tokens from colorhunt.co/palette/00105b6061b6c9b5e0fcf9ec). Breakpoints at 1000, 820, 768 and 600px
- `script.js` — interactive hero gate-chain demo, Ctrl/Cmd+K command menu, cursor spotlight/tilt, stats count-up, lightbox, hidden space shooter game
- Image assets (`.webp`, `.jpeg`, `.png`) in root directory; convert new photos to `.webp`
- Nav items (logo, links, Menu) use the `.space-btn` gradient-border button (Orbitron font) over a `.nav-stars` star layer behind the whole bar; display font is Space Grotesk; Uiverse.io snippets are MIT and keep an attribution comment
- Command menu and lightbox are native `<dialog>` elements opened with `showModal()`
- Motion is opt-in: content is visible by default and animations only run under `prefers-reduced-motion: no-preference`
- To add an event: copy an `<li class="event">` in the timeline (including its `.orb`, the planet/sun on the line, which cycles through 6 styles) and bump its `--i` index
- Space theme: `.star-sky` drifting star layers (box-shadow stars generated in `script.js`) plus a `#stars` canvas for blinking and shooting stars, CSS nebula on `body::before`, CSS solar system (`.cosmos`) behind the gate panel, an SVG spaceship button (`#ship`) that opens the game, and a `.btn-galaxy` primary button with drifting stars. Decorative `.deco` objects (Uiverse ringed planet `.uv-planet`, Uiverse rocket `.uv-rocket` beside Contact, astronauts and mini rockets from the `#astronaut`/`#mini-rocket` SVG symbols in Work, Events, About and the footer, asteroids from the `#rock` SVG symbol, moon) sit behind sections and drift on scroll; the waving alien in a UFO (`#alien`) above Contact also opens the game. The game's `drawShip()` uses the same ship shapes as the SVG

## Key Details
- Deployed via GitHub Pages from `main` branch
- Contact info is gated behind an Easter egg game (score 20 points to unlock)
- No CI/CD pipelines configured
- No `.gitignore` — all files tracked
