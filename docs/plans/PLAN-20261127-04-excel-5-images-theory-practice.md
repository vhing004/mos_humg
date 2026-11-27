# PLAN-20261127-04: Lý thuyết & Thực hành trọng tâm cho 5 ảnh bài tập Excel (`excel_1`–`excel_5`)

- **Task ID:** `04`
- **Ngày tạo:** 2026-11-27
- **Mục tiêu:** Dựa trên nội dung thực tế của 5 ảnh `excel_1.jpg` → `excel_5.jpg`, xây dựng đầy đủ **Lý thuyết trọng tâm** (công thức, cú pháp, bẫy thường gặp) đi kèm **Bài thực hành tương tác trực tiếp** trên `ExcelSandbox`.

---

## 1. Phân tích nội dung 5 ảnh bài tập Excel

1. **`excel_1.jpg` & `excel_3.jpg` — Kết quả cuộc thi chạy Việt dã (2011):**
   - *Lý thuyết trọng tâm:* `LEFT(A4,1)` tách ký tự đầu mã số; `VLOOKUP` kết hợp `IF(C4="Nữ", 3, 4)` để dò cột Xuất phát theo Phái; phép trừ thời gian (`Về đích - Xuất phát`); thống kê `MAX`/`MIN` cho nội dung Maraton; `Sort` nhiều cấp & `Advanced Filter`.
   - *Lưu ý:* `excel_1.jpg` và `excel_3.jpg` là cùng một đề bài (lưu 2 bản ảnh trong thư mục), sẽ liên kết hiển thị rõ ảnh gốc và phần thực hành công thức trên web.
2. **`excel_2.jpg` — Thẻ Nhập Xuất Kho:**
   - *Lý thuyết trọng tâm:* Công thức nhân cơ bản; hàm `IF(G3>33000000, G3*7%, G3*6%)` tính thuế theo ngưỡng; hàm `SUM`, `MAX`, `MIN`.
3. **`excel_4.jpg` — Doanh số mặt hàng Tivi:**
   - *Lý thuyết trọng tâm:* `LEFT(B4,1)` và `VALUE(RIGHT(B4,2))` (chuyển 2 ký tự cuối sang số để dò được bảng giá); dò tìm 2 chiều kết hợp `VLOOKUP` + `IF` (hoặc `MATCH`) theo Mã số & Kích cỡ (`21`, `32`, `40`); `HLOOKUP` lấy tiền tặng khuyến mãi ở hàng cuối bảng phụ; công thức tính `Còn lại = Giá bán - Giá bán*Hỗ trợ giảm - Tặng`.
4. **`excel_5.jpg` — Bảng tính tiền lương:**
   - *Lý thuyết trọng tâm:* Trừ ngày tháng lấy số ngày làm; hàm `IF` phân hệ số theo chức vụ nhân với ô Lương cơ bản cố định (`$K$1` / `$K$2` — nhấn `F4`); `VLOOKUP` lấy tiền thưởng; `IF(Số ngày > 25, 200000, 0)`.

---

## 2. Chi tiết thay đổi kỹ thuật

### Bước 1: Mở rộng Schema & Script dữ liệu (`scripts/build_interactive_labs.py` & `web/src/types/index.ts`)
- Thêm vào `ExcelInteractiveLab`:
  - `imageUrl?: string`: đường dẫn ảnh đề gốc (`/materials/images/excel_1.jpg`...).
  - `theoryPoints: { title: string; syntax: string; explanation: string; tip?: string }[]`: danh sách lý thuyết trọng tâm riêng của bài đó.
- Cập nhật `scripts/build_interactive_labs.py`:
  - Bổ sung bài thực hành tương tác cho **`excel_1.jpg` / `excel_3.jpg` (Việt dã)** và **`excel_4.jpg` (Doanh số Tivi)** (bên cạnh `excel_2` và `excel_5` đã có).
  - Bổ sung `theoryPoints` và `imageUrl` đầy đủ cho cả 5 đề ảnh.

### Bước 2: Cập nhật Giao diện `ExcelSandbox.tsx`
- Hiển thị thêm 2 tab/nút chuyển nhanh ngay trong khung bài tập:
  - **Lý thuyết trọng tâm:** Trình bày các thẻ công thức cần dùng cho đúng đề đang mở (cú pháp, ý nghĩa, mẹo tránh lỗi `#N/A`, `#VALUE!`, quên khóa `$`).
  - **Ảnh đề gốc:** Cho phép mở xem lại ảnh `.jpg` gốc ngay bên cạnh để đối chiếu bảng biểu, yêu cầu định dạng/sắp xếp/vẽ biểu đồ.
- Bổ sung bộ lọc nhanh trên cột trái (`Tất cả` | `5 Đề ảnh trọng tâm` | `Bài học hàm 03–07`) để dễ tìm ngay 5 đề ảnh.

### Bước 3: Kiểm thử
- Chạy `.\.venv\Scripts\python.exe scripts\build_interactive_labs.py`.
- Chạy `npm run build` trong `web/` kiểm tra TypeScript & Vite bundle.

---

## 3. Tiêu chí hoàn thành
- Có đủ 5 đề ảnh (`excel_1..5`) với phần **Lý thuyết trọng tâm** + **Thực hành gõ & chấm công thức trực tiếp** + **Ảnh đề gốc** ngay trong mục **Thực hành công thức**.
- `npm run build` thành công 0 lỗi.
