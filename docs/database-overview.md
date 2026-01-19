# Database Overview - LocalStorage Structure

Tài liệu này mô tả chi tiết cấu trúc database của Game Poker Texas Hold'em, sử dụng **LocalStorage** làm storage engine.

---

## 📊 Tổng quan

Game sử dụng **LocalStorage API** của trình duyệt để lưu trữ dữ liệu. Mọi dữ liệu được lưu dưới dạng **JSON string** với các keys riêng biệt.

### Ưu điểm
- ✅ Không cần server backend
- ✅ Dữ liệu lưu cục bộ, truy cập nhanh
- ✅ Đơn giản, dễ debug
- ✅ Offline-first architecture

### Nhược điểm
- ⚠️ Giới hạn ~5-10MB tùy trình duyệt
- ⚠️ Dữ liệu có thể bị xóa khi clear cache
- ⚠️ Không sync giữa các thiết bị

---

## 🗄️ Storage Keys

Game sử dụng các keys sau trong LocalStorage:

| Key | Mô tả | Kiểu dữ liệu |
|-----|-------|--------------|
| `poker_users` | Danh sách tất cả users đã đăng ký | Array |
| `poker_userSession` | Thông tin user đang đăng nhập | Object |
| `poker_bots` | Danh sách 30 bots | Array |
| `poker_bots_initialized` | Flag đánh dấu đã init bots | String |
| `poker_rememberMe` | Remember login status | String |
| `poker_gameHistory` | Lịch sử các ván chơi | Array |

---

## 👤 Users Collection

### Storage Key: `poker_users`

Lưu trữ tất cả tài khoản người chơi đã đăng ký.

### User Schema

```json
{
  "id": "user_1705579200000_abc123",
  "username": "player1",
  "email": "player1@example.com",
  "password": "password123",
  "balance": 250,
  "createdAt": "2026-01-18T10:30:00.000Z",
  "lastCheckIn": "2026-01-18",
  "stats": {
    "gamesPlayed": 15,
    "wins": 8,
    "losses": 7,
    "totalWinnings": 450,
    "totalLosses": 200,
    "biggestPot": 120
  }
}
```

### Fields Description

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | String | ✅ | Unique ID (format: `user_{timestamp}_{random}`) |
| `username` | String | ✅ | Tên đăng nhập (unique) |
| `email` | String | ✅ | Email (có thể để trống) |
| `password` | String | ✅ | Mật khẩu (plain text - TODO: hash) |
| `balance` | Number | ✅ | Số dư hiện tại ($) |
| `createdAt` | String | ✅ | Thời gian tạo tài khoản (ISO 8601) |
| `lastCheckIn` | String/null | ✅ | Ngày điểm danh gần nhất (YYYY-MM-DD) |
| `stats` | Object | ✅ | Thống kê game |
| `stats.gamesPlayed` | Number | ✅ | Số ván đã chơi |
| `stats.wins` | Number | ✅ | Số ván thắng |
| `stats.losses` | Number | ✅ | Số ván thua |
| `stats.totalWinnings` | Number | ✅ | Tổng số tiền thắng |
| `stats.totalLosses` | Number | ✅ | Tổng số tiền thua |
| `stats.biggestPot` | Number | ✅ | Pot lớn nhất từng thắng |

### Business Rules

- **Initial Balance**: Mỗi user mới nhận $100
- **Check-in Bonus**: Điểm danh mỗi ngày nhận $50
- **Username**: Unique, 3-20 ký tự, chỉ chữ/số/underscore
- **Password**: Tối thiểu 6 ký tự (chưa hash - TODO)

---

## 🎮 User Session

### Storage Key: `poker_userSession`

Lưu thông tin user đang đăng nhập để truy cập nhanh.

### Session Schema

```json
{
  "id": "user_1705579200000_abc123",
  "username": "player1",
  "email": "player1@example.com",
  "balance": 250,
  "lastCheckIn": "2026-01-18",
  "stats": {
    "gamesPlayed": 15,
    "wins": 8,
    "losses": 7,
    "totalWinnings": 450,
    "totalLosses": 200,
    "biggestPot": 120
  }
}
```

### Đặc điểm

- Chỉ lưu thông tin cần thiết (không lưu password)
- Tự động sync khi update user data
- Clear khi logout
- Dùng để check login status

---

## 🤖 Bots Collection

### Storage Key: `poker_bots`

Lưu trữ 30 bots với tính cách và balance riêng.

### Bot Schema

```json
{
  "id": "bot_001",
  "name": "Hannah",
  "gender": "female",
  "balance": 230,
  "initialBalance": 100,
  "personality": "balanced",
  "behaviorWeights": {
    "fold": 2,
    "check": 3,
    "call": 3,
    "raise": 2,
    "allin": 1
  },
  "stats": {
    "gamesPlayed": 104,
    "wins": 36,
    "losses": 68,
    "totalWinnings": 0,
    "totalLosses": 0,
    "biggestPot": 0
  },
  "isBot": true,
  "isActive": true,
  "createdAt": "2026-01-18T10:00:00.000Z",
  "lastPlayed": null
}
```

### Fields Description

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | String | ✅ | Bot ID (format: `bot_001` - `bot_030`) |
| `name` | String | ✅ | Tên bot (từ JSON) |
| `gender` | String | ✅ | Giới tính: `male` hoặc `female` |
| `balance` | Number | ✅ | Số dư hiện tại ($) |
| `initialBalance` | Number | ✅ | Số dư khởi tạo (để reset) |
| `personality` | String | ✅ | Tính cách bot |
| `behaviorWeights` | Object | ✅ | Trọng số hành động |
| `stats` | Object | ✅ | Thống kê game |
| `isBot` | Boolean | ✅ | Đánh dấu là bot (always `true`) |
| `isActive` | Boolean | ✅ | Bot có thể chơi hay không |
| `createdAt` | String | ✅ | Thời gian khởi tạo |
| `lastPlayed` | String/null | ✅ | Lần chơi gần nhất |

### Personalities

Bot có 8 loại tính cách:

| Personality | Behavior | Fold | Check | Call | Raise | All-in |
|-------------|----------|------|-------|------|-------|--------|
| `aggressive` | Thích raise, all-in | 1 | 1 | 3 | 5 | 3 |
| `passive` | Thích check, call | 2 | 5 | 4 | 1 | 1 |
| `tight` | Chơi ít tay, fold nhiều | 5 | 3 | 2 | 2 | 1 |
| `loose` | Chơi nhiều tay | 1 | 3 | 4 | 3 | 2 |
| `balanced` | Cân bằng | 2 | 3 | 3 | 2 | 1 |
| `tight-aggressive` | Ít tay nhưng aggressive | 3 | 2 | 2 | 4 | 2 |
| `loose-aggressive` | Nhiều tay và aggressive | 1 | 1 | 3 | 5 | 3 |
| `careless`/`reckless` | Liều lĩnh | 1 | 1 | 2 | 3 | 5 |

### Bot Initialization

Bots được khởi tạo **một lần duy nhất** khi user đăng nhập lần đầu:

1. Check `poker_bots_initialized` flag
2. Nếu chưa init → Fetch `static/json/bots.json`
3. Parse JSON → Thêm metadata
4. Save vào LocalStorage
5. Set `poker_bots_initialized = "true"`

### Bot Avatar

Avatar không lưu trong database. Load theo pattern:

```javascript
const avatarPath = `static/avatars/${bot.id}.png`;
// Ví dụ: static/avatars/bot_001.png
```

### Bot Selection

Mỗi game chọn **6-10 bots ngẫu nhiên**:

```javascript
// Lấy active bots (balance >= $20)
const activeBots = bots.filter(b => b.isActive && b.balance >= 20);

// Random shuffle và lấy N bots
const selectedBots = shuffle(activeBots).slice(0, count);
```

---

## 📜 Game History

### Storage Key: `poker_gameHistory`

Lưu lịch sử các ván đấu (TODO - chưa implement).

### Game Record Schema (Planned)

```json
{
  "id": "game_1705579200000",
  "timestamp": "2026-01-18T14:30:00.000Z",
  "players": [
    {
      "id": "user_123",
      "isBot": false,
      "startBalance": 100,
      "endBalance": 150,
      "result": "win"
    },
    {
      "id": "bot_001",
      "isBot": true,
      "startBalance": 230,
      "endBalance": 180,
      "result": "loss"
    }
  ],
  "potSize": 50,
  "winner": "user_123",
  "duration": 180
}
```

---

## 🔐 Security Considerations

### Hiện tại

- ⚠️ **Password lưu plain text** - Không an toàn
- ⚠️ Dữ liệu có thể truy cập bằng DevTools
- ⚠️ Không có rate limiting cho login

### TODO

- 🔒 Hash password (bcrypt/SHA-256)
- 🔒 Encrypt sensitive data
- 🔒 Add input validation/sanitization
- 🔒 Implement CSRF protection (nếu có server sau này)

---

## 🔄 Data Migration

### Khi cập nhật schema

```javascript
// Ví dụ: Thêm field mới cho users
function migrateUsers() {
  const users = JSON.parse(localStorage.getItem('poker_users') || '[]');
  
  const migratedUsers = users.map(user => ({
    ...user,
    newField: defaultValue // Thêm field mới
  }));
  
  localStorage.setItem('poker_users', JSON.stringify(migratedUsers));
}
```

---

## 🧪 Testing & Debug

### Xem toàn bộ data

```javascript
// Console
Object.keys(localStorage)
  .filter(key => key.startsWith('poker_'))
  .forEach(key => {
    console.log(key, JSON.parse(localStorage.getItem(key)));
  });
```

### Reset database

```javascript
// Xóa toàn bộ data
Object.keys(localStorage)
  .filter(key => key.startsWith('poker_'))
  .forEach(key => localStorage.removeItem(key));
```

### Export data

```javascript
const exportData = {
  users: JSON.parse(localStorage.getItem('poker_users') || '[]'),
  bots: JSON.parse(localStorage.getItem('poker_bots') || '[]'),
  session: JSON.parse(localStorage.getItem('poker_userSession') || 'null')
};

console.log(JSON.stringify(exportData, null, 2));
```

---

## 📈 Storage Monitoring

### Check storage size

```javascript
function getStorageSize() {
  let total = 0;
  
  Object.keys(localStorage)
    .filter(key => key.startsWith('poker_'))
    .forEach(key => {
      const value = localStorage.getItem(key);
      total += value.length;
    });
  
  return {
    bytes: total,
    kb: (total / 1024).toFixed(2),
    mb: (total / 1024 / 1024).toFixed(2)
  };
}

console.log(getStorageSize());
```

### Storage limit

- Chrome/Edge: ~10MB
- Firefox: ~10MB
- Safari: ~5MB

---

## 🔗 API Reference

Chi tiết các functions trong storage modules:

- **userStorage.js**: [js/storage/userStorage.js](../js/storage/userStorage.js)
  - `createUser()`, `loginUser()`, `updateUser()`, `checkInUser()`
  
- **botStorage.js**: [js/storage/botStorage.js](../js/storage/botStorage.js)
  - `initializeBots()`, `getRandomBots()`, `updateBotBalance()`

---

## 📝 Change Log

### Version 1.0.0 (January 2026)

- ✅ Initial database structure
- ✅ Users collection with authentication
- ✅ Bots collection loaded from JSON
- ✅ User session management
- ✅ Check-in system
- ⏳ Game history (TODO)

---

**Last Updated**: January 18, 2026  
**Status**: 🚧 In Development
