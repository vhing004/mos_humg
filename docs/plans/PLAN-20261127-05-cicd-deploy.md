# PLAN-20261127-05: Thiết lập CI/CD & Deploy Web để sử dụng mọi lúc

- **Task ID:** `05`
- **Ngày tạo:** 2026-11-27
- **Hiện trạng:** `d:\MOS` hiện chưa khởi tạo Git repository và chưa kết nối remote repository. Ứng dụng `web/` là SPA tĩnh (React + Vite + Tailwind + `HyperFormula`), không cần backend.

---

## 1. Kiến trúc CI/CD & Deploy đề xuất

### Phương án chính: GitHub + GitHub Actions → GitHub Pages (Miễn phí, tự động 100%)
1. **Git & Cấu hình bỏ qua file nặng/rác (`.gitignore`):**
   - Bỏ qua `.venv/`, `web/node_modules/`, `web/dist/`.
   - Giữ `web/src/data/` và `web/public/materials/` để GitHub Actions build trực tiếp được ngay mà không cần chạy lại Python trên CI.
2. **Xử lý SPA Routing khi deploy tĩnh:**
   - Chuyển `BrowserRouter` sang `HashRouter` (hoặc thêm `404.html` fallback + `base` động theo biến môi trường `VITE_BASE_PATH`) để khi F5 tại `/excel`, `/word`, `/mock-exam` trên GitHub Pages không bị lỗi 404.
   - Đính kèm sẵn `web/public/_redirects` (cho Netlify/Cloudflare Pages) và `vercel.json` (cho Vercel) để linh hoạt deploy trên bất kỳ nền tảng nào.
3. **Workflow CI/CD (`.github/workflows/deploy.yml`):**
   - **Trigger:** Tự động chạy mỗi khi `push` lên nhánh `main` (hoặc chạy tay `workflow_dispatch`).
   - **Job `build` (CI):** Cài Node.js 22 → `npm ci` → `npm run build` (`tsc -b && vite build`) để kiểm tra lỗi TypeScript & đóng gói `web/dist`.
   - **Job `deploy` (CD):** Sử dụng `actions/upload-pages-artifact` và `actions/deploy-pages` để xuất bản trực tiếp lên **GitHub Pages**.

---

## 2. Các bước thực hiện sau khi được duyệt
1. Tạo `.gitignore` chuẩn tại `d:\MOS\.gitignore` và khởi tạo Git (`git init -b main`).
2. Cập nhật `web/vite.config.ts` (hỗ trợ `base: process.env.VITE_BASE_PATH || '/'`) và `web/src/App.tsx` (dùng `HashRouter` hoặc SPA fallback an toàn cho GitHub Pages).
3. Tạo `.github/workflows/deploy.yml` cho CI/CD tự động.
4. Tạo `web/vercel.json` & `web/public/_redirects` để hỗ trợ deploy đa nền tảng.
5. Chạy `npm run build` kiểm thử lại toàn bộ trước khi commit.
6. Hướng dẫn bạn các bước kết nối repo GitHub (`git remote add origin ...` → `git push -u origin main`) và bật **Settings → Pages → Source: GitHub Actions** để nhận link web dùng mọi lúc.

---

## 3. Tiêu chí hoàn thành
- Có `.gitignore`, `.github/workflows/deploy.yml`, cấu hình SPA routing không lỗi 404 khi F5.
- `npm run build` trong `web/` thành công 0 lỗi.
- Sẵn sàng push lên GitHub để tự động build & deploy.
