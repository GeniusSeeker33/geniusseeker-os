import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import { AuthProvider } from "./lib/auth";
import RequireAuth from "./components/RequireAuth";
import MainLayout from "./layout/MainLayout";

import Dashboard from "./pages/Dashboard";
import Recruiting from "./pages/Recruiting";
import Referrals from "./pages/Referrals";
import Simulator from "./pages/Simulator";
import CRM from "./pages/CRM";
import Missions from "./pages/Missions";
import Leaderboard from "./pages/Leaderboard";
import Admin from "./pages/Admin";
import ContributorSignup from "./pages/ContributorSignup";
import ReferralLanding from "./pages/ReferralLanding";
import Login from "./pages/Login";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/join" element={<ContributorSignup />} />
          <Route path="/r/:contributorId" element={<ReferralLanding />} />

          <Route element={<RequireAuth />}>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/recruiting" element={<Recruiting />} />
              <Route path="/referrals" element={<Referrals />} />
              <Route path="/simulator" element={<Simulator />} />
              <Route path="/crm" element={<CRM />} />
              <Route path="/missions" element={<Missions />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/admin" element={<Admin />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
