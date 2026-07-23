import { Link } from "react-router-dom";
import LoginForm from "../components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="app-container" style={{ minHeight: 'calc(100vh - 4rem)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="login-form-container glass-panel" style={{ width: '100%', margin: '0', padding: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h1 style={{
            fontSize: '1.8rem',
            background: 'var(--primary-gradient)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            display: 'inline-block',
            fontWeight: '800'
          }}>
            Welcome Back
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem', fontSize: '0.85rem' }}>
            Enter your credentials to access your account.
          </p>
        </div>

        <LoginForm />

        <div style={{ marginTop: '1.5rem', textAlign: 'center', borderTop: '1px solid var(--surface-border)', paddingTop: '1rem' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Don't have an account? <Link to="/register" style={{ fontWeight: 600, color: 'var(--primary-color)' }}>Sign up now</Link>
          </p>
          <div style={{ marginTop: '0.5rem' }}>
            <Link to="/" style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}