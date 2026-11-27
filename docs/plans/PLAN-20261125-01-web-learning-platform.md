# PLAN-20261125-01: Xây dựng Web học Excel, Word, PowerPoint từ dữ liệu `d:\MOS`

- **Task ID:** `01`
- **Ngày tạo:** 2026-11-25
- **Mục tiêu:** Xây dựng hoàn chỉnh ứng dụng web học và luyện thi Word, Excel, PowerPoint (kèm 3 module CNTT nền tảng) dựa trên toàn bộ file PDF, Excel và ảnh đề mẫu có sẵn trong `d:\MOS`.

---

## 1. Giả định thiết kế (Assumptions)
- **Kiến trúc:** Web tĩnh (SPA) dùng **React + TypeScript + Vite + Tailwind CSS**, không cần backend/database; dữ liệu tiến độ học lưu trên `localStorage`.
- **Phạm vi nội dung:** Bao gồm cả **3 môn chính (Word, Excel, PowerPoint)** ở cả phần Trắc nghiệm (Module 03, 04, 05) và Thực hành (26 bài Excel + ảnh đề Word/PPT/Excel/Test mẫu), đồng thời tích hợp **Module 01, 02, 06** vào mục Kiến thức nền tảng UDCNTTCB để không lãng phí tài liệu sẵn có.
- **Vị trí code:** Đặt trong thư mục con `web/` (và script trích xuất dữ liệu trong `scripts/`) để không làm xáo trộn các thư mục tài liệu gốc (`Excel/`, `Module01.pdf`...).

---

## 2. Chi tiết các bước thực hiện

### Bước 1: Tạo script Python trích xuất & chuẩn hóa dữ liệu (`scripts/extract_data.py`)
1. Tạo môi trường ảo Python `.venv` tại `d:\MOS\.venv` và cài `pymupdf` (hoặc `pypdf`) + `openpyxl`.
2. Parse 6 file `Module01.pdf` → `Module06.pdf`:
   - Tách từng câu hỏi, nội dung câu hỏi, 4 lựa chọn, đáp án đúng (do PDF gốc luôn để đáp án đúng là `A`, lưu dưới dạng text/index chuẩn để frontend xáo trộn ngẫu nhiên).
   - Ghi ra `web/src/data/quizzes/module01.json` ... `module06.json`.
   - Kiểm tra log số lượng câu hỏi trích xuất được của từng module (mục tiêu 120/120 câu mỗi module).
3. Parse `Excel/Noi dung bai hoc.xlsx` và quét 26 thư mục `Excel/Bài 00...` → `Bài 25...`:
   - Tạo `web/src/data/excel_lessons.json` chứa: mã bài, tiêu đề, danh sách sheet & dữ liệu xem trước (preview 20 dòng đầu của file câu hỏi/bài giảng), đường dẫn tải file gốc.
   - Copy các file `.xlsx`, `.xlsm`, `.pdf` bài tập và các ảnh `word_*.jpg`, `excel_*.jpg`, `ppt_*.jpg`, `test_*.jpg` vào `web/public/materials/`.
4. Tạo `web/src/data/practice_labs.json` mô tả các bài thực hành Word (`word_1..4`), Excel (`excel_1..5`), PowerPoint (`ppt_1..3`), Đề thi mẫu (`test_1..2`) kèm checklist yêu cầu từng câu.

### Bước 2: Khởi tạo dự án Web (`web/`)
1. Khởi tạo Vite + React + TypeScript tại `d:\MOS\web`.
2. Cài đặt `tailwindcss`, `lucide-react` (icon), `react-router-dom` (điều hướng).
3. Thiết kế Layout chung:
   - Sidebar / Topbar điều hướng: **Tổng quan**, **MS Word**, **MS Excel**, **MS PowerPoint**, **Thi thử & Nền tảng**, **Tiến độ học tập**.
   - Giao diện sạch, rõ ràng, hỗ trợ chế độ sáng/tối hoặc bảng màu phân biệt theo từng ứng dụng Office (Word: xanh dương, Excel: xanh lá, PowerPoint: cam đỏ).

### Bước 3: Phân hệ Trắc nghiệm (Quiz & Mock Exam)
- **Trang Luyện tập theo Module:** Chọn môn (Word / Excel / PowerPoint / CNTT / Windows / Internet), lọc theo chế độ xem tất cả / chỉ câu chưa làm / câu làm sai. Trộn thứ tự 4 đáp án A/B/C/D mỗi lần làm bài. Hiển thị giải thích/đáp án đúng ngay khi chọn.
- **Trang Thi thử (Mock Test):** Chọn bộ đề (VD: 30 câu trong 30 phút cho 1 module hoặc đề tổng hợp 60 câu), đồng hồ đếm ngược, bảng điều hướng câu hỏi (đã làm / đánh dấu xem lại), nộp bài & thống kê điểm số.

### Bước 4: Phân hệ Thực hành (Excel 26 bài & Lab Word/PPT/Test)
- **Lộ trình 26 bài Excel:** Giao diện chia 2 cột (danh sách 26 bài bên trái, chi tiết bài học bên phải). Hiển thị bảng dữ liệu xem trước từ file `.xlsx`, danh sách câu hỏi bài tập, nút **Tải file bài giảng** & **Tải file bài tập (.xlsx/.xlsm/.pdf)**, nút đánh dấu "Đã hoàn thành".
- **Phòng Lab Thực hành (Word, PowerPoint, Excel tổng hợp, Đề mẫu):** Trình xem ảnh đề bài có nút Zoom In/Out, bên cạnh là danh sách các yêu cầu dạng **Checklist tương tác** để học viên tick từng bước khi thực hành trực tiếp trên MS Office.

### Bước 5: Tiến độ cá nhân & Kiểm thử
- Lưu toàn bộ lịch sử làm quiz, điểm thi thử, bài thực hành đã xong vào `localStorage`.
- Trang Tổng quan hiển thị % hoàn thành của từng môn (Word, Excel, PowerPoint).
- Chạy `npm run build` để kiểm tra lỗi TypeScript/build, chạy `npm run dev` và kiểm tra giao diện thực tế trên trình duyệt.

---

## 3. Tiêu chí hoàn thành (Definition of Done)
- Trích xuất đầy đủ câu hỏi từ 6 file PDF (kiểm chứng số lượng câu không bị sót/lỗi format).
- Đọc được toàn bộ 26 bài Excel và hiển thị đúng link tải file gốc.
- Các trang Word, Excel, PowerPoint, Thi thử, Thực hành hoạt động mượt, không lỗi console, `npm run build` thành công.
