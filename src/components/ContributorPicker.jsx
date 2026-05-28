import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../lib/supabase";

export default function ContributorPicker({ value, onChange }) {
  const [contributors, setContributors] = useState([]);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newContributor, setNewContributor] = useState({ name: "", email: "", phone: "" });
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState("");
  const containerRef = useRef(null);

  useEffect(() => {
    fetchContributors();
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function fetchContributors() {
    const { data, error } = await supabase
      .from("contributors")
      .select("id, name, email")
      .order("name", { ascending: true });

    if (error) {
      setLoadError(error.message);
      setContributors([]);
      return;
    }

    setContributors(data || []);
  }

  const filtered = useMemo(() => {
    if (!query.trim()) return contributors;
    const q = query.trim().toLowerCase();
    return contributors.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.email && c.email.toLowerCase().includes(q))
    );
  }, [query, contributors]);

  function selectContributor(contributor) {
    onChange(contributor);
    setQuery("");
    setOpen(false);
    setCreating(false);
  }

  function clearSelection() {
    onChange(null);
  }

  function startCreate() {
    setNewContributor({ name: query.trim(), email: "", phone: "" });
    setCreating(true);
  }

  async function saveNewContributor() {
    const name = newContributor.name.trim();
    if (!name) {
      alert("Recruiter name is required");
      return;
    }

    setSaving(true);

    const payload = {
      name,
      email: newContributor.email.trim() || null,
      phone: newContributor.phone.trim() || null,
    };

    const { data, error } = await supabase
      .from("contributors")
      .insert([payload])
      .select("id, name, email")
      .single();

    setSaving(false);

    if (error) {
      alert("Could not save recruiter: " + error.message);
      return;
    }

    setContributors((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
    selectContributor(data);
  }

  if (value) {
    return (
      <div className="contributor-picker">
        <div className="contributor-selected">
          <strong>{value.name}</strong>
          {value.email && <span className="muted-small"> · {value.email}</span>}
          <button type="button" className="mini-btn" onClick={clearSelection} style={{ marginLeft: "10px" }}>
            Change
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="contributor-picker" ref={containerRef}>
      <input
        type="text"
        placeholder="Search by name or email..."
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
          setCreating(false);
        }}
        onFocus={() => setOpen(true)}
      />

      {open && !creating && (
        <div className="contributor-dropdown">
          {loadError && (
            <p className="muted-small" style={{ padding: "10px" }}>
              Could not load recruiters: {loadError}
            </p>
          )}

          {filtered.length > 0 ? (
            filtered.map((contributor) => (
              <button
                type="button"
                key={contributor.id}
                className="contributor-option"
                onClick={() => selectContributor(contributor)}
              >
                <strong>{contributor.name}</strong>
                {contributor.email && <span className="muted-small"> · {contributor.email}</span>}
              </button>
            ))
          ) : (
            <p className="muted-small" style={{ padding: "10px" }}>
              {contributors.length === 0
                ? "No recruiters yet."
                : "No matches."}
            </p>
          )}

          <button
            type="button"
            className="contributor-option contributor-add"
            onClick={startCreate}
          >
            + Add new recruiter{query.trim() ? ` "${query.trim()}"` : ""}
          </button>
        </div>
      )}

      {creating && (
        <div className="contributor-create">
          <label>
            Name
            <input
              value={newContributor.name}
              onChange={(event) =>
                setNewContributor((prev) => ({ ...prev, name: event.target.value }))
              }
              required
            />
          </label>

          <label>
            Email
            <input
              type="email"
              value={newContributor.email}
              onChange={(event) =>
                setNewContributor((prev) => ({ ...prev, email: event.target.value }))
              }
              placeholder="Optional"
            />
          </label>

          <label>
            Phone
            <input
              value={newContributor.phone}
              onChange={(event) =>
                setNewContributor((prev) => ({ ...prev, phone: event.target.value }))
              }
              placeholder="Optional"
            />
          </label>

          <div className="contributor-create-actions">
            <button
              type="button"
              className="mini-btn"
              onClick={() => setCreating(false)}
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="button"
              className="primary-btn"
              onClick={saveNewContributor}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Recruiter"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
