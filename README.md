<div align="center">

# 🎓 Learnio — Frontend

**Nền tảng quản lý khóa học hiện đại — học tập, giảng dạy và quản lý trong một hệ thống duy nhất.**

[![Next.js](https://img.shields.io/badge/Next.js-15-000000?style=flat-square&logo=nextdotjs)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Axios](https://img.shields.io/badge/Axios-HTTP_Client-5A29E4?style=flat-square&logo=axios)](https://axios-http.com/)
[![WebSocket](https://img.shields.io/badge/WebSocket-Realtime-brightgreen?style=flat-square)](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)

[🔗 Frontend Repo](https://github.com/nKhanGh/e-learning-fe) · [⚙️ Backend Repo](https://github.com/nKhanGh/e-learning-be)

</div>

---

## 📖 Giới thiệu

**Learnio** là nền tảng e-learning toàn diện, hỗ trợ đầy đủ vòng đời học tập — từ tìm kiếm & đăng ký khóa học, học video tương tác, làm bài kiểm tra, đến nhận chứng chỉ. Được xây dựng trên Next.js với kiến trúc App Router, Learnio mang lại trải nghiệm nhanh, mượt mà và thân thiện trên mọi thiết bị.

---

## ⚡ Tech Stack

| Công nghệ | Vai trò |
|---|---|
| ▲ **Next.js 15** | Framework chính (App Router, SSR/SSG) |
| 🔷 **TypeScript** | Ngôn ngữ lập trình |
| 🎨 **TailwindCSS** | Styling & responsive design |
| 📦 **Axios** | Giao tiếp HTTP với backend |
| 🔌 **WebSocket** | Thông báo & chat realtime |

---

## 📂 Cấu trúc thư mục

```
src/
├── app/                     # App Router (Next.js 13+)
│   ├── [locale]             # Cấu hình ngôn ngữ
│   │   └── Các route ...
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Trang khởi đầu
├── components/
│   ├── layouts/             # Layout tái sử dụng (Sidebar, Header, Footer, ...)
│   └── ui/                  # UI components (Button, Card, Modal, VideoPlayer, ...)
├── contexts/                # React Context (auth, cart, theme, ...)
├── i18n/                    # Cấu hình ngôn ngữ
├── messages/                # Các file ngôn ngữ
├── services/                # API calls theo từng domain
├── types/                   # TypeScript type definitions
│   └── enums/                  # enum dùng cho các type
└── utils/                   # Hàm tiện ích
```

---

## 🚀 Cài đặt & Khởi chạy

### Yêu cầu hệ thống

- **Node.js** >= 18.x
- **npm** >= 9.x hoặc **yarn** >= 1.22.x

### Các bước cài đặt

```bash
# 1. Clone repository
git clone https://github.com/nKhanGh/e-learning-fe.git
cd e-learning-fe

# 2. Cài đặt dependencies
npm install

# 3. Tạo file môi trường
cp .env.example .env.local
# Điền các biến môi trường cần thiết vào .env.local

# 4. Khởi chạy môi trường development
npm run dev
```

Ứng dụng sẽ chạy tại: `http://localhost:3000`

### Scripts khác

```bash
npm run build        # Build production
npm run start        # Chạy production server
npm run lint         # Kiểm tra lỗi ESLint
npm run type-check   # Kiểm tra TypeScript
```

---

## ✅ Tính năng

### 🌐 Guest (Chưa đăng nhập)
| Tính năng | Mô tả |
|---|---|
| 🔍 Tìm kiếm & Lọc | Tìm khóa học theo từ khóa, category, giá, level, rating; sắp xếp đa tiêu chí |
| 📚 Xem khóa học | Xem danh sách, chi tiết, curriculum outline, video preview và thông tin giảng viên |
| ⭐ Reviews | Xem đánh giá và xếp hạng từ học viên khác |
| 🛒 Giỏ hàng | Thêm / xóa khóa học, lưu giỏ hàng trong session (not started)|
| 🔐 Xác thực | Đăng ký / Đăng nhập qua Email hoặc OAuth2 (Google, Facebook); Quên mật khẩu; Xác thực email |

### 👤 Student (Học viên)
| Tính năng | Mô tả |
|---|---|
| 👤 Hồ sơ | Xem, chỉnh sửa profile; đổi mật khẩu; |
| 💳 Đăng ký & Thanh toán | Mua khóa học qua VNPay / Stripe / PayPal; áp dụng coupon; yêu cầu hoàn tiền (not started)|
| 🎬 Học tập | Video player đầy đủ tính năng (tốc độ, chất lượng, phụ đề); lưu vị trí xem; đánh dấu hoàn thành; ghi chú (not started)|
| 📝 Kiểm tra | Làm quiz / assignment; xem kết quả và phản hồi từ giảng viên (not started)|
| 💬 Tương tác | Q&A forum; comment; nhắn tin trực tiếp với giảng viên; nhận thông báo realtime (not started)|
| ⭐ Đánh giá | Rate và review khóa học; chỉnh sửa / xóa review của mình (not started)|
| 🏆 Chứng chỉ | Nhận, tải PDF và chia sẻ chứng chỉ lên LinkedIn (not started)|
| 📊 Dashboard | Theo dõi tiến độ, learning streak, gợi ý khóa học, deadline sắp tới (not started)|
| 📱 Chat | Chat với người dùng khác, chat với AI gợi ý khóa học |

### 👨‍🏫 Instructor (Giảng viên) (not started)
| Tính năng | Mô tả |
|---|---|
| 🏢 Profile | Tạo instructor profile; verify credentials; liên kết mạng xã hội |
| 📝 Quản lý khóa học | Tạo, chỉnh sửa, publish / unpublish, clone, archive khóa học |
| 🎬 Quản lý nội dung | Upload video / tài liệu; WYSIWYG editor; drip content; phụ đề; free preview |
| 📋 Quiz & Assignment | Tạo đề thi đa dạng; chấm điểm; đặt deadline; cho phép nộp muộn |
| 👥 Quản lý học viên | Xem tiến độ từng học viên; nhắn tin; cấp gia hạn deadline |
| 💬 Tương tác | Trả lời Q&A; tạo announcement; host live Q&A sessions |
| 🏷️ Pricing & Promotions | Đặt giá; tạo coupon; tham gia chiến dịch khuyến mãi |
| 📊 Analytics | Dashboard hiệu suất khóa học; báo cáo doanh thu; tỷ lệ hoàn thành; export Excel / CSV |
| 💰 Earnings | Xem thu nhập; yêu cầu payout; tải tài liệu thuế |
| 📱 Chat | Chat với người dùng khác, chat với AI gợi ý khóa học |

### 🛡️ Admin & Moderator (not started)
| Tính năng | Mô tả |
|---|---|
| 👥 Quản lý người dùng | Xem, lọc, suspend, ban, đổi role, verify instructor |
| 📚 Quản lý khóa học | Approve / reject; featured courses; override pricing |
| 💰 Tài chính | Dashboard doanh thu; xử lý hoàn tiền; approve payout; báo cáo tài chính |
| 📢 Marketing | Tạo chiến dịch giảm giá; newsletter; quản lý coupon |
| 🔍 Kiểm duyệt | Xử lý nội dung bị báo cáo; review khóa học mới; cảnh báo vi phạm |
| ⚙️ Hệ thống | Cấu hình platform; email templates; rate limiting; tích hợp payment gateway |
| 📊 Analytics | Dashboard toàn hệ thống; tăng trưởng người dùng; health metrics; error logs |
| 🔒 Audit | Log toàn bộ hành động admin; GDPR compliance; xuất dữ liệu người dùng |

---

## 🤝 Đóng góp

Pull requests luôn được chào đón! Vui lòng mở issue trước khi thực hiện thay đổi lớn để thảo luận.

---

<div align="center">

Made with 💙 by **Nguyen Huu Khang**

*Coding for fun, improving skill*

</div>