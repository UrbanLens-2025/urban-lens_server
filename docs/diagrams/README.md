# Diagrams Documentation

Tài liệu này chứa Class Diagrams và Sequence Diagrams cho các features chính của Urban Lens Server.

## 📋 Cấu trúc

Mỗi file tương ứng với một feature cụ thể, bao gồm cả **Class Diagram** và **Sequence Diagrams** liên quan:

### 1. **[Post Feature](./01-post-feature.md)**

- Class Diagram: Post, Comment, React, Analytic entities và services
- Sequence Diagrams:
  - Create Post
  - React Post
  - Delete Post

### 2. **[Itinerary Feature](./02-itinerary-feature.md)**

- Class Diagram: Itinerary, ItineraryLocation, Location entities và services
- Sequence Diagrams:
  - Create Itinerary (Manual)
  - Create Itinerary from AI
  - Update Itinerary Album

### 3. **[Mission Feature](./03-mission-feature.md)**

- Class Diagram: LocationMission, UserMissionProgress, OneTimeQRCode entities và services
- Sequence Diagrams:
  - Scan QR Code and Complete Mission
  - Get User Missions
  - Get Missions In Progress
  - Get QR Scan History

### 4. **[Voucher Feature](./04-voucher-feature.md)**

- Class Diagram: LocationVoucher, UserLocationVoucherExchangeHistory entities và services
- Sequence Diagrams:
  - Exchange Voucher
  - Get User Available Vouchers
  - Use Voucher (Business Owner)
  - Get Free Available Vouchers

---

## 📖 Cách xem Diagrams

### 1. **Trong VS Code (Recommended)**

Cài đặt extension:

1. Nhấn `Cmd+Shift+X` (Mac) hoặc `Ctrl+Shift+X` (Windows)
2. Tìm và cài: **"Markdown Preview Mermaid Support"**
3. Mở file `.md` bất kỳ
4. Nhấn `Cmd+Shift+V` để xem preview

**Hoặc:**

- Right-click vào file → "Open Preview"
- Nhấn `Cmd+K V` để mở preview bên cạnh

### 2. **Online Mermaid Editor (Nhanh nhất)**

1. Truy cập: https://mermaid.live/
2. Copy nội dung từ các file `.md` (chỉ phần code trong ` ```mermaid ... ``` `)
3. Paste vào editor
4. Xem kết quả ngay lập tức
5. Có thể export ra PNG, SVG, PDF

### 3. **Tạo HTML Preview File**

Tôi đã tạo file **[view-diagrams.html](./view-diagrams.html)** - mở trực tiếp trong browser:

- Double-click file hoặc drag & drop vào browser
- Xem tất cả diagrams trong một trang

### 4. **Trong GitHub/GitLab**

Nếu bạn push code lên GitHub/GitLab:

- Tự động render Mermaid diagrams trong markdown files
- Chỉ cần mở file `.md` trên web interface

### 5. **Sử dụng Mermaid CLI (Tạo hình ảnh)**

Cài đặt:

```bash
npm install -g @mermaid-js/mermaid-cli
```

Render thành PNG/SVG:

```bash
# Render từng feature
mmdc -i docs/diagrams/01-post-feature.md -o docs/diagrams/01-post-feature.png
mmdc -i docs/diagrams/02-itinerary-feature.md -o docs/diagrams/02-itinerary-feature.png
mmdc -i docs/diagrams/03-mission-feature.md -o docs/diagrams/03-mission-feature.png
mmdc -i docs/diagrams/04-voucher-feature.md -o docs/diagrams/04-voucher-feature.png
```

---

## 🎯 Quick Start

**Cách nhanh nhất:**

1. Cài extension **"Markdown Preview Mermaid Support"** trong VS Code
2. Mở file feature bất kỳ (ví dụ: `01-post-feature.md`)
3. Nhấn `Cmd+Shift+V` để xem preview
4. Done! 🎉

---

## 🔍 Legend

### Class Diagram Symbols:

- `+` = Public method/property
- `-` = Private method/property
- `||--o|` = One-to-one relationship
- `||--o{` = One-to-many relationship
- `<<interface>>` = Interface
- `<|..` = Implements relationship
- `-->` = Dependency

### Sequence Diagram:

- `->>` = Synchronous call
- `-->>` = Return/Response
- `alt` = Alternative flow
- `loop` = Loop
- `Note` = Annotation

---

## 📝 Notes

- Mỗi feature file độc lập, có thể đọc riêng lẻ
- Class diagrams mô tả cấu trúc entities và services
- Sequence diagrams mô tả flow xử lý cụ thể
- Các diagrams được tạo dựa trên codebase thực tế

---

## 🐛 Troubleshooting

- **Diagrams không hiển thị?** Đảm bảo code nằm trong block ` ```mermaid ... ``` `
- **Extension không hoạt động?** Thử restart VS Code
- **Muốn export ra ảnh?** Dùng Mermaid CLI hoặc mermaid.live để export
- **Cần thêm diagram?** Liên hệ team để cập nhật
