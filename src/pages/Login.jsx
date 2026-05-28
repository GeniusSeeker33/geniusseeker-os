import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../lib/auth";

export default function Login() {
  const { user, loading, signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (loading) {
    return (
      <div className="public-shell">
        <div className="public-card">
          <p className="muted-small">Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !password) {
      setError("Email and password are required.");
      return;
    }

    setSubmitting(true);
    const { error: signInError } = await signIn(trimmedEmail, password);
    setSubmitting(false);

    if (signInError) {
      setError(
        signInError.message.toLowerCase().includes("invalid login credentials")
          ? "Invalid email or password."
          : signInError.message
      );
      return;
    }
  }

  return (
    <div className="public-shell">
      <div className="public-card">
        <p className="eyebrow">Recruiter Sign In</p>
        <h1>GeniusSeeker OS</h1>
        <p className="muted-small">
          Sign in with your recruiter credentials.
        </p>

        <form onSubmit={handleSubmit} className="public-form">
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoFocus
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>

          {error && <p className="form-error">{error}</p>}

          <button className="primary-btn" type="submit" disabled={submitting}>
            {submitting ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
