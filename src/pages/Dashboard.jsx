const stats = [
  { label: "Candidates", value: "126" },
  { label: "Active Referrals", value: "42" },
  { label: "Reps in Training", value: "18" },
  { label: "Avg Roleplay Score", value: "84%" },
];

export default function Dashboard() {
  return (
    <>
      <header className="topbar">
        <div>
          <p className="eyebrow">Orion Pilot Dashboard</p>
          <h2>Unified Workforce Intelligence</h2>
        </div>

        <button className="primary-btn">
          Add Referral
        </button>
      </header>

      <section className="grid stats-grid">
        {stats.map((stat) => (
          <div className="card stat-card" key={stat.label}>
            <p>{stat.label}</p>
            <h3>{stat.value}</h3>
          </div>
        ))}
      </section>

      <section className="card">
        <div className="section-header">
          <h3>Contribution Engine</h3>

          <p>
            Every valuable action inside the platform becomes measurable.
          </p>
        </div>

        <div className="pipeline">
          <div>Referral</div>
          <div>Interview</div>
          <div>Training</div>
          <div>Placement</div>
          <div>Payout</div>
        </div>
      </section>
    </>
  );
}