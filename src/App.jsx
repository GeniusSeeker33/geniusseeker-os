import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import MainLayout from "./layout/MainLayout";

import Dashboard from "./pages/Dashboard";
import Recruiting from "./pages/Recruiting";
import Referrals from "./pages/Referrals";
import Simulator from "./pages/Simulator";
import CRM from "./pages/CRM";
import Missions from "./pages/Missions";
import Leaderboard from "./pages/Leaderboard";
import Admin from "./pages/Admin";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
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
      </Routes>
    </BrowserRouter>
  );
}
