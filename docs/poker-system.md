# Poker System Documentation

## 📋 Tổng quan

Hệ thống Poker Game được xây dựng theo kiến trúc modular với 5 module chính, tuân thủ quy tắc Texas Hold'em Poker. Hệ thống sử dụng State Machine để quản lý luồng game và Weighted Random Algorithm cho AI của bot.

## 🏗️ Kiến trúc Module

```
┌─────────────────────────────────────────────────────┐
│                   poker.js (Main)                   │
│              Game Orchestrator & Controller          │
└─────────────────┬───────────────────────────────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
┌───────▼─────┐    ┌────────▼──────┐
│   GameUI    │    │   PokerGame   │
│  (Module 5) │    │   (Module 2)  │
└─────────────┘    └────┬──────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
┌───────▼────┐  ┌───────▼────┐  ┌──────▼──────┐
│   Deck     │  │   Player   │  │ handEvaluator│
│ (Module 1) │  │ (Module 1) │  │  (Module 3)  │
└────────────┘  └────────────┘  └──────────────┘
                                        │
                                ┌───────▼─────┐
                                │   Bot AI    │
                                │  (Module 4) │
                                └─────────────┘
```

---

## 🎮 Module 1: Core Models (Deck & Player)

### 📦 deck.js

**Mục đích:** Quản lý bộ bài 52 lá và các thao tác với bài

**Cấu trúc dữ liệu:**
```javascript
{
  value: 'A' | 'K' | 'Q' | 'J' | '10' | '9' | ... | '2',
  suit: '♥' | '♦' | '♣' | '♠',
  id: 'A♥' | 'K♠' | ...
}
```

**Chức năng chính:**
- `shuffle()` - Xáo bài sử dụng Fisher-Yates algorithm
- `draw()` - Rút 1 lá bài từ đỉnh deck
- `drawMultiple(n)` - Rút n lá bài
- `getCardDisplay(card)` - Hiển thị bài dạng emoji/text
- `getCardValue(card)` - Trả về giá trị số (2-14, Ace = 14)

---

### 👤 player.js

**Mục đích:** Quản lý trạng thái người chơi (không chứa game logic)

**PLAYER_STATUS enum:**
```javascript
ACTIVE    // Đang chơi bình thường
FOLD      // Đã bỏ bài
ALLIN     // Đã all-in
OUT       // Hết tiền
WAITING   // Chờ ván mới
```

**Properties chính:**
```javascript
{
  id: string,           // Unique ID
  name: string,         // Tên hiển thị
  chips: number,        // Số chip hiện tại
  cards: Card[],        // 2 lá bài hole cards
  currentBet: number,   // Số tiền đã đặt trong round hiện tại
  totalBet: number,     // Tổng số tiền đã đặt trong hand
  status: PLAYER_STATUS,
  position: number,     // Vị trí tại bàn (0-7)
  isBot: boolean,
  botData: object       // Dữ liệu bot (personality, behaviorWeights)
}
```

**Phương thức betting:**
- `bet(amount)` - Đặt cược số tiền
- `fold()` - Bỏ bài
- `check()` - Check (không đặt thêm)
- `call(amount)` - Call theo mức cược hiện tại
- `raise(amount)` - Raise (tăng cược)
- `allIn()` - All-in toàn bộ chip

**Phương thức kiểm tra:**
- `canAct()` - Có thể hành động không?
- `hasFolded()` - Đã fold chưa?
- `isAllIn()` - Đã all-in chưa?
- `isInHand()` - Còn trong ván không?

---

## 🎰 Module 2: Game State Machine (gameLogic.js)

### State Flow Diagram

```
WAITING ──┐
          │
          ▼
      PREFLOP (Deal 2 cards to each player)
          │
          ├─► Post Small Blind (SB)
          ├─► Post Big Blind (BB)
          └─► Betting Round 1
          │
          ▼
        FLOP (Deal 3 community cards)
          │
          └─► Betting Round 2
          │
          ▼
        TURN (Deal 1 community card)
          │
          └─► Betting Round 3
          │
          ▼
        RIVER (Deal 1 community card)
          │
          └─► Betting Round 4
          │
          ▼
      SHOWDOWN (Compare hands)
          │
          └─► Award pot to winner(s)
          │
          ▼
        ENDED
```

### GAME_STATE enum
```javascript
WAITING    // Chờ bắt đầu
PREFLOP    // Sau khi deal hole cards
FLOP       // Deal 3 lá community
TURN       // Deal lá thứ 4
RIVER      // Deal lá thứ 5
SHOWDOWN   // So bài
ENDED      // Kết thúc ván
```

### ACTIONS enum
```javascript
FOLD       // Bỏ bài
CHECK      // Check (không đặt)
CALL       // Call theo mức cược
RAISE      // Tăng cược
ALL_IN     // All-in
```

### PokerGame Class

**Properties:**
```javascript
{
  players: Player[],        // Danh sách người chơi
  deck: Deck,               // Bộ bài
  communityCards: Card[],   // Bài chung
  pot: number,              // Tổng pot
  currentBet: number,       // Mức cược hiện tại
  minRaise: number,         // Mức raise tối thiểu
  state: GAME_STATE,        // Trạng thái game
  dealerPosition: number,   // Vị trí dealer button
  currentPlayerIndex: number, // Vị trí người chơi hiện tại
  smallBlind: number,       // Small blind
  bigBlind: number          // Big blind
}
```

**Luồng xử lý chính:**

1. **startNewHand()**
   - Xáo bài mới
   - Reset trạng thái tất cả players
   - Di chuyển dealer button
   - Post blinds (SB, BB)
   - Deal 2 hole cards cho mỗi người
   - Chuyển sang PREFLOP state

2. **postBlinds()**
   - Tìm vị trí SB (dealer + 1)
   - Tìm vị trí BB (dealer + 2)
   - Force SB player bet smallBlind
   - Force BB player bet bigBlind
   - Cập nhật pot

3. **getValidActions(player)**
   - Check điều kiện của player
   - Trả về array các action hợp lệ
   - Logic:
     - Nếu chips = 0 → []
     - Nếu currentBet = 0 → [CHECK, RAISE, ALL_IN]
     - Nếu currentBet > 0 → [FOLD, CALL, RAISE, ALL_IN]
     - Nếu chips < callAmount → chỉ [FOLD, ALL_IN]

4. **applyAction(player, action, amount)**
   - Thực thi action của player
   - Cập nhật chips, currentBet, totalBet
   - Cập nhật pot
   - Trigger callback `onPlayerAction`
   - Return true/false

5. **isBettingRoundComplete()**
   - Kiểm tra tất cả players đã act ít nhất 1 lần
   - Kiểm tra tất cả players có currentBet bằng nhau (hoặc fold/allin)
   - Return true nếu round hoàn thành

6. **advanceState()**
   - Burn 1 lá (đốt bài)
   - Deal community cards theo state:
     - PREFLOP → FLOP (3 lá)
     - FLOP → TURN (1 lá)
     - TURN → RIVER (1 lá)
     - RIVER → SHOWDOWN
   - Reset betting round (currentBet = 0)
   - Trigger callback `onStateChange`

7. **shouldEndEarly()**
   - Check nếu chỉ còn 1 người không fold
   - Return true → end game sớm

8. **awardPot(winner)**
   - Cộng pot vào chips của winner
   - Reset pot = 0

### Event Callbacks

```javascript
pokerGame.onStateChange = (state, gameState) => {
  // Được gọi khi state thay đổi (FLOP, TURN, RIVER, etc.)
};

pokerGame.onPlayerAction = (player, action, amount) => {
  // Được gọi khi player thực hiện action
};

pokerGame.onPotUpdate = (pot) => {
  // Được gọi khi pot thay đổi
};
```

---

## 🃏 Module 3: Hand Evaluator (handEvaluator.js)

### HAND_RANK enum (Theo thứ tự từ cao đến thấp)

```javascript
ROYAL_FLUSH      10  // A-K-Q-J-10 cùng chất
STRAIGHT_FLUSH    9  // 5 lá liên tiếp cùng chất
FOUR_OF_KIND      8  // 4 lá cùng giá trị
FULL_HOUSE        7  // 3 + 2 cùng giá trị
FLUSH             6  // 5 lá cùng chất
STRAIGHT          5  // 5 lá liên tiếp
THREE_OF_KIND     4  // 3 lá cùng giá trị
TWO_PAIR          3  // 2 cặp
ONE_PAIR          2  // 1 cặp
HIGH_CARD         1  // Lá cao nhất
```

### Luồng đánh giá bài

```
7 cards (2 hole + 5 community)
          │
          ▼
   Generate all C(7,5) = 21 combinations
          │
          ▼
   Evaluate each 5-card hand
          │
          ├─► Check Royal Flush
          ├─► Check Straight Flush
          ├─► Check Four of Kind
          ├─► Check Full House
          ├─► Check Flush
          ├─► Check Straight (support Wheel: A-2-3-4-5)
          ├─► Check Three of Kind
          ├─► Check Two Pair
          ├─► Check One Pair
          └─► High Card
          │
          ▼
   Return best hand {rank, values, description}
```

### Hàm chính

1. **evaluateHand(holeCards, communityCards)**
   - Input: 2 hole cards + 5 community cards
   - Tìm bài tốt nhất từ 7 lá
   - Return: `{rank, values, description}`

2. **compareHands(hand1, hand2)**
   - So sánh 2 bài
   - Return: 1 (hand1 win), -1 (hand2 win), 0 (tie)
   - Logic:
     1. So rank trước
     2. Nếu rank bằng nhau → so values array

3. **determineWinners(playerHands)**
   - Input: Array của `{player, hand}`
   - Tìm tất cả winners (có thể nhiều người nếu hòa)
   - Return: Array winners

### Special Cases

**Wheel (Straight đặc biệt):**
- A-2-3-4-5 được tính là Straight
- Ace trong trường hợp này có giá trị = 1 (thấp nhất)

**Kicker:**
- Khi so sánh bài cùng rank, values array chứa kickers
- Ví dụ: One Pair A với kicker K-Q-J > One Pair A với kicker K-Q-9

---

## 🤖 Module 4: Bot AI (botAI.js)

### Weighted Random Algorithm

Bot sử dụng thuật toán chọn ngẫu nhiên có trọng số dựa trên:
- **Personality** (từ botStorage.js)
- **Game Context** (pot size, bet size, community cards)

### Bot Personalities

```javascript
aggressive: {
  fold: 1,
  check: 2,
  call: 3,
  raise: 5,    // Thích raise
  allin: 2
}

passive: {
  fold: 3,     // Thích fold
  check: 5,    // Thích check
  call: 4,
  raise: 1,
  allin: 1
}

balanced: {
  fold: 2,
  check: 4,
  call: 3,
  raise: 2,
  allin: 1
}

reckless: {
  fold: 1,
  check: 1,
  call: 2,
  raise: 4,
  allin: 3     // Thích all-in
}
```

### Luồng quyết định

```
Bot Turn
    │
    ▼
Get validActions from game
    │
    ▼
Calculate action weights based on:
    ├─► Base weights from personality
    ├─► Pot size adjustment
    ├─► Bet size adjustment
    └─► Community cards count
    │
    ▼
Build action pool (repeat each action by weight)
Example: [FOLD, CALL, CALL, CALL, RAISE, RAISE]
    │
    ▼
Random pick from pool
    │
    ▼
If RAISE → Calculate raise amount by personality:
    ├─► aggressive: 70-100% pot
    ├─► passive: 20-50% pot
    ├─► balanced: 40-80% pot
    └─► reckless: 80-120% pot
    │
    ▼
Apply natural delay (600-1400ms * personality modifier)
    │
    ▼
Return {action, amount}
```

### Hàm chính

1. **botDecision(player, validActions, gameContext)**
   - Tính toán action tốt nhất cho bot
   - Return: `{action, amount}`

2. **calculateRaiseAmount(player, gameContext)**
   - Tính số tiền raise dựa trên personality
   - Ensure không vượt quá chips

3. **getBotDelay(player)**
   - Tính thời gian suy nghĩ tự nhiên
   - aggressive: nhanh (0.7x)
   - passive: chậm (1.3x)

4. **botActionWithDelay(player, validActions, gameContext)**
   - Async function
   - Await delay → decision → return

5. **adjustWeights(baseWeights, gameContext)**
   - Điều chỉnh trọng số động:
     - Pot lớn → tăng fold, giảm raise
     - Bet lớn → tăng fold
     - Nhiều community cards → thận trọng hơn

---

## 🎨 Module 5: UI Integration (gameUI.js & poker.js)

### GameUI Class

**Chức năng:** Controller layer giữa game logic và DOM

**Phương thức chính:**

1. **updatePlayerSeat(player, seatNumber)**
   - Cập nhật thông tin player: name, chips, lastAction
   - Apply CSS classes: active, folded, allin

2. **updatePlayerCards(player, seatNumber)**
   - Hiển thị bài:
     - Seat 5 (player): show actual cards
     - Bots: show card-back

3. **highlightCurrentPlayer(seatNumber)**
   - Thêm class `current-turn` cho người chơi hiện tại

4. **updateCommunityCards(cards)**
   - Hiển thị bài chung với getCardDisplay()
   - Thêm class `revealed` khi deal

5. **updatePot(amount)**
   - Cập nhật số tiền pot

6. **updateRoundName(state)**
   - Hiển thị tên round: "Pre-Flop", "Flop", "Turn", "River", "Showdown"

7. **updateActionButtons(validActions, callAmount)**
   - Enable/disable buttons theo validActions
   - Cập nhật text "Call $X"

8. **showActionMessage(playerName, action, amount)**
   - Hiển thị message action của player

9. **showWinnerAnnouncement(winner, pot, handDescription)**
   - Hiển thị thông báo người thắng

10. **resetForNewHand()**
    - Reset UI cho ván mới

---

### poker.js (Main Controller)

**Global Variables:**
```javascript
let selectedBots = [];      // Bots được chọn
let pokerGame = null;       // Instance PokerGame
let gameUI = null;          // Instance GameUI
let currentUser = null;     // User hiện tại
```

**Luồng chính:**

```
Page Load
    │
    ▼
initPokerGame()
    ├─► Load user from localStorage
    ├─► Update player info in seat 5
    └─► Start matching simulation (3s)
    │
    ▼
simulateMatching()
    ├─► Animate progress bar 0-100%
    └─► Parallel: setupBots()
    │
    ▼
setupBots()
    ├─► Initialize botStorage if needed
    └─► Get 6-8 random bots
    │
    ▼
hideLoadingOverlay()
    ├─► Hide loading screen
    ├─► Render bots into seats 1-4, 6-8
    └─► Call initializePokerGame()
    │
    ▼
initializePokerGame()
    ├─► Create Player object for user (seat 5)
    ├─► Create Player objects for bots
    ├─► Sort players by position
    ├─► Create PokerGame instance
    ├─► Create GameUI instance
    ├─► Wire event callbacks
    └─► Delay 1s → startNewHand()
    │
    ▼
startNewHand()
    ├─► Reset UI
    ├─► Call pokerGame.startNewHand()
    ├─► Update all player seats
    ├─► Update community cards
    └─► Start gameLoop()
    │
    ▼
gameLoop() ◄──────────┐
    │                  │
    ├─► Check if betting round complete
    │   ├─► Yes: Check shouldEndEarly()
    │   │   ├─► Yes: handleEarlyEnd()
    │   │   └─► No: advanceState()
    │   │       └─► Continue loop ──┘
    │   │
    │   └─► No: Continue to current player
    │
    ├─► Get current player
    ├─► Check if can act
    │   └─► No: nextPlayer() → loop ──┘
    │
    ├─► Get valid actions
    │
    ├─► If HUMAN:
    │   ├─► Highlight player
    │   ├─► Enable action buttons
    │   └─► Wait for handleAction()
    │
    └─► If BOT:
        ├─► Call botActionWithDelay()
        ├─► Apply action to game
        ├─► Update UI
        ├─► nextPlayer()
        └─► Continue loop (500ms delay) ──┘
```

**Event Handlers:**

1. **handleAction(action)**
   - Xử lý action từ player
   - Validate action
   - Apply to game
   - Update UI
   - Continue gameLoop()

2. **handleShowdown()**
   - Evaluate tất cả hands
   - Determine winners
   - Show winner announcement
   - Award pot
   - Delay 5s → startNewHand()

3. **handleEarlyEnd()**
   - Get early winner
   - Award pot
   - Show announcement
   - Delay 3s → startNewHand()

---

## 🔄 Complete Game Flow Example

### Ví dụ: 1 Hand đầy đủ

```
[WAITING]
│
├─► startNewHand()
│   ├─► Shuffle deck (52 cards)
│   ├─► Reset players (status = ACTIVE, cards = [], currentBet = 0)
│   ├─► Move dealer button (dealer = 0 → 1 → 2 ...)
│   ├─► Post blinds:
│   │   ├─► Player 1 (SB): bet(5)  → pot = 5
│   │   └─► Player 2 (BB): bet(10) → pot = 15
│   ├─► Deal hole cards:
│   │   ├─► Player 0: [A♥, K♠]
│   │   ├─► Player 1: [Q♦, J♣]
│   │   └─► ... (8 players total)
│   └─► State = PREFLOP
│
▼
[PREFLOP] - Betting Round 1
│
├─► gameLoop()
│   ├─► Current: Player 3 (after BB)
│   ├─► Valid actions: [FOLD, CALL, RAISE, ALL_IN]
│   ├─► Bot decision → CALL(10)
│   ├─► pot = 25
│   └─► nextPlayer() → Player 4
│
├─► gameLoop()
│   ├─► Current: Player 4
│   ├─► Valid actions: [FOLD, CALL, RAISE, ALL_IN]
│   ├─► Bot decision → RAISE(30)
│   ├─► pot = 55, currentBet = 30
│   └─► nextPlayer() → Player 5
│
├─► gameLoop()
│   ├─► Current: Player 5 (HUMAN)
│   ├─► Valid actions: [FOLD, CALL, RAISE, ALL_IN]
│   ├─► Enable buttons
│   └─► Wait for player input...
│
├─► Player clicks "Call"
│   ├─► handleAction(CALL)
│   ├─► player.call(30) → pot = 85
│   └─► Continue loop
│
├─► ... (other players act)
│
├─► isBettingRoundComplete() → true
│   ├─► All players acted
│   └─► All currentBet = 30 (or folded/allin)
│
└─► advanceState()
    ├─► Burn 1 card
    ├─► Deal 3 cards → [9♥, 8♦, 7♣]
    ├─► State = FLOP
    └─► Reset betting (currentBet = 0)
│
▼
[FLOP] - Betting Round 2
│
├─► gameLoop()
│   ├─► Current: Player 1 (after dealer)
│   ├─► Valid actions: [CHECK, RAISE, ALL_IN]
│   ├─► Bot decision → CHECK
│   └─► nextPlayer()
│
├─► ... (betting round)
│
├─► isBettingRoundComplete() → true
│
└─► advanceState()
    ├─► Burn 1 card
    ├─► Deal 1 card → [9♥, 8♦, 7♣, 6♠]
    ├─► State = TURN
    └─► Reset betting
│
▼
[TURN] - Betting Round 3
│
├─► ... (betting round)
│
└─► advanceState()
    ├─► Burn 1 card
    ├─► Deal 1 card → [9♥, 8♦, 7♣, 6♠, 5♥]
    ├─► State = RIVER
    └─► Reset betting
│
▼
[RIVER] - Betting Round 4
│
├─► ... (final betting round)
│
├─► isBettingRoundComplete() → true
│
└─► advanceState()
    └─► State = SHOWDOWN
│
▼
[SHOWDOWN]
│
├─► handleShowdown()
│   │
│   ├─► Evaluate hands:
│   │   ├─► Player 0: [A♥, K♠] + community = Straight (9-8-7-6-5)
│   │   ├─► Player 1: [Q♦, J♣] + community = High Card (Q)
│   │   └─► Player 5: [10♦, J♥] + community = Straight (J-10-9-8-7)
│   │
│   ├─► determineWinners()
│   │   └─► Winner: Player 5 (Straight J-high > Straight 9-high)
│   │
│   ├─► awardPot(Player 5)
│   │   ├─► Player 5 chips += 85
│   │   └─► pot = 0
│   │
│   ├─► showWinnerAnnouncement()
│   │   └─► Display: "Player 5 wins $85 with Straight (J high)"
│   │
│   └─► Delay 5s → startNewHand()
│
▼
[ENDED]
│
└─► Back to WAITING → startNewHand() → repeat cycle
```

---

## 📊 Data Structures Summary

### Player Object
```javascript
{
  id: "bot-001",
  name: "Alice",
  chips: 1000,
  cards: [{value: 'A', suit: '♥'}, {value: 'K', suit: '♠'}],
  currentBet: 30,
  totalBet: 50,
  status: "ACTIVE",
  position: 0,
  seatNumber: 1,
  isBot: true,
  botData: {
    personality: "aggressive",
    behaviorWeights: {...}
  }
}
```

### Hand Evaluation Result
```javascript
{
  rank: 5,                           // STRAIGHT
  values: [11, 10, 9, 8, 7],        // J-10-9-8-7
  description: "Straight (J high)"
}
```

### Game State
```javascript
{
  players: [...],
  deck: Deck,
  communityCards: [Card, Card, Card, Card, Card],
  pot: 150,
  currentBet: 30,
  minRaise: 60,
  state: "RIVER",
  dealerPosition: 2,
  currentPlayerIndex: 3,
  smallBlind: 5,
  bigBlind: 10
}
```

---

## 🎯 Key Features

### 1. State Machine
- Strict state flow: WAITING → PREFLOP → FLOP → TURN → RIVER → SHOWDOWN → ENDED
- Automatic state advancement khi betting round complete
- Support early end (chỉ 1 người không fold)

### 2. Betting Logic
- Validate actions theo currentBet và chips
- Support tất cả actions: FOLD, CHECK, CALL, RAISE, ALL_IN
- Tự động skip folded/allin players
- Minimum raise enforcement

### 3. Hand Evaluation
- Hỗ trợ đầy đủ 10 loại bài
- So sánh chính xác với kicker
- Support Wheel (A-2-3-4-5 Straight)
- Tìm best hand từ 7 lá (C(7,5) = 21 combinations)

### 4. Bot AI
- Weighted random decision making
- 4 personality types với behavior khác nhau
- Dynamic weight adjustment theo game context
- Natural delay (600-1400ms) cho realistic gameplay

### 5. UI Integration
- Clean separation: GameUI handles DOM, poker.js orchestrates
- Event-driven updates (onStateChange, onPlayerAction, onPotUpdate)
- Real-time chip/pot updates
- Action button validation
- Winner announcement với hand description

---

## 🔧 Configuration

### Game Settings (poker.js)
```javascript
{
  smallBlind: 5,
  bigBlind: 10,
  minPlayers: 2,
  maxPlayers: 8,
  startingChips: 1000
}
```

### Bot Settings (botStorage.js)
```javascript
{
  defaultBehaviorWeights: {
    fold: 1,
    check: 4,
    call: 3,
    raise: 2,
    allin: 1
  },
  personalities: ['aggressive', 'passive', 'balanced', 'reckless']
}
```

---

## 🚀 Extension Points

### Để mở rộng hệ thống:

1. **Thêm Game Variants:**
   - Omaha: Deal 4 hole cards thay vì 2
   - Modify `evaluateHand()` để chọn 2/4 hole cards

2. **Side Pots:**
   - Implement `calculateSidePots()` trong gameLogic.js
   - Handle multiple winners từng pot

3. **Tournament Mode:**
   - Add blind increase logic
   - Implement player elimination
   - Track tournament rankings

4. **Advanced Bot AI:**
   - Thêm hand strength calculator
   - Implement pot odds calculation
   - Pattern recognition cho opponent behavior

5. **Animations:**
   - Card dealing animation
   - Chip movement animation
   - Winner celebration effects

6. **Statistics:**
   - Track player stats (hands won, biggest pot, etc.)
   - Hand history viewer
   - Replay system

---

## 📝 Testing Checklist

- [x] Deck shuffle randomness
- [x] Player betting methods
- [x] State transitions (all 7 states)
- [x] Hand evaluation (all 10 hand types)
- [x] Bot decision making (all personalities)
- [x] Blind posting correctness
- [x] Dealer button rotation
- [x] Pot calculation accuracy
- [x] Action validation
- [x] Early end detection
- [x] Showdown winner determination
- [x] UI updates sync với game state
- [x] Event callbacks firing correctly

---

## 🎓 Lessons Learned

### Architectural Decisions

1. **Separation of Concerns:**
   - Player class: State only, no logic
   - PokerGame: Logic only, no UI
   - GameUI: UI only, no game rules
   - Result: Clean, testable, maintainable code

2. **Event-Driven Architecture:**
   - Callbacks thay vì tight coupling
   - Easy to add new UI features without touching game logic

3. **State Machine Pattern:**
   - Enforces correct game flow
   - Prevents invalid state transitions
   - Easy to debug game progression

4. **Weighted Random AI:**
   - Simpler than complex AI
   - More predictable behavior
   - Easy to balance personalities
   - Sufficient for engaging gameplay

---

## 📚 References

- [Texas Hold'em Rules](poker-gameplay.md)
- [Project Plan](plan.md)
- [Database Overview](database-overview.md)

---

**Version:** 1.0  
**Last Updated:** January 19, 2026  
**Author:** Game Social Development Team
