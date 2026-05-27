import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import MainLayout from "./layout/MainLayout";

import Dashboard from "./pages/Dashboard";
import Recruiting from "./pages/Recruiting";
import Referrals from "./pages/Referrals";
import Simulator from "./pages/Simulator";
import CRM from "./pages/CRM";
import Missions from "./pages/Missions";
import Leaderboard from "./pages/Leaderboard";
import Admin from "./pages/Admin";
import Login from "./pages/Login";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Dashboard />} />
            <Route path="/recruiting" element={<Recruiting />} />
            <Route path="/referrals" element={<Referrals />} />
            <Route path="/simulator" element={<Simulator />} />
            <Route path="/crm" element={<CRM />} />
            <Route path="/missions" element={<Missions />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <Admin />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
