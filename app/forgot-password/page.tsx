import Link from "next/link";
import { Headphones, MailOpen } from "lucide-react";

export default function ForgotPasswordPage() {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <Headphones size={32} style={{ color: "var(--color-primary-color)" }} />
          <span className="auth-logo-text">Connectdesk</span>
        </div>

        <h1 className="auth-title">Reset Password</h1>

        <p className="auth-subtitle">
          Enter the email associated with this account to receive a reset link
        </p>

        <form className="form-group">
          <div className="form-field">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              placeholder="janedoe1_connectdesk.com"
            />
          </div>

          <button type="button" className="btn btn-primary btn-full btn-lg">
            <MailOpen size={18} />
            Send Reset Link
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "var(--spacing-6)" }}>
          <Link
            href="/login"
            style={{
              fontSize: "var(--font-body-medium-size)",
              color: "var(--color-primary-color)",
              fontWeight: 500,
            }}
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
