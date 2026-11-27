# PROJECT PLAN — Nền tảng Web Học Tin Học Văn Phòng (Word, Excel, PowerPoint & UDCNTTCB)

> **Ngày khởi tạo:** 2026-11-25  
> **Thư mục dữ liệu nguồn:** `d:\MOS`  
> **Trạng thái:** Đã hoàn thành giai đoạn 1–5 (v1.0)

---

## 1. Phân tích hiện trạng tài liệu trong `d:\MOS`

Dự án hiện chưa có mã nguồn web, chỉ có kho tài liệu học tập và ôn thi gồm 3 nhóm dữ liệu chính:

1. **Ngân hàng câu hỏi trắc nghiệm 6 Module (PDF):**
   - `Module01.pdf`: Hiểu biết về CNTT cơ bản (120 câu)
   - `Module02.pdf`: Sử dụng máy tính cơ bản (120 câu)
   - `Module03.pdf`: Xử lý văn bản cơ bản — MS Word (120 câu)
   - `Module04.pdf`: Sử dụng bảng tính cơ bản — MS Excel (120 câu)
   - `Module05.pdf`: Sử dụng trình chiếu cơ bản — MS PowerPoint (120 câu)
   - `Module06.pdf`: Sử dụng Internet cơ bản (120 câu)
   - *Đặc điểm kỹ thuật:* Đáp án đúng trong PDF mặc định nằm ở vị trí `A` (gạch chân đỏ). Khi đưa lên web cần **xáo trộn (shuffle) thứ tự đáp án** và lưu `correctAnswer` theo nội dung/ID để tránh học vẹt.

2. **Giáo trình & Bài tập thực hành Excel chuyên sâu (`Excel/`):**
   - Gồm `Noi dung bai hoc.xlsx` và 26 thư mục từ `Bài 00 Mở Đầu` đến `Bài 25 Lập trình VBA Trong Excel`.
   - Mỗi bài có file bài giảng (`.xlsx` / `.xlsm`) và file câu hỏi/bài tập (`.xlsx` hoặc `.pdf`).

3. **Đề thực hành & Đề thi mẫu dạng ảnh (`.jpg`):**
   - **Word:** `word_1.jpg` → `word_4.jpg` (soạn thảo đơn từ, định dạng đoạn, tab stop, bảng biểu...)
   - **Excel:** `excel_1.jpg` → `excel_5.jpg` (bảng tính + yêu cầu công thức VLOOKUP/HLOOKUP/IF/thống kê/biểu đồ)
   - **PowerPoint:** `ppt_1.jpg` → `ppt_3.jpg` (theme, layout, SmartArt, định dạng slide)
   - **Đề tổng hợp:** `test_1.jpg`, `test_2.jpg` (`De-mau-UDCNTTCB.pdf`)

### Điểm mạnh / Rủi ro / Nợ kỹ thuật cần lưu ý
- **Điểm mạnh:** Dữ liệu đầu vào phong phú, có cả lý thuyết trắc nghiệm (Word/Excel/PPT + 3 module nền tảng) lẫn bài tập thực hành có file `.xlsx` gốc.
- **Rủi ro:**
  - Chưa có thư viện Python parse PDF/XLSX cài sẵn (`openpyxl` chưa cài); cần cài cục bộ trong môi trường ảo (`.venv`) để trích xuất dữ liệu sạch sang JSON.
  - PDF có thể có lỗi ngắt dòng hoặc ký tự đặc biệt ở một số câu hỏi; cần script kiểm tra tính toàn vẹn (đủ 4 đáp án A/B/C/D, không mất câu).
  - Các bài thực hành Word/PPT hiện ở dạng ảnh chụp đề bài (chưa có file `.docx`/`.pptx` mẫu sẵn), nên trên web cần hiển thị ảnh đề bài sắc nét (hỗ trợ zoom) kèm hướng dẫn từng bước và checklist tự chấm.

---

## 2. Kiến trúc & Tech Stack đề xuất

- **Frontend:** React 19 + TypeScript + Vite + Tailwind CSS v4 (SPA tĩnh, tốc độ tải nhanh, không cần backend phức tạp).
- **Pipeline xử lý dữ liệu (Offline Build Script):** Python (`.venv` với `pymupdf`/`pypdf` và `openpyxl`) đọc toàn bộ PDF & Excel → xuất ra các file JSON chuẩn hóa trong `src/data/` và copy tài nguyên (ảnh đề, file `.xlsx`/`.xlsm`/`.pdf` bài tập) vào `public/materials/`.
- **Lưu tiến độ học tập:** `localStorage` (lưu kết quả thi thử, câu làm sai, bài thực hành đã hoàn thành, ghi chú cá nhân; hỗ trợ Export/Import JSON).
- **Tính năng cốt lõi:**
  1. **Trang chủ & Lộ trình học:** Phân chia rõ 3 môn chính (**Word**, **Excel**, **PowerPoint**) + mục **Kiến thức nền tảng (Module 1, 2, 6)**.
  2. **Học & Luyện Trắc nghiệm (Quiz Engine):**
     - Chế độ **Ôn tập theo Module** (xem đáp án ngay, lọc câu hay sai, tìm kiếm câu hỏi).
     - Chế độ **Thi thử (Mock Test)** có đếm ngược thời gian, tự động trộn đề & trộn đáp án, chấm điểm và xem lại chi tiết câu sai.
  3. **Thực hành Excel 26 bài (`Bài 00` – `Bài 25`):**
     - Hiển thị danh sách 26 bài theo lộ trình, xem trước bảng dữ liệu/câu hỏi ngay trên web (parse từ `.xlsx`), nút tải trực tiếp file bài giảng & file bài tập gốc, kèm hướng dẫn hàm/cú pháp liên quan và đánh dấu hoàn thành.
  4. **Thực hành Word, PowerPoint & Đề thi mẫu:**
     - Trình xem đề bài từ ảnh (`word_1..4`, `ppt_1..3`, `excel_1..5`, `test_1..2`) có phóng to/thu nhỏ, tách từng yêu cầu thành **Checklist thao tác** để học viên tự kiểm tra khi làm trên máy.

---

## 3. Các giai đoạn triển khai

| Giai đoạn | Nội dung chính | Trạng thái | Ghi chú |
| :--- | :--- | :--- | :--- |
| **Giai đoạn 1** | Thiết lập pipeline trích xuất dữ liệu từ PDF, XLSX, JPG sang JSON | `Hoàn thành` (2026-11-25) | 720 câu hỏi (6 module), 26 bài Excel, 9 lab |
| **Giai đoạn 2** | Khởi tạo ứng dụng Web (Vite + React + TypeScript + Tailwind) & Layout tổng thể | `Hoàn thành` (2026-11-25) | Giao diện responsive, `web/` |
| **Giai đoạn 3** | Xây dựng phân hệ Trắc nghiệm (Ôn tập + Thi thử 6 Module) | `Hoàn thành` (2026-11-25) | Tự động trộn đáp án, đếm giờ, chấm điểm |
| **Giai đoạn 4** | Xây dựng phân hệ Thực hành Excel (26 bài) + Thực hành Word/PPT/Đề mẫu | `Hoàn thành` (2026-11-25) | Xem preview bảng tính, tải file gốc, zoom & checklist |
| **Giai đoạn 5** | Dashboard tiến độ cá nhân, kiểm thử & tối ưu | `Hoàn thành` (2026-11-25) | Lưu `localStorage`, `npm run build` thành công |
| **Giai đoạn 6** | **v2.0:** Excel Interactive Formula Lab (`HyperFormula`) & bỏ Bài 24–25 | `Hoàn thành` (2026-11-25) | Thực hành gõ & chấm công thức trực tiếp trên web (8 bài) |
| **Giai đoạn 7** | **v2.1:** Nâng cấp UX Excel (Chọn/kéo vùng, F4 `$`, Fill Handle, Autocomplete) | `Hoàn thành` (2026-11-25) | Thao tác chọn vùng điều kiện giống Excel thật |
| **Giai đoạn 8** | **v2.2:** Lý thuyết & Thực hành trọng tâm cho 5 ảnh bài tập Excel (`excel_1..5`) | `Hoàn thành` (2026-11-27) | Đủ 5 đề ảnh (10 Lab tương tác) + Lý thuyết trọng tâm |
| **Giai đoạn 9** | **v2.3:** Thiết lập CI/CD & Deploy lên Vercel + Tối ưu giao diện Mobile | `Hoàn thành` (2026-11-27) | Git push `vhing004/mos_humg`, `vercel.json`, Bottom Nav & Touch Excel |
| **Giai đoạn 10** | **v2.4:** Phân tích cách giải chi tiết từng câu & Thực hành Step-by-Step cho 5 Đề Excel | `Hoàn thành` (2026-11-27) | Stepper từng câu, phân tích tư duy, ẩn/hiện gợi ý, chấm riêng từng câu |

---

## 4. Hướng phát triển dài hạn (Nâng cao)
- Tích hợp **Excel Formula Sandbox** ngay trên trình duyệt (cho phép gõ thử công thức `SUM`, `IF`, `VLOOKUP`, `COUNTIF` trên bảng mẫu và chấm tự động).
- Thêm **Flashcards phím tắt** (Word, Excel, PowerPoint) trích xuất từ `Bài 23 Các phím tắt thông dụng` và các câu hỏi phím tắt.
- Hỗ trợ PWA (học offline không cần mạng) hoặc đóng gói desktop bằng Tauri/Electron nếu cần phân phối nội bộ.
