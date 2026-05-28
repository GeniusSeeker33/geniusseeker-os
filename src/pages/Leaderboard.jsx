import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Leaderboard() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [copiedKey, setCopiedKey] = useState(null);

  async function copyReferralLink(row) {
    if (!row.contributorId) return;
    const link = `${window.location.origin}/r/${row.contributorId}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopiedKey(row.key);
      setTimeout(() => setCopiedKey((prev) => (prev === row.key ? null : prev)), 2000);
    } catch (err) {
      alert("Could not copy link: " + err.message);
    }
  }

  async function fetchLeaderboardData() {
    setLoading(true);
    setLoadError("");

    const { data, error } = await supabase
      .from("candidate_applications")
      .select(
        "id, first_name, last_name, status, referred_by, referred_by_id, referral_payout_amount, referral_payout_status, created_at, contributor:contributors!referred_by_id(id, name, email)"
      )
      .or("referred_by_id.not.is.null,referred_by.not.is.null");

    if (error) {
      setLoadError(error.message);
      setCandidates([]);
    } else {
      setCandidates(data || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    fetchLeaderboardData();
  }, []);

  const leaderboard = useMemo(() => {
    const map = {};

    candidates.forEach((candidate) => {
      const key = candidate.referred_by_id
        ? `id:${candidate.referred_by_id}`
        : `text:${(candidate.referred_by || "Unknown").trim().toLowerCase()}`;

      const displayName =
        candidate.contributor?.name || candidate.referred_by || "Unknown";

      if (!map[key]) {
        map[key] = {
          key,
          name: displayName,
          contributorId: candidate.referred_by_id || null,
          legacy: !candidate.referred_by_id,
          referrals: 0,
          hires: 0,
          earnedPayouts: 0,
          pendingPayouts: 0,
          contributionScore: 0,
        };
      }

      map[key].referrals += 1;

      if (candidate.status === "hired") {
        map[key].hires += 1;
      }

      if (candidate.referral_payout_status === "earned") {
        map[key].earnedPayouts += Number(candidate.referral_payout_amount || 0);
      } else {
        map[key].pendingPayouts += Number(candidate.referral_payout_amount || 0);
      }

      map[key].contributionScore =
        map[key].referrals * 10 +
        map[key].hires * 50 +
        Math.round(map[key].earnedPayouts / 10);
    });

    return Object.values(map).sort(
      (a, b) => b.contributionScore - a.contributionScore
    );
  }, [candidates]);

  const totalEarned = leaderboard.reduce((sum, row) => sum + row.earnedPayouts, 0);
  const totalPending = leaderboard.reduce((sum, row) => sum + row.pendingPayouts, 0);
  const totalHires = leaderboard.reduce((sum, row) => sum + row.hires, 0);

  return (
    <>
      <header className="topbar">
        <div>
          <p className="eyebrow">Contribution Leaderboard</p>
          <h2>Rank recruiters by talent referred, hires, and payout value.</h2>
        </div>

        <button className="primary-btn" onClick={fetchLeaderboardData}>
          Refresh Leaderboard
        </button>
      </header>

      <section className="grid stats-grid">
        <div className="card stat-card">
          <p>Total Recruiters</p>
          <h3>{loading ? "..." : leaderboard.length}</h3>
          <span>People referring candidates</span>
        </div>

        <div className="card stat-card">
          <p>Total Hires</p>
          <h3>{loading ? "..." : totalHires}</h3>
          <span>Referral-sourced hires</span>
        </div>

        <div className="card stat-card">
          <p>Earned / Pending</p>
          <h3>
            ${totalEarned.toLocaleString()} / ${totalPending.toLocaleString()}
          </h3>
          <span>Payout value tracked</span>
        </div>
      </section>

      {loadError && (
        <section className="card error-card">
          <h3>Could not load leaderboard</h3>
          <p>{loadError}</p>
        </section>
      )}

      <section className="card">
        <div className="section-header">
          <h3>Top Recruiters</h3>
          <p>
            Contribution score = referrals, hires, and earned payout value.
          </p>
        </div>

        {loading ? (
          <p className="muted-small">Loading leaderboard...</p>
        ) : leaderboard.length === 0 ? (
          <p className="muted-small">
            No referral activity yet. Add candidates with “Referred By” in Recruiting.
          </p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Referrer</th>
                  <th>Referrals</th>
                  <th>Hires</th>
                  <th>Earned Payouts</th>
                  <th>Pending Payouts</th>
                  <th>Contribution Score</th>
                  <th>Referral Link</th>
                </tr>
              </thead>

              <tbody>
                {leaderboard.map((row, index) => (
                  <tr key={row.key}>
                    <td>
                      <span className="status-pill">#{index + 1}</span>
                    </td>
                    <td>
                      <strong>{row.name}</strong>
                      {row.legacy && (
                        <>
                          {" "}
                          <span className="status-pill payout" title="Legacy free-text referral — not yet linked to a recruiter record">
                            Unlinked
                          </span>
                        </>
                      )}
                    </td>
                    <td>{row.referrals}</td>
                    <td>{row.hires}</td>
                    <td>${row.earnedPayouts.toLocaleString()}</td>
                    <td>${row.pendingPayouts.toLocaleString()}</td>
                    <td>
                      <span className="score-pill">{row.contributionScore}</span>
                    </td>
                    <td>
                      {row.contributorId ? (
                        <button
                          className="mini-btn"
                          onClick={() => copyReferralLink(row)}
                        >
                          {copiedKey === row.key ? "Copied" : "Copy Link"}
                        </button>
                      ) : (
                        <span className="muted-small">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="card">
        <div className="section-header">
          <h3>Contribution Score Logic</h3>
          <p>This turns human contribution into measurable reputation.</p>
        </div>

        <div className="pipeline">
          <div>Referral = 10 pts</div>
          <div>Hire = 50 pts</div>
          <div>$100 Earned = 10 pts</div>
          <div>Rank Updates Live</div>
          <div>Future Token Layer</div>
        </div>
      </section>
    </>
  );
}