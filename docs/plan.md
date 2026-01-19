# Web Poker Game (JS + CSS, không dùng Canvas)

Tài liệu này mô tả **cách triển khai một dự án game Poker (Texas Hold’em)** chạy trên nền tảng web, sử dụng **HTML + CSS + JavaScript thuần**, tập trung vào **logic game chuẩn, bot hành động ngẫu nhiên**, và kiến trúc dễ mở rộng.

Mục tiêu của dự án là: **chơi được – đúng luật – dễ bảo trì**, không chạy theo AI phức tạp hay đồ họa canvas.

---

## 1. Phạm vi dự án

### Làm

* Texas Hold’em Poker cơ bản
* Chơi với **bot hành động ngẫu nhiên (có trọng số)**
* UI bằng DOM + CSS (không canvas)
* Logic game tách rời UI
* Có animation cơ bản bằng CSS

### Không làm (ở giai đoạn này)

* AI thông minh / tính xác suất
* Multiplayer online
* Canvas / WebGL
* Hệ thống tiền thật

---

## 2. Triết lý triển khai

Poker là **game trạng thái**, không phải game vẽ liên tục.

Nguyên tắc cốt lõi:

* State machine rõ ràng
* Turn rotation chính xác
* Action luôn bị ràng buộc bởi luật
* UI chỉ phản ánh state, không điều khiển logic

> Logic đúng → UI tự nhiên sẽ đúng.

---

## 3. Kiến trúc thư mục đề xuất

```
/poker-game
│
├── index.html
├── css/
│   ├── layout.css        # bàn chơi, vị trí ghế
│   ├── cards.css         # lá bài, úp/ngửa
│   ├── chips.css         # chip, pot
│   └── animation.css     # chia bài, bet
│
├── js/
│   ├── core/
│   │   ├── deck.js       # bộ bài
│   │   ├── player.js     # player data
│   │   ├── game.js       # game state & loop
│   │   └── rules.js      # luật & hand eval (sau)
│   │
│   ├── bot/
│   │   └── randomBot.js  # bot hành động ngẫu nhiên
│   │
│   ├── ui/
│   │   ├── tableUI.js
│   │   ├── cardUI.js
│   │   └── actionUI.js
│   │
│   └── main.js
```

---

## 4. Các thành phần cốt lõi

### 4.1 Player

Player chỉ giữ **trạng thái**, không chứa logic.

```js
class Player {
  constructor(id, chips, isBot = false) {
    this.id = id;
    this.chips = chips;
    this.cards = [];
    this.currentBet = 0;
    this.status = 'active'; // active | fold | allin | out
    this.isBot = isBot;
  }
}
```

---

### 4.2 Deck (Bộ bài)

Deck hoàn toàn độc lập với UI.

```js
class Deck {
  constructor() {
    this.cards = [];
    const suits = ['H','D','C','S'];
    const values = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'];
    for (let s of suits)
      for (let v of values)
        this.cards.push(v + s);
  }

  shuffle() {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }

  draw() {
    return this.cards.pop();
  }
}
```

---

## 5. Game State Machine

### 5.1 Các state chuẩn

```js
const GAME_STATE = {
  WAITING: 'waiting',
  PREFLOP: 'preflop',
  FLOP: 'flop',
  TURN: 'turn',
  RIVER: 'river',
  SHOWDOWN: 'showdown'
};
```

Poker luôn đi theo thứ tự trên, không phá vỡ.

---

### 5.2 Game Object

```js
class Game {
  constructor(players) {
    this.players = players;
    this.deck = new Deck();
    this.communityCards = [];
    this.pot = 0;

    this.state = GAME_STATE.WAITING;
    this.currentPlayerIndex = 0;
    this.currentBet = 0;
    this.minRaise = 10;
  }
}
```

---

## 6. Turn rotation

Chỉ xoay lượt giữa các player **còn active**.

```js
nextPlayer() {
  do {
    this.currentPlayerIndex =
      (this.currentPlayerIndex + 1) % this.players.length;
  } while (this.players[this.currentPlayerIndex].status !== 'active');
}
```

---

## 7. Action hợp lệ theo luật

```js
getValidActions(player) {
  if (player.status !== 'active') return [];

  const actions = [];

  if (player.currentBet === this.currentBet) {
    actions.push('check');
  } else {
    actions.push('call', 'fold');
  }

  if (player.chips > this.currentBet - player.currentBet + this.minRaise) {
    actions.push('raise');
  }

  return actions;
}
```

UI chỉ hiển thị các action này.

---

## 8. Áp dụng action

```js
applyAction(player, action, amount = 0) {
  switch (action) {
    case 'fold':
      player.status = 'fold';
      break;

    case 'call': {
      const diff = this.currentBet - player.currentBet;
      player.chips -= diff;
      player.currentBet += diff;
      this.pot += diff;
      break;
    }

    case 'check':
      break;

    case 'raise': {
      const diff = this.currentBet - player.currentBet + amount;
      player.chips -= diff;
      player.currentBet += diff;
      this.currentBet = player.currentBet;
      this.pot += diff;
      break;
    }
  }
}
```

---

## 9. Kết thúc vòng betting

```js
isBettingRoundComplete() {
  return this.players.every(p =>
    p.status !== 'active' || p.currentBet === this.currentBet
  );
}
```

Reset bet khi sang round mới:

```js
resetBets() {
  this.currentBet = 0;
  this.players.forEach(p => p.currentBet = 0);
}
```

---

## 10. Chuyển state & chia bài chung

```js
advanceState() {
  this.resetBets();

  switch (this.state) {
    case GAME_STATE.PREFLOP:
      this.communityCards.push(
        this.deck.draw(),
        this.deck.draw(),
        this.deck.draw()
      );
      this.state = GAME_STATE.FLOP;
      break;

    case GAME_STATE.FLOP:
      this.communityCards.push(this.deck.draw());
      this.state = GAME_STATE.TURN;
      break;

    case GAME_STATE.TURN:
      this.communityCards.push(this.deck.draw());
      this.state = GAME_STATE.RIVER;
      break;

    case GAME_STATE.RIVER:
      this.state = GAME_STATE.SHOWDOWN;
      break;
  }
}
```

---

## 11. Bot hành động ngẫu nhiên

### 11.1 Weight mặc định

```js
const ACTION_WEIGHTS = {
  fold: 1,
  check: 4,
  call: 3,
  raise: 2
};
```

### 11.2 Bot quyết định

```js
function botDecide(player, game) {
  const actions = game.getValidActions(player);
  const pool = [];

  actions.forEach(a => {
    const w = ACTION_WEIGHTS[a] || 1;
    for (let i = 0; i < w; i++) pool.push(a);
  });

  return pool[Math.floor(Math.random() * pool.length)];
}
```

Bot nên có delay để tạo cảm giác thật.

---

## 12. Game Loop tổng quát

```js
gameLoop() {
  const player = this.players[this.currentPlayerIndex];

  if (player.isBot) {
    setTimeout(() => {
      const action = botDecide(player, this);
      this.applyAction(player, action);
      this.afterAction();
    }, 600 + Math.random() * 800);
  } else {
    showActionUI(player);
  }
}
```

---

## 13. Lộ trình triển khai khuyến nghị

1. Game state + turn chạy đúng (chưa UI)
2. Bot random chơi trọn ván
3. Gắn UI DOM + CSS
4. Thêm animation
5. Sau cùng mới làm hand evaluation

---

## 14. Kết luận

Dự án poker này được xây dựng theo hướng:

* Cổ điển
* Chuẩn luật
* Ít nợ kỹ thuật

Không cần AI phức tạp, không cần canvas. Chỉ cần **state đúng – luật đúng – nhịp chơi ổn**, game poker sẽ đứng vững lâu dài.

---

**Giữ nhịp chậm, làm chắc tay, poker là game của trật tự.**
