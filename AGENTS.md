# Portfolio Repository Guidelines

## Overview
Static personal portfolio site (HTML/CSS/JS only). No build tools, package manager, or framework.

## Development
- Open `index.html` directly in browser, or use any local HTTP server (e.g., `python -m http.server`)
- No install step, no dependencies to manage (Font Awesome loaded via CDN)
- No linting, typecheck, or test suite configured

## Structure
- `index.html` — single-page entry point
- `style.css` — all styles (responsive breakpoints at 768px)
- `script.js` — typewriter effect, particle background, hidden space shooter game
- Image assets (`.jpeg`, `.png`) in root directory

## Key Details
- Deployed via GitHub Pages from `main` branch
- Contact info is gated behind an Easter egg game (score 20 points to unlock)
- No CI/CD pipelines configured
- No `.gitignore` — all files tracked
