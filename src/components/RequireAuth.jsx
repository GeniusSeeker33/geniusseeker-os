import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../lib/auth";

export default function RequireAuth() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="public-shell">
        <div className="public-card">
          <p className="muted-small">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
