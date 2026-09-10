import { Link } from "react-router-dom";

export function NotFound() {
  return (
    <div className="container narrow center" style={{ paddingTop: 60 }}>
      <h1 style={{ fontSize: 52, margin: 0 }}>404</h1>
      <p className="lead">这条支路没有连到任何节点（floating node）。</p>
      <div className="toolbar" style={{ justifyContent: "center" }}>
        <Link to="/" className="btn primary">回到首页</Link>
        <Link to="/circuits" className="btn">浏览电路库</Link>
      </div>
    </div>
  );
}
