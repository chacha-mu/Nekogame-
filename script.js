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
let gameStarted = false;

const humans = [];
const bullets = [];
const keys = {};

let enemyInterval;
let shootInterval;

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

  const isBoss = Math.random() < 0.1;

  humans.push({
    x,
    y,
    hp: isBoss ? 5 : 1,
    speed: isBoss ? 0.8 : 1.5,
    boss: isBoss
  });

}

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

  let len = Math.sqrt(dx * dx + dy * dy);

  if (len < 0.1) len = 0.1;

  bullets.push({
    x: player.x,
    y: player.y,
    vx: (dx / len) * 8,
    vy: (dy / len) * 8
  });

}

function startGame() {

  gameStarted = true;

  spawnHuman();

  enemyInterval = setInterval(spawnHuman, 500);
  shootInterval = setInterval(shoot, 400);

}

function restartGame() {

  humans.length = 0;
  bullets.length = 0;

  player.x = 300;
  player.y = 300;
  player.hp = 100;

  score = 0;

  hpText.textContent = player.hp;
  scoreText.textContent = score;

  gameOver = false;

  spawnHuman();

}

canvas.addEventListener("click", (e) => {

  const rect = canvas.getBoundingClientRect();

  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;

  // START
  if (
    !gameStarted &&
    mx >= 200 &&
    mx <= 400 &&
    my >= 250 &&
    my <= 320
  ) {
    startGame();
  }

  // RESTART
  if (
    gameOver &&
    mx >= 190 &&
    mx <= 410 &&
    my >= 340 &&
    my <= 410
  ) {
    restartGame();
  }

});

function update() {

  if (!gameStarted) return;
  if (gameOver) return;

  if (keys["ArrowUp"] || keys["w"]) player.y -= player.speed;
  if (keys["ArrowDown"] || keys["s"]) player.y += player.speed;
  if (keys["ArrowLeft"] || keys["a"]) player.x -= player.speed;
  if (keys["ArrowRight"] || keys["d"]) player.x += player.speed;

  player.x = Math.max(0, Math.min(canvas.width - 40, player.x));
  player.y = Math.max(0, Math.min(canvas.height - 40, player.y));

  humans.forEach((human) => {

    const dx = player.x - human.x;
    const dy = player.y - human.y;

    let len = Math.sqrt(dx * dx + dy * dy);

    if (len < 0.1) len = 0.1;

    human.x += (dx / len) * human.speed;
    human.y += (dy / len) * human.speed;

    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 30) {

      player.hp -= human.boss ? 2 : 1;

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

  // 弾削除
  for (let i = bullets.length - 1; i >= 0; i--) {

    const b = bullets[i];

    if (
      b.x < 0 ||
      b.x > canvas.width ||
      b.y < 0 ||
      b.y > canvas.height
    ) {
      bullets.splice(i, 1);
    }

  }

  // 当たり判定
  for (let i = humans.length - 1; i >= 0; i--) {

    for (let j = bullets.length - 1; j >= 0; j--) {

      const dx = humans[i].x - bullets[j].x;
      const dy = humans[i].y - bullets[j].y;

      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 25) {

        humans[i].hp--;

        bullets.splice(j, 1);

        if (humans[i].hp <= 0) {

          score += humans[i].boss ? 5 : 1;

          scoreText.textContent = score;

          humans.splice(i, 1);

        }

        break;

      }

    }

  }

}

function draw() {

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 背景
  ctx.fillStyle = "#fff8e8";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // プレイヤー
  ctx.font = "40px sans-serif";
  ctx.fillText("🐈", player.x, player.y);

  // 敵
  humans.forEach((human) => {

    if (human.boss) {

      ctx.font = "50px sans-serif";
      ctx.fillText("🧔", human.x, human.y);

    } else {

      ctx.font = "35px sans-serif";
      ctx.fillText("🧑", human.x, human.y);

    }

  });

  // 弾
  bullets.forEach((bullet) => {

    ctx.font = "20px sans-serif";
    ctx.fillText("💨", bullet.x, bullet.y);

  });

  // タイトル画面
  if (!gameStarted) {

    ctx.fillStyle = "rgba(0,0,0,0.8)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "white";
    ctx.font = "48px sans-serif";
    ctx.fillText("CAT DEFENSE", 120, 180);

    ctx.fillStyle = "yellow";
    ctx.fillRect(200, 250, 200, 70);

    ctx.fillStyle = "black";
    ctx.font = "32px sans-serif";
    ctx.fillText("START", 240, 295);

  }

  // GAME OVER
  if (gameOver) {

    ctx.fillStyle = "rgba(0,0,0,0.8)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "white";
    ctx.font = "50px sans-serif";
    ctx.fillText("GAME OVER", 130, 180);

    ctx.font = "30px sans-serif";
    ctx.fillText("SCORE: " + score, 210, 240);

    ctx.fillStyle = "yellow";
    ctx.fillRect(190, 340, 220, 70);

    ctx.fillStyle = "black";
    ctx.font = "30px sans-serif";
    ctx.fillText("RESTART", 220, 385);

  }

}

function loop() {

  update();
  draw();

  requestAnimationFrame(loop);

}

loop();
