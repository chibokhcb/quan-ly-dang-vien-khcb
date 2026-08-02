# HỆ THỐNG THEO DÕI VÀ QUẢN LÝ ĐẢNG VIÊN – CHI BỘ KHOA HỌC CƠ BẢN
Tên ngắn: **QUẢN LÝ ĐẢNG VIÊN KHCB**

Ứng dụng full-stack chuyên nghiệp quản lý hồ sơ Đảng viên, theo dõi nguồn phát triển Đảng, quản lý đảng viên đi nước ngoài và xử lý file Excel chuẩn hóa dành cho Chi bộ Khoa học cơ bản (Trường Đại học Y Dược Cần Thơ).

---

## 🌟 TÍNH NĂNG NỔI BẬT

### 1. Quản lý Hồ sơ Đảng viên Chuẩn hóa 4.0
- Quản lý danh sách đảng viên với 11 nhóm thông tin tiêu chuẩn.
- Mã hóa và che giấu thông tin nhạy cảm: **CCCD (12 số)** và **Số thẻ Đảng (12 số)** (`********3359`).
- Cơ chế truy vết bảo mật (Audit Log) tự động ghi lại mỗi khi người dùng nhấn nút mở xem số định danh.
- Tìm kiếm thông minh không phụ thuộc dấu tiếng Việt (ví dụ: gõ `nguyen van a` tìm đúng `NGUYỄN VĂN A`).

### 2. Xử lý File Excel Chuyên nghiệp
- **Mẫu gốc Chi bộ Khoa học cơ bản**: Định dạng 2 dòng header tiêu chuẩn.
- **Bảo toàn chuỗi 12 số**: Đảm bảo số `0` ở đầu CCCD hoặc thẻ Đảng không bị Excel tự động biến đổi thành số.
- **Quy trình Nhập Excel (Wizard 5 bước)**:
  1. Tải tệp Excel
  2. Đọc & Chọn Sheet
  3. Xanh hóa bản xem trước (Preview)
  4. Phát hiện lỗi trùng lặp/định dạng
  5. Cập nhật giao dịch vào cơ sở dữ liệu.
- **Mẫu công tác nước ngoài (`cong tac dang.xlsx`)**: Hỗ trợ xuất/nhập tệp đa cột với các dấu `X` đánh dấu mục đích (Học tập, Nghiên cứu, Đi công tác, Việc riêng) và nhân thân ở nước ngoài (Cha, Mẹ, Người thân).

### 3. Nguồn Phát triển Đảng theo Năm
- Theo dõi quá trình bồi dưỡng qua 8 giai đoạn từ quần chúng ưu tú đến đảng viên chính thức.
- Phân công **02 Đảng viên hướng dẫn** chính thức cho từng quần chúng.
- Lịch sử nhận xét định kỳ theo quý, theo dõi lịch sử bản thân và lịch sử chính trị gia đình.

### 4. Quản lý Tiến độ Hồ sơ Kết nạp & Công nhận Chính thức
- **Hồ sơ Kết nạp Đảng**: Phân loại theo 3 nhóm danh mục A (Lý lịch), B (Nghị quyết), C (Văn bằng/Đơn) với snapshot phiên bản quy định (Hướng dẫn 06-HD/TW).
- **Công nhận Chính thức (Dự bị 12 tháng)**: Theo dõi thời hạn dự bị, tự động cảnh báo các mốc **90 - 60 - 30 - 15 - 7 ngày**. Kiểm tra tỷ lệ biểu quyết Chi bộ (yêu cầu >= 2/3 tổng số đảng viên chính thức).

### 5. Phân quyền & Duyệt Hồ sơ
- Hỗ trợ các vai trò: **Bí thư (SUPER_ADMIN)**, **Cán bộ Tổ chức (ORGANIZATION_ADMIN)**, **Đảng viên (PARTY_MEMBER)**, **Người hướng dẫn (MENTOR)**, **Quần chúng (CANDIDATE)**, **Cán bộ kiểm tra (AUDITOR)**.
- Quy trình đề nghị cập nhật hồ sơ cá nhân qua hộp thư Phê duyệt (Diff view so sánh dữ liệu trước/sau).

---

## 🚀 HƯỚNG DẪN KẾT NỐI FIREBASE FIRESTORE & AUTHENTICATION

Hệ thống đã được thiết kế sẵn sàng 100% để kết nối với Firebase.

### Bước 1: Khai báo Biến Môi trường (`.env`)
Chuyển chế độ sang Firebase bằng cách cập nhật các biến môi trường trong file `.env`:

```env
VITE_USE_MOCK_DATA=false

VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Bước 2: Triển khai Firestore Rules (Bảo mật)
Triển khai file `firestore.rules` đã tạo tại thư mục gốc của dự án lên Firebase Console.

### Bước 3: Vận hành
- Đăng nhập bằng Google Auth với tên miền email `@ctump.edu.vn`.
- Tài khoản quản trị khởi tạo `chibokhcb@ctump.edu.vn` tự động được cấp quyền `SUPER_ADMIN`.

---

## ⚠️ QUY ĐỊNH BẮT BUỘC
**&quot;Danh mục hồ sơ và căn cứ áp dụng phải được Chi ủy xác nhận trước khi sử dụng chính thức.&quot;**
