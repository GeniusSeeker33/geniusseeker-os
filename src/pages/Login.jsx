import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../lib/auth";

export default function Login() {
  const { user, loading, signInWithEmail } = useAuth();
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
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

    const trimmed = email.trim().toLowerCase();
    if (!trimmed) {
      setError("Email is required.");
      return;
    }

    setSending(true);
    const { error: signInError } = await signInWithEmail(trimmed);
    setSending(false);

    if (signInError) {
      setError(
        signInError.message.includes("Signups not allowed")
          ? "This email isn't authorized. Ask an admin to invite you."
          : signInError.message
      );
      return;
    }

    setSent(true);
  }

  if (sent) {
    return (
      <div className="public-shell">
        <div className="public-card">
          <p className="eyebrow">Check your email</p>
          <h1>Magic link sent.</h1>
          <p className="muted-small">
            We emailed a sign-in link to <strong>{email}</strong>. Click it to
            access the OS. The link expires in 1 hour.
          </p>
          <p className="muted-small">
            Wrong email or didn't get it?{" "}
            <button
              type="button"
              className="link-btn"
              onClick={() => {
                setSent(false);
                setEmail("");
              }}
            >
              Try again
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="public-shell">
      <div className="public-card">
        <p className="eyebrow">Recruiter Sign In</p>
        <h1>GeniusSeeker OS</h1>
        <p className="muted-small">
          Enter your authorized email and we'll send you a one-time sign-in
          link.
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

          {error && <p className="form-error">{error}</p>}

          <button className="primary-btn" type="submit" disabled={sending}>
            {sending ? "Sending..." : "Send Magic Link"}
          </button>
        </form>
      </div>
    </div>
  );
}
