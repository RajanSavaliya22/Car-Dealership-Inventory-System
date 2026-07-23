import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function LoginForm({ onSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      if (onSuccess) {
        onSuccess();
      } else {
        navigate("/"); // changed from /dashboard
      }
    } catch (err) {
      const message =
        err?.response?.data?.detail ||
        "Unable to log in. Please check your credentials and try again.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="login-email">Email Address</label>
        <input
          id="login-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="e.g. name@company.com"
          required
        />
      </div>
      <div className="form-group" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <label htmlFor="login-password" style={{ marginBottom: '0.5rem' }}>Password</label>
        </div>
        <input
          id="login-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
        />
      </div>
      {error && <p className="alert-error" role="alert">{error}</p>}
      <button type="submit" className="btn-primary" disabled={submitting}>
        {submitting ? 'Authenticating...' : 'Sign In'}
      </button>
    </form>
  );
}