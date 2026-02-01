let canvas, ctx;
let player = { x: 0, y: 0, size: 0 }; // サイズはリサイズ時に決定
let items = [];
let score = 0;
let isGameOver = false;
let playerName = "";

let gameStartTime = 0;
let speedMultiplier = 1;

let seGood, seBad;

// プレイヤー画像
const playerImg = new Image();
playerImg.src = "assets/player.png";

// 複数画像を配列で管理
const goodItemImgs = [];
const badItemImgs = [];
for (let i = 1; i <= 8; i++) {
  const img = new Image();
  img.src = `assets/item_good${i}.png`;
  goodItemImgs.push(img);
}
for (let i = 1; i <= 2; i++) {
  const img = new Image();
  img.src = `assets/item_bad${i}.png`;
  badItemImgs.push(img);
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('gameOverScreen').style.display = 'none';
  document.body.classList.add('start-mode');
});

function startGame() {
  playerName = document.getElementById("playerName").value;

  seGood = document.getElementById("seGood");
  seBad  = document.getElementById("seBad");

  seGood.volume = 0.6;
  seBad.volume = 0.7;

  if (!playerName) return alert("名前を入力してください");

  // ★ BGM再生（ユーザー操作内なのでOK）
  const bgm = document.getElementById("bgm");
  bgm.volume = 0.5; // 音量（0.0〜1.0）
  bgm.play().catch(() => {
    // 一部端末での保険
    console.log("BGM再生はユーザー操作待ち");
  });

  document.getElementById("startScreen").style.display = "none";
  document.getElementById("startScreen").style.display = "none";
  document.body.classList.remove('start-mode');
  document.body.classList.add('game-mode');

  canvas = document.getElementById("gameCanvas");
  canvas.style.display = "block";
  ctx = canvas.getContext("2d");

  resizeCanvas();

  gameStartTime = Date.now();
  speedMultiplier = 1;

  // タッチ・マウスイベント
  canvas.addEventListener("touchmove", handleMove, { passive: false });
  canvas.addEventListener("mousemove", handleMove);

  gameLoop();
  spawnItems();
}

// 画面サイズに応じてCanvasとプレイヤー・アイテムサイズを調整
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  player.size = canvas.width * 0.1;
  player.x = canvas.width / 2 - player.size / 2;
  player.y = canvas.height * 0.75;

  items.forEach(item => {
    item.size = canvas.width * 0.2;
  });
}

window.addEventListener('resize', resizeCanvas);

function handleMove(e) {
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  let clientX = e.touches ? e.touches[0].clientX : e.clientX;
  player.x = clientX - rect.left - player.size / 2;

  if (player.x < 0) player.x = 0;
  if (player.x > canvas.width - player.size) player.x = canvas.width - player.size;
}

function spawnItems() {
  if (isGameOver) return;

  const good = Math.random() > 0.2;
  const imageList = good ? goodItemImgs : badItemImgs;
  const img = imageList[Math.floor(Math.random() * imageList.length)];

  const size = canvas.width * 0.075;

  items.push({
    x: Math.random() * (canvas.width - size),
    y: -size,
    size: size,
    speed: canvas.height * 0.004 + Math.random() * 2, // 画面高さに応じて落下速度調整
    good,
    img
  });

  setTimeout(spawnItems, 800);
}

function gameLoop() {
  if (isGameOver) return;

  const elapsedSec = (Date.now() - gameStartTime) / 1000;
  speedMultiplier = Math.min(1 + elapsedSec * 0.05, 6);

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.drawImage(playerImg, player.x, player.y, player.size, player.size);

  for (let i = items.length - 1; i >= 0; i--) {
    const item = items[i];

    ctx.drawImage(item.img, item.x, item.y, item.size, item.size);
    item.y += item.speed * speedMultiplier;

    // 正しい矩形当たり判定
    if (
      item.x < player.x + player.size &&
      item.x + item.size > player.x &&
      item.y < player.y + player.size &&
      item.y + item.size > player.y
    ) {
      if (item.good) {
        score++;

        // ★ 良いアイテムSE
        seGood.currentTime = 0;
        seGood.play();

      } else {
        // ★ ゲームオーバーSE
        seBad.currentTime = 0;
        seBad.play();
        return gameOver();
      }
      items.splice(i, 1);
      continue;
    }

    // 画面外に出たら削除
    if (item.y > canvas.height) {
      items.splice(i, 1);
    }
  }

  // フォントサイズと太さを大きく
  ctx.font = "bold 28px Arial";

  // 文字色をグラデーションっぽく
  const gradient = ctx.createLinearGradient(0, 0, 200, 0);
  gradient.addColorStop(0, "#ff8c00"); // オレンジ
  gradient.addColorStop(1, "#ffff00"); // 黄色
  ctx.fillStyle = gradient;

  // 薄く縁取りを入れる（目立たせる）
  ctx.strokeStyle = "black";
  ctx.lineWidth = 3;
  ctx.strokeText("Score: " + score, 10, 35);
  ctx.fillText("Score: " + score, 10, 35);

  requestAnimationFrame(gameLoop);
}

function gameOver() {
  if (isGameOver) return;
  isGameOver = true;

  const bgm = document.getElementById("bgm");
  bgm.pause();
  bgm.currentTime = 0;

  canvas.style.display = "none";
  document.getElementById("gameOverScreen").style.display = "block";
  document.getElementById("finalScore").innerText = score;

  document.body.classList.remove('game-mode');
  document.body.classList.add('start-mode');

  submitScore(playerName, score);
}
