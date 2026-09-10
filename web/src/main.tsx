import { createRoot } from "react-dom/client";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import "./styles.css";
import { AppShell } from "./components/AppShell";
import { Home } from "./routes/Home";
import { CircuitLibrary } from "./routes/CircuitLibrary";
import { CircuitDetail } from "./routes/CircuitDetail";
import { PromptGenerator } from "./routes/PromptGenerator";
import { LintPage } from "./routes/LintPage";
import { Faq } from "./routes/Faq";
import { LibraryMap } from "./routes/LibraryMap";
import { Workflow } from "./routes/Workflow";
import { NotFound } from "./routes/NotFound";

/**
 * 使用 HashRouter：部署到 GitHub Pages 时无需服务端 rewrite，
 * 直接支持 xxx.github.io/<repo>/#/circuits 这类深链。
 */
function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<Home />} />
          <Route path="/circuits" element={<CircuitLibrary />} />
          <Route path="/circuits/:slug" element={<CircuitDetail />} />
          <Route path="/prompt" element={<PromptGenerator />} />
          <Route path="/lint" element={<LintPage />} />
          <Route path="/faq" element={<Faq />} />
          <Route path="/library" element={<LibraryMap />} />
          <Route path="/workflow" element={<Workflow />} />
          <Route path="/contribute" element={<Navigate to="/workflow" replace />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
