# DNSE_OTR (DNSE On The Road)

Ứng dụng chuyên biệt hiển thị biểu đồ chứng khoán Việt Nam thời gian thực trên màn hình ô tô (**Android Auto**) và thiết bị di động / máy tính bảng Android (**Tablet, Phone, Màn hình phụ**).

---

## 🌟 Tính năng nổi bật

- **Tích hợp sâu Android Auto**: Thiết kế tối ưu theo phong cách buồng lái xe (Cockpit HUD) với độ tương phản cao, phím bấm cảm ứng lớn, dễ dàng quan sát khi đang lái xe.
- **Dữ liệu thời gian thực từ DNSE**: Kết nối trực tiếp qua API DNSE để lấy dữ liệu nến OHLCV và bảng giá.
- **Biểu đồ nến TradingView Lightweight Charts**: Đồ họa canvas mượt mà, tối ưu phần cứng, tiết kiệm tài nguyên.
- **Bộ chỉ báo kỹ thuật chuyên sâu**:
  - **SuperTrend** (chu kỳ ATR 10, hệ số nhân 3.0) hỗ trợ nhận diện xu hướng đảo chiều tức thì.
  - **EMA 20 & EMA 50** xác định hỗ trợ/kháng cự động và xu hướng trung hạn.
  - **Volume** khối lượng khớp lệnh trực quan.
- **Đa khung thời gian linh hoạt**: 1M (1 phút), 5M, 15M, 1H và 1D (ngày).
- **Danh mục theo dõi thông minh**:
  - Mục **Yêu thích** cá nhân (mặc định: `HSG`, `HUT`, `NVL`, `KBC`, `SSI`, `CMG`).
  - Các ngành thị trường: `VN30`, `Ngân Hàng`, `Chứng Khoán`, `Thép & VL`, `Bất Động Sản`, `Công Nghệ & BL`.
- **Chế độ tự chuyển mã rảnh tay (Auto-Rotate)**: Tự động đảo qua từng mã cổ phiếu sau mỗi 10 giây mà không cần thao tác tay vào màn hình.
- **Bảng giá mini tích hợp**: Tự động hiển thị danh sách khớp lệnh và biến động giá ngay bên dưới biểu đồ khi xoay dọc máy tính bảng hoặc dùng chế độ chia đôi màn hình (split-screen / multi-window).

---

## 📲 Hướng dẫn cài đặt lên ô tô (Android Auto)

Do chính sách bảo mật của Google dành cho Android Auto, để ứng dụng xuất hiện trên màn hình ô tô, cần cài đặt thông qua trình cài đặt gói đặc biệt (như **KingInstaller** hoặc **Shinichi APK Installer**):

1. **Chuẩn bị file cài đặt**:
   - Tải file `DNSE_OTR.apk` từ mục [Releases](https://github.com/econodoo/dnse_otr/releases).
2. **Kích hoạt chế độ nhà phát triển trên Android Auto**:
   - Mở ứng dụng Android Auto trên điện thoại.
   - Kéo xuống dưới cùng, nhấn liên tục 10 lần vào dòng **Phiên bản** (Version) cho đến khi xuất hiện thông báo đã bật chế độ nhà phát triển.
   - Nhấn vào biểu tượng 3 chấm ở góc trên bên phải -> Chọn **Cài đặt cho nhà phát triển** (Developer settings).
   - Tích chọn ô **Nguồn không xác định** (Unknown sources).
3. **Cài đặt bằng KingInstaller / Shinichi**:
   - Mở ứng dụng **KingInstaller** hoặc **Shinichi**.
   - Chọn file `DNSE_OTR.apk` vừa tải về và tiến hành cài đặt. Trình cài đặt sẽ gắn cờ gói ứng dụng như thể được cài từ Google Play Store để Android Auto nhận diện.
4. **Kết nối và trải nghiệm**:
   - Cắm dây USB kết nối điện thoại vào màn hình xe hơi hoặc kết nối không dây qua Android Auto.
   - Tìm biểu tượng **DNSE OTR** trong danh sách ứng dụng trên màn hình xe và mở lên.

---

## 🛠 Hướng dẫn biên dịch từ mã nguồn

### Yêu cầu môi trường
- Node.js 18+ và npm
- Java JDK 17 hoặc 21 (ví dụ OpenJDK 21)
- Android SDK (API Level 35)

### 1. Biên dịch giao diện Web Cockpit
```bash
cd web
npm install
npm run build
```

### 2. Đồng bộ tài nguyên sang Android
Sử dụng script có sẵn để đóng gói giao diện vào thư mục assets của Android:
```bash
./sync_and_build.sh
```

### 3. Biên dịch file APK Android
```bash
cd android
./gradlew assembleDebug
```
File APK thành phẩm sẽ nằm tại đường dẫn: `android/app/build/outputs/apk/debug/app-debug.apk` hoặc `DNSE_OTR.apk` ở thư mục gốc.

---

## 📄 Bản quyền & Tuyên bố miễn trừ

- Ứng dụng phục vụ nhu cầu tra cứu cá nhân, phi thương mại.
- Hãy luôn chú ý quan sát đường đi và đặt an toàn giao thông lên hàng đầu khi tham gia giao thông.
