import Link from "next/link";
import { Headphones, ArrowRight } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo" style={{ marginBottom: "var(--spacing-1)" }}>
          <Headphones size={32} style={{ color: "var(--color-primary-color)" }} />
          <span className="auth-logo-text">Connectdesk</span>
        </div>

        <h1 className="auth-title">Login</h1>

        <form className="form-group">
          <div className="form-field">
            <label className="form-label">User ID</label>
            <input
              type="text"
              className="form-input"
              placeholder="ID_123456"
              defaultValue="ID_123456"
            />
          </div>

          <div className="form-field">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              defaultValue="password"
            />
          </div>

          <div>
            <Link
              href="/forgot-password"
              style={{
                fontSize: "var(--font-body-small-size)",
                color: "var(--color-primary-color)",
                fontWeight: 500,
              }}
            >
              Forgot Password?
            </Link>
          </div>

          <Link
            href="/agent"
            className="btn btn-primary btn-full btn-lg"
          >
            Login
            <ArrowRight size={18} />
          </Link>
        </form>
      </div>
    </div>
  );
}
