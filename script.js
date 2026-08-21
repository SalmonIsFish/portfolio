// ============================================
// TYPEWRITER (hero)
// ============================================
const words = ["Building tools.", "Graduating soon.", "Breaking things (legally)."];
let wordIndex = 0;
let letterIndex = 0;
let isDeleting = false;

function type() {
  const current = words[wordIndex];
  const el = document.getElementById("typewriter");

  if (isDeleting) {
    el.textContent = current.substring(0, letterIndex - 1);
    letterIndex--;
  } else {
    el.textContent = current.substring(0, letterIndex + 1);
    letterIndex++;
  }

  if (!isDeleting && letterIndex === current.length) {
    isDeleting = true;
    setTimeout(type, 1500);
    return;
  }

  if (isDeleting && letterIndex === 0) {
    isDeleting = false;
    wordIndex = (wordIndex + 1) % words.length;
  }

  setTimeout(type, isDeleting ? 50 : 100);
}
type();

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

function animateDots() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  dots.forEach(dot => {
    ctx.beginPath();
    ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(167, 139, 250, 0.6)';
    ctx.fill();
    dot.x += dot.speedX;
    dot.y += dot.speedY;
    if (dot.x < 0 || dot.x > canvas.width) dot.speedX *= -1;
    if (dot.y < 0 || dot.y > canvas.height) dot.speedY *= -1;
  });
  requestAnimationFrame(animateDots);
}
animateDots();

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

// ============================================
// TERMINAL ANIMATION
// ============================================
const terminalLines = [
  { prompt: "$", cmd: "cat name.txt", output: "Adib Luqman" },
  { prompt: "$", cmd: "cat role.txt", output: "CyberSecurity Student" },
  { prompt: "$", cmd: "cat focus.txt", output: "CTF / Pentesting / Building" },
  { prompt: "$", cmd: "cat status.txt", output: "Open to opportunities" },
];

const terminalBody = document.getElementById("terminalBody");

function typeTerminal() {
  terminalLines.forEach((line, i) => {
    const delay = i * 1200;

    setTimeout(() => {
      const lineEl = document.createElement("div");
      lineEl.className = "terminal-line";
      lineEl.innerHTML = `<span class="terminal-prompt">${line.prompt}</span> <span class="terminal-cmd">${line.cmd}</span>`;
      terminalBody.appendChild(lineEl);

      requestAnimationFrame(() => lineEl.classList.add("show"));

      setTimeout(() => {
        const outputEl = document.createElement("div");
        outputEl.className = "terminal-line";
        outputEl.innerHTML = `<span class="terminal-output">${line.output}</span>`;
        terminalBody.appendChild(outputEl);
        requestAnimationFrame(() => outputEl.classList.add("show"));
      }, 500);
    }, delay);
  });
}
typeTerminal();

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
  hamburger.classList.toggle("open");
  navLinks.classList.toggle("open");
});

navLinks.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => {
    hamburger.classList.remove("open");
    navLinks.classList.remove("open");
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
// CONTACT MODAL & GAME (kept from original)
// ============================================
console.log("%cHey there, curious dev! \ud83d\udc40", "color: #a78bfa; font-size: 20px; font-weight: bold;");
console.log("%cLike what you see? Let's connect on LinkedIn!", "color: #60a5fa; font-size: 14px;");

const modal = document.getElementById("game-modal");
const contactBtn = document.getElementById("contact-btn");
const skipBtn = document.getElementById("skip-btn");

contactBtn.addEventListener("click", () => {
  modal.classList.remove("hidden");
});

const contactReveal = document.getElementById("contact-reveal");

skipBtn.addEventListener("click", () => {
  modal.classList.add("hidden");
  contactReveal.classList.remove("hidden");
  contactReveal.classList.add("show");
});

const gameContainer = document.getElementById("game-container");
const playBtn = document.getElementById("play-btn");
const closeGameBtn = document.getElementById("close-game");

playBtn.addEventListener("click", () => {
  modal.classList.add("hidden");
  gameContainer.classList.remove("hidden");
  resizeGameCanvas();
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
});

closeGameBtn.addEventListener("click", () => {
  gameContainer.classList.add("hidden");
  clearInterval(enemySpawnTimer);
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

function gameLoop() {
  gctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
  drawPlanets();
  updateGameStars();
  drawGameStars();
  updateShip();
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
  gctx.fillStyle = "#a78bfa";
  gctx.beginPath();
  gctx.moveTo(ship.x, ship.y);
  gctx.lineTo(ship.x, ship.y + ship.height);
  gctx.lineTo(ship.x + ship.width, ship.y + ship.height / 2);
  gctx.closePath();
  gctx.fill();
  gctx.fillStyle = "#60a5fa";
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
  if (e.key === " ") { e.preventDefault(); shootBullet(); }
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
    gctx.fillStyle = `rgba(167, 139, 250, ${p.life})`;
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
  { x: 150, y: 150, radius: 60, color: "#7c3aed" },
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

  function openLightbox(group, startIndex) {
    currentGroup = getImagesInGroup(group);
    currentIndex = startIndex;
    render();
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }

  function render() {
    const trigger = currentGroup[currentIndex];
    const src = trigger.tagName === 'IMG' ? trigger.src : trigger.querySelector('img').src;
    const caption = trigger.dataset.caption || '';

    lightboxImg.src = src;
    lightboxImg.alt = caption;
    lightboxCaption.textContent = caption;
    lightboxCounter.textContent = (currentIndex + 1) + ' / ' + currentGroup.length;

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
  });
})();
