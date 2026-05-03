import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { GoogleLogin } from "@react-oauth/google";
import "./Login.css";

function SparklineSVG() {
  const pts = [18, 28, 22, 35, 30, 26, 38, 34, 42, 36, 45, 40, 48];
  const W = 100, H = 48, max = Math.max(...pts), min = Math.min(...pts);
  const xs = pts.map((_, i) => (i / (pts.length - 1)) * W);
  const ys = pts.map(v => H - ((v - min) / (max - min)) * (H - 8) - 4);
  const line = xs.map((x, i) => `${i === 0 ? 'M' : 'L'}${x} ${ys[i]}`).join(' ');
  const area = `${line} L${W} ${H} L0 ${H} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="sparkline" preserveAspectRatio="none">
      <defs>
        <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#00c896" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#00c896" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#sg)" />
      <path d={line} fill="none" stroke="#00c896" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={xs[xs.length - 1]} cy={ys[ys.length - 1]} r="2.8" fill="#00c896" />
      <circle cx={xs[xs.length - 1]} cy={ys[ys.length - 1]} r="5.5" fill="rgba(0,200,150,0.2)" />
    </svg>
  );
}

const CATS = [
  { label: "Ăn uống", color: "#f59e0b", pct: "28%" },
  { label: "Di chuyển", color: "#34d399", pct: "15%" },
  { label: "Mua sắm", color: "#ec4899", pct: "22%" },
  { label: "Tiết kiệm", color: "#00c896", pct: "35%" },
];

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { login, loginWithGoogle, user } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const { user: loggedInUser } = await login({ email, password });
      navigate(loggedInUser?.role === "admin" ? "/admin" : "/");
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Đăng nhập thất bại");
    } finally { setLoading(false); }
  };

  useEffect(() => {
    if (user) navigate(user.role === "admin" ? "/admin" : "/");
  }, [user, navigate]);

  return (
    <>
      <div className="lr-root">

        {/* ── HERO ── */}
        <div className="lr-hero">
          <div className="lr-hero-dots" />
          <div className="lr-hero-content">

            <div className="lr-badge">
              <span className="lr-badge-icon">✦</span>
              <span className="lr-badge-text">Ứng dụng quản lý chi tiêu #1</span>
            </div>

            <h1 className="lr-hero-title">
              Kiểm soát<br />
              <span className="accent">tài chính</span> cá nhân<br />
              thông minh hơn.
            </h1>

            <p className="lr-hero-sub">
              Tự động theo dõi thu chi, phân tích ngân sách theo danh mục,<br />
              và đạt mục tiêu tiết kiệm — mọi thứ trong tầm tay.
            </p>

            {/* Balance card mockup */}
            <div className="card-mockup">
              <div className="card-top">
                <div className="card-label">Số dư tháng này</div>
                <div className="card-month-tag">Tháng 3 / 2026</div>
              </div>
              <div className="card-balance">12,840,000 ₫</div>
              <div className="card-balance-sub">↑ +8.2% so với tháng trước</div>
              <SparklineSVG />
              <div className="card-stats">
                <div className="card-stat">
                  <div className="card-stat-label">Thu nhập</div>
                  <div className="card-stat-val up">+24.5M</div>
                </div>
                <div className="card-stat">
                  <div className="card-stat-label">Chi tiêu</div>
                  <div className="card-stat-val dn">−11.7M</div>
                </div>
                <div className="card-stat">
                  <div className="card-stat-label">Tiết kiệm</div>
                  <div className="card-stat-val up">12.8M</div>
                </div>
              </div>
            </div>

            {/* Category pills */}
            <div className="cat-row">
              {CATS.map(c => (
                <div className="cat-pill" key={c.label}>
                  <span className="cat-dot" style={{ background: c.color }} />
                  {c.label} <span style={{ opacity: 0.45, marginLeft: 2 }}>{c.pct}</span>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* ── FORM ── */}
        <div className="lr-form-side">

          <div className="app-identity">
            <div className="app-logo">💰</div>
            <div className="app-name">Spend<span>Wise</span></div>
          </div>

          <div className="form-title">Đăng nhập</div>
          <div className="form-sub">Chào mừng trở lại! Quản lý tài chính bắt đầu từ đây.</div>

          <form onSubmit={submit}>
            <div className="field">
              <label className="field-label" htmlFor="em">Email</label>
              <div className="field-wrap">
                <input id="em" type="email" className="field-input"
                  placeholder="ten@email.com" autoComplete="email" autoFocus required
                  value={email} onChange={e => setEmail(e.target.value)} />
              </div>
            </div>

            <div className="field">
              <label className="field-label" htmlFor="pw">Mật khẩu</label>
              <div className="field-wrap">
                <input id="pw" type={showPw ? "text" : "password"}
                  className="field-input field-input-pw"
                  placeholder="••••••••" autoComplete="current-password" required
                  value={password} onChange={e => setPassword(e.target.value)} />
                <button type="button" className="pw-btn" tabIndex={-1} onClick={() => setShowPw(!showPw)}>
                  {showPw
                    ? <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                    : <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                  }
                </button>
              </div>
            </div>

            <div className="row-extras">
              <label className="remember">
                <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} />
                Nhớ đăng nhập
              </label>
              <Link to="/forgot-password" className="forgot-a">Quên mật khẩu?</Link>
            </div>

            {error && (
              <div className="err-box">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                {error}
              </div>
            )}

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading
                ? <><span className="spinner" /> Đang xác thực…</>
                : <>Đăng nhập <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg></>
              }
            </button>
          </form>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '22px' }}>
            <GoogleLogin
              onSuccess={async (credentialResponse) => {
                setLoading(true); setError("");
                try {
                  const { user: googleUser } = await loginWithGoogle(credentialResponse.credential);
                  navigate(googleUser?.role === "admin" ? "/admin" : "/");
                } catch (err) {
                  setError("Đăng nhập Google thất bại");
                } finally {
                  setLoading(false);
                }
              }}
              onError={() => {
                setError("Đăng nhập Google thất bại");
              }}
              useOneTap
            />
          </div>

          <div className="sec-divider">
            <div className="sec-line" /><span className="sec-text">BẢO MẬT & AN TOÀN</span><div className="sec-line" />
          </div>

          <div className="trust-row">
            <div className="trust-badge">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
              SSL 256-bit
            </div>
            <div className="trust-badge">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>
              Mã hóa E2E
            </div>
            <div className="trust-badge">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
              50k+ tin dùng
            </div>
          </div>

          <div className="reg-row">
            Chưa có tài khoản?{" "}
            <Link to="/register">Tạo tài khoản miễn phí</Link>
          </div>
        </div>

      </div>
    </>
  );
}
