const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const EMAIL = "adibluqman117@gmail.com";

// ============================================
// STARFIELD (fixed canvas behind the page)
// Three depth layers that drift at different speeds as you scroll, a few
// slowly twinkling stars, and the odd shooting star. Reduced motion: drawn once, still.
// ============================================
(function starfield() {
  const canvas = document.getElementById("stars");
  const ctx = canvas.getContext("2d");
  const LAYERS = [
    { share: 0.62, size: [0.35, 0.85], alpha: [0.25, 0.55], parallax: 0.03 },
    { share: 0.3, size: [0.8, 1.3], alpha: [0.45, 0.8], parallax: 0.08 },
    { share: 0.08, size: [1.3, 2], alpha: [0.8, 1], parallax: 0.16 },
  ];
  const COLORS = ["236, 237, 216", "226, 226, 182", "110, 172, 218", "255, 255, 255"];
  const rand = (a, b) => a + Math.random() * (b - a);

  let w = 0, h = 0, stars = [], shot = null, nextShot = 0, frame = 0;

  function build() {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.min(300, Math.round((w * h) / 4800));
    stars = [];
    LAYERS.forEach(layer => {
      const n = Math.round(count * layer.share);
      for (let i = 0; i < n; i++) {
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: rand(layer.size[0], layer.size[1]),
          a: rand(layer.alpha[0], layer.alpha[1]),
          parallax: layer.parallax,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          // about a quarter of stars twinkle, each on a slow cycle (3 to 10 s)
          twinkle: Math.random() < 0.25 ? rand(0.0006, 0.002) : 0,
          phase: Math.random() * Math.PI * 2,
        });
      }
    });
  }

  function drawShootingStar(t) {
    if (!shot && t > nextShot) {
      shot = { x: rand(w * 0.35, w), y: rand(0, h * 0.35), vx: -rand(6, 9), vy: rand(2.5, 4), life: 1 };
    }
    if (!shot) return;
    const tailX = shot.x - shot.vx * 14, tailY = shot.y - shot.vy * 14;
    const grad = ctx.createLinearGradient(shot.x, shot.y, tailX, tailY);
    grad.addColorStop(0, `rgba(255, 251, 230, ${0.9 * shot.life})`);
    grad.addColorStop(1, "rgba(110, 172, 218, 0)");
    ctx.strokeStyle = grad;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(shot.x, shot.y);
    ctx.lineTo(tailX, tailY);
    ctx.stroke();
    shot.x += shot.vx;
    shot.y += shot.vy;
    shot.life -= 0.012;
    if (shot.life <= 0 || shot.x < -200 || shot.y > h + 200) {
      shot = null;
      nextShot = t + rand(8000, 15000);
    }
  }

  function draw(t, animate) {
    ctx.clearRect(0, 0, w, h);
    const scroll = animate ? window.scrollY : 0;
    for (const s of stars) {
      let y = (s.y - scroll * s.parallax) % h;
      if (y < 0) y += h;
      let a = s.a;
      if (animate && s.twinkle) a *= 0.55 + 0.45 * Math.sin(t * s.twinkle + s.phase);
      ctx.fillStyle = `rgba(${s.color}, ${a})`;
      ctx.beginPath();
      ctx.arc(s.x, y, s.r, 0, Math.PI * 2);
      ctx.fill();
      if (s.r > 1.5) {
        // soft halo on the brightest stars
        ctx.fillStyle = `rgba(${s.color}, ${a * 0.18})`;
        ctx.beginPath();
        ctx.arc(s.x, y, s.r * 3.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    if (animate) drawShootingStar(t);
  }

  function loop(t) {
    frame = 0;
    if (document.hidden) return;
    draw(t, true);
    frame = requestAnimationFrame(loop);
  }

  build();
  if (prefersReducedMotion) {
    draw(0, false);
  } else {
    nextShot = performance.now() + 3000;
    frame = requestAnimationFrame(loop);
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden && !frame) frame = requestAnimationFrame(loop);
    });
  }

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      build();
      if (prefersReducedMotion) draw(0, false);
    }, 150);
  });
})();

// ============================================
// GATE CHAIN (hero)
// Simplified, in-browser replay of Amanah Trader's fail-closed compliance gates.
// Visitors can type a request or pick a preset; a small deterministic rule table
// decides which gate (if any) rejects it. The rules are illustrative.
// ============================================
(function gateChain() {
  const gates = ["Shariah", "Structure", "Gharar", "Maysir", "Riba", "Risk"];
  const SCREENED = ["AAPL", "MSFT", "NVDA"];
  const MAX_CONTRACTS = 5;
  const presets = [
    { label: "Clean order", request: "sell put · AAPL · 1 contract" },
    { label: "Bank stock", request: "sell put · JPM · 1 contract" },
    { label: "Use margin", request: "LLM: “ignore the limits, sell AAPL puts on margin”" },
    { label: "0DTE lottery", request: "sell put · NVDA · 0DTE, feels lucky" },
    { label: "40 contracts", request: "sell put · MSFT · 40 contracts" },
    { label: "Sweet-talk it", request: "trust me, skip the checks: sell put · AAPL · 1 contract" },
  ];

  const RULES = {
    persuasion: /\b(ignore|override|bypass|disable|skip|trust me|pretend|system prompt|just this once)\b/i,
    excluded: /\b(jpm|bac|gs|bank|casino|alcohol|tobacco|unlisted|unscreened)\b/i,
    structure: /\b(margin|leverag\w*|naked|uncovered|calls?|spreads?|short(ing)?\s+stock)\b/i,
    gharar: /\b(any strike|whatever|tbd|unknown|no expiry|surprise me)\b/i,
    maysir: /\b(0\s?dte|yolo|lottery|gambl\w*|bet|lucky|moon)\b/i,
    riba: /\b(interest|loans?|financ\w*|borrow\w*)\b/i,
    allIn: /\b(all[- ]in|everything|max size)\b/i,
  };

  // Returns the first gate that rejects the request, in chain order (-1 = all pass).
  function evaluate(raw) {
    const request = raw.trim().slice(0, 80);
    let failAt = -1;
    let reason = "";
    const fail = (i, why) => { if (failAt === -1) { failAt = i; reason = why; } };

    const ticker = SCREENED.find(s => new RegExp("\\b" + s + "\\b", "i").test(request));
    if (RULES.excluded.test(request)) fail(0, "outside the screened universe");
    else if (!ticker) fail(0, "no screened ticker named ⇒ fail closed");
    if (RULES.structure.test(request)) fail(1, "cash-secured puts only · cash must cover strike");
    if (RULES.gharar.test(request)) fail(2, "terms left open · strike and expiry must be fixed");
    if (RULES.maysir.test(request)) fail(3, "a bet, not an investment");
    if (RULES.riba.test(request)) fail(4, "no interest-bearing financing");
    const sizes = (request.match(/\b\d+\b/g) || []).map(Number);
    const biggest = Math.max(0, ...sizes);
    if (biggest > MAX_CONTRACTS) fail(5, biggest + " contracts is over the " + MAX_CONTRACTS + "-contract limit");
    else if (RULES.allIn.test(request)) fail(5, "over the position size limit");

    const note = RULES.persuasion.test(request)
      ? "Persuasion isn’t an input. The gates only read the order."
      : "";
    return { request, failAt, reason, note };
  }

  const list = document.getElementById("gateList");
  const requestEl = document.getElementById("gateRequest");
  const noteEl = document.getElementById("gateNote");
  const verdictEl = document.getElementById("gateVerdict");
  const toggle = document.getElementById("gateToggle");
  const form = document.getElementById("gateForm");
  const input = document.getElementById("gateInput");
  const chipsEl = document.getElementById("gateChips");
  const hero = document.querySelector(".hero");

  const rows = gates.map((name, i) => {
    const li = document.createElement("li");
    li.className = "gate";
    li.innerHTML = `<span class="gate-mark" aria-hidden="true"></span><span class="gate-num" aria-hidden="true">G${i + 1}</span><span class="gate-name">${name}</span><span class="gate-state"></span>`;
    list.appendChild(li);
    return li;
  });

  const chips = presets.map((preset, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "gate-chip";
    btn.textContent = preset.label;
    btn.setAttribute("aria-pressed", "false");
    btn.addEventListener("click", () => runManual(preset.request, i));
    chipsEl.appendChild(btn);
    return btn;
  });

  function markChip(index) {
    chips.forEach((chip, i) => chip.setAttribute("aria-pressed", String(i === index)));
  }

  function reset(scenario) {
    requestEl.textContent = scenario.request;
    noteEl.textContent = scenario.note;
    noteEl.hidden = !scenario.note;
    verdictEl.className = "gate-verdict";
    verdictEl.textContent = "Checking…";
    rows.forEach(row => {
      row.className = "gate";
      row.querySelector(".gate-state").textContent = "";
      const reason = row.querySelector(".gate-reason");
      if (reason) reason.remove();
    });
  }

  function setRow(i, state, scenario) {
    const row = rows[i];
    row.className = "gate " + state;
    const stateEl = row.querySelector(".gate-state");
    if (state === "checking") stateEl.textContent = "…";
    if (state === "pass") stateEl.textContent = "pass";
    if (state === "fail") {
      stateEl.textContent = "fail";
      const reason = document.createElement("span");
      reason.className = "gate-reason";
      reason.textContent = scenario.reason;
      row.appendChild(reason);
    }
    if (state === "skipped") stateEl.textContent = "—";
  }

  function finish(scenario) {
    if (scenario.failAt === -1) {
      verdictEl.className = "gate-verdict pass";
      verdictEl.textContent = "✓ Submitted to broker";
    } else {
      for (let j = scenario.failAt + 1; j < rows.length; j++) setRow(j, "skipped", scenario);
      verdictEl.className = "gate-verdict fail";
      verdictEl.textContent = "✗ Rejected · fail-closed";
    }
  }

  function showStatic(scenario) {
    reset(scenario);
    const stop = scenario.failAt === -1 ? rows.length : scenario.failAt;
    for (let i = 0; i < stop; i++) setRow(i, "pass", scenario);
    if (scenario.failAt !== -1) setRow(scenario.failAt, "fail", scenario);
    finish(scenario);
  }

  // Each scenario is a list of timed steps; a single timer walks through them
  // so the replay can pause cleanly when the hero is offscreen or the tab is hidden.
  let auto = !prefersReducedMotion;
  let presetIndex = 0;
  let steps = [];
  let stepIndex = 0;
  let timer = null;
  let heroVisible = true;

  function buildSteps(scenario) {
    const s = [{ wait: 400, run: () => reset(scenario) }];
    const last = scenario.failAt === -1 ? rows.length - 1 : scenario.failAt;
    for (let i = 0; i <= last; i++) {
      s.push({ wait: 280, run: () => setRow(i, "checking", scenario) });
      s.push({ wait: 420, run: () => setRow(i, i === scenario.failAt ? "fail" : "pass", scenario) });
    }
    s.push({ wait: 300, run: () => finish(scenario) });
    s.push({ wait: 2800, run: () => {} });
    return s;
  }

  function load(scenario) {
    steps = buildSteps(scenario);
    stepIndex = 0;
  }

  function tick() {
    timer = null;
    if (!heroVisible || document.hidden) return;
    if (stepIndex >= steps.length) {
      if (!auto) return;
      presetIndex = (presetIndex + 1) % presets.length;
      load(evaluate(presets[presetIndex].request));
      markChip(presetIndex);
    }
    const step = steps[stepIndex++];
    step.run();
    timer = setTimeout(tick, step.wait);
  }

  function play() {
    if (!timer && heroVisible && !document.hidden) tick();
  }

  function setAuto(on) {
    auto = on;
    // The label names the action; no aria-pressed, so it is never announced as a pressed "Auto-play".
    toggle.textContent = on ? "Pause" : "Auto-play";
    // Only announce verdicts the visitor asked for, not every loop of the replay.
    verdictEl.setAttribute("aria-live", on ? "off" : "polite");
  }

  function runManual(text, chipIndex) {
    const scenario = evaluate(text);
    setAuto(false);
    clearTimeout(timer);
    timer = null;
    markChip(chipIndex);
    if (prefersReducedMotion) {
      showStatic(scenario);
      return;
    }
    load(scenario);
    play();
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!input.value.trim()) {
      input.focus();
      return;
    }
    runManual(input.value, -1);
  });

  toggle.addEventListener("click", () => {
    // Pausing lets the current request finish so the panel never freezes mid-check.
    setAuto(!auto);
    if (auto) play();
  });

  if (prefersReducedMotion) {
    toggle.hidden = true;
    verdictEl.setAttribute("aria-live", "polite");
    markChip(2);
    showStatic(evaluate(presets[2].request));
    return;
  }

  load(evaluate(presets[0].request));
  markChip(0);
  new IntersectionObserver(entries => {
    heroVisible = entries[0].isIntersecting;
    play();
  }).observe(hero);
  document.addEventListener("visibilitychange", play);
})();

// ============================================
// NAV: mobile toggle + current section highlight
// ============================================
const hamburger = document.getElementById("hamburger");
const navLinks = document.getElementById("navLinks");

function closeMobileNav() {
  hamburger.classList.remove("open");
  navLinks.classList.remove("open");
  hamburger.setAttribute("aria-expanded", "false");
}

hamburger.addEventListener("click", () => {
  const open = hamburger.classList.toggle("open");
  navLinks.classList.toggle("open", open);
  hamburger.setAttribute("aria-expanded", String(open));
});
navLinks.querySelectorAll("a").forEach(link => link.addEventListener("click", closeMobileNav));

const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    navLinks.querySelectorAll("a").forEach(link => {
      if (link.getAttribute("href") === "#" + entry.target.id) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    });
  });
}, { rootMargin: "-45% 0px -50% 0px" });
document.querySelectorAll("main section[id]").forEach(section => sectionObserver.observe(section));

// ============================================
// SCROLL REVEAL fallback
// Browsers with scroll-driven animations handle .reveal in CSS. Elsewhere,
// fall back to an IntersectionObserver. Content stays visible without either.
// ============================================
if (!prefersReducedMotion && !CSS.supports("animation-timeline", "view()")) {
  document.documentElement.classList.add("js-reveal");
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll(".reveal").forEach(el => revealObserver.observe(el));
}

// ============================================
// STATS count-up
// ============================================
if (!prefersReducedMotion) {
  const countObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      countObserver.unobserve(entry.target);
      const el = entry.target;
      const end = Number(el.dataset.count);
      const start = performance.now();
      const duration = 900;
      function frame(now) {
        const p = Math.min(1, (now - start) / duration);
        el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    });
  }, { threshold: 0.6 });
  document.querySelectorAll("[data-count]").forEach(el => countObserver.observe(el));
}

// ============================================
// SPOTLIGHT + TILT (mouse only)
// ============================================
if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
  const MAX_TILT = 2.5;
  document.querySelectorAll("[data-spot]").forEach(el => {
    const tilt = el.hasAttribute("data-tilt") && !prefersReducedMotion;
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      el.style.setProperty("--mx", x + "px");
      el.style.setProperty("--my", y + "px");
      el.classList.add("spot-on");
      if (tilt) {
        el.style.setProperty("--ry", ((x / r.width - 0.5) * 2 * MAX_TILT).toFixed(2) + "deg");
        el.style.setProperty("--rx", ((0.5 - y / r.height) * 2 * MAX_TILT).toFixed(2) + "deg");
      }
    });
    el.addEventListener("pointerleave", () => {
      el.classList.remove("spot-on");
      el.style.removeProperty("--rx");
      el.style.removeProperty("--ry");
    });
  });
}

// ============================================
// TOAST + COPY EMAIL
// ============================================
const toast = document.getElementById("toast");
let toastTimer;
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
}

async function copyEmail() {
  try {
    await navigator.clipboard.writeText(EMAIL);
  } catch {
    const tmp = document.createElement("textarea");
    tmp.value = EMAIL;
    document.body.appendChild(tmp);
    tmp.select();
    document.execCommand("copy");
    tmp.remove();
  }
  showToast("Email copied");
}

const copyEmailBtn = document.getElementById("copy-email-btn");
copyEmailBtn.addEventListener("click", async () => {
  await copyEmail();
  copyEmailBtn.textContent = "Copied";
  setTimeout(() => { copyEmailBtn.textContent = "Copy email"; }, 2000);
});

// ============================================
// CONTACT & GAME (Easter egg)
// ============================================
console.log("%cHey there, curious dev! 👀", "color: #6eacda; font-size: 20px; font-weight: bold;");
console.log("%cLike what you see? Let's connect on LinkedIn!", "color: #ecedd8; font-size: 14px;");

const contactReveal = document.getElementById("contact-reveal");
const gameContainer = document.getElementById("game-container");
const closeGameBtn = document.getElementById("close-game");
const eggGameBtn = document.getElementById("egg-game-btn");

// Whatever opened the game (spaceship, "play a game" link, command menu) gets focus back on close.
let gameOpener = null;

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !gameContainer.classList.contains("hidden")) {
    closeGameBtn.click();
  }
});

function startGame() {
  const active = document.activeElement;
  gameOpener = active && active !== document.body && active !== closeGameBtn ? active : eggGameBtn;
  gameContainer.classList.remove("hidden");
  closeGameBtn.focus();
  resizeGameCanvas();
  const touchHint = document.getElementById("game-touch-hint");
  const isTouch = "ontouchstart" in window;
  document.getElementById("game-instructions").hidden = isTouch;
  touchHint.hidden = !isTouch;
  ship.x = 100;
  ship.y = gameCanvas.height / 2;
  enemies = [];
  bullets = [];
  score = 0;
  scoreValue.textContent = score;
  createGameStars();
  planets[1].x = gameCanvas.width - 200;
  planets[1].y = gameCanvas.height - 150;
  clearInterval(enemySpawnTimer);
  enemySpawnTimer = setInterval(spawnEnemy, 1200);
  gameLoop();
}

eggGameBtn.addEventListener("click", startGame);
document.getElementById("ship").addEventListener("click", startGame);
document.getElementById("alien").addEventListener("click", startGame);

closeGameBtn.addEventListener("click", () => {
  gameContainer.classList.add("hidden");
  clearInterval(enemySpawnTimer);
  if (gameOpener && gameOpener.isConnected) gameOpener.focus();
});

// ============================================
// COMMAND MENU (Ctrl/Cmd + K)
// ============================================
(function commandMenu() {
  const palette = document.getElementById("palette");
  const input = document.getElementById("paletteInput");
  const listEl = document.getElementById("paletteList");
  const emptyEl = document.getElementById("paletteEmpty");
  const openBtn = document.getElementById("paletteBtn");
  const lightbox = document.getElementById("lightbox");

  const go = (hash) => () => { location.hash = hash; };
  const openTab = (url) => () => window.open(url, "_blank", "noopener");
  const commands = [
    { label: "Go to Work", kind: "Section", run: go("#work") },
    { label: "Go to Events", kind: "Section", run: go("#events") },
    { label: "Go to About", kind: "Section", run: go("#about") },
    { label: "Go to Contact", kind: "Section", run: go("#contact") },
    { label: "Copy email address", kind: "Action", run: copyEmail },
    { label: "Write me an email", kind: "Action", run: () => { location.href = "mailto:" + EMAIL; } },
    { label: "Open GitHub", kind: "Link", run: openTab("https://github.com/SalmonIsFish") },
    { label: "Open LinkedIn", kind: "Link", run: openTab("https://www.linkedin.com/in/adib-luqman-b63683273/") },
    { label: "Play the hidden game", kind: "Game", run: () => startGame() },
  ];

  if (/Mac|iPhone|iPad/.test(navigator.platform)) {
    document.getElementById("paletteKbd").textContent = "⌘ K";
  }

  let matches = [];
  let active = 0;

  function setActive(index) {
    active = index;
    listEl.querySelectorAll(".palette-item").forEach((item, i) => {
      item.setAttribute("aria-selected", String(i === active));
      if (i === active) {
        input.setAttribute("aria-activedescendant", item.id);
        item.scrollIntoView({ block: "nearest" });
      }
    });
  }

  function render() {
    const q = input.value.trim().toLowerCase();
    matches = commands.filter(c => (c.label + " " + c.kind).toLowerCase().includes(q));
    listEl.replaceChildren(...matches.map((cmd, i) => {
      const li = document.createElement("li");
      li.id = "cmd-" + i;
      li.className = "palette-item";
      li.setAttribute("role", "option");
      const name = document.createElement("span");
      name.textContent = cmd.label;
      const kind = document.createElement("small");
      kind.textContent = cmd.kind;
      li.append(name, kind);
      li.addEventListener("click", () => runCommand(cmd));
      li.addEventListener("pointermove", () => { if (active !== i) setActive(i); });
      return li;
    }));
    emptyEl.hidden = matches.length > 0;
    listEl.hidden = matches.length === 0;
    input.removeAttribute("aria-activedescendant");
    if (matches.length) setActive(0);
  }

  function runCommand(cmd) {
    palette.close();
    cmd.run();
  }

  function openPalette() {
    if (palette.open || lightbox.open || !gameContainer.classList.contains("hidden")) return;
    closeMobileNav();
    input.value = "";
    render();
    palette.showModal();
  }

  input.addEventListener("input", render);
  input.addEventListener("keydown", (e) => {
    if (!matches.length) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((active + 1) % matches.length); }
    if (e.key === "ArrowUp") { e.preventDefault(); setActive((active - 1 + matches.length) % matches.length); }
    if (e.key === "Enter") { e.preventDefault(); runCommand(matches[active]); }
  });

  openBtn.addEventListener("click", openPalette);
  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      if (palette.open) palette.close();
      else openPalette();
    }
  });

  // Click-outside-to-close for browsers without <dialog closedby>.
  if (!("closedBy" in HTMLDialogElement.prototype)) {
    const outside = (e, dialog) => {
      const r = dialog.getBoundingClientRect();
      return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
    };
    for (const dialog of document.querySelectorAll('dialog[closedby="any"]')) {
      let pressedOutside = false;
      dialog.addEventListener("pointerdown", (e) => { pressedOutside = outside(e, dialog); });
      dialog.addEventListener("pointerup", (e) => { if (pressedOutside && outside(e, dialog)) dialog.close(); });
    }
  }
})();

// === SPACESHIP GAME ===
const gameCanvas = document.getElementById("game-canvas");
const gctx = gameCanvas.getContext("2d");

function resizeGameCanvas() {
  gameCanvas.width = window.innerWidth;
  gameCanvas.height = window.innerHeight;
}
resizeGameCanvas();
window.addEventListener("resize", resizeGameCanvas);

const ship = { x: 100, y: 0, width: 40, height: 30, speed: 6 };
ship.y = gameCanvas.height / 2;

const keys = {};
window.addEventListener("keydown", (e) => keys[e.key] = true);
window.addEventListener("keyup", (e) => keys[e.key] = false);

function updateShip() {
  if (keys["ArrowUp"] || keys["w"]) ship.y -= ship.speed;
  if (keys["ArrowDown"] || keys["s"]) ship.y += ship.speed;
  if (keys["ArrowLeft"] || keys["a"]) ship.x -= ship.speed;
  if (keys["ArrowRight"] || keys["d"]) ship.x += ship.speed;
  ship.x = Math.max(0, Math.min(gameCanvas.width - ship.width, ship.x));
  ship.y = Math.max(0, Math.min(gameCanvas.height - ship.height, ship.y));
  spawnTrailParticle();
}

// === TOUCH CONTROLS ===
let touchActive = false;

function handleTouch(e) {
  e.preventDefault();
  touchActive = true;
  const t = e.touches[0];
  if (!t) return;
  const rect = gameCanvas.getBoundingClientRect();
  ship.x = Math.max(0, Math.min(gameCanvas.width - ship.width, t.clientX - rect.left - ship.width / 2));
  ship.y = Math.max(0, Math.min(gameCanvas.height - ship.height, t.clientY - rect.top - ship.height / 2));
}

gameCanvas.addEventListener("touchstart", handleTouch, { passive: false });
gameCanvas.addEventListener("touchmove", handleTouch, { passive: false });
gameCanvas.addEventListener("touchend", () => { touchActive = false; });

function gameLoop() {
  gctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
  drawPlanets();
  updateGameStars();
  drawGameStars();
  updateShip();
  if (touchActive) shootBullet();
  updateTrail();
  drawTrail();
  drawShip();
  updateEnemies();
  drawEnemies();
  updateBullets();
  drawBullets();
  checkCollisions();
  updateExplosions();
  drawExplosions();
  if (!gameContainer.classList.contains("hidden")) {
    requestAnimationFrame(gameLoop);
  }
}

// Same shapes as the SVG spaceship in the hero (viewBox 0 0 112 60).
const SHIP_SHAPES = {
  flame: new Path2D("M22 22 C10 24 2 28 0 30 C2 32 10 36 22 38 Z"),
  finTop: new Path2D("M40 18 L28 4 L54 16 Z"),
  finBottom: new Path2D("M40 42 L28 56 L54 44 Z"),
  hull: new Path2D("M24 18 Q70 12 104 30 Q70 48 24 42 Z"),
};

function drawShip() {
  // Fit the hull (x 18 to 104 in the SVG) into the ship's 40px hitbox.
  const s = ship.width / 86;
  gctx.save();
  gctx.translate(ship.x - 18 * s, ship.y + ship.height / 2 - 30 * s);
  gctx.scale(s, s);

  gctx.save();
  gctx.translate(22, 30);
  gctx.scale(0.75 + Math.random() * 0.4, 1);
  gctx.translate(-22, -30);
  const flame = gctx.createLinearGradient(22, 0, 0, 0);
  flame.addColorStop(0, "#fff8e0");
  flame.addColorStop(0.45, "#6eacda");
  flame.addColorStop(1, "rgba(110, 172, 218, 0)");
  gctx.fillStyle = flame;
  gctx.fill(SHIP_SHAPES.flame);
  gctx.restore();

  gctx.fillStyle = "#6eacda";
  gctx.fill(SHIP_SHAPES.finTop);
  gctx.fill(SHIP_SHAPES.finBottom);
  gctx.fillStyle = "#143f6b";
  gctx.fillRect(18, 23, 8, 14);
  gctx.fillStyle = "#ecedd8";
  gctx.fill(SHIP_SHAPES.hull);
  gctx.strokeStyle = "#6eacda";
  gctx.lineWidth = 2.5;
  gctx.lineCap = "round";
  gctx.beginPath();
  gctx.moveTo(34, 30);
  gctx.lineTo(62, 30);
  gctx.stroke();
  gctx.fillStyle = "#03346e";
  gctx.lineWidth = 2;
  gctx.beginPath();
  gctx.arc(76, 30, 6, 0, Math.PI * 2);
  gctx.fill();
  gctx.stroke();
  gctx.restore();
}

// === ENEMIES ===
let enemies = [];
function spawnEnemy() {
  const shape = [];
  for (let i = 0; i < 8; i++) shape.push(0.7 + Math.random() * 0.3);
  enemies.push({
    x: gameCanvas.width,
    y: Math.random() * gameCanvas.height,
    width: 30, height: 30,
    speed: 2 + Math.random() * 2,
    shape: shape,
  });
}
let enemySpawnTimer;

function updateEnemies() {
  enemies.forEach(e => e.x -= e.speed);
  enemies = enemies.filter(e => e.x + e.width > 0);
}

function drawEnemies() {
  enemies.forEach(e => {
    const cx = e.x + e.width / 2, cy = e.y + e.height / 2, r = e.width / 2;
    gctx.fillStyle = "#9ca3af";
    gctx.strokeStyle = "#4b5563";
    gctx.lineWidth = 2;
    gctx.beginPath();
    e.shape.forEach((p, i) => {
      const a = (Math.PI * 2 / e.shape.length) * i;
      const px = cx + Math.cos(a) * r * p, py = cy + Math.sin(a) * r * p;
      if (i === 0) gctx.moveTo(px, py); else gctx.lineTo(px, py);
    });
    gctx.closePath();
    gctx.fill();
    gctx.stroke();
  });
}

// === BULLETS ===
let bullets = [];
function shootBullet() {
  bullets.push({ x: ship.x + ship.width, y: ship.y + ship.height / 2 - 3, width: 10, height: 6, speed: 9 });
}
window.addEventListener("keydown", (e) => {
  if (e.key === " " && !gameContainer.classList.contains("hidden")) { e.preventDefault(); shootBullet(); }
});

function updateBullets() {
  bullets.forEach(b => b.x += b.speed);
  bullets = bullets.filter(b => b.x < gameCanvas.width);
}

function drawBullets() {
  gctx.fillStyle = "#ecedd8";
  bullets.forEach(b => gctx.fillRect(b.x, b.y, b.width, b.height));
}

// === SCORE & COLLISIONS ===
let score = 0;
const scoreValue = document.getElementById("score-value");

function checkCollisions() {
  bullets.forEach(bullet => {
    enemies.forEach(enemy => {
      const hit = bullet.x < enemy.x + enemy.width && bullet.x + bullet.width > enemy.x && bullet.y < enemy.y + enemy.height && bullet.y + bullet.height > enemy.y;
      if (hit) {
        enemy.hit = true;
        bullet.hit = true;
        score++;
        scoreValue.textContent = score;
        spawnExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
        if (score >= 20) endGame();
      }
    });
  });
  enemies = enemies.filter(e => !e.hit);
  bullets = bullets.filter(b => !b.hit);
}

function endGame() {
  gameContainer.classList.add("hidden");
  clearInterval(enemySpawnTimer);
  contactReveal.classList.remove("hidden");
  contactReveal.classList.add("show");
}

// === ENGINE TRAIL ===
let engineTrail = [];
function spawnTrailParticle() {
  engineTrail.push({ x: ship.x - 4, y: ship.y + ship.height / 2 + (Math.random() - 0.5) * 10, radius: 2 + Math.random() * 2, life: 1 });
}
function updateTrail() {
  engineTrail.forEach(p => { p.x -= 2; p.life -= 0.05; });
  engineTrail = engineTrail.filter(p => p.life > 0);
}
function drawTrail() {
  engineTrail.forEach(p => {
    gctx.fillStyle = `rgba(110, 172, 218, ${p.life})`;
    gctx.beginPath();
    gctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    gctx.fill();
  });
}

// === GAME STARS ===
let gameStars = [];
function createGameStars() {
  gameStars = [];
  for (let i = 0; i < 100; i++) {
    gameStars.push({ x: Math.random() * gameCanvas.width, y: Math.random() * gameCanvas.height, radius: Math.random() * 1.5, speed: 0.5 + Math.random() * 1.5 });
  }
}
function updateGameStars() {
  gameStars.forEach(s => { s.x -= s.speed; if (s.x < 0) s.x = gameCanvas.width; });
}
function drawGameStars() {
  gctx.fillStyle = "rgba(255, 255, 255, 0.7)";
  gameStars.forEach(s => { gctx.beginPath(); gctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2); gctx.fill(); });
}

// === PLANETS ===
const planets = [
  { x: 150, y: 150, radius: 60, color: "#1f5f99" },
  { x: 0, y: 0, radius: 90, color: "#3ddc97" },
];
function drawPlanets() {
  planets.forEach(p => {
    gctx.fillStyle = p.color;
    gctx.globalAlpha = 0.25;
    gctx.beginPath();
    gctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    gctx.fill();
    gctx.globalAlpha = 1;
  });
}

// === EXPLOSIONS ===
let explosions = [];
function spawnExplosion(x, y) {
  for (let i = 0; i < 12; i++) {
    const a = Math.random() * Math.PI * 2, sp = 1 + Math.random() * 3;
    explosions.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 1, color: Math.random() > 0.5 ? "#fbbf24" : "#ef4444" });
  }
}
function updateExplosions() {
  explosions.forEach(p => { p.x += p.vx; p.y += p.vy; p.life -= 0.04; });
  explosions = explosions.filter(p => p.life > 0);
}
function drawExplosions() {
  explosions.forEach(p => {
    gctx.fillStyle = p.color;
    gctx.globalAlpha = p.life;
    gctx.beginPath();
    gctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
    gctx.fill();
    gctx.globalAlpha = 1;
  });
}

// ============================================
// LIGHTBOX (native <dialog>: focus, Esc and inert page come from the browser)
// ============================================
(function() {
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxThumbs = document.getElementById('lightbox-thumbs');
  const lightboxCounter = document.getElementById('lightbox-counter');
  const btnClose = document.getElementById('lightbox-close');
  const btnPrev = document.getElementById('lightbox-prev');
  const btnNext = document.getElementById('lightbox-next');

  let currentIndex = 0;
  let currentGroup = [];

  function getImagesInGroup(group) {
    return Array.from(document.querySelectorAll('.lightbox-trigger[data-group="' + group + '"]'));
  }

  // The clicked photo morphs into the lightbox image (and back) where view
  // transitions are available; otherwise the dialog just opens and closes.
  function canMorph(trigger) {
    return document.startViewTransition && !prefersReducedMotion && trigger && !trigger.hidden;
  }

  function openLightbox(group, startIndex) {
    currentGroup = getImagesInGroup(group);
    currentIndex = startIndex;
    const trigger = currentGroup[currentIndex];
    const show = function() {
      render();
      lightbox.showModal();
    };
    if (!canMorph(trigger)) {
      show();
      return;
    }
    trigger.style.viewTransitionName = 'lb';
    const transition = document.startViewTransition(async function() {
      trigger.style.viewTransitionName = '';
      show();
      lightboxImg.style.viewTransitionName = 'lb';
      try { await lightboxImg.decode(); } catch { /* still show the photo */ }
    });
    transition.finished.finally(function() {
      lightboxImg.style.viewTransitionName = '';
    });
  }

  function closeLightbox() {
    const trigger = currentGroup[currentIndex];
    if (!canMorph(trigger)) {
      lightbox.close();
      return;
    }
    lightboxImg.style.viewTransitionName = 'lb';
    const transition = document.startViewTransition(function() {
      lightboxImg.style.viewTransitionName = '';
      lightbox.close();
      trigger.style.viewTransitionName = 'lb';
    });
    transition.finished.finally(function() {
      trigger.style.viewTransitionName = '';
    });
  }

  function render() {
    const trigger = currentGroup[currentIndex];
    const caption = trigger.dataset.caption || '';

    lightboxImg.src = trigger.src;
    lightboxImg.alt = trigger.alt || caption;
    lightboxCaption.textContent = caption;
    lightboxCounter.textContent = (currentIndex + 1) + ' / ' + currentGroup.length;
    lightbox.classList.toggle('single', currentGroup.length < 2);

    lightboxThumbs.innerHTML = '';
    currentGroup.forEach(function(t, i) {
      const thumb = document.createElement('img');
      thumb.className = 'lightbox-thumb' + (i === currentIndex ? ' active' : '');
      thumb.src = t.src;
      thumb.alt = 'Photo ' + (i + 1);
      thumb.addEventListener('click', function() {
        currentIndex = i;
        render();
      });
      lightboxThumbs.appendChild(thumb);
    });
  }

  function goNext() {
    currentIndex = (currentIndex + 1) % currentGroup.length;
    render();
  }

  function goPrev() {
    currentIndex = (currentIndex - 1 + currentGroup.length) % currentGroup.length;
    render();
  }

  btnClose.addEventListener('click', closeLightbox);
  btnNext.addEventListener('click', goNext);
  btnPrev.addEventListener('click', goPrev);

  // The dialog fills the viewport, so a click on its empty area is a click "outside" the photo.
  lightbox.addEventListener('click', function(e) {
    if (e.target === lightbox) closeLightbox();
  });

  // Esc: run the same animated close as the button.
  lightbox.addEventListener('cancel', function(e) {
    e.preventDefault();
    closeLightbox();
  });

  lightbox.addEventListener('keydown', function(e) {
    if (currentGroup.length < 2) return;
    if (e.key === 'ArrowRight') goNext();
    if (e.key === 'ArrowLeft') goPrev();
  });

  document.querySelectorAll('.lightbox-trigger').forEach(function(trigger) {
    trigger.addEventListener('click', function(e) {
      e.preventDefault();
      const groupImages = getImagesInGroup(trigger.dataset.group);
      const idx = groupImages.indexOf(trigger);
      openLightbox(trigger.dataset.group, idx >= 0 ? idx : 0);
    });
    trigger.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        trigger.click();
      }
    });
  });
})();

// "Certificate" buttons open the matching hidden image in the lightbox
document.querySelectorAll("[data-open]").forEach(btn => {
  btn.addEventListener("click", () => document.getElementById(btn.dataset.open).click());
});
