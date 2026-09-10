import { NavLink, Outlet, Link } from "react-router-dom";
import { REPO_URL, SITE } from "../config";

const NAV = [
  { to: "/", label: "首页", end: true },
  { to: "/circuits", label: "电路库" },
  { to: "/prompt", label: "提示词生成器" },
  { to: "/lint", label: "在线检查" },
  { to: "/library", label: "元件库速查" },
  { to: "/faq", label: "FAQ" },
  { to: "/workflow", label: "工作流" },
];

export function AppShell() {
  return (
    <div className="app">
      <header className="site-header">
        <div className="inner">
          <Link to="/" className="brand">
            <span className="logo">&gt;_</span>
            <span>
              {SITE.title}
              <br />
              <small>AI 生成 · 人工验证</small>
            </span>
          </Link>
          <nav className="nav">
            {NAV.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => (isActive ? "active" : "")}>
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="site-main">
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="inner">
          <span>MIT License · Copyright (c) 2026 ZhangJie86889</span>
          <a href={REPO_URL} target="_blank" rel="noreferrer">
            GitHub 仓库
          </a>
          <span className="spacer" />
          <span>🟡 本库全部电路未经人工仿真验证前均为「待验证」，请以 Multisim 实测为准。</span>
        </div>
      </footer>
    </div>
  );
}
