"""
Sinh dữ liệu bảng tính tương tác (Excel Interactive Formula Lab) cho HyperFormula.
Bao gồm:
- 5 bài luyện hàm trọng tâm (Bài 03 -> Bài 07)
- Đầy đủ 5 đề ảnh bài tập Excel (excel_1.jpg -> excel_5.jpg) kèm Lý thuyết trọng tâm & Ảnh đề gốc
- Phần Excel trong đề thi mẫu UDCNTTCB
"""
import json
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent.parent / "web" / "src" / "data"


def build_interactive_labs() -> list[dict]:
    labs = [
        # 1. Đề ảnh excel_1.jpg & excel_3.jpg: Việt dã
        {
            "id": "lab-excel-1-vietda",
            "group": "exam",
            "badge": "Đề ảnh 01 & 03",
            "title": "Kết quả cuộc thi chạy Việt dã (excel_1.jpg & excel_3.jpg)",
            "description": "Thực hành kết hợp LEFT + VLOOKUP lấy nội dung thi, VLOOKUP + IF tra giờ xuất phát theo Phái, tính thành tích (phút) và thống kê MAX/MIN.",
            "imageUrl": "/materials/images/excel_1.jpg",
            "theoryPoints": [
                {
                    "title": "1. Tách ký tự đầu & Dò bảng phụ",
                    "syntax": "=VLOOKUP(LEFT(A4,1), $A$11:$D$13, 2, 0)",
                    "explanation": "LEFT(A4,1) lấy ký tự đầu của Mã số ('M', 'B', 'C') để dò tìm chính xác (0) trong bảng Nội dung thi.",
                    "tip": "Luôn nhấn F4 để khóa bảng phụ $A$11:$D$13 trước khi kéo công thức xuống."
                },
                {
                    "title": "2. Dò tìm 2 điều kiện (Mã số + Phái)",
                    "syntax": '=VLOOKUP(LEFT(A4,1), $A$11:$D$13, IF(C4="Nữ",3,4), 0)',
                    "explanation": "Cột 3 là giờ xuất phát của Nữ, cột 4 là của Nam. Dùng hàm IF ở đối số col_index_num để chọn đúng cột.",
                    "tip": "Kiểm tra đúng chính tả chữ \"Nữ\" có dấu tiếng Việt."
                },
                {
                    "title": "3. Tính Thành tích (đơn vị phút)",
                    "syntax": "=F4-E4",
                    "explanation": "Trong bài này, thời gian Xuất phát và Về đích được quy đổi sẵn sang tổng số phút (ví dụ 8:49 = 529 phút) để bạn trừ trực tiếp.",
                    "tip": "Trên Excel thật, nếu nhập dạng giờ hh:mm thì Thành tích = Về đích - Xuất phát và định dạng [h]:mm."
                },
                {
                    "title": "4. Thống kê theo điều kiện & Rút trích",
                    "syntax": "=MAX(G4:G9) / =MIN(G4:G9) / Advanced Filter",
                    "explanation": "Lọc riêng nhóm Maraton hoặc dùng MAX/MIN trên vùng thành tích. Trên Excel desktop, dùng Data -> Sort nhiều cấp và Data -> Advanced Filter."
                }
            ],
            "instructions": [
                "Cột Nội dung thi (D4:D9): Dùng VLOOKUP kết hợp LEFT(A4,1) dò trong bảng $A$11:$D$13 lấy cột 2.",
                "Cột Xuất phát (phút) (E4:E9): Dùng VLOOKUP kết hợp LEFT(A4,1) và IF(C4=\"Nữ\",3,4) lấy giờ xuất phát (đã quy đổi ra phút).",
                "Cột Thành tích (phút) (G4:G9): Tính = Về đích - Xuất phát (F4-E4).",
                "Ô H12 & I12: Tính Thành tích cao nhất (MAX) và thấp nhất (MIN) của cột Thành tích (G4:G9).",
            ],
            "steps": [
                {
                    "stepNumber": 1,
                    "title": "Câu 1: Điền cột Nội dung thi (D4:D9)",
                    "requirement": "Dựa vào ký tự đầu của Mã số (M, B, C) để tra tên Nội dung thi từ bảng phụ ở dưới.",
                    "analysis": [
                        "Bước 1 — Xác định giá trị dò: Mã số ở cột A có dạng 'M1', 'B2', 'C4', trong khi bảng phụ ($A$11:$D$13) chỉ ghi ký tự đầu 'M', 'B', 'C'. Vì vậy phải dùng LEFT(A4, 1) để cắt lấy 1 ký tự bên trái.",
                        "Bước 2 — Chọn hàm dò: Bảng phụ xếp theo cột dọc nên dùng VLOOKUP.",
                        "Bước 3 — Xác định vùng bảng phụ & cột lấy: Vùng $A$11:$D$13 (nhấn F4 khóa tuyệt đối để kéo xuống không bị lệch), Nội dung thi nằm ở cột thứ 2, dò chính xác nên đối số cuối là 0."
                    ],
                    "formulaPattern": "=VLOOKUP(LEFT(A4,1), $A$11:$D$13, 2, 0)",
                    "tip": "Nhớ khóa bảng phụ $A$11:$D$13 bằng phím F4 rồi mới kéo Fill Handle từ D4 xuống D9.",
                    "targetRefs": ["D4", "D5", "D6", "D7", "D8", "D9"]
                },
                {
                    "stepNumber": 2,
                    "title": "Câu 2: Tính giờ Xuất phát theo Phái (E4:E9)",
                    "requirement": "Tra giờ xuất phát (đã quy đổi ra phút) dựa vào cả Mã số (M/B/C) và Phái (Nam/Nữ).",
                    "analysis": [
                        "Bước 1 — Vẫn dò theo dòng bằng LEFT(A4, 1) trong bảng $A$11:$D$13.",
                        "Bước 2 — Chọn cột linh hoạt theo Phái: Trong bảng phụ, cột 3 là giờ xuất phát của Nữ, cột 4 là của Nam.",
                        "Bước 3 — Lồng hàm IF vào vị trí col_index_num của VLOOKUP: nếu C4=\"Nữ\" thì lấy cột 3, ngược lại lấy cột 4."
                    ],
                    "formulaPattern": '=VLOOKUP(LEFT(A4,1), $A$11:$D$13, IF(C4="Nữ",3,4), 0)',
                    "tip": "Chữ \"Nữ\" phải đặt trong ngoặc kép và gõ đúng dấu tiếng Việt như trong cột C.",
                    "targetRefs": ["E4", "E5", "E6", "E7", "E8", "E9"]
                },
                {
                    "stepNumber": 3,
                    "title": "Câu 3: Tính Thành tích chạy (G4:G9)",
                    "requirement": "Tính thời gian chạy thực tế (tính bằng phút) từ lúc Xuất phát đến lúc Về đích.",
                    "analysis": [
                        "Bước 1 — Thành tích = Thời điểm Về đích (cột F) trừ đi Thời điểm Xuất phát (cột E).",
                        "Bước 2 — Do cả hai cột đã quy đổi sẵn sang đơn vị phút nên chỉ cần dùng phép trừ trực tiếp F4 - E4."
                    ],
                    "formulaPattern": "=F4-E4",
                    "tip": "Nếu làm trên Excel thật với định dạng giờ hh:mm, vẫn lấy Về đích - Xuất phát nhưng phải định dạng ô kết quả là [h]:mm.",
                    "targetRefs": ["G4", "G5", "G6", "G7", "G8", "G9"]
                },
                {
                    "stepNumber": 4,
                    "title": "Câu 4: Thống kê Thành tích Cao nhất & Thấp nhất (H12, I12)",
                    "requirement": "Tìm giá trị Thành tích lớn nhất (ô H12) và nhỏ nhất (ô I12) của toàn bộ VĐV.",
                    "analysis": [
                        "Bước 1 — Ô H12 (Cao nhất): dùng hàm MAX trên toàn bộ cột Thành tích G4:G9.",
                        "Bước 2 — Ô I12 (Thấp nhất): dùng hàm MIN trên cùng vùng G4:G9."
                    ],
                    "formulaPattern": "=MAX(G4:G9)  và  =MIN(G4:G9)",
                    "tip": "Có thể gõ =MAX( rồi kéo chọn thẳng vùng G4:G9 trên bảng tính.",
                    "targetRefs": ["H12", "I12"]
                },
                {
                    "stepNumber": 5,
                    "title": "Câu 5: Sắp xếp & Rút trích danh sách VĐV (Thao tác Excel)",
                    "requirement": "Sắp xếp bảng tăng dần theo Thành tích; rút trích các VĐV thi nội dung Maraton sang vùng mới.",
                    "analysis": [
                        "Thao tác 1 (Sort): Bôi đen bảng A3:G9 → thẻ Data → Sort → Sort by: Thành tích, Order: Smallest to Largest (tăng dần theo số phút chạy ít nhất).",
                        "Thao tác 2 (Advanced Filter): Tạo vùng điều kiện gồm 2 ô: tiêu đề 'Nội dung thi' ở trên và 'Maraton' ở dưới → Data → Advanced → Copy to another location → chọn List range, Criteria range và Copy to."
                    ],
                    "formulaPattern": "Data → Sort  |  Data → Advanced Filter",
                    "tip": "Đây là câu thao tác giao diện Excel trên máy tính (không cần nhập công thức trên sheet). Đọc kỹ các bước rồi bấm xác nhận hoàn thành.",
                    "targetRefs": []
                }
            ],
            "colHeaders": ["A", "B", "C", "D", "E", "F", "G", "H", "I"],
            "rows": [
                ["Mã số", "Họ Tên", "Phái", "Nội dung thi", "Xuất phát (phút)", "Về đích (phút)", "Thành tích", "", ""],
                ["", "", "", "", "6:00=360", "8:49=529", "", "", ""],
                ["", "", "", "", "", "", "", "", ""],
                ["M1", "Trần Tấn Tài", "Nam", None, None, 529, None, "", ""],
                ["B2", "Lê Xuân An", "Nữ", None, None, 545, None, "", ""],
                ["B3", "Lê Văn Toàn", "Nam", None, None, 537, None, "", ""],
                ["C4", "Võ Thế Bảo", "Nam", None, None, 583, None, "", ""],
                ["M5", "Lê Minh Tâm", "Nam", None, None, 550, None, "", ""],
                ["C6", "Vũ Thị Liên", "Nữ", None, None, 592, None, "", ""],
                ["Mã", "Nội dung thi", "Nữ (phút)", "Nam (phút)", "", "", "Thống kê chung", "Cao nhất", "Thấp nhất"],
                ["M", "Maraton", 360, 390, "", "", "", "", ""],
                ["B", "Đi bộ 20 km", 420, 450, "", "", "Tất cả VĐV", None, None],
                ["C", "Chạy 10000 m", 510, 540, "", "", "", "", ""],
            ],
            "targets": [
                {"row": 3, "col": 3, "ref": "D4", "expectedFormula": "=VLOOKUP(LEFT(A4,1),$A$11:$D$13,2,0)", "expectedValue": "Maraton", "hint": "=VLOOKUP(LEFT(A4,1),$A$11:$D$13,2,0)"},
                {"row": 4, "col": 3, "ref": "D5", "expectedFormula": "=VLOOKUP(LEFT(A5,1),$A$11:$D$13,2,0)", "expectedValue": "Đi bộ 20 km", "hint": "=VLOOKUP(LEFT(A5,1),$A$11:$D$13,2,0)"},
                {"row": 5, "col": 3, "ref": "D6", "expectedFormula": "=VLOOKUP(LEFT(A6,1),$A$11:$D$13,2,0)", "expectedValue": "Đi bộ 20 km", "hint": "=VLOOKUP(LEFT(A6,1),$A$11:$D$13,2,0)"},
                {"row": 6, "col": 3, "ref": "D7", "expectedFormula": "=VLOOKUP(LEFT(A7,1),$A$11:$D$13,2,0)", "expectedValue": "Chạy 10000 m", "hint": "=VLOOKUP(LEFT(A7,1),$A$11:$D$13,2,0)"},
                {"row": 7, "col": 3, "ref": "D8", "expectedFormula": "=VLOOKUP(LEFT(A8,1),$A$11:$D$13,2,0)", "expectedValue": "Maraton", "hint": "=VLOOKUP(LEFT(A8,1),$A$11:$D$13,2,0)"},
                {"row": 8, "col": 3, "ref": "D9", "expectedFormula": "=VLOOKUP(LEFT(A9,1),$A$11:$D$13,2,0)", "expectedValue": "Chạy 10000 m", "hint": "=VLOOKUP(LEFT(A9,1),$A$11:$D$13,2,0)"},

                {"row": 3, "col": 4, "ref": "E4", "expectedFormula": '=VLOOKUP(LEFT(A4,1),$A$11:$D$13,IF(C4="Nữ",3,4),0)', "expectedValue": 390, "hint": '=VLOOKUP(LEFT(A4,1),$A$11:$D$13,IF(C4="Nữ",3,4),0)'},
                {"row": 4, "col": 4, "ref": "E5", "expectedFormula": '=VLOOKUP(LEFT(A5,1),$A$11:$D$13,IF(C5="Nữ",3,4),0)', "expectedValue": 420, "hint": '=VLOOKUP(LEFT(A5,1),$A$11:$D$13,IF(C5="Nữ",3,4),0)'},
                {"row": 5, "col": 4, "ref": "E6", "expectedFormula": '=VLOOKUP(LEFT(A6,1),$A$11:$D$13,IF(C6="Nữ",3,4),0)', "expectedValue": 450, "hint": '=VLOOKUP(LEFT(A6,1),$A$11:$D$13,IF(C6="Nữ",3,4),0)'},
                {"row": 6, "col": 4, "ref": "E7", "expectedFormula": '=VLOOKUP(LEFT(A7,1),$A$11:$D$13,IF(C7="Nữ",3,4),0)', "expectedValue": 540, "hint": '=VLOOKUP(LEFT(A7,1),$A$11:$D$13,IF(C7="Nữ",3,4),0)'},
                {"row": 7, "col": 4, "ref": "E8", "expectedFormula": '=VLOOKUP(LEFT(A8,1),$A$11:$D$13,IF(C8="Nữ",3,4),0)', "expectedValue": 390, "hint": '=VLOOKUP(LEFT(A8,1),$A$11:$D$13,IF(C8="Nữ",3,4),0)'},
                {"row": 8, "col": 4, "ref": "E9", "expectedFormula": '=VLOOKUP(LEFT(A9,1),$A$11:$D$13,IF(C9="Nữ",3,4),0)', "expectedValue": 510, "hint": '=VLOOKUP(LEFT(A9,1),$A$11:$D$13,IF(C9="Nữ",3,4),0)'},

                {"row": 3, "col": 6, "ref": "G4", "expectedFormula": "=F4-E4", "expectedValue": 139, "hint": "=F4-E4"},
                {"row": 4, "col": 6, "ref": "G5", "expectedFormula": "=F5-E5", "expectedValue": 125, "hint": "=F5-E5"},
                {"row": 5, "col": 6, "ref": "G6", "expectedFormula": "=F6-E6", "expectedValue": 87, "hint": "=F6-E6"},
                {"row": 6, "col": 6, "ref": "G7", "expectedFormula": "=F7-E7", "expectedValue": 43, "hint": "=F7-E7"},
                {"row": 7, "col": 6, "ref": "G8", "expectedFormula": "=F8-E8", "expectedValue": 160, "hint": "=F8-E8"},
                {"row": 8, "col": 6, "ref": "G9", "expectedFormula": "=F9-E9", "expectedValue": 82, "hint": "=F9-E9"},

                {"row": 11, "col": 7, "ref": "H12", "expectedFormula": "=MAX(G4:G9)", "expectedValue": 160, "hint": "=MAX(G4:G9)"},
                {"row": 11, "col": 8, "ref": "I12", "expectedFormula": "=MIN(G4:G9)", "expectedValue": 43, "hint": "=MIN(G4:G9)"},
            ],
        },
        # 2. Đề ảnh excel_2.jpg: Thẻ nhập xuất kho
        {
            "id": "lab-excel-2-kho",
            "group": "exam",
            "badge": "Đề ảnh 02",
            "title": "Thẻ Nhập Xuất Kho (excel_2.jpg)",
            "description": "Bài thực hành chuẩn từ ảnh đề excel_2.jpg: Trị giá, Chuyên chở, Thuế (IF > 33.000.000), Tổng cộng và SUM/MAX/MIN.",
            "imageUrl": "/materials/images/excel_2.jpg",
            "theoryPoints": [
                {
                    "title": "1. Phép tính cơ bản & Phân tách phần trăm",
                    "syntax": "=D3*F3  và  =D3*400",
                    "explanation": "Tính Trị giá = Số lượng * Đơn giá; Chuyên chở = Số lượng * 400."
                },
                {
                    "title": "2. Hàm điều kiện IF tính Thuế theo ngưỡng",
                    "syntax": "=IF(G3>33000000, G3*7%, G3*6%)",
                    "explanation": "Nếu Trị giá > 33.000.000 thì thuế 7% (0.07), ngược lại (<= 33.000.000) thì thuế 6% (0.06).",
                    "tip": "Không gõ dấu chấm ngăn cách hàng ngàn vào số 33000000 trong công thức."
                },
                {
                    "title": "3. Tổng hợp SUM, MAX, MIN",
                    "syntax": "=SUM(J3:J8) / =MAX(J3:J8) / =MIN(J3:J8)",
                    "explanation": "Tính tổng, giá trị lớn nhất và nhỏ nhất cho cột Tổng cộng."
                }
            ],
            "instructions": [
                "Cột Trị giá (G3:G8): Số lượng * Đơn giá (D3*F3).",
                "Cột Thuế (H3:H8): Nếu Trị giá > 33000000 thì Trị giá * 7%, ngược lại Trị giá * 6%.",
                "Cột Chuyên chở (I3:I8): Số lượng * 400 (D3*400).",
                "Cột Tổng cộng (J3:J8): Trị giá + Thuế + Chuyên chở.",
                "Dòng 9 (Tổng): Dùng SUM cho G9, H9, I9, J9. Dòng 10–11: MAX và MIN cho cột J.",
            ],
            "steps": [
                {
                    "stepNumber": 1,
                    "title": "Câu 1: Tính cột Trị giá (G3:G8)",
                    "requirement": "Tính Trị giá của từng mặt hàng bằng Số lượng nhân Đơn giá.",
                    "analysis": [
                        "Bước 1 — Xác định vị trí dữ liệu dòng đầu tiên (dòng 3): Số lượng nằm ở ô D3, Đơn giá nằm ở ô F3.",
                        "Bước 2 — Nhân trực tiếp hai ô để ra Trị giá, sau đó kéo Fill Handle xuống đến dòng 8."
                    ],
                    "formulaPattern": "=D3*F3",
                    "tip": "Không khóa $ ở D3 hay F3 vì mỗi dòng có Số lượng và Đơn giá riêng.",
                    "targetRefs": ["G3", "G4", "G5", "G6", "G7", "G8"]
                },
                {
                    "stepNumber": 2,
                    "title": "Câu 2: Tính cột Thuế theo điều kiện (H3:H8)",
                    "requirement": "Nếu Trị giá > 33.000.000 thì Thuế = 7% Trị giá, ngược lại Thuế = 6% Trị giá.",
                    "analysis": [
                        "Bước 1 — Bài toán có 2 nhánh điều kiện rõ ràng nên dùng hàm IF(điều_kiện, đúng, sai).",
                        "Bước 2 — Điều kiện: G3 > 33000000 (viết liền số, tuyệt đối không gõ dấu chấm ngăn cách).",
                        "Bước 3 — Nếu đúng: G3*7% (hoặc G3*0.07). Nếu sai: G3*6% (hoặc G3*0.06)."
                    ],
                    "formulaPattern": "=IF(G3>33000000, G3*7%, G3*6%)",
                    "tip": "Kiểm tra lại kết quả: các mặt hàng có Trị giá > 33 triệu (như Gạo nếp, Gạo ST24) phải áp mức 7%.",
                    "targetRefs": ["H3", "H4", "H5", "H6", "H7", "H8"]
                },
                {
                    "stepNumber": 3,
                    "title": "Câu 3: Tính cột Chuyên chở (I3:I8)",
                    "requirement": "Tính chi phí Chuyên chở = Số lượng * 400.",
                    "analysis": [
                        "Bước 1 — Lấy Số lượng tại ô D3 nhân với hằng số 400.",
                        "Bước 2 — Kéo công thức từ I3 xuống I8."
                    ],
                    "formulaPattern": "=D3*400",
                    "tip": "Đơn vị tính đã thống nhất là đồng/kg nên nhân trực tiếp với 400.",
                    "targetRefs": ["I3", "I4", "I5", "I6", "I7", "I8"]
                },
                {
                    "stepNumber": 4,
                    "title": "Câu 4: Tính cột Tổng cộng (J3:J8)",
                    "requirement": "Tính Tổng cộng = Trị giá + Thuế + Chuyên chở.",
                    "analysis": [
                        "Bước 1 — Cộng 3 cột liền kề là G3, H3 và I3.",
                        "Bước 2 — Có thể viết =G3+H3+I3 hoặc =SUM(G3:I3) đều cho kết quả giống nhau."
                    ],
                    "formulaPattern": "=G3+H3+I3",
                    "tip": "Kéo Fill Handle từ J3 xuống J8 để hoàn thành cả cột.",
                    "targetRefs": ["J3", "J4", "J5", "J6", "J7", "J8"]
                },
                {
                    "stepNumber": 5,
                    "title": "Câu 5: Tính Tổng, Lớn nhất, Nhỏ nhất (Dòng 9–11)",
                    "requirement": "Tính Tổng cộng cho 4 cột (G9:J9) và tìm Lớn nhất (J10), Nhỏ nhất (J11) của cột Tổng cộng.",
                    "analysis": [
                        "Bước 1 — Tại G9, H9, I9, J9: dùng hàm =SUM(cột_từ_dòng_3_đến_8).",
                        "Bước 2 — Tại J10: dùng =MAX(J3:J8) để tìm Tổng cộng cao nhất.",
                        "Bước 3 — Tại J11: dùng =MIN(J3:J8) để tìm Tổng cộng thấp nhất."
                    ],
                    "formulaPattern": "=SUM(G3:G8)  |  =MAX(J3:J8)  |  =MIN(J3:J8)",
                    "tip": "Chú ý vùng dữ liệu chỉ từ dòng 3 đến dòng 8 (không quét nhầm vào dòng 9 Tổng khi tính MAX/MIN).",
                    "targetRefs": ["G9", "H9", "I9", "J9", "J10", "J11"]
                },
                {
                    "stepNumber": 6,
                    "title": "Câu 6: Định dạng số & Kẻ khung bảng (Thao tác Excel)",
                    "requirement": "Định dạng các cột tiền có dấu phân cách hàng ngàn, kẻ viền và căn giữa tiêu đề.",
                    "analysis": [
                        "Thao tác 1 — Định dạng số: Chọn vùng D3:D8 và F3:J11 → thẻ Home → bấm nút Comma Style (,) rồi bấm Decrease Decimal 2 lần để bỏ phần thập phân .00.",
                        "Thao tác 2 — Kẻ khung: Chọn toàn bảng → Home → Borders → All Borders."
                    ],
                    "formulaPattern": "Home → Comma Style (,) → Decrease Decimal",
                    "tip": "Câu thao tác định dạng trên Excel desktop — đọc hướng dẫn rồi bấm xác nhận để hoàn thành bước này.",
                    "targetRefs": []
                }
            ],
            "colHeaders": ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"],
            "rows": [
                ["TT", "Diễn giải", "Đơn vị", "Số lượng", "Tên kho", "Đơn giá", "Trị giá", "Thuế", "Chuyên chở", "Tổng cộng"],
                ["", "", "", "", "", "", "", "", "", ""],
                [1, "Gạo nàng hương", "Kg", 2000, "GNH", 15000, None, None, None, None],
                [2, "Gạo nàng thơm", "Kg", 1580, "GNT", 15500, None, None, None, None],
                [3, "Gạo tẻ", "Kg", 2200, "GT", 14800, None, None, None, None],
                [4, "Gạo nếp", "Kg", 2700, "GN", 16800, None, None, None, None],
                [5, "Bột mì Pháp", "Kg", 1500, "BMP", 17000, None, None, None, None],
                [6, "Gạo ST24", "Kg", 1600, "ST24", 30000, None, None, None, None],
                ["", "Tổng", "", "", "", "", None, None, None, None],
                ["", "Lớn nhất", "", "", "", "", "", "", "", None],
                ["", "Nhỏ nhất", "", "", "", "", "", "", "", None],
            ],
            "targets": [
                {"row": 2, "col": 6, "ref": "G3", "expectedFormula": "=D3*F3", "expectedValue": 30000000, "hint": "=D3*F3"},
                {"row": 3, "col": 6, "ref": "G4", "expectedFormula": "=D4*F4", "expectedValue": 24490000, "hint": "=D4*F4"},
                {"row": 4, "col": 6, "ref": "G5", "expectedFormula": "=D5*F5", "expectedValue": 32560000, "hint": "=D5*F5"},
                {"row": 5, "col": 6, "ref": "G6", "expectedFormula": "=D6*F6", "expectedValue": 45360000, "hint": "=D6*F6"},
                {"row": 6, "col": 6, "ref": "G7", "expectedFormula": "=D7*F7", "expectedValue": 25500000, "hint": "=D7*F7"},
                {"row": 7, "col": 6, "ref": "G8", "expectedFormula": "=D8*F8", "expectedValue": 48000000, "hint": "=D8*F8"},

                {"row": 2, "col": 7, "ref": "H3", "expectedFormula": "=IF(G3>33000000,G3*0.07,G3*0.06)", "expectedValue": 1800000, "hint": "=IF(G3>33000000,G3*7%,G3*6%)"},
                {"row": 3, "col": 7, "ref": "H4", "expectedFormula": "=IF(G4>33000000,G4*0.07,G4*0.06)", "expectedValue": 1469400, "hint": "=IF(G4>33000000,G4*7%,G4*6%)"},
                {"row": 4, "col": 7, "ref": "H5", "expectedFormula": "=IF(G5>33000000,G5*0.07,G5*0.06)", "expectedValue": 1953600, "hint": "=IF(G5>33000000,G5*7%,G5*6%)"},
                {"row": 5, "col": 7, "ref": "H6", "expectedFormula": "=IF(G6>33000000,G6*0.07,G6*0.06)", "expectedValue": 3175200, "hint": "=IF(G6>33000000,G6*7%,G6*6%)"},
                {"row": 6, "col": 7, "ref": "H7", "expectedFormula": "=IF(G7>33000000,G7*0.07,G7*0.06)", "expectedValue": 1530000, "hint": "=IF(G7>33000000,G7*7%,G7*6%)"},
                {"row": 7, "col": 7, "ref": "H8", "expectedFormula": "=IF(G8>33000000,G8*0.07,G8*0.06)", "expectedValue": 3360000, "hint": "=IF(G8>33000000,G8*7%,G8*6%)"},

                {"row": 2, "col": 8, "ref": "I3", "expectedFormula": "=D3*400", "expectedValue": 800000, "hint": "=D3*400"},
                {"row": 3, "col": 8, "ref": "I4", "expectedFormula": "=D4*400", "expectedValue": 632000, "hint": "=D4*400"},
                {"row": 4, "col": 8, "ref": "I5", "expectedFormula": "=D5*400", "expectedValue": 880000, "hint": "=D5*400"},
                {"row": 5, "col": 8, "ref": "I6", "expectedFormula": "=D6*400", "expectedValue": 1080000, "hint": "=D6*400"},
                {"row": 6, "col": 8, "ref": "I7", "expectedFormula": "=D7*400", "expectedValue": 600000, "hint": "=D7*400"},
                {"row": 7, "col": 8, "ref": "I8", "expectedFormula": "=D8*400", "expectedValue": 640000, "hint": "=D8*400"},

                {"row": 2, "col": 9, "ref": "J3", "expectedFormula": "=G3+H3+I3", "expectedValue": 32600000, "hint": "=G3+H3+I3"},
                {"row": 3, "col": 9, "ref": "J4", "expectedFormula": "=G4+H4+I4", "expectedValue": 26591400, "hint": "=G4+H4+I4"},
                {"row": 4, "col": 9, "ref": "J5", "expectedFormula": "=G5+H5+I5", "expectedValue": 35393600, "hint": "=G5+H5+I5"},
                {"row": 5, "col": 9, "ref": "J6", "expectedFormula": "=G6+H6+I6", "expectedValue": 49615200, "hint": "=G6+H6+I6"},
                {"row": 6, "col": 9, "ref": "J7", "expectedFormula": "=G7+H7+I7", "expectedValue": 27630000, "hint": "=G7+H7+I7"},
                {"row": 7, "col": 9, "ref": "J8", "expectedFormula": "=G8+H8+I8", "expectedValue": 52000000, "hint": "=G8+H8+I8"},

                {"row": 8, "col": 6, "ref": "G9", "expectedFormula": "=SUM(G3:G8)", "expectedValue": 205910000, "hint": "=SUM(G3:G8)"},
                {"row": 8, "col": 7, "ref": "H9", "expectedFormula": "=SUM(H3:H8)", "expectedValue": 13288200, "hint": "=SUM(H3:H8)"},
                {"row": 8, "col": 8, "ref": "I9", "expectedFormula": "=SUM(I3:I8)", "expectedValue": 4632000, "hint": "=SUM(I3:I8)"},
                {"row": 8, "col": 9, "ref": "J9", "expectedFormula": "=SUM(J3:J8)", "expectedValue": 223830200, "hint": "=SUM(J3:J8)"},
                {"row": 9, "col": 9, "ref": "J10", "expectedFormula": "=MAX(J3:J8)", "expectedValue": 52000000, "hint": "=MAX(J3:J8)"},
                {"row": 10, "col": 9, "ref": "J11", "expectedFormula": "=MIN(J3:J8)", "expectedValue": 26591400, "hint": "=MIN(J3:J8)"},
            ],
        },
        # 3. Đề ảnh excel_4.jpg: Doanh số mặt hàng Tivi
        {
            "id": "lab-excel-4-tivi",
            "group": "exam",
            "badge": "Đề ảnh 04",
            "title": "Doanh số mặt hàng Tivi (excel_4.jpg)",
            "description": "Thực hành tổng hợp LEFT, VALUE(RIGHT), VLOOKUP tra bảng 2 chiều (kết hợp IF/MATCH), HLOOKUP lấy tiền tặng khuyến mãi và tính Còn lại.",
            "imageUrl": "/materials/images/excel_4.jpg",
            "theoryPoints": [
                {
                    "title": "1. Tách chuỗi sang Số bằng VALUE(RIGHT(...))",
                    "syntax": "=VALUE(RIGHT(B3,2))",
                    "explanation": "RIGHT(B3,2) trả về chuỗi \"21\". Phải bọc VALUE() để chuyển thành số 21 mới khớp được với tiêu đề cột 21, 32, 40 trong Bảng giá.",
                    "tip": "Nếu quên VALUE(), hàm HLOOKUP hoặc IF(E3=21,...) sẽ trả về #N/A hoặc sai!"
                },
                {
                    "title": "2. Dò bảng 2 chiều: VLOOKUP + IF (hoặc MATCH)",
                    "syntax": "=VLOOKUP(LEFT(B3,1), $A$11:$F$13, IF(E3=21,4,IF(E3=32,5,6)), 0)",
                    "explanation": "Dò dòng theo ký tự đầu Mã số ('S', 'P', 'T'), còn cột thì dùng IF theo Kích cỡ (21 -> cột 4, 32 -> cột 5, 40 -> cột 6)."
                },
                {
                    "title": "3. Dò ngang HLOOKUP lấy tiền Tặng",
                    "syntax": "=HLOOKUP(E3, $D$10:$F$14, 5, 0)",
                    "explanation": "Bảng khuyến mãi theo kích cỡ (21, 32, 40) nằm theo hàng ngang ở D10:F14; dòng Khuyến mãi là hàng thứ 5."
                },
                {
                    "title": "4. Tính Còn lại sau giảm giá & khuyến mãi",
                    "syntax": "=F3*(1-G3)-H3",
                    "explanation": "Còn lại = Giá bán - (Giá bán * Tỷ lệ hỗ trợ giảm) - Tiền tặng."
                }
            ],
            "instructions": [
                "Cột Hiệu (C3:C7): Dò ký tự đầu Mã số (LEFT(B3,1)) trong $A$11:$F$13 lấy cột 2.",
                "Cột Kích cỡ (E3:E7): Dùng VALUE(RIGHT(B3,2)) lấy 2 số cuối.",
                "Cột Giá bán (F3:F7): Dùng VLOOKUP theo LEFT(B3,1) trong $A$11:$F$13, cột lấy dùng IF(E3=21,4,IF(E3=32,5,6)).",
                "Cột Hỗ trợ giảm (G3:G7): Dùng VLOOKUP theo LEFT(B3,1) lấy cột 3 trong $A$11:$F$13.",
                "Cột Tặng (H3:H7): Dùng HLOOKUP(E3,$D$10:$F$14,5,0). Cột Còn lại (I3:I7): =F3*(1-G3)-H3.",
            ],
            "steps": [
                {
                    "stepNumber": 1,
                    "title": "Câu 1: Điền cột Hiệu Tivi (C3:C7)",
                    "requirement": "Dựa vào ký tự đầu của Mã số ('S', 'P', 'T') để tra tên Hiệu từ bảng giá.",
                    "analysis": [
                        "Bước 1 — Dùng LEFT(B3, 1) để tách ký tự đầu của Mã số ('S21' → 'S').",
                        "Bước 2 — Dùng VLOOKUP dò trong bảng giá $A$11:$F$13 (nhấn F4 khóa vùng), lấy cột thứ 2 (Hiệu), kiểu dò chính xác 0."
                    ],
                    "formulaPattern": "=VLOOKUP(LEFT(B3,1), $A$11:$F$13, 2, 0)",
                    "tip": "Khóa bảng $A$11:$F$13 bằng F4 trước khi kéo xuống C7.",
                    "targetRefs": ["C3", "C4", "C5", "C6", "C7"]
                },
                {
                    "stepNumber": 2,
                    "title": "Câu 2: Tách cột Kích cỡ dạng Số (E3:E7)",
                    "requirement": "Lấy 2 ký tự cuối của Mã số để xác định Kích cỡ (inch) ở dạng số.",
                    "analysis": [
                        "Bước 1 — RIGHT(B3, 2) cắt lấy 2 ký tự cuối ('21', '40', '32').",
                        "Bước 2 — Vì RIGHT trả về chuỗi văn bản (text) nên bắt buộc phải bọc hàm VALUE(...) ra ngoài để chuyển thành số 21, 32, 40."
                    ],
                    "formulaPattern": "=VALUE(RIGHT(B3,2))",
                    "tip": "Nếu quên bọc VALUE(), các câu sau dùng HLOOKUP hoặc so sánh E3=21 sẽ bị lỗi #N/A hoặc sai kết quả!",
                    "targetRefs": ["E3", "E4", "E5", "E6", "E7"]
                },
                {
                    "stepNumber": 3,
                    "title": "Câu 3: Tra Giá bán từ bảng 2 chiều (F3:F7)",
                    "requirement": "Tra Giá bán dựa vào cả Hiệu (dòng) và Kích cỡ (cột 21, 32, 40).",
                    "analysis": [
                        "Bước 1 — Dò theo dòng bằng VLOOKUP với lookup_value là LEFT(B3, 1) trong $A$11:$F$13.",
                        "Bước 2 — Xác định số thứ tự cột (col_index_num): kích cỡ 21 ở cột 4, 32 ở cột 5, 40 ở cột 6.",
                        "Bước 3 — Dùng IF lồng nhau: IF(E3=21, 4, IF(E3=32, 5, 6))."
                    ],
                    "formulaPattern": "=VLOOKUP(LEFT(B3,1), $A$11:$F$13, IF(E3=21,4,IF(E3=32,5,6)), 0)",
                    "tip": "Thay vì IF lồng nhau, trên Excel bạn cũng có thể dùng MATCH(E3, $A$10:$F$10, 0) tại vị trí cột.",
                    "targetRefs": ["F3", "F4", "F5", "F6", "F7"]
                },
                {
                    "stepNumber": 4,
                    "title": "Câu 4: Tra tỷ lệ Hỗ trợ giảm (G3:G7)",
                    "requirement": "Lấy tỷ lệ Nhà SX hỗ trợ giảm giá theo từng hãng từ bảng phụ.",
                    "analysis": [
                        "Bước 1 — Tương tự Câu 1, dùng VLOOKUP(LEFT(B3,1), $A$11:$F$13, 3, 0).",
                        "Bước 2 — Cột 'Nhà SX hỗ trợ' nằm ở cột thứ 3 trong vùng $A$11:$F$13."
                    ],
                    "formulaPattern": "=VLOOKUP(LEFT(B3,1), $A$11:$F$13, 3, 0)",
                    "tip": "Giá trị trả về là số thập phân (0.2 = 20%, 0.3 = 30%).",
                    "targetRefs": ["G3", "G4", "G5", "G6", "G7"]
                },
                {
                    "stepNumber": 5,
                    "title": "Câu 5: Tra tiền Tặng khuyến mãi bằng HLOOKUP (H3:H7)",
                    "requirement": "Dựa vào Kích cỡ (cột E) để tra tiền Khuyến mãi tặng theo bảng ngang $D$10:$F$14.",
                    "analysis": [
                        "Bước 1 — Kích cỡ (21, 32, 40) và dòng Khuyến mãi tặng (200, 1000, 2000) xếp theo hàng ngang nên dùng hàm HLOOKUP.",
                        "Bước 2 — Vùng bảng $D$10:$F$14: dòng 1 là Kích cỡ (row 10), dòng 5 là Khuyến mãi tặng (row 14) → row_index_num = 5, dò chính xác 0."
                    ],
                    "formulaPattern": "=HLOOKUP(E3, $D$10:$F$14, 5, 0)",
                    "tip": "Đếm đúng số dòng từ D10 đến D14: 10(1), 11(2), 12(3), 13(4), 14(5).",
                    "targetRefs": ["H3", "H4", "H5", "H6", "H7"]
                },
                {
                    "stepNumber": 6,
                    "title": "Câu 6: Tính số tiền Còn lại phải trả (I3:I7)",
                    "requirement": "Tính Còn lại = Giá bán - Tiền hỗ trợ giảm - Tiền tặng.",
                    "analysis": [
                        "Bước 1 — Tiền hỗ trợ giảm = Giá bán * Tỷ lệ hỗ trợ (F3 * G3).",
                        "Bước 2 — Gom gọn công thức: F3 * (1 - G3) - H3 (hoặc F3 - F3*G3 - H3)."
                    ],
                    "formulaPattern": "=F3*(1-G3)-H3",
                    "tip": "Kéo Fill Handle từ I3 xuống I7 để hoàn thành bảng.",
                    "targetRefs": ["I3", "I4", "I5", "I6", "I7"]
                }
            ],
            "colHeaders": ["A", "B", "C", "D", "E", "F", "G", "H", "I"],
            "rows": [
                ["STT", "MÃ SỐ", "HIỆU", "NGÀY BÁN", "KÍCH CỠ", "GIÁ BÁN", "HỖ TRỢ GIẢM", "TẶNG", "CÒN LẠI"],
                ["", "", "", "", "", "", "", "", ""],
                [1, "S21", None, "12/02/11", None, None, None, None, None],
                [2, "S40", None, "24/02/11", None, None, None, None, None],
                [3, "T32", None, "07/03/11", None, None, None, None, None],
                [4, "P21", None, "18/03/11", None, None, None, None, None],
                [5, "P40", None, "01/05/11", None, None, None, None, None],
                ["", "", "", "", "", "", "", "", ""],
                ["BẢNG GIÁ (1000đ)", "", "", "Kích cỡ (inch)", "", "", "", "", ""],
                ["Mã số", "Hiệu", "Nhà SX hỗ trợ", 21, 32, 40, "", "", ""],
                ["S", "Sony", 0.2, 2500, 10500, 20700, "", "", ""],
                ["P", "Panasonic", 0.3, 1900, 9800, 18500, "", "", ""],
                ["T", "Toshiba", 0.25, 2200, 9900, 19000, "", "", ""],
                ["Khuyến mãi tặng", "", "", 200, 1000, 2000, "", "", ""],
            ],
            "targets": [
                {"row": 2, "col": 2, "ref": "C3", "expectedFormula": "=VLOOKUP(LEFT(B3,1),$A$11:$F$13,2,0)", "expectedValue": "Sony", "hint": "=VLOOKUP(LEFT(B3,1),$A$11:$F$13,2,0)"},
                {"row": 3, "col": 2, "ref": "C4", "expectedFormula": "=VLOOKUP(LEFT(B4,1),$A$11:$F$13,2,0)", "expectedValue": "Sony", "hint": "=VLOOKUP(LEFT(B4,1),$A$11:$F$13,2,0)"},
                {"row": 4, "col": 2, "ref": "C5", "expectedFormula": "=VLOOKUP(LEFT(B5,1),$A$11:$F$13,2,0)", "expectedValue": "Toshiba", "hint": "=VLOOKUP(LEFT(B5,1),$A$11:$F$13,2,0)"},
                {"row": 5, "col": 2, "ref": "C6", "expectedFormula": "=VLOOKUP(LEFT(B6,1),$A$11:$F$13,2,0)", "expectedValue": "Panasonic", "hint": "=VLOOKUP(LEFT(B6,1),$A$11:$F$13,2,0)"},
                {"row": 6, "col": 2, "ref": "C7", "expectedFormula": "=VLOOKUP(LEFT(B7,1),$A$11:$F$13,2,0)", "expectedValue": "Panasonic", "hint": "=VLOOKUP(LEFT(B7,1),$A$11:$F$13,2,0)"},

                {"row": 2, "col": 4, "ref": "E3", "expectedFormula": "=VALUE(RIGHT(B3,2))", "expectedValue": 21, "hint": "=VALUE(RIGHT(B3,2))"},
                {"row": 3, "col": 4, "ref": "E4", "expectedFormula": "=VALUE(RIGHT(B4,2))", "expectedValue": 40, "hint": "=VALUE(RIGHT(B4,2))"},
                {"row": 4, "col": 4, "ref": "E5", "expectedFormula": "=VALUE(RIGHT(B5,2))", "expectedValue": 32, "hint": "=VALUE(RIGHT(B5,2))"},
                {"row": 5, "col": 4, "ref": "E6", "expectedFormula": "=VALUE(RIGHT(B6,2))", "expectedValue": 21, "hint": "=VALUE(RIGHT(B6,2))"},
                {"row": 6, "col": 4, "ref": "E7", "expectedFormula": "=VALUE(RIGHT(B7,2))", "expectedValue": 40, "hint": "=VALUE(RIGHT(B7,2))"},

                {"row": 2, "col": 5, "ref": "F3", "expectedFormula": "=VLOOKUP(LEFT(B3,1),$A$11:$F$13,IF(E3=21,4,IF(E3=32,5,6)),0)", "expectedValue": 2500, "hint": "=VLOOKUP(LEFT(B3,1),$A$11:$F$13,IF(E3=21,4,IF(E3=32,5,6)),0)"},
                {"row": 3, "col": 5, "ref": "F4", "expectedFormula": "=VLOOKUP(LEFT(B4,1),$A$11:$F$13,IF(E4=21,4,IF(E4=32,5,6)),0)", "expectedValue": 20700, "hint": "=VLOOKUP(LEFT(B4,1),$A$11:$F$13,IF(E4=21,4,IF(E4=32,5,6)),0)"},
                {"row": 4, "col": 5, "ref": "F5", "expectedFormula": "=VLOOKUP(LEFT(B5,1),$A$11:$F$13,IF(E5=21,4,IF(E5=32,5,6)),0)", "expectedValue": 9900, "hint": "=VLOOKUP(LEFT(B5,1),$A$11:$F$13,IF(E5=21,4,IF(E5=32,5,6)),0)"},
                {"row": 5, "col": 5, "ref": "F6", "expectedFormula": "=VLOOKUP(LEFT(B6,1),$A$11:$F$13,IF(E6=21,4,IF(E6=32,5,6)),0)", "expectedValue": 1900, "hint": "=VLOOKUP(LEFT(B6,1),$A$11:$F$13,IF(E6=21,4,IF(E6=32,5,6)),0)"},
                {"row": 6, "col": 5, "ref": "F7", "expectedFormula": "=VLOOKUP(LEFT(B7,1),$A$11:$F$13,IF(E7=21,4,IF(E7=32,5,6)),0)", "expectedValue": 18500, "hint": "=VLOOKUP(LEFT(B7,1),$A$11:$F$13,IF(E7=21,4,IF(E7=32,5,6)),0)"},

                {"row": 2, "col": 6, "ref": "G3", "expectedFormula": "=VLOOKUP(LEFT(B3,1),$A$11:$F$13,3,0)", "expectedValue": 0.2, "hint": "=VLOOKUP(LEFT(B3,1),$A$11:$F$13,3,0)"},
                {"row": 3, "col": 6, "ref": "G4", "expectedFormula": "=VLOOKUP(LEFT(B4,1),$A$11:$F$13,3,0)", "expectedValue": 0.2, "hint": "=VLOOKUP(LEFT(B4,1),$A$11:$F$13,3,0)"},
                {"row": 4, "col": 6, "ref": "G5", "expectedFormula": "=VLOOKUP(LEFT(B5,1),$A$11:$F$13,3,0)", "expectedValue": 0.25, "hint": "=VLOOKUP(LEFT(B5,1),$A$11:$F$13,3,0)"},
                {"row": 5, "col": 6, "ref": "G6", "expectedFormula": "=VLOOKUP(LEFT(B6,1),$A$11:$F$13,3,0)", "expectedValue": 0.3, "hint": "=VLOOKUP(LEFT(B6,1),$A$11:$F$13,3,0)"},
                {"row": 6, "col": 6, "ref": "G7", "expectedFormula": "=VLOOKUP(LEFT(B7,1),$A$11:$F$13,3,0)", "expectedValue": 0.3, "hint": "=VLOOKUP(LEFT(B7,1),$A$11:$F$13,3,0)"},

                {"row": 2, "col": 7, "ref": "H3", "expectedFormula": "=HLOOKUP(E3,$D$10:$F$14,5,0)", "expectedValue": 200, "hint": "=HLOOKUP(E3,$D$10:$F$14,5,0)"},
                {"row": 3, "col": 7, "ref": "H4", "expectedFormula": "=HLOOKUP(E4,$D$10:$F$14,5,0)", "expectedValue": 2000, "hint": "=HLOOKUP(E4,$D$10:$F$14,5,0)"},
                {"row": 4, "col": 7, "ref": "H5", "expectedFormula": "=HLOOKUP(E5,$D$10:$F$14,5,0)", "expectedValue": 1000, "hint": "=HLOOKUP(E5,$D$10:$F$14,5,0)"},
                {"row": 5, "col": 7, "ref": "H6", "expectedFormula": "=HLOOKUP(E6,$D$10:$F$14,5,0)", "expectedValue": 200, "hint": "=HLOOKUP(E6,$D$10:$F$14,5,0)"},
                {"row": 6, "col": 7, "ref": "H7", "expectedFormula": "=HLOOKUP(E7,$D$10:$F$14,5,0)", "expectedValue": 2000, "hint": "=HLOOKUP(E7,$D$10:$F$14,5,0)"},

                {"row": 2, "col": 8, "ref": "I3", "expectedFormula": "=F3*(1-G3)-H3", "expectedValue": 1800, "hint": "=F3*(1-G3)-H3"},
                {"row": 3, "col": 8, "ref": "I4", "expectedFormula": "=F4*(1-G4)-H4", "expectedValue": 14560, "hint": "=F4*(1-G4)-H4"},
                {"row": 4, "col": 8, "ref": "I5", "expectedFormula": "=F5*(1-G5)-H5", "expectedValue": 6425, "hint": "=F5*(1-G5)-H5"},
                {"row": 5, "col": 8, "ref": "I6", "expectedFormula": "=F6*(1-G6)-H6", "expectedValue": 1130, "hint": "=F6*(1-G6)-H6"},
                {"row": 6, "col": 8, "ref": "I7", "expectedFormula": "=F7*(1-G7)-H7", "expectedValue": 10950, "hint": "=F7*(1-G7)-H7"},
            ],
        },
        # 4. Đề ảnh excel_5.jpg: Bảng tính tiền lương
        {
            "id": "lab-excel-5-luong",
            "group": "exam",
            "badge": "Đề ảnh 05",
            "title": "Bảng Tính Tiền Lương (excel_5.jpg)",
            "description": "Bài thực hành chuẩn từ ảnh đề excel_5.jpg: Số ngày làm, Lương theo bậc (IF + F4), VLOOKUP Tiền thưởng, Thưởng ngày công và Tổng lương.",
            "imageUrl": "/materials/images/excel_5.jpg",
            "theoryPoints": [
                {
                    "title": "1. Khóa ô cố định bằng phím F4 ($K$1)",
                    "syntax": '=IF(B2="Trưởng phòng", 4, 2.5) * $K$1',
                    "explanation": "Ô chứa Lương cơ bản (2.430.000) là ô dùng chung cho tất cả nhân viên. Phải nhấn F4 thành $K$1 để khi kéo Fill Handle không bị nhảy sang K2, K3."
                },
                {
                    "title": "2. Dò Tiền thưởng bằng VLOOKUP",
                    "syntax": "=VLOOKUP(A2, $A$10:$B$12, 2, 0)",
                    "explanation": "Dò Mã nhân viên ('HC', 'KT', 'BV') trong Bảng tiền thưởng $A$10:$B$12, lấy cột 2, dò chính xác (0)."
                },
                {
                    "title": "3. Thưởng theo ngày làm việc",
                    "syntax": "=IF(E2>25, 200000, 0)",
                    "explanation": "Nếu Số ngày làm > 25 thì thưởng 200.000, ngược lại 0."
                }
            ],
            "instructions": [
                "Cột Số ngày làm (E2:E7): = Ngày kết thúc - Ngày bắt đầu (D2-C2).",
                "Cột Lương theo bậc (F2:F7): Nếu Chức vụ = 'Trưởng phòng' thì 4 * $K$1, ngược lại 2.5 * $K$1 (Lương CB K1 = 2430000).",
                "Cột Tiền thưởng (G2:G7): VLOOKUP dựa vào Mã NV (A2:A7) trong bảng $A$10:$B$12.",
                "Cột Thưởng ngày làm (H2:H7): Nếu Số ngày làm > 25 thì 200000, ngược lại 0.",
                "Cột Tổng lương (I2:I7): Lương theo bậc + Tiền thưởng + Thưởng ngày làm.",
            ],
            "steps": [
                {
                    "stepNumber": 1,
                    "title": "Câu 1: Tính Số ngày làm việc (E2:E7)",
                    "requirement": "Tính Số ngày làm bằng Đến ngày trừ Từ ngày.",
                    "analysis": [
                        "Bước 1 — Lấy ô Đến ngày (D2) trừ đi ô Từ ngày (C2).",
                        "Bước 2 — Kéo Fill Handle từ E2 xuống E7."
                    ],
                    "formulaPattern": "=D2-C2",
                    "tip": "Không cần cộng thêm 1 trong bài mẫu này (theo đáp án chuẩn của đề).",
                    "targetRefs": ["E2", "E3", "E4", "E5", "E6", "E7"]
                },
                {
                    "stepNumber": 2,
                    "title": "Câu 2: Tính Lương theo bậc (F2:F7) — Lưu ý F4 khóa $K$1",
                    "requirement": "Nếu Chức vụ là 'Trưởng phòng' thì hệ số 4, ngược lại hệ số 2.5, nhân với Lương cơ bản ở ô K1.",
                    "analysis": [
                        "Bước 1 — Dùng IF kiểm tra Chức vụ: IF(B2=\"Trưởng phòng\", 4, 2.5).",
                        "Bước 2 — Nhân kết quả IF với ô Lương cơ bản K1.",
                        "Bước 3 — Bắt buộc nhấn F4 để khóa thành $K$1 vì ô K1 dùng chung cho cả 6 nhân viên."
                    ],
                    "formulaPattern": '=IF(B2="Trưởng phòng", 4, 2.5)*$K$1',
                    "tip": "Nếu quên khóa $K$1, khi kéo xuống dòng 3 sẽ nhân với K2 (ô trống) làm kết quả bằng 0!",
                    "targetRefs": ["F2", "F3", "F4", "F5", "F6", "F7"]
                },
                {
                    "stepNumber": 3,
                    "title": "Câu 3: Tra Tiền thưởng theo Mã NV (G2:G7)",
                    "requirement": "Dựa vào Mã NV (HC, KT, BV) để tra mức Tiền thưởng trong bảng phụ $A$10:$B$12.",
                    "analysis": [
                        "Bước 1 — Dùng VLOOKUP dò ô A2 trong vùng $A$10:$B$12 (nhấn F4 khóa bảng phụ).",
                        "Bước 2 — Tiền thưởng nằm ở cột thứ 2, dò chính xác nên đối số cuối là 0."
                    ],
                    "formulaPattern": "=VLOOKUP(A2, $A$10:$B$12, 2, 0)",
                    "tip": "Mã NV ở cột A khớp chính xác với bảng phụ nên không cần dùng LEFT.",
                    "targetRefs": ["G2", "G3", "G4", "G5", "G6", "G7"]
                },
                {
                    "stepNumber": 4,
                    "title": "Câu 4: Tính Thưởng ngày làm (H2:H7)",
                    "requirement": "Nếu Số ngày làm > 25 thì thưởng 200.000đ, ngược lại 0đ.",
                    "analysis": [
                        "Bước 1 — Dùng IF kiểm tra ô Số ngày làm (E2 > 25).",
                        "Bước 2 — Đúng trả về 200000, sai trả về 0."
                    ],
                    "formulaPattern": "=IF(E2>25, 200000, 0)",
                    "tip": "Chú ý dấu '>' chứ không phải '>=' (người làm đúng 25 ngày được 0đ).",
                    "targetRefs": ["H2", "H3", "H4", "H5", "H6", "H7"]
                },
                {
                    "stepNumber": 5,
                    "title": "Câu 5: Tính Tổng lương thực lĩnh (I2:I7)",
                    "requirement": "Tổng lương = Lương theo bậc + Tiền thưởng + Thưởng ngày làm.",
                    "analysis": [
                        "Bước 1 — Cộng 3 cột F2 + G2 + H2 (hoặc =SUM(F2:H2)).",
                        "Bước 2 — Kéo Fill Handle từ I2 xuống I7."
                    ],
                    "formulaPattern": "=F2+G2+H2",
                    "tip": "Kiểm tra lại xem có ô nào ở cột F bị 0 do quên khóa $K$1 không.",
                    "targetRefs": ["I2", "I3", "I4", "I5", "I6", "I7"]
                }
            ],
            "colHeaders": ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K"],
            "rows": [
                ["Mã NV", "Chức vụ", "Từ ngày", "Đến ngày", "Số ngày làm", "Lương theo bậc", "Tiền thưởng", "Thưởng ngày làm", "Tổng lương", "Lương CB:", 2430000],
                ["HC", "Trưởng phòng", 1, 30, None, None, None, None, None, "", ""],
                ["HC", "Nhân viên", 2, 25, None, None, None, None, None, "", ""],
                ["KT", "Trưởng phòng", 10, 20, None, None, None, None, None, "", ""],
                ["BV", "Trưởng phòng", 5, 30, None, None, None, None, None, "", ""],
                ["KT", "Nhân viên", 6, 24, None, None, None, None, None, "", ""],
                ["BV", "Nhân viên", 1, 28, None, None, None, None, None, "", ""],
                ["", "", "", "", "", "", "", "", "", "", ""],
                ["BẢNG TIỀN THƯỞNG", "", "", "", "", "", "", "", "", "", ""],
                ["HC", 2000000, "", "", "", "", "", "", "", "", ""],
                ["KT", 1500000, "", "", "", "", "", "", "", "", ""],
                ["BV", 1300000, "", "", "", "", "", "", "", "", ""],
            ],
            "targets": [
                {"row": 1, "col": 4, "ref": "E2", "expectedFormula": "=D2-C2", "expectedValue": 29, "hint": "=D2-C2"},
                {"row": 2, "col": 4, "ref": "E3", "expectedFormula": "=D3-C3", "expectedValue": 23, "hint": "=D3-C3"},
                {"row": 3, "col": 4, "ref": "E4", "expectedFormula": "=D4-C4", "expectedValue": 10, "hint": "=D4-C4"},
                {"row": 4, "col": 4, "ref": "E5", "expectedFormula": "=D5-C5", "expectedValue": 25, "hint": "=D5-C5"},
                {"row": 5, "col": 4, "ref": "E6", "expectedFormula": "=D6-C6", "expectedValue": 18, "hint": "=D6-C6"},
                {"row": 6, "col": 4, "ref": "E7", "expectedFormula": "=D7-C7", "expectedValue": 27, "hint": "=D7-C7"},

                {"row": 1, "col": 5, "ref": "F2", "expectedFormula": '=IF(B2="Trưởng phòng",4,2.5)*$K$1', "expectedValue": 9720000, "hint": '=IF(B2="Trưởng phòng",4,2.5)*$K$1'},
                {"row": 2, "col": 5, "ref": "F3", "expectedFormula": '=IF(B3="Trưởng phòng",4,2.5)*$K$1', "expectedValue": 6075000, "hint": '=IF(B3="Trưởng phòng",4,2.5)*$K$1'},
                {"row": 3, "col": 5, "ref": "F4", "expectedFormula": '=IF(B4="Trưởng phòng",4,2.5)*$K$1', "expectedValue": 9720000, "hint": '=IF(B4="Trưởng phòng",4,2.5)*$K$1'},
                {"row": 4, "col": 5, "ref": "F5", "expectedFormula": '=IF(B5="Trưởng phòng",4,2.5)*$K$1', "expectedValue": 9720000, "hint": '=IF(B5="Trưởng phòng",4,2.5)*$K$1'},
                {"row": 5, "col": 5, "ref": "F6", "expectedFormula": '=IF(B6="Trưởng phòng",4,2.5)*$K$1', "expectedValue": 6075000, "hint": '=IF(B6="Trưởng phòng",4,2.5)*$K$1'},
                {"row": 6, "col": 5, "ref": "F7", "expectedFormula": '=IF(B7="Trưởng phòng",4,2.5)*$K$1', "expectedValue": 6075000, "hint": '=IF(B7="Trưởng phòng",4,2.5)*$K$1'},

                {"row": 1, "col": 6, "ref": "G2", "expectedFormula": "=VLOOKUP(A2,$A$10:$B$12,2,0)", "expectedValue": 2000000, "hint": "=VLOOKUP(A2,$A$10:$B$12,2,0)"},
                {"row": 2, "col": 6, "ref": "G3", "expectedFormula": "=VLOOKUP(A3,$A$10:$B$12,2,0)", "expectedValue": 2000000, "hint": "=VLOOKUP(A3,$A$10:$B$12,2,0)"},
                {"row": 3, "col": 6, "ref": "G4", "expectedFormula": "=VLOOKUP(A4,$A$10:$B$12,2,0)", "expectedValue": 1500000, "hint": "=VLOOKUP(A4,$A$10:$B$12,2,0)"},
                {"row": 4, "col": 6, "ref": "G5", "expectedFormula": "=VLOOKUP(A5,$A$10:$B$12,2,0)", "expectedValue": 1300000, "hint": "=VLOOKUP(A5,$A$10:$B$12,2,0)"},
                {"row": 5, "col": 6, "ref": "G6", "expectedFormula": "=VLOOKUP(A6,$A$10:$B$12,2,0)", "expectedValue": 1500000, "hint": "=VLOOKUP(A6,$A$10:$B$12,2,0)"},
                {"row": 6, "col": 6, "ref": "G7", "expectedFormula": "=VLOOKUP(A7,$A$10:$B$12,2,0)", "expectedValue": 1300000, "hint": "=VLOOKUP(A7,$A$10:$B$12,2,0)"},

                {"row": 1, "col": 7, "ref": "H2", "expectedFormula": "=IF(E2>25,200000,0)", "expectedValue": 200000, "hint": "=IF(E2>25,200000,0)"},
                {"row": 2, "col": 7, "ref": "H3", "expectedFormula": "=IF(E3>25,200000,0)", "expectedValue": 0, "hint": "=IF(E3>25,200000,0)"},
                {"row": 3, "col": 7, "ref": "H4", "expectedFormula": "=IF(E4>25,200000,0)", "expectedValue": 0, "hint": "=IF(E4>25,200000,0)"},
                {"row": 4, "col": 7, "ref": "H5", "expectedFormula": "=IF(E5>25,200000,0)", "expectedValue": 0, "hint": "=IF(E5>25,200000,0)"},
                {"row": 5, "col": 7, "ref": "H6", "expectedFormula": "=IF(E6>25,200000,0)", "expectedValue": 0, "hint": "=IF(E6>25,200000,0)"},
                {"row": 6, "col": 7, "ref": "H7", "expectedFormula": "=IF(E7>25,200000,0)", "expectedValue": 200000, "hint": "=IF(E7>25,200000,0)"},

                {"row": 1, "col": 8, "ref": "I2", "expectedFormula": "=F2+G2+H2", "expectedValue": 11920000, "hint": "=F2+G2+H2"},
                {"row": 2, "col": 8, "ref": "I3", "expectedFormula": "=F3+G3+H3", "expectedValue": 8075000, "hint": "=F3+G3+H3"},
                {"row": 3, "col": 8, "ref": "I4", "expectedFormula": "=F4+G4+H4", "expectedValue": 11220000, "hint": "=F4+G4+H4"},
                {"row": 4, "col": 8, "ref": "I5", "expectedFormula": "=F5+G5+H5", "expectedValue": 11020000, "hint": "=F5+G5+H5"},
                {"row": 5, "col": 8, "ref": "I6", "expectedFormula": "=F6+G6+H6", "expectedValue": 7575000, "hint": "=F6+G6+H6"},
                {"row": 6, "col": 8, "ref": "I7", "expectedFormula": "=F7+G7+H7", "expectedValue": 7575000, "hint": "=F7+G7+H7"},
            ],
        },
        # 5. Đề thi mẫu UDCNTTCB
        {
            "id": "lab-test-tien-hang",
            "group": "exam",
            "badge": "Đề thi mẫu UDCNTTCB",
            "title": "Bảng Tính Tiền Hàng (De-mau-UDCNTTCB)",
            "description": "Phần II (Excel - 4 điểm) trong đề thi mẫu UDCNTTCB: VLOOKUP kết hợp LEFT lấy Tên hàng và Đơn giá từ Bảng phụ.",
            "imageUrl": "/materials/images/test_1.jpg",
            "theoryPoints": [
                {
                    "title": "1. VLOOKUP + LEFT lấy thông tin từ Bảng phụ",
                    "syntax": "=VLOOKUP(LEFT(A2,1), $A$10:$C$13, 2, 0)",
                    "explanation": "Lấy ký tự đầu của Mã hàng ('K', 'B', 'S', 'D') dò trong bảng phụ để trả về Tên hàng (cột 2) và Đơn giá (cột 3)."
                }
            ],
            "instructions": [
                "Cột Tên hàng (B2:B6): Dùng VLOOKUP kết hợp LEFT(A2,1) dò trong Bảng phụ $A$10:$C$13.",
                "Cột Đơn giá (E2:E6): Dùng VLOOKUP kết hợp LEFT(A2,1) lấy cột 3 từ Bảng phụ $A$10:$C$13.",
                "Cột Thành tiền (G2:G6): Đơn giá * Số lượng (E2*F2).",
                "Ô G7 (Tổng tiền): Tính tổng cột Thành tiền bằng hàm SUM.",
            ],
            "steps": [
                {
                    "stepNumber": 1,
                    "title": "Câu 1: Điền cột Tên hàng (B2:B6)",
                    "requirement": "Dựa vào ký tự đầu của Mã hàng ('K', 'B', 'S', 'D') để tra Tên hàng từ bảng phụ $A$10:$C$13.",
                    "analysis": [
                        "Bước 1 — Dùng LEFT(A2, 1) để lấy ký tự đầu của Mã hàng ('K01' → 'K').",
                        "Bước 2 — Dùng VLOOKUP dò trong vùng $A$10:$C$13 (nhấn F4 khóa bảng phụ), lấy cột 2 (Tên hàng), kiểu dò 0."
                    ],
                    "formulaPattern": "=VLOOKUP(LEFT(A2,1), $A$10:$C$13, 2, 0)",
                    "tip": "Nhấn F4 khóa vùng $A$10:$C$13 trước khi kéo xuống B6.",
                    "targetRefs": ["B2", "B3", "B4", "B5", "B6"]
                },
                {
                    "stepNumber": 2,
                    "title": "Câu 2: Tra Đơn giá (E2:E6)",
                    "requirement": "Dùng VLOOKUP tương tự Câu 1 nhưng lấy cột Đơn giá (cột 3) từ bảng phụ.",
                    "analysis": [
                        "Bước 1 — Giữ nguyên giá trị dò LEFT(A2, 1) và bảng phụ $A$10:$C$13.",
                        "Bước 2 — Đổi số thứ tự cột từ 2 thành 3 để lấy Đơn giá."
                    ],
                    "formulaPattern": "=VLOOKUP(LEFT(A2,1), $A$10:$C$13, 3, 0)",
                    "tip": "Sau khi gõ xong ô E2, có thể kéo Fill Handle xuống E6.",
                    "targetRefs": ["E2", "E3", "E4", "E5", "E6"]
                },
                {
                    "stepNumber": 3,
                    "title": "Câu 3: Tính Thành tiền (G2:G6)",
                    "requirement": "Tính Thành tiền = Đơn giá * Số lượng.",
                    "analysis": [
                        "Bước 1 — Nhân ô Đơn giá (E2) với ô Số lượng (F2).",
                        "Bước 2 — Kéo công thức xuống đến ô G6."
                    ],
                    "formulaPattern": "=E2*F2",
                    "tip": "Kiểm tra nhanh dòng đầu: 25.000 * 30 = 750.000.",
                    "targetRefs": ["G2", "G3", "G4", "G5", "G6"]
                },
                {
                    "stepNumber": 4,
                    "title": "Câu 4: Tính Tổng tiền (G7)",
                    "requirement": "Tính tổng toàn bộ cột Thành tiền vào ô G7.",
                    "analysis": [
                        "Bước 1 — Dùng hàm SUM trên vùng G2:G6."
                    ],
                    "formulaPattern": "=SUM(G2:G6)",
                    "tip": "Đảm bảo không quét nhầm vào chính ô G7 để tránh lỗi tham chiếu vòng (Circular Reference).",
                    "targetRefs": ["G7"]
                }
            ],
            "colHeaders": ["A", "B", "C", "D", "E", "F", "G"],
            "rows": [
                ["Mã hàng", "Tên hàng", "Loại", "Tháng", "Đơn giá", "Số lượng", "Thành tiền"],
                ["K01", None, 1, 1, None, 30, None],
                ["B02", None, 1, 2, None, 50, None],
                ["S02", None, 2, 1, None, 70, None],
                ["B03", None, 3, 3, None, 60, None],
                ["D04", None, 2, 2, None, 30, None],
                ["Tổng tiền", "", "", "", "", "", None],
                ["", "", "", "", "", "", ""],
                ["Ký tự đầu", "Tên hàng", "Đơn giá", "", "", "", ""],
                ["B", "Bánh", 75000, "", "", "", ""],
                ["D", "Đường", 35000, "", "", "", ""],
                ["K", "Kẹo", 25000, "", "", "", ""],
                ["S", "Sữa", 450000, "", "", "", ""],
            ],
            "targets": [
                {"row": 1, "col": 1, "ref": "B2", "expectedFormula": "=VLOOKUP(LEFT(A2,1),$A$10:$C$13,2,0)", "expectedValue": "Kẹo", "hint": "=VLOOKUP(LEFT(A2,1),$A$10:$C$13,2,0)"},
                {"row": 2, "col": 1, "ref": "B3", "expectedFormula": "=VLOOKUP(LEFT(A3,1),$A$10:$C$13,2,0)", "expectedValue": "Bánh", "hint": "=VLOOKUP(LEFT(A3,1),$A$10:$C$13,2,0)"},
                {"row": 3, "col": 1, "ref": "B4", "expectedFormula": "=VLOOKUP(LEFT(A4,1),$A$10:$C$13,2,0)", "expectedValue": "Sữa", "hint": "=VLOOKUP(LEFT(A4,1),$A$10:$C$13,2,0)"},
                {"row": 4, "col": 1, "ref": "B5", "expectedFormula": "=VLOOKUP(LEFT(A5,1),$A$10:$C$13,2,0)", "expectedValue": "Bánh", "hint": "=VLOOKUP(LEFT(A5,1),$A$10:$C$13,2,0)"},
                {"row": 5, "col": 1, "ref": "B6", "expectedFormula": "=VLOOKUP(LEFT(A6,1),$A$10:$C$13,2,0)", "expectedValue": "Đường", "hint": "=VLOOKUP(LEFT(A6,1),$A$10:$C$13,2,0)"},

                {"row": 1, "col": 4, "ref": "E2", "expectedFormula": "=VLOOKUP(LEFT(A2,1),$A$10:$C$13,3,0)", "expectedValue": 25000, "hint": "=VLOOKUP(LEFT(A2,1),$A$10:$C$13,3,0)"},
                {"row": 2, "col": 4, "ref": "E3", "expectedFormula": "=VLOOKUP(LEFT(A3,1),$A$10:$C$13,3,0)", "expectedValue": 75000, "hint": "=VLOOKUP(LEFT(A3,1),$A$10:$C$13,3,0)"},
                {"row": 3, "col": 4, "ref": "E4", "expectedFormula": "=VLOOKUP(LEFT(A4,1),$A$10:$C$13,3,0)", "expectedValue": 450000, "hint": "=VLOOKUP(LEFT(A4,1),$A$10:$C$13,3,0)"},
                {"row": 4, "col": 4, "ref": "E5", "expectedFormula": "=VLOOKUP(LEFT(A5,1),$A$10:$C$13,3,0)", "expectedValue": 75000, "hint": "=VLOOKUP(LEFT(A5,1),$A$10:$C$13,3,0)"},
                {"row": 5, "col": 4, "ref": "E6", "expectedFormula": "=VLOOKUP(LEFT(A6,1),$A$10:$C$13,3,0)", "expectedValue": 35000, "hint": "=VLOOKUP(LEFT(A6,1),$A$10:$C$13,3,0)"},

                {"row": 1, "col": 6, "ref": "G2", "expectedFormula": "=E2*F2", "expectedValue": 750000, "hint": "=E2*F2"},
                {"row": 2, "col": 6, "ref": "G3", "expectedFormula": "=E3*F3", "expectedValue": 3750000, "hint": "=E3*F3"},
                {"row": 3, "col": 6, "ref": "G4", "expectedFormula": "=E4*F4", "expectedValue": 31500000, "hint": "=E4*F4"},
                {"row": 4, "col": 6, "ref": "G5", "expectedFormula": "=E5*F5", "expectedValue": 4500000, "hint": "=E5*F5"},
                {"row": 5, "col": 6, "ref": "G6", "expectedFormula": "=E6*F6", "expectedValue": 1050000, "hint": "=E6*F6"},
                {"row": 6, "col": 6, "ref": "G7", "expectedFormula": "=SUM(G2:G6)", "expectedValue": 41550000, "hint": "=SUM(G2:G6)"},
            ],
        },
        # 6. Bài 03: SUM / SUMIF
        {
            "id": "lab-bai-03-sum",
            "group": "lesson",
            "badge": "Bài 03",
            "title": "Nhóm hàm tính tổng: SUM, SUMIF, SUMIFS",
            "description": "Thực hành tính tổng doanh thu, tổng có điều kiện theo loại sản phẩm và tổng nhiều điều kiện.",
            "theoryPoints": [
                {
                    "title": "SUMIF (Tổng 1 điều kiện)",
                    "syntax": '=SUMIF(B2:B6, "Áo", E2:E6)',
                    "explanation": "Đối số 1 là vùng điều kiện, đối số 2 là điều kiện, đối số 3 là vùng cần tính tổng."
                },
                {
                    "title": "SUMIFS (Tổng nhiều điều kiện)",
                    "syntax": '=SUMIFS(E2:E6, B2:B6, "Quần", C2:C6, ">=10")',
                    "explanation": "Khác với SUMIF, vùng tính tổng (E2:E6) được đưa lên đầu tiên, theo sau là các cặp (vùng ĐK, ĐK)."
                }
            ],
            "instructions": [
                "Ô E2:E6: Tính Thành tiền = Số lượng * Đơn giá (C2*D2).",
                "Ô E7: Tính Tổng thành tiền bằng hàm SUM.",
                "Ô H2: Tính Tổng thành tiền của mặt hàng 'Áo' bằng SUMIF.",
                "Ô H3: Tính Tổng thành tiền của mặt hàng 'Quần' có Số lượng >= 10 bằng SUMIFS.",
            ],
            "colHeaders": ["A", "B", "C", "D", "E", "F", "G", "H"],
            "rows": [
                ["Mã", "Sản phẩm", "Số lượng", "Đơn giá", "Thành tiền", "", "Chỉ tiêu thống kê", "Kết quả"],
                ["SP1", "Áo", 12, 150000, None, "", "Tổng tiền Áo (SUMIF)", None],
                ["SP2", "Quần", 8, 250000, None, "", "Tổng tiền Quần SL>=10 (SUMIFS)", None],
                ["SP3", "Áo", 5, 180000, None, "", "", ""],
                ["SP4", "Quần", 15, 220000, None, "", "", ""],
                ["SP5", "Giày", 6, 400000, None, "", "", ""],
                ["", "Tổng cộng", "", "", None, "", "", ""],
            ],
            "targets": [
                {"row": 1, "col": 4, "ref": "E2", "expectedFormula": "=C2*D2", "expectedValue": 1800000, "hint": "=C2*D2"},
                {"row": 2, "col": 4, "ref": "E3", "expectedFormula": "=C3*D3", "expectedValue": 2000000, "hint": "=C3*D3"},
                {"row": 3, "col": 4, "ref": "E4", "expectedFormula": "=C4*D4", "expectedValue": 900000, "hint": "=C4*D4"},
                {"row": 4, "col": 4, "ref": "E5", "expectedFormula": "=C5*D5", "expectedValue": 3300000, "hint": "=C5*D5"},
                {"row": 5, "col": 4, "ref": "E6", "expectedFormula": "=C6*D6", "expectedValue": 2400000, "hint": "=C6*D6"},
                {"row": 6, "col": 4, "ref": "E7", "expectedFormula": "=SUM(E2:E6)", "expectedValue": 10400000, "hint": "=SUM(E2:E6)"},
                {"row": 1, "col": 7, "ref": "H2", "expectedFormula": '=SUMIF(B2:B6,"Áo",E2:E6)', "expectedValue": 2700000, "hint": '=SUMIF(B2:B6,"Áo",E2:E6)'},
                {"row": 2, "col": 7, "ref": "H3", "expectedFormula": '=SUMIFS(E2:E6,B2:B6,"Quần",C2:C6,">=10")', "expectedValue": 3300000, "hint": '=SUMIFS(E2:E6,B2:B6,"Quần",C2:C6,">=10")'},
            ],
        },
        # 7. Bài 04: COUNT / COUNTA / COUNTIF
        {
            "id": "lab-bai-04-count",
            "group": "lesson",
            "badge": "Bài 04",
            "title": "Nhóm hàm đếm: COUNT, COUNTA, COUNTBLANK, COUNTIF",
            "description": "Phân biệt đếm số, đếm ô khác rỗng, đếm ô trống và đếm có điều kiện.",
            "instructions": [
                "Ô F2: Đếm số học viên đã có điểm (COUNT trên C2:C7).",
                "Ô F3: Đếm tổng số học viên có tên (COUNTA trên B2:B7).",
                "Ô F4: Đếm số ô điểm còn bỏ trống (COUNTBLANK trên C2:C7).",
                "Ô F5: Đếm số học viên có điểm >= 8 (COUNTIF).",
            ],
            "colHeaders": ["A", "B", "C", "D", "E", "F"],
            "rows": [
                ["STT", "Họ và tên", "Điểm thi", "", "Yêu cầu đếm", "Kết quả"],
                [1, "Nguyễn Văn An", 8.5, "", "Số HV có điểm (COUNT)", None],
                [2, "Trần Thị Bình", 6.0, "", "Tổng số HV (COUNTA)", None],
                [3, "Lê Minh Châu", "", "", "Số HV chưa có điểm (COUNTBLANK)", None],
                [4, "Phạm Quốc Dũng", 9.0, "", "Số HV điểm >= 8 (COUNTIF)", None],
                [5, "Hoàng Lan Anh", 7.5, "", "", ""],
                [6, "Vũ Hải Nam", 8.0, "", "", ""],
            ],
            "targets": [
                {"row": 1, "col": 5, "ref": "F2", "expectedFormula": "=COUNT(C2:C7)", "expectedValue": 5, "hint": "=COUNT(C2:C7)"},
                {"row": 2, "col": 5, "ref": "F3", "expectedFormula": "=COUNTA(B2:B7)", "expectedValue": 6, "hint": "=COUNTA(B2:B7)"},
                {"row": 3, "col": 5, "ref": "F4", "expectedFormula": "=COUNTBLANK(C2:C7)", "expectedValue": 1, "hint": "=COUNTBLANK(C2:C7)"},
                {"row": 4, "col": 5, "ref": "F5", "expectedFormula": '=COUNTIF(C2:C7,">=8")', "expectedValue": 3, "hint": '=COUNTIF(C2:C7,">=8")'},
            ],
        },
        # 8. Bài 05: IF, AND, OR
        {
            "id": "lab-bai-05-if",
            "group": "lesson",
            "badge": "Bài 05",
            "title": "Hàm điều kiện & Logic: IF, AND, OR",
            "description": "Xếp loại kết quả thi và xét học bổng kết hợp nhiều điều kiện logic.",
            "instructions": [
                "Cột Kết quả (E2:E5): Nếu Điểm TB >= 5 thì 'Đạt', ngược lại 'Trượt'.",
                "Cột Học bổng (F2:F5): Nếu Điểm TB >= 8 VÀ Hạnh kiểm = 'Tốt' thì 1000000, ngược lại 0.",
            ],
            "colHeaders": ["A", "B", "C", "D", "E", "F"],
            "rows": [
                ["STT", "Họ tên", "Điểm TB", "Hạnh kiểm", "Kết quả", "Học bổng"],
                [1, "An", 8.5, "Tốt", None, None],
                [2, "Bình", 4.5, "Khá", None, None],
                [3, "Châu", 8.2, "Khá", None, None],
                [4, "Dũng", 6.5, "Tốt", None, None],
            ],
            "targets": [
                {"row": 1, "col": 4, "ref": "E2", "expectedFormula": '=IF(C2>=5,"Đạt","Trượt")', "expectedValue": "Đạt", "hint": '=IF(C2>=5,"Đạt","Trượt")'},
                {"row": 2, "col": 4, "ref": "E3", "expectedFormula": '=IF(C3>=5,"Đạt","Trượt")', "expectedValue": "Trượt", "hint": '=IF(C3>=5,"Đạt","Trượt")'},
                {"row": 3, "col": 4, "ref": "E4", "expectedFormula": '=IF(C4>=5,"Đạt","Trượt")', "expectedValue": "Đạt", "hint": '=IF(C4>=5,"Đạt","Trượt")'},
                {"row": 4, "col": 4, "ref": "E5", "expectedFormula": '=IF(C5>=5,"Đạt","Trượt")', "expectedValue": "Đạt", "hint": '=IF(C5>=5,"Đạt","Trượt")'},
                {"row": 1, "col": 5, "ref": "F2", "expectedFormula": '=IF(AND(C2>=8,D2="Tốt"),1000000,0)', "expectedValue": 1000000, "hint": '=IF(AND(C2>=8,D2="Tốt"),1000000,0)'},
                {"row": 2, "col": 5, "ref": "F3", "expectedFormula": '=IF(AND(C3>=8,D3="Tốt"),1000000,0)', "expectedValue": 0, "hint": '=IF(AND(C3>=8,D3="Tốt"),1000000,0)'},
                {"row": 3, "col": 5, "ref": "F4", "expectedFormula": '=IF(AND(C4>=8,D4="Tốt"),1000000,0)', "expectedValue": 0, "hint": '=IF(AND(C4>=8,D4="Tốt"),1000000,0)'},
                {"row": 4, "col": 5, "ref": "F5", "expectedFormula": '=IF(AND(C5>=8,D5="Tốt"),1000000,0)', "expectedValue": 0, "hint": '=IF(AND(C5>=8,D5="Tốt"),1000000,0)'},
            ],
        },
        # 9. Bài 06: Hàm xử lý chuỗi
        {
            "id": "lab-bai-06-text",
            "group": "lesson",
            "badge": "Bài 06",
            "title": "Hàm xử lý chuỗi: LEFT, MID, RIGHT, VALUE",
            "description": "Tách mã loại, mã giữa và chuyển ký tự số ở cuối chuỗi sang dạng số.",
            "instructions": [
                "Cột Mã loại (B2:B4): Lấy 2 ký tự đầu của Mã hàng (LEFT).",
                "Cột Phân nhóm (C2:C4): Lấy 1 ký tự ở vị trí thứ 4 (MID).",
                "Cột Số lượng (D2:D4): Lấy 2 ký tự cuối chuyển sang dạng số (VALUE + RIGHT).",
            ],
            "colHeaders": ["A", "B", "C", "D"],
            "rows": [
                ["Mã hàng", "Mã loại (2 đầu)", "Phân nhóm (vị trí 4)", "Số lượng (2 cuối dạng số)"],
                ["TV-A-15", None, None, None],
                ["TL-B-08", None, None, None],
                ["MG-A-20", None, None, None],
            ],
            "targets": [
                {"row": 1, "col": 1, "ref": "B2", "expectedFormula": "=LEFT(A2,2)", "expectedValue": "TV", "hint": "=LEFT(A2,2)"},
                {"row": 2, "col": 1, "ref": "B3", "expectedFormula": "=LEFT(A3,2)", "expectedValue": "TL", "hint": "=LEFT(A3,2)"},
                {"row": 3, "col": 1, "ref": "B4", "expectedFormula": "=LEFT(A4,2)", "expectedValue": "MG", "hint": "=LEFT(A4,2)"},
                {"row": 1, "col": 2, "ref": "C2", "expectedFormula": "=MID(A2,4,1)", "expectedValue": "A", "hint": "=MID(A2,4,1)"},
                {"row": 2, "col": 2, "ref": "C3", "expectedFormula": "=MID(A3,4,1)", "expectedValue": "B", "hint": "=MID(A3,4,1)"},
                {"row": 3, "col": 2, "ref": "C4", "expectedFormula": "=MID(A4,4,1)", "expectedValue": "A", "hint": "=MID(A4,4,1)"},
                {"row": 1, "col": 3, "ref": "D2", "expectedFormula": "=VALUE(RIGHT(A2,2))", "expectedValue": 15, "hint": "=VALUE(RIGHT(A2,2))"},
                {"row": 2, "col": 3, "ref": "D3", "expectedFormula": "=VALUE(RIGHT(A3,2))", "expectedValue": 8, "hint": "=VALUE(RIGHT(A3,2))"},
                {"row": 3, "col": 3, "ref": "D4", "expectedFormula": "=VALUE(RIGHT(A4,2))", "expectedValue": 20, "hint": "=VALUE(RIGHT(A4,2))"},
            ],
        },
        # 10. Bài 07: VLOOKUP & HLOOKUP
        {
            "id": "lab-bai-07-lookup",
            "group": "lesson",
            "badge": "Bài 07",
            "title": "Hàm tìm kiếm: VLOOKUP & HLOOKUP",
            "description": "Dò tìm chính xác từ Bảng phụ (nhớ dùng địa chỉ tuyệt đối $A$8:$C$10).",
            "instructions": [
                "Cột Tên hàng (C2:C4): Dùng VLOOKUP dựa vào Mã (A2:A4) và Bảng phụ A8:C10.",
                "Cột Đơn giá (D2:D4): Dùng VLOOKUP lấy cột thứ 3 từ Bảng phụ A8:C10.",
                "Cột Thành tiền (E2:E4): Số lượng * Đơn giá.",
            ],
            "colHeaders": ["A", "B", "C", "D", "E"],
            "rows": [
                ["Mã", "Số lượng", "Tên hàng", "Đơn giá", "Thành tiền"],
                ["B", 10, None, None, None],
                ["K", 5, None, None, None],
                ["S", 4, None, None, None],
                ["", "", "", "", ""],
                ["BẢNG PHỤ", "", "", "", ""],
                ["Mã", "Tên hàng", "Đơn giá", "", ""],
                ["B", "Bánh", 75000, "", ""],
                ["K", "Kẹo", 25000, "", ""],
                ["S", "Sữa", 450000, "", ""],
            ],
            "targets": [
                {"row": 1, "col": 2, "ref": "C2", "expectedFormula": "=VLOOKUP(A2,$A$8:$C$10,2,0)", "expectedValue": "Bánh", "hint": "=VLOOKUP(A2,$A$8:$C$10,2,0)"},
                {"row": 2, "col": 2, "ref": "C3", "expectedFormula": "=VLOOKUP(A3,$A$8:$C$10,2,0)", "expectedValue": "Kẹo", "hint": "=VLOOKUP(A3,$A$8:$C$10,2,0)"},
                {"row": 3, "col": 2, "ref": "C4", "expectedFormula": "=VLOOKUP(A4,$A$8:$C$10,2,0)", "expectedValue": "Sữa", "hint": "=VLOOKUP(A4,$A$8:$C$10,2,0)"},
                {"row": 1, "col": 3, "ref": "D2", "expectedFormula": "=VLOOKUP(A2,$A$8:$C$10,3,0)", "expectedValue": 75000, "hint": "=VLOOKUP(A2,$A$8:$C$10,3,0)"},
                {"row": 2, "col": 3, "ref": "D3", "expectedFormula": "=VLOOKUP(A3,$A$8:$C$10,3,0)", "expectedValue": 25000, "hint": "=VLOOKUP(A3,$A$8:$C$10,3,0)"},
                {"row": 3, "col": 3, "ref": "D4", "expectedFormula": "=VLOOKUP(A4,$A$8:$C$10,3,0)", "expectedValue": 450000, "hint": "=VLOOKUP(A4,$A$8:$C$10,3,0)"},
                {"row": 1, "col": 4, "ref": "E2", "expectedFormula": "=B2*D2", "expectedValue": 750000, "hint": "=B2*D2"},
                {"row": 2, "col": 4, "ref": "E3", "expectedFormula": "=B3*D3", "expectedValue": 125000, "hint": "=B3*D3"},
                {"row": 3, "col": 4, "ref": "E4", "expectedFormula": "=B4*D4", "expectedValue": 1800000, "hint": "=B4*D4"},
            ],
        },
    ]
    return labs


if __name__ == "__main__":
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    labs = build_interactive_labs()
    out = DATA_DIR / "excel_interactive_labs.json"
    out.write_text(json.dumps(labs, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"[INTERACTIVE] Đã tạo {len(labs)} bài thực hành Excel tương tác.")
