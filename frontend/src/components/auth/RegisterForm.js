import { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as authApi from "../../api/auth";

export default function RegisterForm({ onSuccess }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  function firstErrorMessage(err) {
    const data = err?.response?.data;
    if (!data) return "Registration failed. Please try again.";
    if (typeof data === "string") return "Registration failed. Server error.";
    const firstKey = Object.keys(data)[0];
    if (!firstKey) return "Registration failed. Please try again.";
    const value = data[firstKey];
    return Array.isArray(value) ? value[0] : String(value);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await authApi.register(username, email, password);
      if (onSuccess) {
        onSuccess();
      } else {
        // If standalone page, fallback to redirecting to login page
        navigate("/login");
      }
    } catch (err) {
      setError(firstErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="register-username">Choose a Username</label>
        <input
          id="register-username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="e.g. jdoe99"
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="register-email">Email Address</label>
        <input
          id="register-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="e.g. name@company.com"
          required
        />
      </div>
      <div className="form-group" style={{ marginBottom: '1.5rem' }}>
        <label htmlFor="register-password">Secure Password</label>
        <input
          id="register-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
        />
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Must be at least 8 characters long.</p>
      </div>
      {error && <p className="alert-error" role="alert">{error}</p>}
      <button type="submit" className="btn-primary" disabled={submitting}>
        {submitting ? 'Creating Account...' : 'Create Account'}
      </button>
    </form>
  );
}