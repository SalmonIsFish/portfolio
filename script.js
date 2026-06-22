const words = ["Building stuff.", "Graduating soon.", "Future developer."]
let wordIndex = 0;
let letterIndex = 0;
let isDeleting = false;

function type(){
    const current = words[wordIndex];

    if(isDeleting){
        //remove a letter 
        document.getElementById("typewriter").textContent = current.substring(0, letterIndex - 1);
    letterIndex--;

    } else {
        //add a letter
        document.getElementById('typewriter').textContent = current.substring(0, letterIndex + 1);
    letterIndex++;  
    }
    
    // finishes typing the word 
    if (!isDeleting && letterIndex === current.length) {
        isDeleting = true;
        setTimeout(type, 1500);
        return;
    } 

    //finished deleting
    if (isDeleting && letterIndex === 0) {
        isDeleting = false;
        wordIndex = (wordIndex + 1) % words.length; //move to the next word
    }

    setTimeout(type, isDeleting ? 50 : 100); //deleting faster than typing

}
type();

//particles
const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let dots = [];

for (let i =0; i < 80; i++) {
    dots.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2 ,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5
    });
}

function animateDots(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    dots.forEach(dot => {
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(167, 139, 250, 0.6)'; //purple dots 
        ctx.fill();

        dot.x += dot.speedX;
        dot.y += dot.speedY;

        //bounce off edges
        if (dot.x < 0 || dot.x > canvas.width) dot.speedX *= -1;
        if (dot.y < 0 || dot.y > canvas.height) dot.speedY *= -1;
    } );

    requestAnimationFrame(animateDots);
}
animateDots();

console.log("%cHey there, curious dev! 👀", "color: #a78bfa; font-size: 20px; font-weight: bold;");
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

  createGameStars();                              // ← add this
  planets[1].x = gameCanvas.width - 200;           // ← add this
  planets[1].y = gameCanvas.height - 150;          // ← add this

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

// the player's spaceship
const ship = {
  x: 100,
  y: 0,         // will be set properly below
  width: 40,
  height: 30,
  speed: 6,
};
ship.y = gameCanvas.height / 2;

// track which keys are pressed
const keys = {};
window.addEventListener("keydown", (e) => keys[e.key] = true);
window.addEventListener("keyup", (e) => keys[e.key] = false);

function updateShip() {
  if (keys["ArrowUp"] || keys["w"]) ship.y -= ship.speed;
  if (keys["ArrowDown"] || keys["s"]) ship.y += ship.speed;
  if (keys["ArrowLeft"] || keys["a"]) ship.x -= ship.speed;
  if (keys["ArrowRight"] || keys["d"]) ship.x += ship.speed;

  // keep ship inside the screen
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
  gctx.moveTo(ship.x, ship.y);                              // top back
  gctx.lineTo(ship.x, ship.y + ship.height);                 // bottom back
  gctx.lineTo(ship.x + ship.width, ship.y + ship.height / 2); // front tip
  gctx.closePath();
  gctx.fill();

  // little glow/engine at the back
  gctx.fillStyle = "#60a5fa";
  gctx.beginPath();
  gctx.arc(ship.x - 4, ship.y + ship.height / 2, 5, 0, Math.PI * 2);
  gctx.fill();
}

// === ENEMIES ===
let enemies = [];

function spawnEnemy() {
  // generate a random rocky shape once per asteroid
  const shape = [];
  const points = 8;
  for (let i = 0; i < points; i++) {
    shape.push(0.7 + Math.random() * 0.3);   // random radius variation
  }

  enemies.push({
    x: gameCanvas.width,
    y: Math.random() * gameCanvas.height,
    width: 30,
    height: 30,
    speed: 2 + Math.random() * 2,
    shape: shape,    // ← add this
  });
}

// spawn a new enemy every 1.2 seconds
let enemySpawnTimer;

function updateEnemies() {
  enemies.forEach(enemy => {
    enemy.x -= enemy.speed;   // move left toward the ship
  });

  // remove enemies that went off-screen
  enemies = enemies.filter(enemy => enemy.x + enemy.width > 0);
}

function drawEnemies() {
  enemies.forEach(enemy => {
    const cx = enemy.x + enemy.width / 2;
    const cy = enemy.y + enemy.height / 2;
    const r = enemy.width / 2;

    gctx.fillStyle = "#9ca3af";       // grey rock color
    gctx.strokeStyle = "#4b5563";     // darker grey outline
    gctx.lineWidth = 2;

    gctx.beginPath();
    // draw an irregular polygon using the asteroid's own random points
    enemy.shape.forEach((point, i) => {
      const angle = (Math.PI * 2 / enemy.shape.length) * i;
      const px = cx + Math.cos(angle) * r * point;
      const py = cy + Math.sin(angle) * r * point;
      if (i === 0) gctx.moveTo(px, py);
      else gctx.lineTo(px, py);
    });
    gctx.closePath();
    gctx.fill();
    gctx.stroke();
  });
}

// === BULLETS ===
let bullets = [];

function shootBullet() {
  bullets.push({
    x: ship.x + ship.width,
    y: ship.y + ship.height / 2 - 3,
    width: 10,
    height: 6,
    speed: 9,
  });
}

// shoot when spacebar is pressed (only once per press, not held down)
window.addEventListener("keydown", (e) => {
  if (e.key === " ") {
    e.preventDefault();   // stop page from scrolling on spacebar
    shootBullet();
  }
});

function updateBullets() {
  bullets.forEach(bullet => {
    bullet.x += bullet.speed;
  });

  bullets = bullets.filter(bullet => bullet.x < gameCanvas.width);
}

function drawBullets() {
  gctx.fillStyle = "#fbbf24";  // yellow/gold
  bullets.forEach(bullet => {
    gctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
  });
}

// === SCORE & COLLISIONS ===
let score = 0;
const scoreValue = document.getElementById("score-value");

function checkCollisions() {
  bullets.forEach(bullet => {
    enemies.forEach(enemy => {
      const hit =
        bullet.x < enemy.x + enemy.width &&
        bullet.x + bullet.width > enemy.x &&
        bullet.y < enemy.y + enemy.height &&
        bullet.y + bullet.height > enemy.y;

      if (hit) {
        enemy.hit = true;
        bullet.hit = true;
        score++;
        scoreValue.textContent = score;

        spawnExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);  // ← add this
        if (score >= 20) {        // ← make sure this is here
        endGame();
  }
    }
    });
  });

  enemies = enemies.filter(enemy => !enemy.hit);
  bullets = bullets.filter(bullet => !bullet.hit);
}

function endGame() {
  gameContainer.classList.add("hidden");
  clearInterval(enemySpawnTimer);

  // show the contact info as the reward!
  contactReveal.classList.remove("hidden");
  contactReveal.classList.add("show");
}

// === ENGINE TRAIL PARTICLES ===
let engineTrail = [];

function spawnTrailParticle() {
  engineTrail.push({
    x: ship.x - 4,
    y: ship.y + ship.height / 2 + (Math.random() - 0.5) * 10,
    radius: 2 + Math.random() * 2,
    life: 1,        // starts fully visible
  });
}

function updateTrail() {
  engineTrail.forEach(p => {
    p.x -= 2;           // drift backward
    p.life -= 0.05;     // fade out over time
  });
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

// === GAME BACKGROUND STARS ===
let gameStars = [];

function createGameStars() {
  gameStars = [];
  for (let i = 0; i < 100; i++) {
    gameStars.push({
      x: Math.random() * gameCanvas.width,
      y: Math.random() * gameCanvas.height,
      radius: Math.random() * 1.5,
      speed: 0.5 + Math.random() * 1.5,
    });
  }
}

function updateGameStars() {
  gameStars.forEach(star => {
    star.x -= star.speed;        // drift left, like flying through space
    if (star.x < 0) star.x = gameCanvas.width;  // wrap back to the right
  });
}

function drawGameStars() {
  gctx.fillStyle = "rgba(255, 255, 255, 0.7)";
  gameStars.forEach(star => {
    gctx.beginPath();
    gctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    gctx.fill();
  });
}

// === BACKGROUND PLANETS ===
const planets = [
  { x: 150, y: 150, radius: 60, color: "#7c3aed" },
  { x: 0, y: 0, radius: 90, color: "#0ea5e9" },  // position set on game start
];

function drawPlanets() {
  planets.forEach(planet => {
    gctx.fillStyle = planet.color;
    gctx.globalAlpha = 0.25;     // soft, dim, background feel
    gctx.beginPath();
    gctx.arc(planet.x, planet.y, planet.radius, 0, Math.PI * 2);
    gctx.fill();
    gctx.globalAlpha = 1;        // reset for everything else
  });
}

// === EXPLOSIONS ===
let explosions = [];

function spawnExplosion(x, y) {
  for (let i = 0; i < 12; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 1 + Math.random() * 3;
    explosions.push({
      x: x,
      y: y,
      vx: Math.cos(angle) * speed,   // velocity x
      vy: Math.sin(angle) * speed,   // velocity y
      life: 1,
      color: Math.random() > 0.5 ? "#fbbf24" : "#ef4444",
    });
  }
}

function updateExplosions() {
  explosions.forEach(p => {
    p.x += p.vx;
    p.y += p.vy;
    p.life -= 0.04;
  });
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