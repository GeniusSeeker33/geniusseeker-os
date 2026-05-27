import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const allNavItems = [
  { label: "Dashboard", path: "/", roles: ["admin", "recruiter", "referrer"] },
  { label: "Recruiting", path: "/recruiting", roles: ["admin", "recruiter"] },
  { label: "Referrals", path: "/referrals", roles: ["admin", "recruiter", "referrer"] },
  { label: "Sales Simulator", path: "/simulator", roles: ["admin", "recruiter"] },
  { label: "CRM", path: "/crm", roles: ["admin", "recruiter"] },
  { label: "Marketing Missions", path: "/missions", roles: ["admin", "recruiter", "referrer"] },
  { label: "Leaderboard", path: "/leaderboard", roles: ["admin", "recruiter", "referrer"] },
  { label: "Admin", path: "/admin", roles: ["admin"] },
];

export default function MainLayout() {
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();

  const visibleNavItems = allNavItems.filter((item) => {
    if (!role) return item.roles.includes("referrer");
    return item.roles.includes(role);
  });

  async function handleSignOut() {
    await signOut();
    navigate("/login", { replace: true });
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="logo">GS</div>

          <div>
            <h1>GeniusSeeker OS</h1>
            <p>Workforce Growth Engine</p>
          </div>
        </div>

        <nav>
          {visibleNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                isActive ? "nav-item active" : "nav-item"
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-user">
          <div className="sidebar-user-meta">
            <strong>{user?.email}</strong>
            <span className={`role-badge role-${role || "none"}`}>
              {role || "no role"}
            </span>
          </div>
          <button type="button" className="mini-btn" onClick={handleSignOut}>
            Sign out
          </button>
        </div>
      </aside>

      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
