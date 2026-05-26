const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const hpText = document.getElementById("hp");
const scoreText = document.getElementById("score");

const player = {
  x: 300,
  y: 300,
  speed: 5,
  hp: 100
};

let score = 0;
let gameOver = false;

const humans = [];
const bullets = [];
const keys = {};

window.addEventListener("keydown", (e) => {
  keys[e.key] = true;
});

window.addEventListener("keyup", (e) => {
  keys[e.key] = false;
});

function spawnHuman() {
  const side = Math.floor(Math.random() * 4);

  let x;
  let y;

  if (side === 0) {
    x = 0;
    y = Math.random() * canvas.height;
  } else if (side === 1) {
    x = canvas.width;
    y = Math.random() * canvas.height;
  } else if (side === 2) {
    x = Math.random() * canvas.width;
    y = 0;
  } else {
    x = Math.random() * canvas.width;
    y = canvas.height;
  }

  humans.push({
    x,
    y
  });
}

setInterval(spawnHuman, 1000);

function shoot() {
  if (humans.length === 0) return;

  let nearest = humans[0];
  let best = Infinity;

  humans.forEach((human) => {
    const dx = human.x - player.x;
    const dy = human.y - player.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < best) {
      best = dist;
      nearest = human;
    }
  });

  const dx = nearest.x - player.x;
  const dy = nearest.y - player.y;
  const len = Math.sqrt(dx * dx + dy * dy);

  bullets.push({
    x: player.x,
    y: player.y,
    vx: (dx / len) * 8,
    vy: (dy / len) * 8
  });
}

setInterval(shoot, 400);

function update() {
  if (gameOver) return;

  if (keys["ArrowUp"] || keys["w"]) player.y -= player.speed;
  if (keys["ArrowDown"] || keys["s"]) player.y += player.speed;
  if (keys["ArrowLeft"] || keys["a"]) player.x -= player.speed;
  if (keys["ArrowRight"] || keys["d"]) player.x += player.speed;

  humans.forEach((human) => {
    const dx = player.x - human.x;
    const dy = player.y - human.y;
    const len = Math.sqrt(dx * dx + dy * dy);

    human.x += (dx / len) * 1.5;
    human.y += (dy / len) * 1.5;

    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 30) {
      player.hp -= 1;
      hpText.textContent = player.hp;

      if (player.hp <= 0) {
        gameOver = true;
      }
    }
  });

  bullets.forEach((bullet) => {
    bullet.x += bullet.vx;
    bullet.y += bullet.vy;
  });

  for (let i = humans.length - 1; i >= 0; i--) {
    for (let j = bullets.length - 1; j >= 0; j--) {

      const dx = humans[i].x - bullets[j].x;
      const dy = humans[i].y - bullets[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 25) {
        humans.splice(i, 1);
        bullets.splice(j, 1);

        score++;
        scoreText.textContent = score;

        break;
      }
    }
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.font = "40px serif";
  ctx.fillText("🐈", player.x, player.y);

  humans.forEach((human) => {
    ctx.font = "35px serif";
    ctx.fillText("🧑", human.x, human.y);
  });

  bullets.forEach((bullet) => {
    ctx.font = "20px serif";
    ctx.fillText("💨", bullet.x, bullet.y);
  });

  if (gameOver) {
    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "white";
    ctx.font = "50px sans-serif";
    ctx.fillText("GAME OVER", 150, 300);
  }
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

loop();
