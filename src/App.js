import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import SteelPlantDashboard from "./pages/SteelPlantDashboard";
import MotorDetail from "./pages/MotorDetail";

/* ===== CGL ===== */
import CGLDashboard from "./pages/CGLDashboard";
import CGLBridleSelect from "./pages/CGLBridleSelect";
import CGLMotors from "./pages/CGLMotors";
import CGLAreaMotors from "./pages/CGLAreaMotors";

/* ===== CRM ===== */
import CRMDashboard from "./pages/CRMDashboard";
import CRMMotorPage from "./pages/CRMMotorPage";
import CRMTrimmerPage from "./pages/CRMTrimmerPage";

/* ===== CCL ===== */
import CCLDashboard from "./pages/CCLDashboard";
import CCLBridleSelect from "./pages/CCLBridleSelect";
import CCLMotors from "./pages/CCLMotors";
import CCLAreaMotors from "./pages/CCLAreaMotors";

/* ===== PICKLING ===== */
import PicklingDashboard from "./pages/PicklingDashboard";
import PicklingAreaMotors from "./pages/PicklingAreaMotors";

/* ===== CRANE ===== */
import CraneDashboard from "./pages/CraneDashboard";
import CranePlantList from "./pages/CranePlantList";
import CraneDetail from "./pages/CraneDetail";

/* ===== SAFETY ===== */
import SafetyDashboard from "./pages/SafetyDashboard";
import LeadingIndicator from "./pages/LeadingIndicator";
import LaggingIndicator from "./pages/LaggingIndicator";
import Training from "./pages/Training";
import NearMiss from "./pages/NearMiss";
import SafetyWalk from "./pages/SafetyWalk";
import UnsafeClosed from "./pages/UnsafeClosed";
import FAC from "./pages/FAC";
import MTI from "./pages/MTI";
import LTI from "./pages/LTI";
import UnsafeRaised from "./pages/UnsafeRaised";

/* ===== AC ===== */
import ACList from "./pages/ACList";
import ACDetail from "./pages/ACDetail";

function App() {
  return (
    <Router>
      <Routes>

        {/* ===== MAIN DASHBOARD ===== */}
        <Route path="/" element={<SteelPlantDashboard />} />

        {/* ===== CGL ===== */}
        <Route path="/cgl" element={<CGLDashboard />} />
        <Route path="/cgl/bridles" element={<CGLBridleSelect />} />
        <Route path="/cgl/bridle/:bridleNo" element={<CGLMotors />} />
        <Route path="/cgl/area/:area" element={<CGLAreaMotors />} />

        {/* ===== CRM ===== */}
        <Route path="/crm" element={<CRMDashboard />} />
        <Route path="/crm/motor" element={<CRMMotorPage />} />
        <Route path="/crm/trimmer/:area" element={<CRMTrimmerPage />} />

        {/* ===== CCL ===== */}
        <Route path="/ccl" element={<CCLDashboard />} />
        <Route path="/ccl/bridles" element={<CCLBridleSelect />} />
        <Route path="/ccl/bridle/:bridleNo" element={<CCLMotors />} />
        <Route path="/ccl/area/:area" element={<CCLAreaMotors />} />

        {/* ===== PICKLING ===== */}
        <Route path="/pickling" element={<PicklingDashboard />} />
        <Route path="/pickling/area/:area" element={<PicklingAreaMotors />} />

        {/* ===== CRANE ===== */}
        <Route path="/crane" element={<CraneDashboard />} />
        <Route path="/crane/plant/:plant" element={<CranePlantList />} />
        <Route path="/crane/detail/:id" element={<CraneDetail />} />

        {/* ===== AC ===== */}
        <Route path="/cgl/acs" element={<ACList plant="CGL" />} />
        <Route path="/crm/acs" element={<ACList plant="CRM" />} />
        <Route path="/ccl/acs" element={<ACList plant="CCL" />} />
        <Route path="/pickling/acs" element={<ACList plant="Pickling" />} />
        <Route path="/ac-detail/:id" element={<ACDetail />} />

        {/* ===== SAFETY ===== */}
        <Route path="/safety" element={<SafetyDashboard />} />
        <Route path="/safety/leading" element={<LeadingIndicator />} />
        <Route path="/safety/lagging" element={<LaggingIndicator />} />

        <Route path="/safety/leading/training" element={<Training />} />
        <Route path="/safety/leading/nearmiss" element={<NearMiss />} />
        <Route path="/safety/leading/safetywalk" element={<SafetyWalk />} />
        <Route path="/safety/leading/unsafeclosed" element={<UnsafeClosed />} />

        <Route path="/safety/lagging/fac" element={<FAC />} />
        <Route path="/safety/lagging/mti" element={<MTI />} />
        <Route path="/safety/lagging/lti" element={<LTI />} />
        <Route path="/safety/lagging/unsaferaised" element={<UnsafeRaised />} />

        {/* ===== MOTOR DETAIL ===== */}
        <Route path="/motor/:id" element={<MotorDetail />} />

      </Routes>
    </Router>
  );
}

export default App;