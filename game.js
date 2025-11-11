let canvas, ctx;
let player = { x: 0, y: 0, size: 40 }; // 初期位置を0に設定
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

function startGame() {
  playerName = document.getElementById("playerName").value;
  if (!playerName) return alert("名前を入力してください");

  document.getElementById("startScreen").style.display = "none";
  document.body.style.overflow = "hidden";

  canvas = document.getElementById("gameCanvas");
  canvas.style.display = "block";
  ctx = canvas.getContext("2d");

  // canvasの内部解像度を実際の表示サイズに設定し、アスペクト比を維持
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;

  // プレイヤーの初期位置を中央に設定
  player.x = canvas.width / 2 - player.size / 2;
  player.y = canvas.height - 50;

  // タッチイベントに対応
  canvas.addEventListener("touchmove", handleMove, { passive: false });
  // PCでのデバッグ用としてマウスイベントも残しておく
  canvas.addEventListener("mousemove", handleMove);

  gameLoop();
  spawnItems();
}

// canvasのサイズ変更処理
function resizeCanvas() {
  canvas.width = Math.min(window.innerWidth * 0.9, 400);
  canvas.height = Math.min(window.innerHeight * 0.8, 600);
  player.y = canvas.height - 50;
}

// マウスとタッチの両方に対応する移動処理
function handleMove(e) {
  // タッチイベントの場合のみpreventDefaultを実行
  if (e.touches && e.touches.length > 0) {
    e.preventDefault(); 
  }
  // スクロールなどのデフォルト動作を無効化
  e.preventDefault(); 
  
  const rect = canvas.getBoundingClientRect();
  let clientX;
  if (e.touches && e.touches.length > 0) {
    clientX = e.touches[0].clientX; // タッチイベント
  } else {
    clientX = e.clientX; // マウスイベント
  }
  
  player.x = clientX - rect.left - player.size / 2;
  
  // プレイヤーが画面外に出ないように制限
  if (player.x < 0) player.x = 0;
  if (player.x > canvas.width - player.size) player.x = canvas.width - player.size;
}

function spawnItems() {
  if (isGameOver) return;
  
  const good = Math.random() > 0.2;
  const imageList = good ? goodItemImgs : badItemImgs;
  const img = imageList[Math.floor(Math.random() * imageList.length)];
  
  items.push({
    x: Math.random() * (canvas.width - 30), // canvasの幅に応じてアイテムの出現位置を調整
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

  ctx.drawImage(playerImg, player.x, player.y, player.size, player.size);

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

  document.body.style.overflow = "auto"; // ゲームオーバー時にスクロールを許可
}