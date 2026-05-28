import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../lib/auth";

const navItems = [
  { label: "Dashboard", path: "/" },
  { label: "Recruiting", path: "/recruiting" },
  { label: "Referrals", path: "/referrals" },
  { label: "Sales Simulator", path: "/simulator" },
  { label: "CRM", path: "/crm" },
  { label: "Marketing Missions", path: "/missions" },
  { label: "Leaderboard", path: "/leaderboard" },
  { label: "Admin", path: "/admin" },
];

export default function MainLayout() {
  const { user, signOut } = useAuth();

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
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                isActive ? "nav-item active" : "nav-item"
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {user && (
          <div className="sidebar-footer">
            <p className="muted-small" title={user.email}>
              Signed in as<br />
              <strong>{user.email}</strong>
            </p>
            <button className="mini-btn" onClick={signOut}>
              Sign Out
            </button>
          </div>
        )}
      </aside>

      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}