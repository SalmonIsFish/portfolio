# Portfolio Refresh Plan

## Context
Adib's portfolio (static HTML/CSS/JS) needs a major visual upgrade. Currently uses Arial, hardcoded CSS values, simple centered hero, no scroll animations. Reference: Zakhwan Anuar's portfolio (https://zakhwananuar.my) — has custom fonts, CSS variables, terminal widget, stats bar, scroll animations, section tags, and a polished design system.

## Current Files
- `index.html` — single-page entry point
- `style.css` — all styles (responsive at 768px)
- `script.js` — typewriter effect, particle background, hidden space shooter game
- Images: `setel-event.jpeg`, `aqufish-talk.png`, `owasp-ctf.jpeg`, `proC-hackahton.jpeg`, `SupervityHackhaton.jpg`, `UCSI_Hackhaton.jpg`

## Current Site Structure (in order)
1. Nav: About • Activities • Hackathons • Projects • Contact
2. Hero: "HI, I'm Adib 🚀" + typewriter + GitHub/LinkedIn buttons
3. About Me section
4. Activities & Events (Setel Visit, AquFish Talk)
5. Hackathons & Competitions (Supervity, UCSI, PromptQuest)
6. Projects (OWASP CTF Academy, This Portfolio)
7. Contact (Easter egg game to unlock email)
8. Space shooter game (modal)

## What to Implement

### 1. Typography Upgrade
- Add Google Fonts: `JetBrains Mono` (body/monospace) + `Syne` (headings)
- Replace `Arial` in body font-family

### 2. CSS Variables (Design System)
Add `:root` block at top of style.css:
```css
:root {
  --bg: #0a0c10;
  --bg-2: #0f1117;
  --bg-3: #161b24;
  --bg-4: #1c2333;
  --accent: #a78bfa;
  --accent-2: #60a5fa;
  --accent-dim: rgba(167, 139, 250, 0.15);
  --text: #e2e8f0;
  --text-2: #8892a4;
  --text-3: #4a5568;
  --border: #1e2a3a;
  --border-2: #2d3748;
  --font-display: 'Syne', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  --nav-height: 72px;
  --radius: 8px;
  --radius-lg: 16px;
  --trans: 0.2s ease;
  --trans-slow: 0.4s ease;
}
```

### 3. Hero Redesign
- Split into two columns (grid: 1fr 1fr)
- Left: greeting ("Hello, I'm"), name (large, gradient), title with typewriter, short bio, CTA buttons, social icon squares
- Right: Terminal widget showing `whoami` style output (animated lines: name, role, focus areas, current status)
- Keep particle canvas OR replace with subtle CSS grid overlay
- Add scroll hint at bottom (thin animated line, not emoji)

### 4. Stats Bar
New section after hero, full-width with bg-2 background:
```
[ 29 ]              [ 3 ]              [ 2 ]              [ 3+ ]
CTF Flags          Hackathons         Events Organized    Projects
```
- Numbers in accent color, large font (Syne)
- Labels in monospace, muted, uppercase

### 5. Section Tags
Replace emoji-only headers with code-style labels:
```html
<div class="section-header">
  <span class="section-tag">// about_me</span>
  <h2 class="section-title">About Me</h2>
</div>
```
Apply to: About, Activities, Hackathons, Projects, Contact

### 6. Scroll Animations
- Add class `fade-in-element` to all section headers and cards
- CSS:
```css
.fade-in-element {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}
.fade-in-element.visible {
  opacity: 1;
  transform: translateY(0);
}
```
- JS: IntersectionObserver adds `.visible` when elements enter viewport

### 7. Button Styles
```css
.btn { display: inline-flex; align-items: center; gap: 8px; padding: 12px 24px; border-radius: var(--radius); font-family: var(--font-mono); font-size: 0.85rem; font-weight: 500; transition: all var(--trans); border: none; cursor: pointer; }
.btn-primary { background: var(--accent); color: #000; }
.btn-primary:hover { background: #fff; color: #000; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(167,139,250,0.3); }
.btn-secondary { background: transparent; color: var(--accent); border: 1px solid var(--accent); }
.btn-secondary:hover { background: var(--accent-dim); transform: translateY(-2px); }
.btn-ghost { background: var(--bg-3); color: var(--text-2); border: 1px solid var(--border); }
.btn-ghost:hover { border-color: var(--accent); color: var(--accent); transform: translateY(-2px); }
```

### 8. Card Hover Improvements
Add top accent gradient line on hover:
```css
.project-card::before, .hackathon-card::before, .activity-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--accent), transparent);
  opacity: 0;
  transition: opacity var(--trans);
}
.project-card:hover::before, .hackathon-card:hover::before, .activity-card:hover::before {
  opacity: 1;
}
```
Add `position: relative; overflow: hidden;` to card base styles.

### 9. Terminal Widget (Hero Right Side)
HTML structure:
```html
<div class="hero-terminal">
  <div class="terminal-window">
    <div class="terminal-header">
      <div class="terminal-dots">
        <span class="dot dot-red"></span>
        <span class="dot dot-yellow"></span>
        <span class="dot dot-green"></span>
      </div>
      <span class="terminal-title">whoami.sh</span>
    </div>
    <div class="terminal-body" id="terminalBody"></div>
  </div>
</div>
```
CSS: Dark bg-3 background, border, rounded corners, box-shadow. Dots colored red/yellow/green. Body uses monospace font, 0.8rem size.

JS to populate terminal lines with animation:
```js
const terminalLines = [
  { prompt: '$', cmd: 'cat name.txt', output: 'Adib Luqman' },
  { prompt: '$', cmd: 'cat role.txt', output: 'CyberSecurity Student' },
  { prompt: '$', cmd: 'cat focus.txt', output: 'CTF • Pentesting • Building' },
  { prompt: '$', cmd: 'cat status.txt', output: 'Open to opportunities' },
];
// Animate line by line with delay
```

### 10. Navbar Improvements
- Logo: `[ Adib ]` with brackets in accent color
- Add `.navbar.scrolled` class via JS (adds bg + blur + border on scroll)
- Mobile: hamburger toggle button (3 spans), nav slides down as overlay

### 11. Footer
```html
<footer class="footer">
  <div class="container footer-inner">
    <p class="footer-copy">&copy; 2026 Adib Luqman. Built with curiosity.</p>
    <div class="footer-links">
      <a href="https://github.com/SalmonIsFish" target="_blank"><i class="fab fa-github"></i></a>
      <a href="https://www.linkedin.com/in/adib-luqman-b63683273/" target="_blank"><i class="fab fa-linkedin"></i></a>
    </div>
  </div>
</footer>
```

### 12. Social Links in Hero
Replace text pill buttons with icon squares:
```html
<div class="hero-social">
  <a href="https://github.com/SalmonIsFish" class="social-link" target="_blank"><i class="fab fa-github"></i></a>
  <a href="https://www.linkedin.com/in/adib-luqman-b63683273/" class="social-link" target="_blank"><i class="fab fa-linkedin"></i></a>
</div>
```
CSS: 40x40px squares, border, rounded, hover = accent border + color + translateY.

### 13. Responsive (Mobile)
- At 900px: hero goes single column, terminal below text
- At 768px: hamburger menu, nav links as vertical overlay
- At 480px: smaller stats grid, smaller hero name

## JS Additions (script.js)
1. **Terminal animation**: Line-by-line typing with delays
2. **IntersectionObserver**: `.fade-in-element` → `.visible` on scroll
3. **Navbar scroll**: Add/remove `.scrolled` class on scroll
4. **Hamburger toggle**: Toggle `.open` on nav-links
5. Keep existing: particles, typewriter, space shooter game

## Files to Modify
- `index.html` — restructure hero, add stats bar, section tags, footer, terminal HTML, button classes, social icons
- `style.css` — full rewrite with CSS variables, new sections, animations, terminal styles, responsive
- `script.js` — add terminal animation, IntersectionObserver, navbar scroll, hamburger toggle (keep all existing code)

## Constraints
- No frameworks, no build tools — pure HTML/CSS/JS only
- Keep the space shooter Easter egg game
- Keep the particle background (or optionally enhance it)
- Keep all existing content and links
- Deploy via GitHub Pages from main branch
