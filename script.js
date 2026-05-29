const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const hpText = document.getElementById("hp");
const scoreText = document.getElementById("score");

// 猫画像
const normalImg = new Image();
normalImg.src = "アタッカー猫.png";

const fastImg = new Image();
fastImg.src = "スピード猫.png";

const tankImg = new Image();
tankImg.src = "タンク猫.png";

const attackImg = new Image();
attackImg.src = "アタッカー猫.png";

// 猫データ
const cats = {

  normal: {
    name: "NORMAL",
    image: normalImg,
    hp: 120,
    speed: 5,
    shootSpeed: 350,
    skillName: "ニャンラッシュ",
    skillCooldown: 8000
  },

  fast: {
    name: "FAST",
    image: fastImg,
    hp: 80,
    speed: 8,
    shootSpeed: 450,
    skillName: "ダッシュ",
    skillCooldown: 6000
  },

  tank: {
    name: "TANK",
    image: tankImg,
    hp: 300,
    speed: 3,
    shootSpeed: 450,
    skillName: "鉄壁",
    skillCooldown: 10000
  },

  attack: {
    name: "ATTACK",
    image: attackImg,
    hp: 45,
    speed: 4,
    shootSpeed: 500,
    skillName: "2WAY",
    skillCooldown: 10000
  }

};

let selectedCat = null;

const player = {
  x: 300,
  y: 300,
  speed: 5,
  hp: 100,
  image: normalImg
};

let score = 0;
let gameOver = false;
let gameStarted = false;

let canSkill = true;
let shieldMode = false;
let dashMode = false;

const humans = [];
const bullets = [];
const keys = {};

let enemyInterval;
let shootInterval;

window.addEventListener("keydown", (e) => {

  keys[e.key] = true;

  if (e.key === " ") {
    useSkill();
  }

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
    x: player.x + 24,
    y: player.y + 24,
    vx: (dx / len) * 8,
    vy: (dy / len) * 8
  });

}

function useSkill() {

  if (!canSkill) return;
  if (!gameStarted) return;
  if (gameOver) return;

  canSkill = false;

  // NORMAL
  if (selectedCat.name === "NORMAL") {

    for (let i = 0; i < 8; i++) {

      const angle = (Math.PI * 2 / 8) * i;

      bullets.push({
        x: player.x + 24,
        y: player.y + 24,
        vx: Math.cos(angle) * 8,
        vy: Math.sin(angle) * 8
      });

    }

  }

  // FAST
  if (selectedCat.name === "FAST") {

    dashMode = true;

    player.speed = 15;

    setTimeout(() => {

      player.speed = selectedCat.speed;
      dashMode = false;

    }, 2000);

  }

  // TANK
  if (selectedCat.name === "TANK") {

    shieldMode = true;

    setTimeout(() => {

      shieldMode = false;

    }, 4000);

  }

  // ATTACK
  if (selectedCat.name === "ATTACK") {

    if (humans.length > 0) {

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

      for (let spread = -0.2; spread <= 0.2; spread += 0.4) {

        bullets.push({
          x: player.x + 24,
          y: player.y + 24,
          vx: ((dx / len) * Math.cos(spread) - (dy / len) * Math.sin(spread)) * 10,
          vy: ((dx / len) * Math.sin(spread) + (dy / len) * Math.cos(spread)) * 10
        });

      }

    }

  }

  setTimeout(() => {
    canSkill = true;
  }, selectedCat.skillCooldown);

}

function selectCat(catType) {

  selectedCat = cats[catType];

  player.hp = selectedCat.hp;
  player.speed = selectedCat.speed;
  player.image = selectedCat.image;

  hpText.textContent = player.hp;

  startGame();

}

function startGame() {

  gameStarted = true;

  spawnHuman();

  enemyInterval = setInterval(spawnHuman, 500);

  shootInterval = setInterval(shoot, selectedCat.shootSpeed);

}

function restartGame() {

  humans.length = 0;
  bullets.length = 0;

  player.x = 300;
  player.y = 300;

  player.hp = selectedCat.hp;

  score = 0;

  hpText.textContent = player.hp;
  scoreText.textContent = score;

  gameOver = false;

  canSkill = true;
  shieldMode = false;
  dashMode = false;

  spawnHuman();

}

canvas.addEventListener("click", (e) => {

  const rect = canvas.getBoundingClientRect();

  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;

  if (!gameStarted) {

    if (mx >= 50 && mx <= 250 && my >= 220 && my <= 290) {
      selectCat("normal");
    }

    if (mx >= 350 && mx <= 550 && my >= 220 && my <= 290) {
      selectCat("fast");
    }

    if (mx >= 50 && mx <= 250 && my >= 330 && my <= 400) {
      selectCat("tank");
    }

    if (mx >= 350 && mx <= 550 && my >= 330 && my <= 400) {
      selectCat("attack");
    }

  }

  if (
    gameOver &&
    mx >= 190 &&
    mx <= 410 &&
    my >= 500 &&
    my <= 570
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

  player.x = Math.max(0, Math.min(canvas.width - 48, player.x));
  player.y = Math.max(0, Math.min(canvas.height - 48, player.y));

  humans.forEach((human) => {

    const dx = player.x - human.x;
    const dy = player.y - human.y;

    let len = Math.sqrt(dx * dx + dy * dy);

    if (len < 0.1) len = 0.1;

    human.x += (dx / len) * human.speed;
    human.y += (dy / len) * human.speed;

    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 30) {

      if (!shieldMode) {
        player.hp -= human.boss ? 2 : 1;
      }

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

  ctx.fillStyle = "#fff8e8";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // プレイヤー画像
  ctx.drawImage(
    player.image,
    player.x,
    player.y,
    48,
    48
  );

  // シールド
  if (shieldMode) {

    ctx.strokeStyle = "cyan";
    ctx.lineWidth = 5;

    ctx.beginPath();
    ctx.arc(player.x + 24, player.y + 24, 35, 0, Math.PI * 2);
    ctx.stroke();

  }

  // ダッシュ
  if (dashMode) {

    ctx.fillStyle = "yellow";
    ctx.font = "20px sans-serif";
    ctx.fillText("DASH!", player.x - 10, player.y - 20);

  }

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

    ctx.fillStyle = "skyblue";

    ctx.beginPath();
    ctx.arc(bullet.x, bullet.y, 5, 0, Math.PI * 2);
    ctx.fill();

  });

  // 必殺技UI
  if (gameStarted && !gameOver) {

    ctx.font = "20px sans-serif";

    if (!canSkill) {

      ctx.globalAlpha = 0.4;

      ctx.fillStyle = "gray";
      ctx.fillText("SPACE : " + selectedCat.skillName, 10, 30);

      ctx.globalAlpha = 1;

    } else {

      ctx.fillStyle = "black";
      ctx.fillText("SPACE : " + selectedCat.skillName, 10, 30);

    }

  }

  // 猫選択画面
  if (!gameStarted) {

    ctx.fillStyle = "rgba(0,0,0,0.8)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "white";
    ctx.font = "45px sans-serif";
    ctx.fillText("SELECT CAT", 160, 120);

    ctx.fillStyle = "orange";
    ctx.fillRect(50, 220, 200, 70);

    ctx.fillStyle = "black";
    ctx.font = "30px sans-serif";
    ctx.fillText("NORMAL", 90, 265);

    ctx.fillStyle = "lightblue";
    ctx.fillRect(350, 220, 200, 70);

    ctx.fillStyle = "black";
    ctx.fillText("FAST", 420, 265);

    ctx.fillStyle = "lightgreen";
    ctx.fillRect(50, 330, 200, 70);

    ctx.fillStyle = "black";
    ctx.fillText("TANK", 100, 375);

    ctx.fillStyle = "pink";
    ctx.fillRect(350, 330, 200, 70);

    ctx.fillStyle = "black";
    ctx.fillText("ATTACK", 390, 375);

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
    ctx.fillRect(190, 500, 220, 70);

    ctx.fillStyle = "black";
    ctx.font = "30px sans-serif";
    ctx.fillText("RESTART", 220, 545);

  }

}

function loop() {

  update();
  draw();

  requestAnimationFrame(loop);

}

loop();
