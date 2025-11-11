let canvas, ctx;
let player = { x: 180, y: 550, size: 40 };
let items = [];
let score = 0;
let isGameOver = false;
let playerName = "";

// プレイヤー画像
const playerImg = new Image();
playerImg.src = "assets/player.png";

// 複数画像を配列で管理
const goodItemImgs = [];
const badItemImgs = [];

// 画像を複数読み込み
for (let i = 1; i <= 8; i++) { // gooditem1〜3.png を読み込む場合
  const img = new Image();
  img.src = `assets/item_good${i}.png`;
  goodItemImgs.push(img);
}

for (let i = 1; i <= 2; i++) { // baditem1〜2.png を読み込む場合
  const img = new Image();
  img.src = `assets/item_bad${i}.png`;
  badItemImgs.push(img);
}

function startGame() {
  playerName = document.getElementById("playerName").value;
  if (!playerName) return alert("名前を入力してください");

  document.getElementById("startScreen").style.display = "none";
  canvas = document.getElementById("gameCanvas");
  canvas.style.display = "block";
  ctx = canvas.getContext("2d");

  document.addEventListener("mousemove", e => {
    const rect = canvas.getBoundingClientRect();
    player.x = e.clientX - rect.left - player.size / 2;
  });

  gameLoop();
  spawnItems();
}
function spawnItems() {
  if (isGameOver) return;

  const good = Math.random() > 0.2; // 80%良いアイテム
  const imageList = good ? goodItemImgs : badItemImgs;
  const img = imageList[Math.floor(Math.random() * imageList.length)];

  items.push({
    x: Math.random() * 360,
    y: -20,
    size: 30,
    speed: 3 + Math.random() * 3,
    good,
    img
  });

  setTimeout(spawnItems, 800);
}

function gameLoop() {
  if (isGameOver) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // プレイヤー描画
  ctx.drawImage(playerImg, player.x, player.y, player.size, player.size);

  // アイテム描画
  items.forEach((item, i) => {
    ctx.drawImage(item.img, item.x, item.y, item.size, item.size);
    item.y += item.speed;

    // 当たり判定
    if (
      item.y + item.size >= player.y &&
      item.x < player.x + player.size &&
      item.x + item.size > player.x
    ) {
      if (item.good) score++;
      else return gameOver();
      items.splice(i, 1);
    }

    // 画面外削除
    if (item.y > canvas.height) items.splice(i, 1);
  });

  // スコア描画
  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillText("Score: " + score, 10, 30);

  requestAnimationFrame(gameLoop);
}

function gameOver() {
  isGameOver = true;
  canvas.style.display = "none";
  document.getElementById("gameOverScreen").style.display = "block";
  document.getElementById("finalScore").innerText = score;
}