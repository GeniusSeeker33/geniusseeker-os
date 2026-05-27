import { useState } from "react";

const initialReferrals = [
  {
    id: 1,
    referrer: "Desiree Thayer",
    candidate: "Alex Morgan",
    email: "alex@example.com",
    role: "Orion Sales Representative",
    status: "Interviewing",
    payout: "$300",
    payoutStatus: "Pending",
  },
  {
    id: 2,
    referrer: "Sarah H.",
    candidate: "Jordan Blake",
    email: "jordan@example.com",
    role: "Remote Recruiter",
    status: "Submitted",
    payout: "$150",
    payoutStatus: "Not Earned Yet",
  },
];

export default function Referrals() {
  const [referrals, setReferrals] = useState(initialReferrals);

  const [form, setForm] = useState({
    referrer: "",
    candidate: "",
    email: "",
    phone: "",
    role: "",
    notes: "",
  });

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    const newReferral = {
      id: Date.now(),
      referrer: form.referrer,
      candidate: form.candidate,
      email: form.email,
      role: form.role,
      status: "Submitted",
      payout: "$300",
      payoutStatus: "Not Earned Yet",
    };

    setReferrals((prev) => [newReferral, ...prev]);

    setForm({
      referrer: "",
      candidate: "",
      email: "",
      phone: "",
      role: "",
      notes: "",
    });
  }

  return (
    <>
      <header className="topbar">
        <div>
          <p className="eyebrow">Referral Wallet</p>
          <h2>Track who referred talent, where they are in the pipeline, and what payout is owed.</h2>
        </div>
      </header>

      <section className="content-grid">
        <form className="card form-card" onSubmit={handleSubmit}>
          <div className="section-header">
            <h3>Add Referral</h3>
            <p>Start the contribution trail the moment someone shares talent.</p>
          </div>

          <label>
            Referrer Name
            <input
              name="referrer"
              value={form.referrer}
              onChange={handleChange}
              placeholder="Who made the referral?"
              required
            />
          </label>

          <label>
            Candidate Name
            <input
              name="candidate"
              value={form.candidate}
              onChange={handleChange}
              placeholder="Candidate full name"
              required
            />
          </label>

          <label>
            Candidate Email
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="candidate@email.com"
              required
            />
          </label>

          <label>
            Candidate Phone
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Phone number"
            />
          </label>

          <label>
            Role Interested In
            <select name="role" value={form.role} onChange={handleChange} required>
              <option value="">Select role</option>
              <option value="Orion Sales Representative">Orion Sales Representative</option>
              <option value="Remote Recruiter">Remote Recruiter</option>
              <option value="Marketing Ambassador">Marketing Ambassador</option>
              <option value="Field Mission Rep">Field Mission Rep</option>
            </select>
          </label>

          <label>
            Notes
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Relationship, strengths, context, or why they are a fit"
            />
          </label>

          <button className="primary-btn" type="submit">
            Submit Referral
          </button>
        </form>

        <div className="card">
          <div className="section-header">
            <h3>Payout Rules</h3>
            <p>This makes referral compensation visible and auditable.</p>
          </div>

          <div className="payout-rules">
            <div>
              <strong>$150</strong>
              <span>Candidate screened</span>
            </div>

            <div>
              <strong>$300</strong>
              <span>Candidate hired</span>
            </div>

            <div>
              <strong>$500+</strong>
              <span>High-value or hard-to-fill role</span>
            </div>
          </div>
        </div>
      </section>

      <section className="card">
        <div className="section-header">
          <h3>Referral Table</h3>
          <p>Pipeline visibility from referral submitted to payout earned.</p>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Referrer</th>
                <th>Candidate</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Payout</th>
                <th>Payout Status</th>
              </tr>
            </thead>

            <tbody>
              {referrals.map((referral) => (
                <tr key={referral.id}>
                  <td>{referral.referrer}</td>
                  <td>{referral.candidate}</td>
                  <td>{referral.email}</td>
                  <td>{referral.role}</td>
                  <td>
                    <span className="status-pill">{referral.status}</span>
                  </td>
                  <td>{referral.payout}</td>
                  <td>
                    <span className="status-pill payout">
                      {referral.payoutStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}