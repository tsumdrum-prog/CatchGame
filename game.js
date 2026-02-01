let canvas, ctx;
let player = { x: 0, y: 0, size: 0 }; // サイズはリサイズ時に決定
let items = [];
let score = 0;
let isGameOver = false;
let playerName = "";

let gameStartTime = 0;
let speedMultiplier = 1;

let seGood, seBad;

let scorePopFrame = 0;   // ポップ演出用フレーム

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
    item.size = canvas.width * 0.1;
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

  const size = canvas.width * 0.1;

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

function drawCenterScore() {
  ctx.save();

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const x = canvas.width / 2;
  const y = canvas.height / 2;

  // ===== ベース設定（倍サイズ）=====
  let baseSize = 128;   // ← 64 → 128（倍）
  let fontSize = baseSize;
  let alpha = 0.4;
  let color = "#ffffaa";

  // ===== スコア増加ポップ =====
  if (scorePopFrame > 0) {
    const t = scorePopFrame / 12;   // 1 → 0
    fontSize = baseSize + baseSize * 0.5 * t; // 最大1.5倍
    alpha = 0.85;
    scorePopFrame--;
  }

  // ===== ゲームオーバー演出 =====
  if (isGameOver) {
    fontSize = baseSize * 2; // 超デカ
    alpha = 1;
    color = "#ff5555";
  }

  ctx.globalAlpha = alpha;
  ctx.font = `bold ${fontSize}px RetroFont`;
  ctx.fillStyle = color;
  ctx.strokeStyle = "#000";
  ctx.lineWidth = fontSize * 0.08;

  const text = `Score: ${score}`;

  ctx.strokeText(text, x, y);
  ctx.fillText(text, x, y);

  ctx.restore();
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // スコアは常に描画
  drawCenterScore();

  // ゲームオーバー中は「更新だけ止める」
  if (isGameOver) {
    requestAnimationFrame(gameLoop);
    return;
  }

  const elapsedSec = (Date.now() - gameStartTime) / 1000;
  speedMultiplier = Math.min(1 + elapsedSec * 0.05, 6);

  ctx.drawImage(playerImg, player.x, player.y, player.size, player.size);

  // アイテム処理
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
        scorePopFrame = 12; // 12フレーム分ポップ

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

  // ★ 最後に描く
  drawCenterScore();

  requestAnimationFrame(gameLoop);
}

function gameOver() {
  if (isGameOver) return;
  isGameOver = true;

  const bgm = document.getElementById("bgm");
  bgm.pause();
  bgm.currentTime = 0;

  // 1秒だけ中央スコアを見せる
  setTimeout(() => {
    canvas.style.display = "none";
    document.getElementById("gameOverScreen").style.display = "block";
    document.getElementById("finalScore").innerText = score;
  }, 1000);

  submitScore(playerName, score);
}
