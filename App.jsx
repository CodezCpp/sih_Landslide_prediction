import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";

import Dashboard from "./pages/Dashboard.jsx";
import RiskMap from "./pages/RiskMap.jsx";
import EarlyWarning from "./pages/EarlyWarning.jsx";
import HighRisk from "./pages/HighRisk.jsx";
import RiskPrediction from "./pages/RiskPrediction.jsx";
import FieldReport from "./pages/FieldReport.jsx";

import BottomNav from "./components/BottomNav.jsx";

function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <main className="pb-20">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/map" element={<RiskMap />} />
            <Route path="/early-warning" element={<EarlyWarning />} />
            <Route path="/high-risk" element={<HighRisk />} />
            <Route path="/predict" element={<RiskPrediction />} />
            <Route path="/field-report" element={<FieldReport />} />
          </Routes>
        </main>

        <BottomNav />
      </div>
    </BrowserRouter>
  );
}

export default App;