# PLAN-20261125-02: Nâng cấp Excel Thực hành Trực tiếp trên Web (Interactive Formula Lab)

- **Task ID:** `02`
- **Ngày tạo:** 2026-11-25
- **Phạm vi:** Tập trung hoàn toàn vào **MS Excel** trên web theo yêu cầu mới:
  - **Loại bỏ Bài 24 (Record Macro) và Bài 25 (VBA)** khỏi lộ trình Excel trên web.
  - **Giữ nguyên Word & PowerPoint** (trắc nghiệm + ảnh đề mẫu & checklist để tự làm trên ứng dụng desktop).
  - **Nâng cấp Excel** thành môi trường thực hành gõ công thức & chấm điểm tự động ngay trên trình duyệt bằng thư viện `hyperformula`.

---

## 1. Kiến trúc & Thư viện bổ sung
- **Thư viện mới (trong `web/`):** `hyperformula` (engine tính toán công thức chuẩn Excel chạy 100% client-side, hỗ trợ `SUM`, `SUMIF`, `SUMIFS`, `COUNT`, `COUNTA`, `COUNTBLANK`, `COUNTIF`, `COUNTIFS`, `IF`, `AND`, `OR`, `LEFT`, `RIGHT`, `MID`, `FIND`, `SEARCH`, `VALUE`, `TEXT`, `VLOOKUP`, `HLOOKUP`, `INDEX`, `MATCH`, `SUMPRODUCT`, `AVERAGE`, `MAX`, `MIN`, `TODAY`, `MONTH`, `YEAR`, `ROUND`, `MOD`...).
- **Dữ liệu mới:**
  - Cập nhật `scripts/extract_data.py` để:
    1. Bỏ qua `Bài 24` và `Bài 25` khi sinh `excel_lessons.json` (chỉ còn **24 bài: Bài 00 → Bài 23**).
    2. Trích xuất thêm `formulas` (công thức mẫu) và `editableCells` (các ô bài tập cần điền) cho các bài có tính toán.
    3. Tạo `web/src/data/excel_interactive_labs.json` chứa dữ liệu bảng tính tương tác chuẩn hóa cho:
       - **6 chuyên đề hàm trọng tâm (từ Bài 03 → Bài 08):** `SUM/SUMIF`, `COUNT/COUNTIF`, `IF/AND/OR`, `LEFT/RIGHT/MID/VALUE`, `VLOOKUP/HLOOKUP`, `AVERAGE/MAX/MIN/INDEX+MATCH`.
       - **5 đề thực hành Excel tổng hợp (`excel_1` → `excel_5`):** Bảng tính sẵn dữ liệu đầu vào + các ô trống cần viết công thức + đáp án chuẩn để chấm tự động.
       - **Phần Excel trong đề thi mẫu UDCNTTCB (`test_1`–`test_2`):** Bảng tính tiền hàng + bảng phụ.

---

## 2. Chi tiết các bước thực hiện

### Bước 1: Cập nhật Pipeline dữ liệu (`scripts/extract_data.py`)
1. Lọc bỏ thư mục `Bài 24` và `Bài 25` khỏi `excel_lessons.json` (và không copy tài liệu 2 bài này).
2. Bổ sung hàm trích xuất công thức từ các file `.xlsx` bài giảng (`data_only=False`) và tạo file `web/src/data/excel_interactive_labs.json` gồm dữ liệu bảng tính dạng lưới (rows/cols, tiêu đề cột `A, B, C...`, giá trị đầu vào, danh sách ô mục tiêu `targetCells` kèm công thức đáp án & giá trị kỳ vọng + gợi ý cú pháp).

### Bước 2: Cài `hyperformula` & Xây dựng Component `ExcelSandbox.tsx`
1. Cài `hyperformula` vào `web/package.json`.
2. Xây dựng component `web/src/components/ExcelSandbox.tsx`:
   - **Thanh Formula Bar (`fx`):** Hiển thị địa chỉ ô đang chọn (ví dụ `E4`) và cho phép nhập/sửa công thức trực tiếp như Excel thật.
   - **Lưới bảng tính tương tác:**
     - Header cột (`A, B, C...`) và số dòng (`1, 2, 3...`).
     - Phân biệt rõ bằng màu sắc: ô dữ liệu cố định (read-only), ô bài tập cần nhập công thức (viền xanh/nền nhạt), ô đã chấm Đúng (xanh lá) / Sai (đỏ).
     - Click vào ô khác khi đang gõ công thức (hoặc gõ tay địa chỉ ô) → `HyperFormula` tự động tính giá trị real-time.
   - **Chấm điểm & Gợi ý:**
     - Nút **"Kiểm tra kết quả"**: So sánh giá trị tính ra (và kiểm tra có dùng công thức bắt đầu bằng `=` thay vì gõ cứng số) với đáp án chuẩn; hiển thị số ô đúng/tổng số ô.
     - Nút **"Gợi ý công thức"**: Hiển thị cú pháp mẫu/hướng dẫn cho ô đang chọn.
     - Nút **"Làm lại"** và lưu trạng thái hoàn thành bài Lab vào `localStorage`.

### Bước 3: Tích hợp vào Giao diện Excel (`SubjectPage.tsx` & `ExcelLessonsPanel.tsx`)
1. Trong trang **MS Excel (`/excel`)**, bổ sung tab **"Thực hành công thức trực tiếp"** (đặt làm tab nổi bật hoặc ngay cạnh tab 24 Bài giảng & Trắc nghiệm).
2. Hiển thị thêm mục **Tra cứu nhanh Phím tắt Excel** (lấy từ dữ liệu `Bài 23`) dạng bảng tìm kiếm/flashcard gọn nhẹ.
3. Cập nhật các số liệu tổng trên `Layout.tsx` và `DashboardPage.tsx` từ `26 bài` → `24 bài Excel` (đồng bộ với việc bỏ Bài 24–25).

### Bước 4: Kiểm thử & Xác nhận
1. Chạy `.\.venv\Scripts\python.exe scripts\extract_data.py` kiểm tra dữ liệu mới.
2. Chạy `npm run build` trong `web/` đảm bảo 0 lỗi TypeScript và Vite bundle.
3. Kiểm tra thực tế hoạt động của `ExcelSandbox` trên dev server.

---

## 3. Tiêu chí hoàn thành
- Không còn Bài 24, 25 trong giao diện và dữ liệu Excel.
- Người học có thể chọn các bài hàm (SUM/COUNT/IF/Chuỗi/VLOOKUP) và 5 đề Excel tổng hợp (`excel_1..5`) để **gõ công thức trực tiếp trên web và được chấm đúng/sai tự động**.
- `npm run build` thành công không lỗi.
