const API_URL = "https://script.google.com/macros/s/AKfycbxOB2SXn1vTqNoNJBz1MdfLIUEdU0leaeB-2QfbQJtUilYm7t47N-_3cjQSM7hwOeMc/exec";

// スコア送信
function submitScore(name, score) {
  fetch(API_URL, {
    method: "POST",
    body: JSON.stringify({ name, score }),
    headers: { "Content-Type": "application/json" },
  })
  .then(res => res.json()) // ← GASがJSONを返すようにしている
  .then(() => fetchRanking())
  .catch(err => console.error("スコア送信エラー:", err));
}

// ランキング取得
function fetchRanking() {
  fetch(API_URL)
    .then(res => res.json())
    .then(data => displayRanking(data))
    .catch(err => console.error("ランキング取得エラー:", err));
}

// 表示
function displayRanking(data) {
  const list = document.getElementById("rankingList");
  list.innerHTML = "";

  if (!data || data.length === 0) {
    list.innerHTML = "<p>まだスコアがありません。</p>";
    return;
  }

  data.sort((a, b) => Number(b.score) - Number(a.score));
  const top5 = data.slice(0, 5);

  top5.forEach((entry, index) => {
    const div = document.createElement("div");
    div.textContent = `${index + 1}. ${entry.name} - ${entry.score}`;
    list.appendChild(div);
  });
}