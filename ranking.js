fetch("https://script.google.com/macros/s/XXXXXXXXXXXXXXXXXXXX/exec")
  .then(res => res.json())
  .then(data => displayRanking(data));