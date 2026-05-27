import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Dashboard() {
  const [candidates, setCandidates] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchDashboard() {
    setLoading(true);

    const { data: candidateData } = await supabase
      .from("candidate_applications")
      .select(
        "id, first_name, last_name, status, referred_by, referral_payout_amount, referral_payout_status, created_at"
      )
      .order("created_at", { ascending: false });

    const { data: activityData } = await supabase
      .from("candidate_activity")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(6);

    setCandidates(candidateData || []);
    setActivities(activityData || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchDashboard();
  }, []);

  const stats = useMemo(() => {
    const referrals = candidates.filter((c) => c.referred_by);
    const hires = candidates.filter((c) => c.status === "hired");

    const earned = candidates.reduce((sum, c) => {
      if (c.referral_payout_status === "earned") {
        return sum + Number(c.referral_payout_amount || 0);
      }
      return sum;
    }, 0);

    const pending = candidates.reduce((sum, c) => {
      if (c.referred_by && c.referral_payout_status !== "earned") {
        return sum + Number(c.referral_payout_amount || 0);
      }
      return sum;
    }, 0);

    return {
      totalApplicants: candidates.length,
      referrals: referrals.length,
      hires: hires.length,
      earned,
      pending,
    };
  }, [candidates]);

  const topReferrers = useMemo(() => {
    const map = {};

    candidates
      .filter((candidate) => candidate.referred_by)
      .forEach((candidate) => {
        const name = candidate.referred_by;

        if (!map[name]) {
          map[name] = {
            name,
            referrals: 0,
            hires: 0,
            earned: 0,
          };
        }

        map[name].referrals += 1;

        if (candidate.status === "hired") {
          map[name].hires += 1;
        }

        if (candidate.referral_payout_status === "earned") {
          map[name].earned += Number(candidate.referral_payout_amount || 0);
        }
      });

    return Object.values(map)
      .sort((a, b) => b.referrals - a.referrals)
      .slice(0, 5);
  }, [candidates]);

  return (
    <>
      <header className="topbar">
        <div>
          <p className="eyebrow">GeniusSeeker OS</p>
          <h2>Executive view of recruiting, referrals, payouts, and activity.</h2>
        </div>

        <button className="primary-btn" onClick={fetchDashboard}>
          Refresh Dashboard
        </button>
      </header>

      <section className="grid stats-grid">
        <div className="card stat-card">
          <p>Total Applicants</p>
          <h3>{loading ? "..." : stats.totalApplicants}</h3>
          <span>Live from Supabase</span>
        </div>

        <div className="card stat-card">
          <p>Referral Candidates</p>
          <h3>{loading ? "..." : stats.referrals}</h3>
          <span>Attributed to a referrer</span>
        </div>

        <div className="card stat-card">
          <p>Hires</p>
          <h3>{loading ? "..." : stats.hires}</h3>
          <span>Marked hired in pipeline</span>
        </div>

        <div className="card stat-card">
          <p>Earned Payouts</p>
          <h3>${stats.earned.toLocaleString()}</h3>
          <span>Triggered by hire status</span>
        </div>

        <div className="card stat-card">
          <p>Pending Payouts</p>
          <h3>${stats.pending.toLocaleString()}</h3>
          <span>Awaiting hire status</span>
        </div>

        <div className="card stat-card">
          <p>Active Modules</p>
          <h3>4</h3>
          <span>Recruiting, referrals, activity, leaderboard</span>
        </div>
      </section>

      <section className="content-grid">
        <div className="card">
          <div className="section-header">
            <h3>Recent Activity</h3>
            <p>Latest recruiter actions across candidates.</p>
          </div>

          {activities.length === 0 ? (
            <p className="muted-small">No activity logged yet.</p>
          ) : (
            <div className="activity-feed">
              {activities.map((activity) => (
                <div className="activity-item" key={activity.id}>
                  <strong>{activity.activity_type}</strong>
                  <p>{activity.activity_note}</p>
                  <span>{new Date(activity.created_at).toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="section-header">
            <h3>Top Referrers</h3>
            <p>Who is creating recruiting value?</p>
          </div>

          {topReferrers.length === 0 ? (
            <p className="muted-small">No referrals yet.</p>
          ) : (
            <div className="activity-feed">
              {topReferrers.map((row, index) => (
                <div className="activity-item" key={row.name}>
                  <strong>
                    #{index + 1} {row.name}
                  </strong>
                  <p>
                    {row.referrals} referrals • {row.hires} hires • $
                    {row.earned.toLocaleString()} earned
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="card">
        <div className="section-header">
          <h3>Operating System Flow</h3>
          <p>The core loop now connects across modules.</p>
        </div>

        <div className="pipeline">
          <div>Applicant Intake</div>
          <div>Recruiting Pipeline</div>
          <div>Referral Attribution</div>
          <div>Activity Timeline</div>
          <div>Payout Trigger</div>
        </div>
      </section>
    </>
  );
}