# PLAN-20261127-06: Hướng dẫn giải chi tiết từng câu & Thực hành từng bước cho 5 Đề thi Excel

## 1. Mục tiêu
Nâng cấp trải nghiệm học 5 đề thi Excel (`group === 'exam'`) trong [ExcelSandbox.tsx](file:///d:/MOS/web/src/components/ExcelSandbox.tsx) từ dạng danh sách yêu cầu chung sang chế độ **học & thực hành lần lượt từng câu (Step-by-Step)**:
1. Hiển thị **đầy đủ từng câu hỏi** của mỗi đề (theo đúng thứ tự Câu 1 → Câu N, bao gồm cả các câu thao tác Excel desktop như Sort/Filter/Format nếu đề gốc có).
2. Mỗi câu có **phân tích chi tiết cách giải** giúp đọc hiểu bản chất (tư duy bài toán, chọn hàm nào, tại sao dùng đối số đó, lưu ý khóa `$` / kiểu dữ liệu), kèm **nút ẩn/hiện gợi ý công thức** riêng cho từng câu.
3. Người học làm **lần lượt từng câu** (chuyển `Câu trước` / `Câu tiếp` hoặc chọn nhanh số câu) và có nút **Kiểm tra riêng câu hiện tại** (highlight đúng/sai các ô thuộc câu đó ngay trên bảng tính), đồng thời vẫn giữ nút **Kiểm tra toàn bộ đề**.

---

## 2. Phân tích dữ liệu 5 đề hiện có
Dựa trên [excel_interactive_labs.json](file:///d:/MOS/web/src/data/excel_interactive_labs.json) và [build_interactive_labs.py](file:///d:/MOS/scripts/build_interactive_labs.py):

| STT | ID Lab | Tên đề | Số `targets` hiện tại | Ghi chú cấu trúc câu |
|---|---|---|---|---|
| 1 | `lab-excel-1-vietda` | Kết quả cuộc thi chạy Việt dã (`excel_1.jpg` & `excel_3.jpg`) | 20 ô (`D4:D9`, `E4:E9`, `G4:G9`, `H12`, `I12`) | Chia thành các câu theo đúng đề: Nội dung thi, Xuất phát, Thành tích, Thống kê MAX/MIN (+ hướng dẫn các câu sắp xếp/rút trích/định dạng nếu có trong đề ảnh) |
| 2 | `lab-excel-2-kho` | Thẻ Nhập Xuất Kho (`excel_2.jpg`) | 30 ô (`G3:G8`, `H3:H8`, `I3:I8`, `J3:J8`, `G9:J9`, `J10:J11`) | 5–6 bước tuần tự: Trị giá → Thuế (IF) → Chuyên chở → Tổng cộng → Tổng/Lớn nhất/Nhỏ nhất |
| 3 | `lab-excel-4-tivi` | Doanh số mặt hàng Tivi (`excel_4.jpg`) | 30 ô (`C3:C7`, `E3:E7`, `F3:F7`, `G3:G7`, `H3:H7`, `I3:I7`) | 6 bước tuần tự: Hiệu → Kích cỡ (`VALUE(RIGHT)`) → Giá bán (2 chiều) → Hỗ trợ giảm → Tặng (`HLOOKUP`) → Còn lại |
| 4 | `lab-excel-5-luong` | Bảng Tính Tiền Lương (`excel_5.jpg`) | 30 ô (`E2:I7`) | 5 bước tuần tự: Lương ngày → Phụ cấp → Tạm ứng → Bảo hiểm → Thực lĩnh |
| 5 | `lab-test-tien-hang` | Bảng Tính Tiền Hàng (`De-mau-UDCNTTCB`) | 16 ô (`B2:B6`, `E2:E6`, `G2:G7`) | 3–4 bước tuần tự: Tên hàng (`VLOOKUP`) → Thành tiền (`IF` / nhân) → Chiết khấu / Tổng cộng |

---

## 3. Thiết kế kiến trúc & Dữ liệu

### 3.1. Mở rộng Type (`web/src/types/index.ts`)
Thêm interface `ExcelExamStep` (tùy chọn `steps?: ExcelExamStep[]` trên `ExcelInteractiveLab` để không phá vỡ 5 bài `lesson`):
```ts
export interface ExcelExamStep {
  stepNumber: number;         // 1, 2, 3...
  title: string;              // Tên ngắn gọn của câu (VD: "Câu 1: Tính cột Nội dung thi")
  requirement: string;        // Đề bài / yêu cầu của câu
  analysis: string[];         // Phân tích tư duy từng bước (vì sao dùng hàm này, đối số nào...)
  formulaPattern: string;     // Công thức mẫu tổng quát cho ô đầu tiên
  tip?: string;               // Lưu ý bẫy thường gặp (F4, VALUE, dấu tiếng Việt...)
  targetRefs: string[];       // Danh sách ô thuộc câu này trên sheet (VD: ["D4","D5",...]). Rỗng [] nếu là câu thao tác Excel desktop (Sort/Filter/Chart)
}
```

### 3.2. Cập nhật script sinh dữ liệu (`scripts/build_interactive_labs.py`)
- Bổ sung mảng `steps` chi tiết cho cả **5 đề thi Excel** (`lab-excel-1-vietda`, `lab-excel-2-kho`, `lab-excel-4-tivi`, `lab-excel-5-luong`, `lab-test-tien-hang`).
- Chạy lại `.venv\Scripts\python.exe scripts/build_interactive_labs.py` để cập nhật `web/src/data/excel_interactive_labs.json`.

### 3.3. Nâng cấp giao diện Step-by-Step (`web/src/components/ExcelSandbox.tsx`)
Khi `lab.steps && lab.steps.length > 0`:
1. **Thanh chọn câu tuần tự (Stepper):**
   - Hiển thị các nút `Câu 1`, `Câu 2`, ..., `Câu N` với trạng thái màu:
     - Đang chọn: nổi bật (`bg-indigo-600 text-white`).
     - Đã kiểm tra đúng hết ô của câu: xanh lá (`bg-emerald-100 text-emerald-800`).
     - Có ô sai: đỏ nhạt (`bg-rose-100 text-rose-800`).
   - Khi chuyển sang `Câu k`, hệ thống tự động focus/chọn ô đầu tiên trong `step.targetRefs` (nếu có) và highlight nhẹ vùng ô cần điền của câu hiện tại.
2. **Thẻ nội dung câu hiện tại:**
   - **Yêu cầu câu:** Mô tả rõ ràng đề bài yêu cầu làm gì.
   - **Phân tích cách giải chi tiết (đọc hiểu):** Giải thích từng bước tư duy (xác định điều kiện, chọn hàm, đối số, vùng khóa `$`).
   - **Nút Ẩn/Hiện Gợi ý cách làm (`showStepHint`):** Mặc định **ẩn** để người học tự tư duy trước; bấm vào sẽ hiện `formulaPattern` + `tip` + nút **"Điền mẫu ô đầu"** (chỉ điền ô đầu tiên của câu để người học tự kéo Fill Handle xuống các ô còn lại).
3. **Kiểm tra kết quả từng câu & toàn đề:**
   - Nút **"Kiểm tra Câu X"**: chỉ chấm và báo đúng/sai cho các ô thuộc `step.targetRefs` của câu hiện tại (ví dụ: *"Câu 2: Đúng 6/6 ô — chuyển sang Câu 3"*), tự động mở khóa/gợi ý bấm `Câu tiếp →`.
   - Với câu thao tác Excel desktop (`targetRefs: []` như Sort, Advanced Filter, Format), hiển thị nút **"Đánh dấu đã hiểu / Hoàn thành bước"** để người học tự xác nhận và chuyển tiếp.
   - Giữ nút **"Kiểm tra toàn bộ đề"** ở thanh hành động dưới cùng để chấm 100% bài và lưu vào `completedInteractiveLabs`.

---

## 4. Phạm vi & Rủi ro
- **Phạm vi file thay đổi:**
  - `web/src/types/index.ts`
  - `scripts/build_interactive_labs.py`
  - `web/src/data/excel_interactive_labs.json` (sinh tự động từ script)
  - `web/src/components/ExcelSandbox.tsx`
- **Tính tương thích ngược:** 5 bài học hàm (`group === 'lesson'`) không có `steps` vẫn giữ nguyên giao diện cũ, không bị ảnh hưởng.
- **Kiểm thử:** Chạy `python scripts/build_interactive_labs.py`, kiểm tra đủ `targetRefs` khớp 100% với `targets`, chạy `npm run build` tại `web/` xác nhận 0 lỗi TypeScript/Vite.

---

## 5. Câu hỏi xác nhận
1. Với các câu trong đề ảnh gốc mang tính thao tác giao diện Excel (như Sắp xếp, Rút trích Advanced Filter, Tạo biểu đồ, Định dạng bảng) không nhập công thức được trên sheet web, bạn muốn đưa vào thành một bước có hướng dẫn thao tác chi tiết + nút xác nhận đã xem/làm để giữ đủ số câu của đề gốc, hay chỉ tách theo các câu có công thức trên bảng tính?
*(Nếu không có yêu cầu khác, tôi đề xuất giữ đầy đủ các câu theo đề gốc — câu công thức thì chấm tự động trên sheet, câu thao tác Excel desktop thì có hướng dẫn chi tiết từng click menu và nút xác nhận chuyển câu.)*
