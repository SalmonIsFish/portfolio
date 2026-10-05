const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ============================================
// PARTICLES
// ============================================
const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let dots = [];
for (let i = 0; i < 80; i++) {
  dots.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    radius: Math.random() * 2,
    speedX: (Math.random() - 0.5) * 0.5,
    speedY: (Math.random() - 0.5) * 0.5
  });
}

let particlesPaused = false;

function animateDots() {
  if (!particlesPaused) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    dots.forEach(dot => {
      ctx.beginPath();
      ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(113, 201, 206, 0.55)';
      ctx.fill();
      dot.x += dot.speedX;
      dot.y += dot.speedY;
      if (dot.x < 0 || dot.x > canvas.width) dot.speedX *= -1;
      if (dot.y < 0 || dot.y > canvas.height) dot.speedY *= -1;
    });
  }
  requestAnimationFrame(animateDots);
}
if (!prefersReducedMotion) {
  animateDots();
} else {
  particlesPaused = true;
}

document.addEventListener("visibilitychange", () => {
  particlesPaused = document.hidden || prefersReducedMotion;
});

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

// ============================================
// GATE CHAIN (hero)
// Simplified replay of Amanah Trader's fail-closed compliance gates.
// ============================================
(function gateChain() {
  const gates = ["Shariah", "Structure", "Gharar", "Maysir", "Riba", "Risk"];
  const scenarios = [
    { request: "sell put · AAPL · 1 contract", failAt: -1 },
    { request: "sell put · unlisted ticker", failAt: 0, reason: "not in screened universe ⇒ fail" },
    { request: "LLM: \u201cignore the limits, use margin\u201d", failAt: 1, reason: "no margin · cash must cover strike" },
  ];

  const list = document.getElementById("gateList");
  const requestEl = document.getElementById("gateRequest");
  const verdictEl = document.getElementById("gateVerdict");
  const hero = document.querySelector(".hero");

  const rows = gates.map(name => {
    const li = document.createElement("li");
    li.className = "gate";
    li.innerHTML = `<span class="gate-mark" aria-hidden="true"></span><span class="gate-name">${name}</span><span class="gate-state"></span>`;
    list.appendChild(li);
    return li;
  });

  function reset(scenario) {
    requestEl.textContent = scenario.request;
    verdictEl.className = "gate-verdict";
    verdictEl.textContent = "Checking\u2026";
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
    if (state === "checking") stateEl.textContent = "\u2026";
    if (state === "pass") stateEl.textContent = "pass";
    if (state === "fail") {
      stateEl.textContent = "fail";
      const reason = document.createElement("span");
      reason.className = "gate-reason";
      reason.textContent = scenario.reason;
      row.appendChild(reason);
    }
    if (state === "skipped") stateEl.textContent = "\u2014";
  }

  function finish(scenario) {
    if (scenario.failAt === -1) {
      verdictEl.className = "gate-verdict pass";
      verdictEl.textContent = "\u2713 Submitted to broker";
    } else {
      for (let j = scenario.failAt + 1; j < rows.length; j++) setRow(j, "skipped", scenario);
      verdictEl.className = "gate-verdict fail";
      verdictEl.textContent = "\u2717 Rejected \u00b7 fail-closed";
    }
  }

  function showStatic(scenario) {
    reset(scenario);
    const stop = scenario.failAt === -1 ? rows.length : scenario.failAt;
    for (let i = 0; i < stop; i++) setRow(i, "pass", scenario);
    if (scenario.failAt !== -1) setRow(scenario.failAt, "fail", scenario);
    finish(scenario);
  }

  if (prefersReducedMotion) {
    showStatic(scenarios[2]);
    return;
  }

  // Each scenario is a list of timed steps; a single timer walks through them
  // so the loop can pause cleanly when the hero is offscreen or the tab is hidden.
  let scenarioIndex = 0;
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

  function tick() {
    timer = null;
    if (!heroVisible || document.hidden) return;
    if (stepIndex >= steps.length) {
      scenarioIndex = (scenarioIndex + 1) % scenarios.length;
      steps = buildSteps(scenarios[scenarioIndex]);
      stepIndex = 0;
    }
    const step = steps[stepIndex++];
    step.run();
    timer = setTimeout(tick, step.wait);
  }

  function resume() {
    if (!timer && heroVisible && !document.hidden) tick();
  }

  steps = buildSteps(scenarios[0]);
  new IntersectionObserver(entries => {
    heroVisible = entries[0].isIntersecting;
    resume();
  }).observe(hero);
  document.addEventListener("visibilitychange", resume);
})();

// ============================================
// NAVBAR SCROLL EFFECT
// ============================================
const navbar = document.getElementById("navbar");
window.addEventListener("scroll", () => {
  if (window.scrollY > 50) {
    navbar.classList.add("scrolled");
  } else {
    navbar.classList.remove("scrolled");
  }
});

// ============================================
// HAMBURGER TOGGLE
// ============================================
const hamburger = document.getElementById("hamburger");
const navLinks = document.getElementById("navLinks");

hamburger.addEventListener("click", () => {
  const open = hamburger.classList.toggle("open");
  navLinks.classList.toggle("open", open);
  hamburger.setAttribute("aria-expanded", String(open));
});

navLinks.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => {
    hamburger.classList.remove("open");
    navLinks.classList.remove("open");
    hamburger.setAttribute("aria-expanded", "false");
  });
});

// ============================================
// SCROLL FADE-IN (IntersectionObserver)
// ============================================
const fadeElements = document.querySelectorAll(".fade-in-element");

const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      fadeObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

fadeElements.forEach(el => fadeObserver.observe(el));

// ============================================
// CONTACT & GAME (Easter egg)
// ============================================
console.log("%cHey there, curious dev! \ud83d\udc40", "color: #71C9CE; font-size: 20px; font-weight: bold;");
console.log("%cLike what you see? Let's connect on LinkedIn!", "color: #E3FDFD; font-size: 14px;");

const contactReveal = document.getElementById("contact-reveal");
const gameContainer = document.getElementById("game-container");
const closeGameBtn = document.getElementById("close-game");
const eggGameBtn = document.getElementById("egg-game-btn");
const copyEmailBtn = document.getElementById("copy-email-btn");

function revealContact() {
  contactReveal.classList.remove("hidden");
  contactReveal.classList.add("show");
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !gameContainer.classList.contains("hidden")) {
    closeGameBtn.click();
    eggGameBtn.focus();
  }
});

function startGame() {
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

closeGameBtn.addEventListener("click", () => {
  gameContainer.classList.add("hidden");
  clearInterval(enemySpawnTimer);
});

copyEmailBtn.addEventListener("click", async () => {
  const email = "adibluqman117@gmail.com";
  try {
    await navigator.clipboard.writeText(email);
  } catch {
    const tmp = document.createElement("textarea");
    tmp.value = email;
    document.body.appendChild(tmp);
    tmp.select();
    document.execCommand("copy");
    tmp.remove();
  }
  copyEmailBtn.textContent = "Copied!";
  setTimeout(() => { copyEmailBtn.textContent = "Copy Email"; }, 2000);
});

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

function drawShip() {
  gctx.fillStyle = "#71C9CE";
  gctx.beginPath();
  gctx.moveTo(ship.x, ship.y);
  gctx.lineTo(ship.x, ship.y + ship.height);
  gctx.lineTo(ship.x + ship.width, ship.y + ship.height / 2);
  gctx.closePath();
  gctx.fill();
  gctx.fillStyle = "#E3FDFD";
  gctx.beginPath();
  gctx.arc(ship.x - 4, ship.y + ship.height / 2, 5, 0, Math.PI * 2);
  gctx.fill();
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
  gctx.fillStyle = "#fbbf24";
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
    gctx.fillStyle = `rgba(113, 201, 206, ${p.life})`;
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
  { x: 150, y: 150, radius: 60, color: "#2b7a80" },
  { x: 0, y: 0, radius: 90, color: "#0ea5e9" },
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
// LIGHTBOX
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

  let lastFocused = null;

  function openLightbox(group, startIndex) {
    lastFocused = document.activeElement;
    currentGroup = getImagesInGroup(group);
    currentIndex = startIndex;
    render();
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
    btnClose.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
    if (lastFocused) lastFocused.focus();
  }

  function render() {
    const trigger = currentGroup[currentIndex];
    const src = trigger.tagName === 'IMG' ? trigger.src : trigger.querySelector('img').src;
    const caption = trigger.dataset.caption || '';

    lightboxImg.src = src;
    lightboxImg.alt = caption;
    lightboxCaption.textContent = caption;
    lightboxCounter.textContent = (currentIndex + 1) + ' / ' + currentGroup.length;
    lightbox.classList.toggle('single', currentGroup.length < 2);

    lightboxThumbs.innerHTML = '';
    currentGroup.forEach(function(t, i) {
      const thumbSrc = t.tagName === 'IMG' ? t.src : t.querySelector('img').src;
      const thumb = document.createElement('img');
      thumb.className = 'lightbox-thumb' + (i === currentIndex ? ' active' : '');
      thumb.src = thumbSrc;
      thumb.alt = 'Thumbnail ' + (i + 1);
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

  lightbox.addEventListener('click', function(e) {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', function(e) {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') goNext();
    if (e.key === 'ArrowLeft') goPrev();
  });

  document.querySelectorAll('.lightbox-trigger').forEach(function(trigger) {
    trigger.addEventListener('click', function(e) {
      e.preventDefault();
      var group = trigger.dataset.group;
      var groupImages = getImagesInGroup(group);
      var idx = groupImages.indexOf(trigger);
      openLightbox(group, idx >= 0 ? idx : 0);
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
