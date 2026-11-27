r"""
Script trích xuất dữ liệu từ kho tài liệu d:\MOS sang JSON và tài nguyên tĩnh cho web.
Chạy bằng: .\.venv\Scripts\python.exe scripts\extract_data.py
"""
import json
import os
import re
import shutil
from pathlib import Path

import openpyxl
import pymupdf

ROOT_DIR = Path(__file__).resolve().parent.parent
WEB_DIR = ROOT_DIR / "web"
DATA_DIR = WEB_DIR / "src" / "data"
QUIZ_DIR = DATA_DIR / "quizzes"
PUBLIC_MATERIALS_DIR = WEB_DIR / "public" / "materials"

MODULES_META = [
    {
        "id": "module01",
        "file": "Module01.pdf",
        "code": "Module 01",
        "title": "Hiểu biết về CNTT cơ bản",
        "category": "foundation",
        "description": "Phần cứng, phần mềm, hệ điều hành, mạng máy tính, bảo mật và pháp luật CNTT.",
    },
    {
        "id": "module02",
        "file": "Module02.pdf",
        "code": "Module 02",
        "title": "Sử dụng máy tính cơ bản",
        "category": "foundation",
        "description": "Thao tác Windows, quản lý tệp/thư mục, tiện ích hệ thống và gõ tiếng Việt.",
    },
    {
        "id": "module03",
        "file": "Module03.pdf",
        "code": "Module 03",
        "title": "Xử lý văn bản cơ bản (MS Word)",
        "category": "word",
        "description": "Soạn thảo, định dạng văn bản, bảng biểu, hình ảnh, trộn thư và in ấn trong Word.",
    },
    {
        "id": "module04",
        "file": "Module04.pdf",
        "code": "Module 04",
        "title": "Sử dụng bảng tính cơ bản (MS Excel)",
        "category": "excel",
        "description": "Địa chỉ ô, công thức, hàm SUM/IF/COUNT/VLOOKUP, định dạng và biểu đồ Excel.",
    },
    {
        "id": "module05",
        "file": "Module05.pdf",
        "code": "Module 05",
        "title": "Sử dụng trình chiếu cơ bản (MS PowerPoint)",
        "category": "ppt",
        "description": "Thiết kế slide, Slide Master, SmartArt, hiệu ứng Animation/Transition và trình chiếu.",
    },
    {
        "id": "module06",
        "file": "Module06.pdf",
        "code": "Module 06",
        "title": "Sử dụng Internet cơ bản",
        "category": "foundation",
        "description": "Trình duyệt web, tìm kiếm thông tin, thư điện tử (Email) và an toàn trực tuyến.",
    },
]


def parse_pdf_questions(pdf_path: Path) -> list[dict]:
    """Đọc toàn bộ câu hỏi trắc nghiệm từ file PDF Module0x."""
    doc = pymupdf.open(pdf_path)
    lines: list[str] = []
    for page in doc:
        text = page.get_text("text")
        for raw_line in text.splitlines():
            line = raw_line.strip()
            if not line:
                continue
            # Bỏ số trang đứng một mình
            if re.fullmatch(r"\d{1,3}", line):
                continue
            # Bỏ dòng tiêu đề đầu module
            if re.match(r"^Modul\s+\d+\s*:", line, re.IGNORECASE):
                continue
            # Ghép trường hợp "Câu" bị ngắt dòng trước số "62:"
            if lines and re.fullmatch(r"C?âu", lines[-1], re.IGNORECASE):
                lines[-1] = f"{lines[-1]} {line}"
                continue
            lines.append(line)

    questions: list[dict] = []
    current_q: dict | None = None
    current_opt_key: str | None = None

    # Khớp "Câu 12:" hoặc lỗi OCR "âu 81:"
    q_pattern = re.compile(r"^(?:C?âu)\s+(\d+)\s*:\s*(.*)$", re.IGNORECASE)
    opt_pattern = re.compile(r"^([ABCD])\.\s*(.*)$")

    def finalize_question(q: dict | None):
        if not q:
            return
        q["question"] = re.sub(r"\s+", " ", q["question"]).strip()
        opts = []
        for k in ["A", "B", "C", "D"]:
            if k in q["options"]:
                opts.append(re.sub(r"\s+", " ", q["options"][k]).strip())
        # Đáp án đúng mặc định trong bộ PDF là lựa chọn đầu tiên (A)
        questions.append(
            {
                "number": q["number"],
                "question": q["question"],
                "options": opts,
                "correctIndex": 0,
            }
        )

    for line in lines:
        q_match = q_pattern.match(line)
        if q_match:
            finalize_question(current_q)
            current_q = {
                "number": int(q_match.group(1)),
                "question": q_match.group(2).strip(),
                "options": {},
            }
            current_opt_key = None
            continue

        opt_match = opt_pattern.match(line)
        if opt_match and current_q is not None:
            key = opt_match.group(1)
            val = opt_match.group(2).strip()
            current_q["options"][key] = val
            current_opt_key = key
            continue

        if current_q is not None:
            if current_opt_key is not None:
                current_q["options"][current_opt_key] = (
                    current_q["options"][current_opt_key] + " " + line
                ).strip()
            else:
                current_q["question"] = (current_q["question"] + " " + line).strip()

    finalize_question(current_q)
    return questions


def extract_all_quizzes():
    """Trích xuất toàn bộ 6 module trắc nghiệm sang JSON."""
    QUIZ_DIR.mkdir(parents=True, exist_ok=True)
    summary = []
    for meta in MODULES_META:
        pdf_path = ROOT_DIR / meta["file"]
        questions = parse_pdf_questions(pdf_path)
        invalid = [q["number"] for q in questions if len(q["options"]) != 4]
        print(
            f"[PDF] {meta['file']}: {len(questions)} câu | lỗi != 4 đáp án: {invalid}"
        )
        out_path = QUIZ_DIR / f"{meta['id']}.json"
        out_path.write_text(
            json.dumps(
                {
                    "id": meta["id"],
                    "code": meta["code"],
                    "title": meta["title"],
                    "category": meta["category"],
                    "description": meta["description"],
                    "questions": questions,
                },
                ensure_ascii=False,
                indent=2,
            ),
            encoding="utf-8",
        )
        summary.append(
            {
                "id": meta["id"],
                "code": meta["code"],
                "title": meta["title"],
                "category": meta["category"],
                "description": meta["description"],
                "questionCount": len(questions),
            }
        )
    (QUIZ_DIR / "index.json").write_text(
        json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8"
    )


def read_excel_preview(xlsx_path: Path, max_rows: int = 25, max_cols: int = 10) -> list[dict]:
    """Đọc dữ liệu xem trước các sheet của file Excel."""
    sheets_data = []
    try:
        wb = openpyxl.load_workbook(xlsx_path, data_only=True, read_only=True)
        for sheet_name in wb.sheetnames[:4]:
            ws = wb[sheet_name]
            rows = []
            for r_idx, row in enumerate(ws.iter_rows(values_only=True)):
                if r_idx >= max_rows:
                    break
                sliced = [
                    "" if cell is None else str(cell).strip()
                    for cell in row[:max_cols]
                ]
                # Bỏ dòng hoàn toàn trống ở cuối/giữa nếu không có gì
                if any(sliced):
                    rows.append(sliced)
            if rows:
                sheets_data.append({"name": sheet_name, "rows": rows})
        wb.close()
    except Exception as exc:
        print(f"  [WARN] Không đọc được preview {xlsx_path.name}: {exc}")
    return sheets_data


def extract_excel_lessons():
    """Trích xuất danh mục 26 bài Excel, preview nội dung và copy file tài liệu."""
    excel_src_dir = ROOT_DIR / "Excel"
    excel_dest_dir = PUBLIC_MATERIALS_DIR / "excel"
    if excel_dest_dir.exists():
        shutil.rmtree(excel_dest_dir)
    excel_dest_dir.mkdir(parents=True, exist_ok=True)

    # Đọc file Noi dung bai hoc.xlsx
    syllabus_rows = []
    syllabus_path = excel_src_dir / "Noi dung bai hoc.xlsx"
    if syllabus_path.exists():
        wb = openpyxl.load_workbook(syllabus_path, data_only=True)
        ws = wb["Danh Muc"] if "Danh Muc" in wb.sheetnames else wb.active
        for r in list(ws.iter_rows(values_only=True))[1:]:
            if r and r[0]:
                syllabus_rows.append(
                    {
                        "title": str(r[0]).strip(),
                        "content": str(r[1]).strip() if len(r) > 1 and r[1] else "",
                    }
                )
        wb.close()

    # Liệt kê 24 thư mục bài học từ 00..23 (bỏ Bài 24 Macro và Bài 25 VBA theo yêu cầu)
    folders = []
    for d in excel_src_dir.iterdir():
        if not d.is_dir():
            continue
        m_num = re.search(r"(\d+)", d.name)
        num = int(m_num.group(1)) if m_num else 999
        if num <= 23:
            folders.append(d)

    def folder_sort_key(d: Path) -> int:
        m = re.search(r"(\d+)", d.name)
        return int(m.group(1)) if m else 999

    folders.sort(key=folder_sort_key)

    lessons = []
    for idx, folder in enumerate(folders):
        m = re.search(r"(\d+)", folder.name)
        lesson_num = int(m.group(1)) if m else idx
        lesson_id = f"bai-{lesson_num:02d}"

        syllabus_info = syllabus_rows[idx] if idx < len(syllabus_rows) else {}
        title = syllabus_info.get("title") or folder.name
        description = syllabus_info.get("content") or ""

        dest_folder = excel_dest_dir / lesson_id
        dest_folder.mkdir(parents=True, exist_ok=True)

        files_info = []
        max_preview_rows = 80 if lesson_num == 23 else 25

        for item in sorted(folder.rglob("*")):
            if not item.is_file():
                continue
            rel_name = item.relative_to(folder).as_posix()
            safe_rel = rel_name.replace(" ", "_")
            dest_file = dest_folder / safe_rel
            dest_file.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(item, dest_file)

            ext = item.suffix.lower()
            is_question = any(
                kw in item.name.lower() for kw in ["cau hoi", "câu hỏi"]
            )
            file_entry = {
                "name": item.name,
                "url": f"/materials/excel/{lesson_id}/{safe_rel}",
                "ext": ext,
                "size": item.stat().st_size,
                "kind": "exercise" if is_question else ("image" if ext in [".jpg", ".png"] else "lecture"),
                "sheets": [],
            }
            if ext in [".xlsx", ".xlsm"]:
                file_entry["sheets"] = read_excel_preview(item, max_rows=max_preview_rows)
            files_info.append(file_entry)

        lessons.append(
            {
                "id": lesson_id,
                "number": lesson_num,
                "folderName": folder.name,
                "title": title,
                "description": description,
                "files": files_info,
            }
        )

    print(f"[EXCEL] Đã xử lý {len(lessons)} bài học Excel.")
    (DATA_DIR / "excel_lessons.json").write_text(
        json.dumps(lessons, ensure_ascii=False, indent=2), encoding="utf-8"
    )


def extract_practice_labs():
    """Copy ảnh đề thực hành Word, Excel, PPT, Đề mẫu và tạo JSON checklist."""
    img_dest_dir = PUBLIC_MATERIALS_DIR / "images"
    img_dest_dir.mkdir(parents=True, exist_ok=True)

    for img in ROOT_DIR.glob("*.jpg"):
        shutil.copy2(img, img_dest_dir / img.name)

    labs = [
        {
            "id": "word-lab-01",
            "subject": "word",
            "title": "Bài thực hành Word 01: Soạn thảo Đơn xin mở lớp (Phần 1–4)",
            "description": "Thực hành thiết lập trang A4, font Times New Roman, Tab Stop, Watermark, Drop Cap, chèn hình Behind Text và xuất PDF.",
            "images": [
                "/materials/images/word_1.jpg",
                "/materials/images/word_2.jpg",
                "/materials/images/word_3.jpg",
            ],
            "tasks": [
                "Câu 1: Tạo file xulyvanban01.docx, font Times New Roman 13pt, lề trên/dưới/phải 2cm, lề trái 2.5cm, khổ A4, giãn dòng Multiple 1.5, Before/After 5pt.",
                "Câu 2: Lưu thành xulyvanban02.docx, soạn thảo mẫu Đơn xin mở lớp, sử dụng Tab Stop để tạo dấu chấm (....) thẳng hàng và gạch chân Double Underline màu đỏ.",
                "Tạo Watermark chữ 'TT NGOẠI NGỮ - TIN HỌC HUMG', màu Red, font Times New Roman, cỡ 45, layout CONFIDENTIAL 1.",
                "Câu 3: Lưu thành xulyvanban03.docx, chèn danh sách dấu tick (✓) các đại diện lớp ở cuối văn bản.",
                "Câu 4: Lưu thành xulyvanban04.docx, tạo Drop Cap 4 dòng, chèn Shape/Logo chế độ Behind Text và xuất ra file xulyvanban.pdf.",
            ],
        },
        {
            "id": "word-lab-02",
            "subject": "word",
            "title": "Bài thực hành Word 02: Vitamin và Khoáng chất (Đề thi mẫu)",
            "description": "Thực hành khổ giấy A5 ngang, WordArt, Shapes, Bullets, Symbol, chia cột kết hợp Drop Cap và bảng biểu có trộn ô + chữ dọc.",
            "images": ["/materials/images/word_4.jpg"],
            "tasks": [
                "Định dạng trang in khổ A5 hướng ngang (Landscape), lề trái 2.5cm, phải/trên/dưới 2cm.",
                "Chèn Shape tiêu đề phụ và WordArt 'Vitamin và khoáng chất' tạo dáng uốn cong.",
                "Tạo danh sách Bullets hoa thị và chèn ký tự đặc biệt Symbol (Ω, ®).",
                "Chia đoạn văn bản thành nhiều cột (Columns), tạo Drop Cap chữ 'D' và chèn hình ảnh con rùa.",
                "Tạo bảng KẾT QUẢ HỌC TẬP: gộp ô ngang (Số tiết -> LT/TH), gộp ô dọc, xoay chữ đứng cột 'Số thứ tự'.",
            ],
        },
        {
            "id": "ppt-lab-01",
            "subject": "ppt",
            "title": "Bài thực hành PowerPoint: Giới thiệu Trung tâm Ngoại ngữ - Tin học HUMG (3 Slides)",
            "description": "Thực hành áp dụng Theme Essential, bố cục Slide, SmartArt Cycle & Hierarchy, Picture Style, Textbox, nền ảnh và hiệu ứng.",
            "images": [
                "/materials/images/ppt_1.jpg",
                "/materials/images/ppt_2.jpg",
                "/materials/images/ppt_3.jpg",
            ],
            "tasks": [
                "Slide 1: Dùng Theme Essential, lưu file kynangtrinhchieu.pptx, Layout Title Slide, font Times New Roman 25pt, chèn ảnh và SmartArt Cycle Arrow Process (2014, 2020, 2015).",
                "Slide 2: Nhân bản Slide 1, đổi Picture Style ảnh sang Soft Edge Oval, chèn số trang & Footer 'Tôi yêu HUMG', tiêu đề màu đỏ gạch chân, chèn ảnh ClipArt + 2 Textbox nền vàng viền xanh 3pt.",
                "Slide 3: Nhân bản Slide 1, đổi Layout Title and Content, đặt ảnh nền ngôi sao, chèn SmartArt Horizontal Multi-Level Hierarchy (Khoá 66 -> SV đã thi/chưa thi/đã đạt/chưa đạt CĐR).",
                "Thiết lập hiệu ứng chuyển trang (Transition) cho các slide và hiệu ứng Entrance (Animation) cho tiêu đề Slide 3.",
            ],
        },
        {
            "id": "excel-lab-01",
            "subject": "excel",
            "title": "Bài tập Excel tổng hợp 01: Kết quả cuộc thi chạy Việt dã",
            "description": "Luyện tập hàm chuỗi LEFT, dò tìm VLOOKUP/INDEX-MATCH kết hợp cột phụ, tính thời gian, sắp xếp, thống kê MIN/MAX có điều kiện và vẽ biểu đồ Bar.",
            "images": ["/materials/images/excel_1.jpg"],
            "tasks": [
                "Dùng ký tự đầu của Mã số dò bảng phụ lấy Tên nội dung thi.",
                "Dựa vào ký tự đầu Mã số và cột Phái (Nam/Nữ) lấy thời gian Xuất phát.",
                "Tính cột Thành tích = Về đích - Xuất phát.",
                "Kẻ khung, tô màu nền bảng phụ và sắp xếp theo Nội dung thi, Thành tích.",
                "Thống kê thành tích Maraton cao nhất/thấp nhất của Nam và Nữ; rút trích VĐV Nam sinh <= 1985; vẽ biểu đồ Bar.",
            ],
        },
        {
            "id": "excel-lab-02",
            "subject": "excel",
            "title": "Bài tập Excel tổng hợp 02: Thẻ nhập xuất kho",
            "description": "Luyện tập định dạng bảng tính, tính Trị giá, Chuyên chở, hàm IF tính Thuế theo ngưỡng 33.000.000 và các hàm SUM, MAX, MIN.",
            "images": ["/materials/images/excel_2.jpg"],
            "tasks": [
                "Trình bày bảng tính font Times New Roman 12pt, căn lề, kẻ viền chuẩn.",
                "Tính Trị giá = Số lượng * Đơn giá; Chuyên chở = Số lượng * 400.",
                "Dùng hàm IF tính Thuế: > 33.000.000 thì 7%, ngược lại 6%.",
                "Chèn cột Tổng cộng = Trị giá + Thuế + Chuyên chở.",
                "Tính Tổng, Lớn nhất, Nhỏ nhất và định dạng phân cách hàng ngàn.",
            ],
        },
        {
            "id": "excel-lab-03",
            "subject": "excel",
            "title": "Bài tập Excel tổng hợp 03: Kết quả cuộc thi chạy Việt dã (Bản mở rộng)",
            "description": "Thực hành lại quy trình xử lý bảng tính đa điều kiện, sắp xếp nhiều cấp, Advanced Filter và biểu đồ.",
            "images": ["/materials/images/excel_3.jpg"],
            "tasks": [
                "Nhập bảng dữ liệu chính xác với định dạng giờ (h:mm).",
                "Hoàn thiện các cột Nội dung thi, Xuất phát, Thành tích bằng công thức.",
                "Thực hiện Advanced Filter rút trích danh sách theo điều kiện Nam và Năm sinh <= 1985.",
                "Hoàn thiện bảng thống kê và vẽ biểu đồ Bar.",
            ],
        },
        {
            "id": "excel-lab-04",
            "subject": "excel",
            "title": "Bài tập Excel tổng hợp 04: Doanh số mặt hàng Tivi",
            "description": "Luyện tập VLOOKUP, HLOOKUP kết hợp LEFT/RIGHT/VALUE, tính tỷ lệ hỗ trợ giảm giá, khuyến mãi và lọc dữ liệu.",
            "images": ["/materials/images/excel_4.jpg"],
            "tasks": [
                "Dựa vào ký tự đầu Mã số dò Bảng giá điền cột Hiệu.",
                "Dựa vào 2 ký tự cuối Mã số chuyển sang số điền cột Kích cỡ.",
                "Dùng INDEX/MATCH hoặc VLOOKUP+IF lấy Giá bán theo Mã số và Kích cỡ.",
                "Điền tỷ lệ Hỗ trợ giảm theo hiệu Tivi và tiền Tặng theo kích cỡ.",
                "Tính Còn lại và rút trích danh sách Tivi 32 inch hoặc giá bán > 20 triệu.",
            ],
        },
        {
            "id": "excel-lab-05",
            "subject": "excel",
            "title": "Bài tập Excel tổng hợp 05: Bảng tính tiền lương",
            "description": "Luyện tập hàm ngày tháng, hàm IF phân bậc chức vụ, VLOOKUP bảng tiền thưởng, thống kê SUM/AVERAGE/MAX/MIN và biểu đồ cột 3D.",
            "images": ["/materials/images/excel_5.jpg"],
            "tasks": [
                "Nhập bảng tính, lưu baithuchanhexcel.xlsx, định dạng tiền tệ nhóm phân cách.",
                "Tính Số ngày làm = Ngày kết thúc - Ngày bắt đầu; tính Tổng, TB, Lớn nhất, Nhỏ nhất.",
                "Tính Lương theo bậc = Hệ số (Trưởng phòng 4.0, Nhân viên 2.5) * Lương cơ bản ($K$2 = 2.430.000).",
                "Dùng VLOOKUP điền Tiền thưởng; hàm IF thưởng thêm 200.000 nếu số ngày làm > 25.",
                "Tính Tổng lương, định dạng VND, sắp xếp tăng dần và vẽ biểu đồ cột 3D.",
            ],
        },
        {
            "id": "mock-test-udcnttcb",
            "subject": "test",
            "title": "Đề thi mẫu tổng hợp UDCNTTCB (Word + Excel + PowerPoint)",
            "description": "Đề thi chuẩn 3 phần: Soạn thảo văn bản thông tin chung (3đ), Bảng tính tiền hàng + biểu đồ 3D-Pie (4đ), Trình chiếu Natural.pptx (3đ).",
            "images": [
                "/materials/images/test_1.jpg",
                "/materials/images/test_2.jpg",
            ],
            "tasks": [
                "Phần I (Word - 3đ): Soạn thông tin Học viện Nông nghiệp VN, Times New Roman 13pt, Margin chuẩn, Bullets, Comment tại mục Địa chỉ, đánh số trang Plain Number 3.",
                "Phần II (Excel - 4đ): Nhập Bảng tính tiền hàng & Bảng phụ, đổi tên sheet 'Tiền hàng', dùng VLOOKUP điền Tên hàng & Đơn giá, tính Thành tiền & Tổng tiền.",
                "Phần II (Excel - tiếp): Vẽ biểu đồ 3D-Pie tỷ lệ % Số lượng, Layout 1, Style 2; sắp xếp theo Tháng tăng dần và Số lượng giảm dần.",
                "Phần III (PowerPoint - 3đ): Hiệu ứng chuyển trang Doors, Entrance Random Bars cho tiêu đề Slide 1, âm thanh Chime, chỉnh Saturation 100%, Bullets vuông đặc và thêm Notes Page Slide 2.",
            ],
        },
    ]

    print(f"[LABS] Đã tạo {len(labs)} bài thực hành tổng hợp.")
    (DATA_DIR / "practice_labs.json").write_text(
        json.dumps(labs, ensure_ascii=False, indent=2), encoding="utf-8"
    )


if __name__ == "__main__":
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    PUBLIC_MATERIALS_DIR.mkdir(parents=True, exist_ok=True)
    extract_all_quizzes()
    extract_excel_lessons()
    extract_practice_labs()
    print("HOAN TAT TRICH XUAT DU LIEU!")
