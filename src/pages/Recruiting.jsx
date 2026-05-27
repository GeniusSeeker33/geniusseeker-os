import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const statuses = ["new", "screened", "interviewing", "offered", "hired", "rejected"];

function formatStatus(status) {
  return status ? status.charAt(0).toUpperCase() + status.slice(1) : "New";
}

export default function Recruiting() {
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  async function fetchCandidates() {
    setLoading(true);
    setLoadError("");

    const { data, error } = await supabase
      .from("candidate_applications")
      .select(
        "id, first_name, last_name, email, phone, position_title, status, created_at, resume_path, source, notes, recruiter"
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Candidate fetch error:", error);
      setLoadError(error.message);
      setCandidates([]);
    } else {
      setCandidates(data || []);
    }

    setLoading(false);
  }

  async function updateStatus(id, status) {
    const { error } = await supabase
      .from("candidate_applications")
      .update({ status })
      .eq("id", id);

    if (error) {
      alert("Status update failed: " + error.message);
      return;
    }

    setCandidates((prev) =>
      prev.map((candidate) =>
        candidate.id === id ? { ...candidate, status } : candidate
      )
    );

    setSelectedCandidate((prev) =>
      prev && prev.id === id ? { ...prev, status } : prev
    );
  }

  useEffect(() => {
    fetchCandidates();
  }, []);

  const interviewingCount = candidates.filter(
    (candidate) => candidate.status === "interviewing"
  ).length;

  return (
    <>
      <header className="topbar">
        <div>
          <p className="eyebrow">Recruiting Pipeline</p>
          <h2>Live Orion applicants flowing from Join-Orion into GeniusSeeker OS.</h2>
        </div>

        <button className="primary-btn" onClick={fetchCandidates}>
          Refresh Applicants
        </button>
      </header>

      <section className="card form-card">
        <div className="section-header">
          <h3>Manual Candidate Import</h3>
          <p>Add candidates from Indeed, LinkedIn, referrals, trade shows, or direct outreach.</p>
        </div>

        <ManualImportForm onImported={fetchCandidates} />
      </section>

      <section className="grid stats-grid">
        <div className="card stat-card">
          <p>Total Applicants</p>
          <h3>{loading ? "..." : candidates.length}</h3>
          <span>From candidate_applications</span>
        </div>

        <div className="card stat-card">
          <p>Interviewing</p>
          <h3>{loading ? "..." : interviewingCount}</h3>
          <span>Needs follow-up</span>
        </div>

        <div className="card stat-card">
          <p>Source</p>
          <h3>Join-Orion</h3>
          <span>Applicant intake funnel + manual imports</span>
        </div>
      </section>

      {loadError && (
        <section className="card error-card">
          <h3>Could not load applicants</h3>
          <p>{loadError}</p>
        </section>
      )}

      <section className="card">
        <div className="section-header">
          <h3>Candidate Applications</h3>
          <p>Click any candidate to open the profile drawer.</p>
        </div>

        {loading ? (
          <p className="muted-small">Loading applicants...</p>
        ) : candidates.length === 0 ? (
          <p className="muted-small">No applicants found yet.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Source</th>
                  <th>Status</th>
                  <th>Resume</th>
                  <th>Recruiter</th>
                  <th>Applied</th>
                  <th>Profile</th>
                </tr>
              </thead>

              <tbody>
                {candidates.map((candidate) => (
                  <tr key={candidate.id} className="clickable-row">
                    <td onClick={() => setSelectedCandidate(candidate)}>
                      <strong>
                        {candidate.first_name} {candidate.last_name}
                      </strong>
                      <br />
                      <span className="muted-small">{candidate.email}</span>
                    </td>

                    <td onClick={() => setSelectedCandidate(candidate)}>{candidate.phone || "-"}</td>
                    <td onClick={() => setSelectedCandidate(candidate)}>{candidate.position_title || "-"}</td>
                    <td onClick={() => setSelectedCandidate(candidate)}>{candidate.source || "Join-Orion"}</td>

                    <td>
                      <select
                        className="table-select"
                        value={candidate.status || "new"}
                        onChange={(event) => updateStatus(candidate.id, event.target.value)}
                      >
                        {statuses.map((status) => (
                          <option value={status} key={status}>
                            {formatStatus(status)}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td onClick={() => setSelectedCandidate(candidate)}>
                      {candidate.resume_path ? (
                        <span className="status-pill">Uploaded</span>
                      ) : (
                        <span className="status-pill payout">Missing</span>
                      )}
                    </td>

                    <td onClick={() => setSelectedCandidate(candidate)}>{candidate.recruiter || "-"}</td>

                    <td onClick={() => setSelectedCandidate(candidate)}>
                      {candidate.created_at
                        ? new Date(candidate.created_at).toLocaleDateString()
                        : "-"}
                    </td>

                    <td>
                      <button
                        className="mini-btn"
                        onClick={() => setSelectedCandidate(candidate)}
                      >
                        View
                      </button>
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
          <h3>Pipeline Stages</h3>
          <p>Live counts by applicant status.</p>
        </div>

        <div className="pipeline">
          {statuses.map((status) => (
            <div key={status}>
              {formatStatus(status)}:{" "}
              {candidates.filter((candidate) => candidate.status === status).length}
            </div>
          ))}
        </div>
      </section>

      {selectedCandidate && (
        <CandidateDrawer
          candidate={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
          onStatusChange={updateStatus}
        />
      )}
    </>
  );
}

function ManualImportForm({ onImported }) {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    position_title: "",
    source: "Indeed",
    recruiter: "",
    notes: "",
  });

  const [loading, setLoading] = useState(false);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);

    const payload = {
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      position_title: form.position_title.trim(),
      source: form.source,
      recruiter: form.recruiter.trim() || null,
      notes: form.notes.trim() || null,
      status: "new",
    };

    const { error } = await supabase.from("candidate_applications").insert([payload]);

    if (error) {
      alert("Import failed: " + error.message);
      setLoading(false);
      return;
    }

    setForm({
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      position_title: "",
      source: "Indeed",
      recruiter: "",
      notes: "",
    });

    setLoading(false);
    onImported?.();
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid stats-grid">
        <label>
          First Name
          <input name="first_name" value={form.first_name} onChange={updateField} required />
        </label>

        <label>
          Last Name
          <input name="last_name" value={form.last_name} onChange={updateField} required />
        </label>

        <label>
          Email
          <input type="email" name="email" value={form.email} onChange={updateField} required />
        </label>
      </div>

      <div className="grid stats-grid">
        <label>
          Phone
          <input name="phone" value={form.phone} onChange={updateField} />
        </label>

        <label>
          Position
          <input
            name="position_title"
            value={form.position_title}
            onChange={updateField}
            placeholder="Sales Executive"
            required
          />
        </label>

        <label>
          Source
          <select name="source" value={form.source} onChange={updateField}>
            <option>Indeed</option>
            <option>LinkedIn</option>
            <option>Referral</option>
            <option>Trade Show</option>
            <option>Join-Orion</option>
            <option>Direct Outreach</option>
          </select>
        </label>
      </div>

      <label>
        Recruiter
        <input
          name="recruiter"
          value={form.recruiter}
          onChange={updateField}
          placeholder="Assigned recruiter"
        />
      </label>

      <label>
        Notes
        <textarea
          name="notes"
          value={form.notes}
          onChange={updateField}
          placeholder="Candidate strengths, conversation notes, fit, etc."
        />
      </label>

      <button className="primary-btn" type="submit" disabled={loading}>
        {loading ? "Importing..." : "Import Candidate"}
      </button>
    </form>
  );
}

function CandidateDrawer({ candidate, onClose, onStatusChange }) {
  return (
    <div className="drawer-overlay">
      <aside className="candidate-drawer">
        <div className="drawer-header">
          <div>
            <p className="eyebrow">Candidate Profile</p>
            <h2>
              {candidate.first_name} {candidate.last_name}
            </h2>
            <p className="muted-small">{candidate.position_title || "No role listed"}</p>
          </div>

          <button className="drawer-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="drawer-grid">
          <div className="drawer-field">
            <span>Email</span>
            <strong>{candidate.email || "-"}</strong>
          </div>

          <div className="drawer-field">
            <span>Phone</span>
            <strong>{candidate.phone || "-"}</strong>
          </div>

          <div className="drawer-field">
            <span>Source</span>
            <strong>{candidate.source || "Join-Orion"}</strong>
          </div>

          <div className="drawer-field">
            <span>Recruiter</span>
            <strong>{candidate.recruiter || "Unassigned"}</strong>
          </div>

          <div className="drawer-field">
            <span>Resume</span>
            <strong>{candidate.resume_path ? "Uploaded" : "Missing"}</strong>
          </div>

          <div className="drawer-field">
            <span>Applied</span>
            <strong>
              {candidate.created_at
                ? new Date(candidate.created_at).toLocaleString()
                : "-"}
            </strong>
          </div>
        </div>

        <label className="drawer-status">
          Pipeline Status
          <select
            value={candidate.status || "new"}
            onChange={(event) => onStatusChange(candidate.id, event.target.value)}
          >
            {statuses.map((status) => (
              <option key={status} value={status}>
                {formatStatus(status)}
              </option>
            ))}
          </select>
        </label>

        <div className="drawer-notes">
          <h3>Recruiter Notes</h3>
          <p>{candidate.notes || "No notes yet."}</p>
        </div>

        <div className="drawer-actions">
          <button className="mini-btn">Log Call</button>
          <button className="mini-btn">Schedule Interview</button>
          <button className="primary-btn">Advance Candidate</button>
        </div>
      </aside>
    </div>
  );
}