# Poker Texas Hold’em – Luật chơi cơ bản

Tài liệu này trình bày **luật chơi cơ bản của Poker Texas Hold’em**, theo cách tiếp cận truyền thống, rõ ràng, phù hợp cho người mới học hoặc dùng làm tài liệu nền khi triển khai game.

---

## 1. Tổng quan

Texas Hold’em là biến thể poker phổ biến nhất.

* Mỗi người chơi có **2 lá bài tẩy riêng**
* Trên bàn có **5 lá bài chung**
* Người chơi kết hợp các lá bài để tạo ra **bộ bài mạnh nhất gồm đúng 5 lá**

Người thắng là người có **bộ 5 lá mạnh nhất** khi so bài.

---

## 2. Số người và bộ bài

* Số người: **2–10 người / bàn**
* Sử dụng **bộ bài Tây 52 lá**, không có Joker

---

## 3. Dealer và tiền mù (Blind)

* **Dealer (D)**: vị trí chia bài, luân phiên mỗi ván
* **Small Blind (SB)**: người bên trái Dealer, đặt cược nhỏ
* **Big Blind (BB)**: người kế tiếp, đặt cược gấp đôi SB

Blind được đặt **trước khi chia bài** để đảm bảo luôn có tiền trong pot.

---

## 4. Trình tự một ván bài Texas Hold’em

### 4.1. Chia bài

* Mỗi người được chia **2 lá bài úp** (bài tẩy)

### 4.2. Pre-Flop

* Chưa có bài chung
* Người chơi lựa chọn: Fold / Call / Raise

### 4.3. Flop

* Mở **3 lá bài chung**
* Tiến hành vòng cược

### 4.4. Turn

* Mở **lá bài chung thứ 4**
* Tiếp tục vòng cược

### 4.5. River

* Mở **lá bài chung thứ 5**
* Vòng cược cuối

### 4.6. Showdown

* Những người còn bài sẽ lật bài
* So **bộ 5 lá mạnh nhất** để xác định người thắng

---

## 5. Các hành động cơ bản

* **Check**: không cược (khi chưa ai cược)
* **Bet**: đặt cược
* **Call**: theo cược
* **Raise**: tố thêm
* **Fold**: bỏ bài

---

## 6. Thứ tự so bài trong Poker Texas Hold’em (RẤT QUAN TRỌNG)

Thứ tự bài được xét từ **mạnh nhất → yếu nhất**.

### 6.1. Royal Flush (Thùng phá sảnh lớn)

* 5 lá **liên tiếp**, **cùng chất**
* Gồm: **10 – J – Q – K – A**

Đặc điểm:

* Mạnh tuyệt đối
* Không có bài nào cao hơn
* Nếu nhiều người cùng Royal Flush → chia pot

---

### 6.2. Straight Flush (Sảnh đồng chất)

* 5 lá **liên tiếp**
* **Cùng chất**
* Không phải Royal Flush

So bài:

* So **lá cao nhất** của sảnh
* Ví dụ: 9–8–7–6–5 > 8–7–6–5–4

Lưu ý:

* A có thể làm lá thấp trong sảnh: A–2–3–4–5 (sảnh thấp nhất)

---

### 6.3. Four of a Kind (Tứ quý)

* 4 lá **giống hệt nhau**
* 1 lá lẻ (kicker)

So bài:

1. So **giá trị tứ quý**
2. Nếu trùng → so **kicker**

---

### 6.4. Full House (Cù lũ)

* 1 bộ **3 lá giống nhau**
* 1 **đôi**

So bài:

1. So **bộ ba**
2. Nếu trùng → so **đôi**

Ví dụ:

* 77722 > 666AA

---

### 6.5. Flush (Thùng)

* 5 lá **cùng chất**
* Không cần liên tiếp

So bài:

* So lần lượt từng lá từ **cao xuống thấp**

Ví dụ:

* A-high Flush > K-high Flush

---

### 6.6. Straight (Sảnh)

* 5 lá **liên tiếp**
* Không cần cùng chất

So bài:

* So **lá cao nhất**
* A–2–3–4–5 là sảnh thấp nhất

---

### 6.7. Three of a Kind (Sám cô)

* 3 lá giống nhau
* 2 lá lẻ khác nhau

So bài:

1. So **bộ ba**
2. So **2 lá kicker** theo thứ tự

---

### 6.8. Two Pair (Hai đôi)

* 2 đôi khác nhau
* 1 lá lẻ (kicker)

So bài:

1. So **đôi cao hơn**
2. So **đôi thấp hơn**
3. So **kicker**

---

### 6.9. One Pair (Một đôi)

* 1 đôi
* 3 lá lẻ

So bài:

1. So **đôi**
2. So **3 kicker** theo thứ tự

---

### 6.10. High Card (Bài cao)

* Không tạo được bộ nào

So bài:

* So từng lá từ **cao xuống thấp**

---

## 7. Các quy tắc nền tảng cần nhớ

* **Chỉ xét đúng 5 lá mạnh nhất** (trong 7 lá có thể dùng)
* Không bắt buộc phải dùng cả 2 lá bài tẩy
* **Chất không phân cấp** (♠ ♥ ♦ ♣ ngang nhau)
* Nếu 5 lá chung đã là bài mạnh nhất → chia pot

---

## 8. Ghi nhớ nhanh thứ tự bài

Straight Flush > Four of a Kind > Full House > Flush > Straight > Three of a Kind > Two Pair > One Pair > High Card

---

Tài liệu này có thể dùng làm:

* README cho dự án game poker
* Tài liệu giảng dạy nhập môn
* Cơ sở để triển khai thuật toán so bài

Có thể mở rộng thêm các phần như: All-in, Side Pot, Position, hoặc chiến thuật cơ bản.
