import React, { useEffect, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  BookOpen,
  CheckSquare,
  FileSpreadsheet,
  FileText,
  GraduationCap,
  Layers,
  Menu,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Presentation,
  Sun,
  X,
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/', label: 'Tổng quan', icon: GraduationCap, exact: true },
  { to: '/word', label: 'MS Word', icon: FileText },
  { to: '/excel', label: 'MS Excel', icon: FileSpreadsheet },
  { to: '/ppt', label: 'MS PowerPoint', icon: Presentation },
  { to: '/foundation', label: 'CNTT Nền tảng', icon: Layers },
  { to: '/mock-exam', label: 'Thi thử (Mock Test)', icon: CheckSquare },
  { to: '/labs', label: 'Đề thực hành mẫu', icon: BookOpen },
];

export const Layout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('mos_sidebar_collapsed') === 'true';
  });
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('mos_theme') === 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem('mos_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('mos_theme', 'light');
    }
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('mos_sidebar_collapsed', String(collapsed));
  }, [collapsed]);

  return (
    <div className="min-h-screen flex flex-col bg-[#f2f8fd] dark:bg-[#0b1623] text-slate-900 dark:text-slate-100 transition-colors">
      {/* Mobile top bar */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="flex items-center gap-2 font-bold text-slate-800">
          <GraduationCap className="w-6 h-6 text-indigo-600" />
          <span>MOS & UDCNTTCB</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setDarkMode((d) => !d)}
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            aria-label="Đổi giao diện sáng/tối"
          >
            {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
          </button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            aria-label="Mở menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Sidebar cố định bên trái (hỗ trợ đóng/mở trên cả desktop & mobile) */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 bg-white border-r border-slate-200 flex flex-col transition-all duration-200 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } ${collapsed ? 'w-64 md:w-20' : 'w-64'}`}
      >
        {/* Header Sidebar + nút đóng/mở trên desktop */}
        <div
          className={`hidden md:flex items-center border-b border-slate-100 py-4 ${
            collapsed ? 'justify-center px-2' : 'justify-between px-4'
          }`}
        >
          {!collapsed && (
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm shrink-0">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-slate-900 leading-tight truncate">MOS Studio</div>
                <div className="text-xs text-slate-500 truncate">Word • Excel • PPT</div>
              </div>
            </div>
          )}

          <button
            onClick={() => setCollapsed((c) => !c)}
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-indigo-600 transition-colors shrink-0"
            title={collapsed ? 'Mở rộng Sidebar' : 'Thu gọn Sidebar'}
            aria-label={collapsed ? 'Mở rộng Sidebar' : 'Thu gọn Sidebar'}
          >
            {collapsed ? (
              <PanelLeftOpen className="w-5 h-5" />
            ) : (
              <PanelLeftClose className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Danh sách điều hướng */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.exact}
                onClick={() => setMobileOpen(false)}
                title={collapsed ? item.label : undefined}
                className={({ isActive }) =>
                  `flex items-center rounded-xl text-sm font-medium transition-colors ${
                    collapsed
                      ? 'md:justify-center md:px-2 md:py-2.5 gap-3 px-3.5 py-2.5'
                      : 'gap-3 px-3.5 py-2.5'
                  } ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span className={collapsed ? 'md:hidden' : ''}>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer Sidebar: Nút Dark Mode & Thông tin kho */}
        <div className="p-3 border-t border-slate-100 space-y-2.5">
          <button
            onClick={() => setDarkMode((d) => !d)}
            title={darkMode ? 'Chuyển sang Chế độ Sáng' : 'Chuyển sang Chế độ Tối'}
            className={`w-full flex items-center rounded-xl bg-slate-100 hover:bg-indigo-50 text-slate-700 text-xs font-semibold transition-colors ${
              collapsed ? 'md:justify-center p-2.5' : 'justify-between px-3 py-2'
            }`}
          >
            <span className="flex items-center gap-2">
              {darkMode ? (
                <Sun className="w-4 h-4 text-amber-400 shrink-0" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-600 shrink-0" />
              )}
              <span className={collapsed ? 'md:hidden' : ''}>
                {darkMode ? 'Chế độ Sáng' : 'Chế độ Tối (Dark)'}
              </span>
            </span>
            {!collapsed && (
              <span className="px-1.5 py-0.5 rounded bg-white text-[10px] text-slate-500 border border-slate-200">
                {darkMode ? 'ON' : 'OFF'}
              </span>
            )}
          </button>

          {!collapsed && (
            <div className="px-1 text-xs text-slate-400">
              Kho dữ liệu: <span className="font-medium text-slate-600">720 câu hỏi</span> +{' '}
              <span className="font-medium text-slate-600">24 bài Excel</span> +{' '}
              <span className="font-medium text-slate-600">10 Lab công thức</span>
            </div>
          )}
        </div>
      </aside>

      {/* Backdrop mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main Content tự động co giãn theo trạng thái Sidebar cố định */}
      <div
        className={`flex-1 min-w-0 transition-all duration-200 ${
          collapsed ? 'md:pl-20' : 'md:pl-64'
        }`}
      >
        <main className="p-3 sm:p-6 lg:p-8 pb-24 md:pb-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>

      {/* Bottom Navigation Bar cho điện thoại */}
      <nav
        aria-label="Điều hướng nhanh"
        className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-t border-slate-200 dark:border-slate-800 px-1 py-1.5 flex items-center justify-around"
      >
        {[
          { to: '/', label: 'Tổng quan', icon: GraduationCap, exact: true },
          { to: '/word', label: 'Word', icon: FileText },
          { to: '/excel', label: 'Excel', icon: FileSpreadsheet },
          { to: '/ppt', label: 'PPT', icon: Presentation },
          { to: '/mock-exam', label: 'Thi thử', icon: CheckSquare },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-0.5 px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-colors min-w-[56px] ${
                  isActive
                    ? 'text-indigo-600 bg-indigo-50/80'
                    : 'text-slate-500 hover:text-slate-900'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};
