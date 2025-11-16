// Firebase 初期化
const firebaseConfig = {
  apiKey: "AIzaSyCSN6frkgciGtsdluftWFFQ6dZGxpbrsLg",
  authDomain: "game-ranking-65eab.firebaseapp.com",
  databaseURL: "https://game-ranking-65eab-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "game-ranking-65eab",
  storageBucket: "game-ranking-65eab.appspot.com",
  messagingSenderId: "914841797728",
  appId: "1:914841797728:web:abf47cb1dd65e1f2a46f05"
};

firebase.initializeApp(firebaseConfig);

// Firebase 初期化済み前提
const db = firebase.database();

// スコア送信
function submitScore(name, score) {
  const scoresRef = db.ref('scores');
  const newScoreRef = scoresRef.push();
  newScoreRef.set({ name, score })
    .then(() => fetchRanking())
    .catch(err => console.error("スコア送信エラー:", err));
}

// ランキング取得
function fetchRanking() {
  db.ref('scores').once('value')
    .then(snapshot => {
      const data = snapshot.val();
      if (!data) return displayRanking([]);
      // 配列に変換
      const scoreArray = Object.values(data);
      displayRanking(scoreArray);
    })
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

// グローバル化
window.submitScore = submitScore;
window.fetchRanking = fetchRanking;
window.displayRanking = displayRanking;

// ページ読み込み時にランキング取得
fetchRanking();
