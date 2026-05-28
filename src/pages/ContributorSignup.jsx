import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function ContributorSignup() {
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [contributor, setContributor] = useState(null);
  const [copied, setCopied] = useState(false);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();

    if (!name || !email) {
      setError("Name and email are required.");
      return;
    }

    setSaving(true);

    const { data, error: insertError } = await supabase
      .from("contributors")
      .insert([
        {
          name,
          email,
          phone: form.phone.trim() || null,
        },
      ])
      .select("id, name, email")
      .single();

    setSaving(false);

    if (insertError) {
      if (insertError.code === "23505") {
        const { data: existing } = await supabase
          .from("contributors")
          .select("id, name, email")
          .eq("email", email)
          .maybeSingle();

        if (existing) {
          setContributor(existing);
          return;
        }
      }

      setError(insertError.message);
      return;
    }

    setContributor(data);
  }

  if (contributor) {
    const referralLink = `${window.location.origin}/r/${contributor.id}`;

    async function copyLink() {
      try {
        await navigator.clipboard.writeText(referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        setCopied(false);
      }
    }

    return (
      <div className="public-shell">
        <div className="public-card">
          <p className="eyebrow">You're in</p>
          <h1>Welcome, {contributor.name}.</h1>
          <p className="muted-small">
            Share your personal referral link. When someone applies through it,
            you'll be credited as their referrer.
          </p>

          <div className="referral-link-box">
            <code>{referralLink}</code>
            <button type="button" className="primary-btn" onClick={copyLink}>
              {copied ? "Copied" : "Copy Link"}
            </button>
          </div>

          <p className="muted-small">
            Bookmark this page or copy the link somewhere safe. You can always
            return to <code>{window.location.origin}/r/{contributor.id}</code>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="public-shell">
      <div className="public-card">
        <p className="eyebrow">Become a contributor</p>
        <h1>Join the GeniusSeeker referral network.</h1>
        <p className="muted-small">
          Refer talent to Orion roles and earn payouts when your referrals get
          hired. Sign up below to get your personal referral link.
        </p>

        <form onSubmit={handleSubmit} className="public-form">
          <label>
            Full Name
            <input
              name="name"
              value={form.name}
              onChange={updateField}
              required
              autoFocus
            />
          </label>

          <label>
            Email
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={updateField}
              required
            />
          </label>

          <label>
            Phone <span className="muted-small">(optional)</span>
            <input name="phone" value={form.phone} onChange={updateField} />
          </label>

          {error && <p className="form-error">{error}</p>}

          <button className="primary-btn" type="submit" disabled={saving}>
            {saving ? "Creating link..." : "Get My Referral Link"}
          </button>
        </form>
      </div>
    </div>
  );
}
