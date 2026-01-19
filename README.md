# Game Poker Texas Hold'em - Web Offline

> Game Poker Texas Hold'em chơi offline với bot, giao diện web thuần (HTML/CSS/JS ES6), không phụ thuộc server.

---

## 📋 Tổng quan dự án

Dự án này là một **game poker Texas Hold'em** chạy hoàn toàn trên trình duyệt, cho phép người chơi:

- Đăng ký/đăng nhập tài khoản
- Chơi poker với bot thông minh
- Quản lý số dư tài khoản
- Điểm danh hàng ngày để nhận thưởng
- Trải nghiệm game poker chân thực với luật chơi chuẩn

---

## ✨ Tính năng chính

### 🎮 Gameplay
- **Texas Hold'em Poker** đầy đủ: Pre-flop → Flop → Turn → River → Showdown
- So bài chính xác theo thứ tự: Royal Flush → Straight Flush → ... → High Card
- Hệ thống cược: Check, Bet, Call, Raise, Fold, All-in
- Animation mượt mà cho các hành động: chia bài, cược, thu pot

### 👤 Hệ thống User
- **Đăng ký/Đăng nhập** với LocalStorage
- Số dư ban đầu: **$100**
- **Điểm danh hàng ngày**: nhận thêm **$50**
- Lưu trữ lịch sử, thống kê người chơi

### 🤖 Hệ thống Bot
- **25 bot** với tài khoản và số dư riêng
- Bot hành động có trọng số (fold/check/call/raise)
- Mỗi trận đấu: **6-10 bot** được chọn ngẫu nhiên
- Số tiền bot **thay đổi thực tế** sau mỗi ván

### 💾 Lưu trữ dữ liệu
- **LocalStorage** làm database
- Lưu trữ: user data, bot data, game history
- Không cần server backend

---

## 🛠️ Công nghệ sử dụng

| Công nghệ | Mục đích |
|-----------|----------|
| **HTML5** | Cấu trúc trang |
| **Bootstrap 5** | Framework UI responsive |
| **CSS3** | Giao diện, animation, custom colors |
| **Font Awesome 6** | Icon set cho UI |
| **JavaScript ES6** | Logic game, bot AI |
| **LocalStorage** | Lưu trữ dữ liệu |
| **No Canvas** | UI thuần DOM + CSS |

---

## 📁 Cấu trúc dự án

```
/game-social
│
├── index.html                  # Landing page / Portal (✅ Done)
├── login.html                  # Trang đăng nhập
├── signup.html                 # Trang đăng ký
├── game.html                   # Trang chọn trò chơi (✅ Done)
├── poker.html                  # Màn hình chơi poker (TODO)
├── horse-racing.html           # Màn hình đua ngựa (TODO)
│
├── css/
│   ├── variables.css           # CSS custom properties (colors) (✅ Done)
│   ├── landing.css             # Landing page style (✅ Done)
│   ├── auth.css                # Đăng nhập/đăng ký (✅ Done)
│   ├── game.css                # Game selection page (✅ Done)
│   ├── layout.css              # Bố cục bàn poker (TODO)
│   ├── cards.css               # Lá bài (úp/ngửa) (TODO)
│   ├── chips.css               # Chip, pot (TODO)
│   └── animation.css           # Animation chia bài, bet (TODO)
│
├── js/
│   ├── game.js                 # Game page logic (✅ Done)
│   ├── sidebar.js              # Sidebar navigation (✅ Done)
│   │
│   ├── core/
│   │   ├── deck.js             # Bộ bài 52 lá (TODO)
│   │   ├── player.js           # Player model (TODO)
│   │   ├── gameLogic.js        # Game state machine (TODO)
│   │   ├── rules.js            # Luật poker, so bài (TODO)
│   │   └── handEvaluator.js    # Đánh giá bộ bài (TODO)
│   │
│   ├── bot/
│   │   ├── botManager.js       # Quản lý bot (TODO)
│   │   └── botAI.js            # Logic hành động bot (TODO)
│   │
│   ├── storage/
│   │   ├── userStorage.js      # CRUD user (✅ Done)
│   │   ├── botStorage.js       # CRUD bot (✅ Done)
│   │   └── gameStorage.js      # Lưu lịch sử game (TODO)
│   │
│   ├── ui/
│   │   ├── tableUI.js          # Giao diện bàn chơi (TODO)
│   │   ├── cardUI.js           # Hiển thị bài (TODO)
│   │   ├── actionUI.js         # Nút action (bet, fold...) (TODO)
│   │   └── notificationUI.js   # Thông báo, popup (TODO)
│   │
│   └── main.js                 # Entry point
│
├── static/
│   ├── img/
│   │   ├── banner1.jpg         # Banner landing page (✅ Done)
│   │   ├── banner2.jpg         # Banner game page (✅ Done)
│   │   ├── banner-poker.jpg    # Banner poker game (✅ Done)
│   │   ├── banner-horse-racing.jpg # Banner horse racing (✅ Done)
│   │   └── icon/
│   │       ├── poker.png       # Icon poker game (✅ Done)
│   │       └── horse-racing.png # Icon horse racing (✅ Done)
│   │
│   ├── json/
│   │   └── bots.json           # Data 30 bots (✅ Done)
│   │
│   └── avatars/
│       ├── default.png         # Avatar mặc định
│       ├── bot_001.png         # Avatar bot (theo ID)
│       ├── bot_002.png
│       └── ...
│
├── docs/
│   ├── plan.md                 # Kế hoạch triển khai
│   ├── poker-gameplay.md       # Luật chơi poker
│   └── database-overview.md    # Cấu trúc database
│
└── README.md                   # File này
```

---

## 🎯 Luật chơi

Game tuân thủ **luật Texas Hold'em chuẩn**:

### Thứ tự bài (mạnh → yếu)
1. **Royal Flush** - Thùng phá sảnh lớn (10-J-Q-K-A cùng chất)
2. **Straight Flush** - Sảnh đồng chất
3. **Four of a Kind** - Tứ quý
4. **Full House** - Cù lũ
5. **Flush** - Thùng
6. **Straight** - Sảnh
7. **Three of a Kind** - Sám cô
8. **Two Pair** - Hai đôi
9. **One Pair** - Một đôi
10. **High Card** - Bài cao

Chi tiết luật chơi xem tại: [poker-gameplay.md](docs/poker-gameplay.md)

---

## 🎨 Color Palette

Game sử dụng bảng màu tối, sang trọng phù hợp với không khí poker:

### Màu chủ đạo

| Color | Hex | Usage |
|-------|-----|-------|
| **Dark Purple** | `#37353E` | Background chính, bàn chơi |
| **Dark Gray** | `#44444E` | Card back, panel |
| **Brown** | `#715A5A` | Accent, border |
| **Light Gray** | `#D3DAD9` | Text, icon |

### Màu phụ (Buttons & Actions)

| Color | Hex | Usage |
|-------|-----|-------|
| **Success** | `#4CAF50` | Call, Check button |
| **Danger** | `#DC3545` | Fold, All-in button |
| **Warning** | `#FFC107` | Raise button |
| **Info** | `#17A2B8` | Bet button |

### CSS Variables (variables.css)

```css
:root {
  /* Primary Colors */
  --color-primary: #37353E;
  --color-secondary: #44444E;
  --color-accent: #715A5A;
  --color-text: #D3DAD9;
  
  /* Action Colors */
  --color-success: #4CAF50;
  --color-danger: #DC3545;
  --color-warning: #FFC107;
  --color-info: #17A2B8;
  
  /* Gradients */
  --gradient-table: linear-gradient(135deg, #37353E 0%, #44444E 100%);
  --gradient-card: linear-gradient(180deg, #44444E 0%, #37353E 100%);
  
  /* Shadows */
  --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 8px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 8px 16px rgba(0, 0, 0, 0.5);
  
  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
}
```
 (Landing page)
2. Click "Click to Play" để chuyển đến trang login
3. Đăng ký tài khoản mới hoặc đăng nhập
4. Chọn trò chơi từ trang `game.html`
5. Bắt đầu chơi!

### Hoặc chạy với Live Server (khuyến nghị)
```bash
# Nếu dùng VS Code
# Cài extension: Live Server
# Right-click index.html → Open with Live Server
```

### Luồng navigation
```
indeLanding Page (index.html) ✅
- Hero banner với background image (4:3 ratio)
- Logo và brand "Game Social"
- CTA button "Click to Play" → login.html
- 3 features highlight
- Background animation với card suits
- Fully responsive

### Game Selection Page (game.html) ✅
- Hero banner với logo
- 2-column layout (2/3 games + 1/3 sidebar)
- Game cards với:
  - Background image riêng
  - Icon từ static/img/icon/
  - Mô tả game
  - Statistics (số người chơi)
  - Button "Chơi Ngay" → link đến game
- Sidebar navigation với:
  - Active state management
  - User info card (avatar, username, balance)
  - Menu items (Games, Profile, Leaderboard, etc.)
  - Logout functionality
- Responsive (sidebar chuyển lên trên trên mobile)

### Hệ thống tài khoản

#### Đăng ký
- Username (unique)
- Password (mã hóa đơn giản)
- Nhận $100 ban đầu

#### Đăng nhập
- Xác thực username/password
- Tự động login nếu đã đăng nhập trước
- Redirect to game.html sau khi login

#### User Session
- Load từ `poker_userSession` trong LocalStorage
- Display username và balance
- Auto redirect nếu chưa loginệt
2. Đăng ký tài khoản mới hoặc đăng nhập
3. Bắt đầu chơi!

### Hoặc chạy với Live Server (khuyến nghị)
```bash
# Nếu dùng VS Code
# Cài extension: Live Server
# Right-click index.html → Open with Live Server
```

---

## 📊 Tính năng chi tiết

### Hệ thống tài khoản

#### Đăng ký
- Username (unique)
- Password (mã hóa đơn giản)
- Nhận $100 ban đầu

#### Đăng nhập
- Xác thực username/password
- Tự động login nếu đã đăng nhập trước

#### Điểm danh
- Mỗi ngày điểm danh 1 lần
- Nhận $50
- Kiểm tra bằng timestamp

### Hệ thống Bot

#### 25 Bot với đặc điểm:
- Tên ngẫu nhiên (Bot_Alpha, Bot_Bravo, Bot_Charlie...)
- Số dư ban đầu: $80 - $150 (random)
- Tính cách khác nhau: Aggressive, Passive, Balanced

#### Matching:
- Khi bắt đầu game mới
- Chọn ngẫu nhiên 6-10 bot
- Xếp vị trí ngẫu nhiên quanh bàn

### Game Flow

```
START → Blind → Pre-Flop → Flop → Turn → River → Showdown → END
                    ↓        ↓       ↓      ↓         ↓
             Foundation & UI ✅ (Hoàn thành một phần)
- [x] Cấu trúc dự án
- [x] CSS variables (color palette)
- [x] Landing page (index.html)
- [x] Game selection page (game.html)
- [x] Sidebar navigation với active state
- [x] User info display từ LocalStorage
- [x] Responsive design (mobile/tablet

Game sử dụng **LocalStorage** để lưu trữ toàn bộ dữ liệu:

- **Users**: Tài khoản người chơi (username, password, balance, stats)
- **User Session**: Thông tin người dùng đang đăng nhập
- **Bots**: 30 bot với tính cách và balance riêng (load từ JSON)
- **Game History**: Lịch sử các ván đấu

Chi tiết cấu trúc database xem tại: [database-overview.md](docs/database-overview.md)

**Đặc điểm:**
- Dữ liệu lưu cục bộ trên trình duyệt
- Không cần server backend
- Bot data được init từ `static/json/bots.json` lần đầu đăng nhập
- Avatar bot Game UI/UX
- [x] Landing page với hero banner
- [x] Game selection cards với images
- [x] Sidebar navigation system
- [x] User info card
- [ ] Layout bàn poker
- [ ] Card display (úp/ngửa)
- [ ] Chip & pot animation
- [ ] Action buttons (custom colors)
- [ ] Notification system (Toast/Modal)
- [ ] Cấu trúc dự án
- [ ] Setup Bootstrap 5 + Font Awesome 6
- [ ] CSS variables (color palette)
- [ ] Deck + shuffle + deal
- [ ] Player model
- [ ] Game state machine
- [ ] Turn rotation

### Phase 2: Logic Game
- [ ] Betting system (check/bet/call/raise/fold)
- [ ] Hand evaluator (so bài)
- [ ] Pot calculation
- [ ] Side pot (khi có all-in)
- [ ] Winner determination

### Phase 3: Bot System
- [ ] 25 bot với data riêng
- [ ] Bot AI với trọng số
- [ ] Matching system (chọn 6-10 bot)
- [ ] Bot money management

### Phase 4: UI/UX
- [ ] Layout bàn poker (Bootstrap grid)
- [ ] Card display (úp/ngửa)
- [ ] Chip & pot animation
- [ ] Action buttons (Bootstrap + custom colors)
- [ ] Notification system (Toast/Modal)
- [ ] Font Awesome icons integration

### Phase 5: User System
- [ ] Đăng ký/đăng nhập
- [ ] LocalStorage integration
- [ ] Điểm danh hàng ngày
- [ ] Profile & stats

### Phase 6: Polish
- [ ] Sound effects
- [ ] Animation mượt mà
- [ ] Responsive design
- [ ] Bug fixes

---

## 🎨 Nguyên tắc thiết kế

### Code
- **ES6 modules**: import/export
- **Class-based**: OOP rõ ràng
- **State machine**: game state chặt chẽ
- **Separation of concerns**: logic ≠ UI

### UI/UX
- **Bootstrap 5**: responsive grid, components
- **Custom Colors**: CSS variables cho theme riêng
- **Font Awesome 6**: icon system đồng bộ
- **No Canvas**: thuần DOM + CSS
- **Animation CSS**: transition, keyframes
- **Responsive**: chơi được trên mobile/tablet
- **Accessible**: keyboard support, ARIA labels

### Data
- **LocalStorage only**: không server
- **JSON structure**: dễ debug
- **Backup/restore**: export/import data

---

## 📝 Tài liệu tham khảo

- [plan.md](docs/plan.md) - Kế hoạch triển khai chi tiết
- [poker-gameplay.md](docs/poker-gameplay.md) - Luật chơi Texas Hold'em
- [database-overview.md](docs/database-overview.md) - Cấu trúc database LocalStorage

---

## 🤝 Đóng góp

Dự án này là open-source cho mục đích học tập.

---

## 📄 License

MIT License - Tự do sử dụng và chỉnh sửa.

---

## 🎲 Let's Play Poker!

*"Giữ nhịp chậm, làm chắc tay, poker là game của trật tự."*

---

**Version**: 1.0.0  
**Last Update**: January 2026  
**Status**: 🚧 In Development
