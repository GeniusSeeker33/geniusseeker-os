import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function ReferralLanding() {
  const { contributorId } = useParams();
  const [contributor, setContributor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [linkError, setLinkError] = useState("");
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    position_title: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    async function loadContributor() {
      setLoading(true);

      const { data, error } = await supabase
        .from("contributors")
        .select("id, name")
        .eq("id", contributorId)
        .maybeSingle();

      if (error) {
        setLinkError(error.message);
      } else if (!data) {
        setLinkError("This referral link isn't valid.");
      } else {
        setContributor(data);
      }

      setLoading(false);
    }

    loadContributor();
  }, [contributorId]);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitError("");
    setSubmitting(true);

    const payload = {
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || null,
      position_title: form.position_title.trim() || null,
      source: "Referral",
      referred_by_id: contributor.id,
      referred_by: contributor.name,
      referral_payout_amount: 300,
      referral_payout_status: "not_earned",
      status: "new",
    };

    const { data, error } = await supabase
      .from("candidate_applications")
      .insert([payload])
      .select("id")
      .single();

    if (error) {
      setSubmitError(error.message);
      setSubmitting(false);
      return;
    }

    await supabase.from("candidate_activity").insert([
      {
        candidate_id: data.id,
        activity_type: "referral_submission",
        activity_note: `Submitted via referral link from ${contributor.name}`,
        created_by: contributor.name,
      },
    ]);

    setSubmitting(false);
    setSubmitted(true);
  }

  if (loading) {
    return (
      <div className="public-shell">
        <div className="public-card">
          <p className="muted-small">Loading...</p>
        </div>
      </div>
    );
  }

  if (linkError) {
    return (
      <div className="public-shell">
        <div className="public-card">
          <p className="eyebrow">Invalid Link</p>
          <h1>{linkError}</h1>
          <p className="muted-small">
            Double-check the URL with whoever shared it with you.
          </p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="public-shell">
        <div className="public-card">
          <p className="eyebrow">Application Received</p>
          <h1>Thanks, {form.first_name}.</h1>
          <p className="muted-small">
            Your application has been submitted and {contributor.name} has been
            credited as your referrer. A recruiter will be in touch soon.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="public-shell">
      <div className="public-card">
        <p className="eyebrow">Referral from {contributor.name}</p>
        <h1>{contributor.name} invited you to apply at Orion.</h1>
        <p className="muted-small">
          Fill out the form below to start your application. {contributor.name}
          {" "}earns a referral bonus if you're hired.
        </p>

        <form onSubmit={handleSubmit} className="public-form">
          <div className="public-form-row">
            <label>
              First Name
              <input
                name="first_name"
                value={form.first_name}
                onChange={updateField}
                required
              />
            </label>

            <label>
              Last Name
              <input
                name="last_name"
                value={form.last_name}
                onChange={updateField}
                required
              />
            </label>
          </div>

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

          <label>
            Role You're Interested In
            <input
              name="position_title"
              value={form.position_title}
              onChange={updateField}
              placeholder="Sales Executive"
            />
          </label>

          {submitError && <p className="form-error">{submitError}</p>}

          <button className="primary-btn" type="submit" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Application"}
          </button>
        </form>
      </div>
    </div>
  );
}
