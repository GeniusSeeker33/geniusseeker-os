import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

const pipelineStatuses = [
  "new",
  "screened",
  "interviewing",
  "offered",
  "hired",
  "rejected",
];

function formatStatus(status) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export default function Dashboard() {
  const [candidates, setCandidates] = useState([]);
  const [contributorCount, setContributorCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchStats() {
      setLoading(true);
      setLoadError("");

      const [candidatesResult, contributorsResult] = await Promise.all([
        supabase
          .from("candidate_applications")
          .select(
            "id, status, referred_by_id, referral_payout_amount, referral_payout_status"
          ),
        supabase
          .from("contributors")
          .select("id", { count: "exact", head: true }),
      ]);

      if (cancelled) return;

      if (candidatesResult.error) {
        setLoadError(candidatesResult.error.message);
        setLoading(false);
        return;
      }

      if (contributorsResult.error) {
        setLoadError(contributorsResult.error.message);
        setLoading(false);
        return;
      }

      setCandidates(candidatesResult.data || []);
      setContributorCount(contributorsResult.count || 0);
      setLoading(false);
    }

    fetchStats();
    return () => {
      cancelled = true;
    };
  }, []);

  const totalCandidates = candidates.length;
  const activePipeline = candidates.filter(
    (candidate) =>
      candidate.status !== "hired" && candidate.status !== "rejected"
  ).length;
  const earnedPayouts = candidates
    .filter((candidate) =>
      ["earned", "requested", "paid"].includes(
        candidate.referral_payout_status
      )
    )
    .reduce(
      (sum, candidate) => sum + Number(candidate.referral_payout_amount || 0),
      0
    );

  const stats = [
    { label: "Total Candidates", value: totalCandidates },
    { label: "Active Pipeline", value: activePipeline },
    { label: "Contributors", value: contributorCount },
    {
      label: "Earned Payouts",
      value: `$${earnedPayouts.toLocaleString()}`,
    },
  ];

  return (
    <>
      <header className="topbar">
        <div>
          <p className="eyebrow">Orion Pilot Dashboard</p>
          <h2>Unified Workforce Intelligence</h2>
        </div>

        <Link to="/recruiting" className="primary-btn">
          Add Candidate
        </Link>
      </header>

      {loadError && (
        <section className="card error-card">
          <h3>Could not load dashboard stats</h3>
          <p>{loadError}</p>
        </section>
      )}

      <section className="grid stats-grid">
        {stats.map((stat) => (
          <div className="card stat-card" key={stat.label}>
            <p>{stat.label}</p>
            <h3>{loading ? "..." : stat.value}</h3>
          </div>
        ))}
      </section>

      <section className="card">
        <div className="section-header">
          <h3>Pipeline Stages</h3>
          <p>Live counts by applicant status.</p>
        </div>

        <div className="pipeline">
          {pipelineStatuses.map((status) => {
            const count = candidates.filter(
              (candidate) => candidate.status === status
            ).length;
            return (
              <div key={status}>
                {formatStatus(status)}: {loading ? "..." : count}
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
