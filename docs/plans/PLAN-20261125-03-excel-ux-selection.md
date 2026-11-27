# PLAN-20261125-03: Nâng cấp Trải nghiệm Excel Tương tác (Chọn vùng, F4, Fill Handle, Autocomplete)

- **Task ID:** `03`
- **Ngày tạo:** 2026-11-25
- **Mục tiêu:** Khắc phục việc phải gõ tay địa chỉ ô/vùng trong `ExcelSandbox.tsx`, mang lại trải nghiệm thao tác giống Microsoft Excel thật khi viết công thức.

---

## 1. Các tính năng sẽ bổ sung vào `ExcelSandbox.tsx`

### 1.1. Click & Kéo chuột chọn ô / chọn vùng (Point-and-Click Range Selection)
- Khi đang nhập công thức (bắt đầu bằng `=`) ở **Formula Bar** hoặc trực tiếp trong ô, nếu con trỏ đang đứng sau dấu `=`, `(`, `,`, `;`, `+`, `-`, `*`, `/`, `&`:
  - **Click** vào một ô bất kỳ (kể cả ô dữ liệu cố định như `A2` hay `K1`) → tự động chèn địa chỉ ô (`A2`) vào đúng vị trí con trỏ trong công thức.
  - **Nhấn giữ và kéo chuột (Drag)** qua nhiều ô (ví dụ từ `A8` đến `C10`) → tự động chèn địa chỉ vùng (`A8:C10`) và cập nhật theo thời gian thực khi đang kéo!
- Để người dùng không bị mất focus khỏi công thức khi click vào ô khác, quản lý chế độ **Formula Pointing Mode** (chỉ thoát chế độ nhập công thức khi nhấn `Enter`, `Escape` hoặc bấm nút xác nhận).

### 1.2. Phím tắt `F4` (và nút `$`) chuyển đổi địa chỉ Tuyệt đối / Tương đối
- Khi con trỏ đang nằm cạnh hoặc bên trong một tham chiếu ô/vùng (ví dụ `A8:C10` hoặc `K1`):
  - Nhấn **`F4`** (hoặc bấm nút **`F4 ($)`** trên thanh Formula Bar) sẽ xoay vòng qua 4 trạng thái chuẩn Excel:
    1. `A8:C10` (tương đối)
    2. `$A$8:$C$10` (tuyệt đối cả cột & dòng)
    3. `A$8:C$10` (cố định dòng)
    4. `$A8:$C10` (cố định cột)

### 1.3. Tô màu làm nổi bật các ô/vùng đang được tham chiếu (Formula Reference Highlighting)
- Phân tích công thức của ô đang chọn (regex tìm các tham chiếu như `C2:C6`, `$A$8:$C$10`, `B2`).
- Tự động tô viền màu phân biệt (xanh dương, tím, cam, xanh ngọc...) quanh các ô/vùng đó ngay trên lưới bảng tính để người học nhìn trực quan vùng điều kiện/vùng tính tổng mình vừa chọn.

### 1.4. Kéo góc ô để sao chép công thức (Fill Handle)
- Ở góc dưới bên phải của ô mục tiêu đang chọn, hiển thị ô vuông nhỏ (**Fill Handle `+`**).
- Kéo xuống các ô mục tiêu bên dưới (hoặc double-click vào Fill Handle) để tự động sao chép công thức theo quy tắc Excel: **tăng chỉ số dòng/cột cho tham chiếu tương đối, giữ nguyên phần có dấu `$`**.

### 1.5. Gợi ý hàm & Thanh hướng dẫn tham số (Formula Autocomplete & Signature Tooltip)
- Khi người dùng gõ `=V...`, `=SU...`, `=IF...`, hiển thị dropdown gợi ý các hàm phổ biến (`SUM`, `SUMIF`, `SUMIFS`, `COUNT`, `COUNTA`, `COUNTBLANK`, `COUNTIF`, `IF`, `AND`, `OR`, `LEFT`, `RIGHT`, `MID`, `VALUE`, `VLOOKUP`, `HLOOKUP`, `MAX`, `MIN`, `AVERAGE`).
- Khi đang gõ bên trong ngoặc `(...)` của một hàm (ví dụ `=VLOOKUP(`), hiển thị thanh tooltip ngay dưới Formula Bar ghi rõ cú pháp và làm nổi bật đối số hiện tại đang nhập (ví dụ: `VLOOKUP(lookup_value, table_array, col_index_num, [range_lookup])`).

---

## 2. Chi tiết file cần chỉnh sửa
- `web/src/utils/excelFormulaUtils.ts` *(file mới)*: Tách các hàm thuần túy dễ kiểm thử:
  - `parseFormulaReferences(formula)` → danh sách tọa độ các ô/vùng cần tô màu highlight.
  - `toggleReferenceLock(formula, cursorPos)` → xử lý phím `F4` xoay vòng `$`.
  - `shiftFormulaReferences(formula, deltaRow, deltaCol)` → xử lý kéo Fill Handle sao chép công thức.
  - `EXCEL_FUNCTIONS_DOCS` → từ điển cú pháp & mô tả tham số các hàm Excel cơ bản.
- `web/src/components/ExcelSandbox.tsx`: Tích hợp toàn bộ tương tác chuột (drag selection, fill handle), bàn phím (`F4`, `Enter`, `Esc`, điều hướng dropdown gợi ý) và highlight vùng tham chiếu.

---

## 3. Kiểm thử & Tiêu chí hoàn thành
- Chọn ô/kéo vùng trên lưới chèn đúng `ref` hoặc `start:end` vào công thức.
- Nhấn `F4` chuyển đổi `A8:C10` ↔ `$A$8:$C$10` chính xác.
- Kéo Fill Handle từ `E2` xuống `E6` tự động sinh `=C3*D3` ... `=C6*D6` (và giữ nguyên `$A$8:$C$10` trong `VLOOKUP`).
- `npm run build` (`tsc -b && vite build`) thành công 0 lỗi.
