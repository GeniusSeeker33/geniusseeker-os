import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

function formatPayoutStatus(status) {
  if (!status) return "Not Earned";
  return status.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function Referrals() {
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  async function fetchReferrals() {
    setLoading(true);
    setLoadError("");

    const { data, error } = await supabase
      .from("candidate_applications")
      .select(
        "id, first_name, last_name, email, phone, position_title, status, created_at, source, recruiter, referred_by, referred_by_id, referral_payout_amount, referral_payout_status, contributor:contributors!referred_by_id(id, name, email)"
      )
      .or("referred_by_id.not.is.null,referred_by.not.is.null")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Referral fetch error:", error);
      setLoadError(error.message);
      setReferrals([]);
    } else {
      setReferrals(data || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    fetchReferrals();
  }, []);

  const outstanding = referrals.filter(
    (item) =>
      item.referral_payout_status === "earned" ||
      item.referral_payout_status === "requested"
  );
  const paid = referrals.filter(
    (item) => item.referral_payout_status === "paid"
  );

  const outstandingTotal = outstanding.reduce(
    (sum, item) => sum + Number(item.referral_payout_amount || 0),
    0
  );

  const paidTotal = paid.reduce(
    (sum, item) => sum + Number(item.referral_payout_amount || 0),
    0
  );

  return (
    <>
      <header className="topbar">
        <div>
          <p className="eyebrow">Referral Wallet</p>
          <h2>Track referrals, candidate status, and payout eligibility.</h2>
        </div>

        <button className="primary-btn" onClick={fetchReferrals}>
          Refresh Referrals
        </button>
      </header>

      <section className="grid stats-grid">
        <div className="card stat-card">
          <p>Total Referrals</p>
          <h3>{loading ? "..." : referrals.length}</h3>
          <span>Candidates with a referred-by value</span>
        </div>

        <div className="card stat-card">
          <p>Outstanding Payouts</p>
          <h3>${outstandingTotal.toLocaleString()}</h3>
          <span>Owed but not yet paid (earned + requested)</span>
        </div>

        <div className="card stat-card">
          <p>Paid Out</p>
          <h3>${paidTotal.toLocaleString()}</h3>
          <span>Settled payouts to recruiters</span>
        </div>
      </section>

      {loadError && (
        <section className="card error-card">
          <h3>Could not load referrals</h3>
          <p>{loadError}</p>
        </section>
      )}

      <section className="card">
        <div className="section-header">
          <h3>Referral Payout Table</h3>
          <p>Candidate referrals are pulled from the live recruiting pipeline.</p>
        </div>

        {loading ? (
          <p className="muted-small">Loading referrals...</p>
        ) : referrals.length === 0 ? (
          <p className="muted-small">
            No referrals found yet. Add a candidate in Recruiting with “Referred By” filled in.
          </p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Referred By</th>
                  <th>Candidate</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Candidate Status</th>
                  <th>Payout Amount</th>
                  <th>Payout Status</th>
                  <th>Recruiter</th>
                  <th>Created</th>
                </tr>
              </thead>

              <tbody>
                {referrals.map((item) => (
                  <tr key={item.id}>
                    <td>{item.contributor?.name || item.referred_by || "-"}</td>

                    <td>
                      <strong>
                        {item.first_name} {item.last_name}
                      </strong>
                    </td>

                    <td>{item.email || "-"}</td>
                    <td>{item.position_title || "-"}</td>
                    <td>
                      <span className="status-pill">
                        {item.status || "new"}
                      </span>
                    </td>

                    <td>${Number(item.referral_payout_amount || 0).toLocaleString()}</td>

                    <td>
                      <span
                        className={
                          item.referral_payout_status === "paid"
                            ? "status-pill"
                            : "status-pill payout"
                        }
                      >
                        {formatPayoutStatus(item.referral_payout_status)}
                      </span>
                    </td>

                    <td>{item.recruiter || "-"}</td>

                    <td>
                      {item.created_at
                        ? new Date(item.created_at).toLocaleDateString()
                        : "-"}
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
          <h3>Referral Logic</h3>
          <p>This is the first working version of the GeniusSeeker contribution economy.</p>
        </div>

        <div className="pipeline">
          <div>Referral Added</div>
          <div>Candidate Screened</div>
          <div>Interviewing</div>
          <div>Hired</div>
          <div>Payout Earned</div>
        </div>
      </section>
    </>
  );
}