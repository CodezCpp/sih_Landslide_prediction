import { useState, useEffect } from "react";
import {
  Brain,
  CloudRain,
  Mountain,
  Activity,
  Route,
  Waves,
  AlertTriangle,
  RotateCcw,
  Loader2,
  Globe,
  ChevronDown,
} from "lucide-react";

// REGIONAL CONSTANTS & UNIQUE MIZORAM GEOLOGICAL BASELINES (ISRO/NRSC & GSI)
const regionCoordinates = {
  Aizawl: { 
    lat: 23.7271, lng: 92.7176, slope: 38.0, lithology: 0.78, 
    hillCutting: 0.85, historicalFailures: 8, surfaceCrack: 6.5 
  },
  Lunglei: { 
    lat: 22.8833, lng: 92.7333, slope: 42.0, lithology: 0.75, 
    hillCutting: 0.70, historicalFailures: 6, surfaceCrack: 4.0 
  },
  Champhai: { 
    lat: 23.4750, lng: 93.3250, slope: 28.0, lithology: 0.68, 
    hillCutting: 0.40, historicalFailures: 3, surfaceCrack: 1.5 
  },
  Kolasib: { 
    lat: 24.2266, lng: 92.6750, slope: 31.0, lithology: 0.70, 
    hillCutting: 0.50, historicalFailures: 4, surfaceCrack: 2.0 
  }
};

// EXACT 10 FACTORS INCORPORATING MIZORAM REGIONAL CONSTANTS & LIVE TELEMETRY
const initialFactors = {
  Rainfall_72h_mm: 180.0,
  Rainfall_mm: 45.0,
  Soil_Saturation: 0.65,
  Slope_Angle: 38.0,
  Hill_Cutting_Severity: 0.60,         
  Lithology_Weakness: 0.78,            
  Historical_Failure_Count: 5,         
  Surface_Crack_Width_cm: 4.0,          
  Distance_to_Road_m: 120.0,           
  Earthquake_Activity: 0.0,            
};

const factorConfig = [
  { key: "Rainfall_72h_mm", label: "Rainfall (72h)", unit: "mm", min: 0, max: 450, step: 1, icon: CloudRain },
  { key: "Rainfall_mm", label: "Current Rainfall", unit: "mm", min: 0, max: 250, step: 1, icon: CloudRain },
  { key: "Soil_Saturation", label: "Soil Saturation", unit: "ratio", min: 0, max: 1, step: 0.01, icon: Waves },
  { key: "Slope_Angle", label: "Slope Angle", unit: "°", min: 0, max: 90, step: 0.1, icon: Mountain },
  { key: "Hill_Cutting_Severity", label: "Hill Cutting Severity", unit: "ratio", min: 0, max: 1, step: 0.01, icon: Mountain },
  { key: "Lithology_Weakness", label: "Lithology Weakness", unit: "ratio", min: 0, max: 1, step: 0.01, icon: Activity },
  { key: "Historical_Failure_Count", label: "Historical Failures", unit: "events", min: 0, max: 15, step: 1, icon: AlertTriangle }, 
  { key: "Surface_Crack_Width_cm", label: "Surface Crack Width", unit: "cm", min: 0, max: 15, step: 0.1, icon: Activity }, 
  { key: "Distance_to_Road_m", label: "Distance to Road", unit: "m", min: 0, max: 500, step: 1, icon: Route }, 
  { key: "Earthquake_Activity", label: "Earthquake Activity", unit: "mag", min: 0, max: 8.0, step: 0.1, icon: Activity }, 
];

function getRiskClass(score) {
  if (score >= 65) return "text-red-400";       // High Risk
  if (score >= 35) return "text-orange-400";    // Medium Risk
  return "text-green-400";                      // Safe
}
function RiskPrediction() {
  const [activeRegion, setActiveRegion] = useState("Aizawl");
  const [values, setValues] = useState(initialFactors);
  const [predicted, setPredicted] = useState(false);
  
  const [risk, setRisk] = useState(0);
  const [level, setLevel] = useState("AWAITING DATA");
  const [loading, setLoading] = useState(false);
  const [loadingAPIs, setLoadingAPIs] = useState(false);

  // Sync with Dashboard selected region on mount and load district baselines
  useEffect(() => {
    const savedRegion = localStorage.getItem("activeCommandRegion");
    if (savedRegion) {
      const parsed = JSON.parse(savedRegion);
      setActiveRegion(parsed.region);
      if (regionCoordinates[parsed.region]) {
        const reg = regionCoordinates[parsed.region];
        setValues(prev => ({
          ...prev,
          Lithology_Weakness: reg.lithology,
          Slope_Angle: reg.slope,
          Hill_Cutting_Severity: reg.hillCutting,
          Historical_Failure_Count: reg.historicalFailures,
          Surface_Crack_Width_cm: reg.surfaceCrack
        }));
      }
    }
  }, []);

  const updateValue = (key, value) => {
    setValues((current) => ({
      ...current,
      [key]: Number(value),
    }));
    setPredicted(false);
  };

  const reset = () => {
    setValues(initialFactors);
    setPredicted(false);
    setRisk(0);
    setLevel("AWAITING DATA");
  };

  // --- FETCH LIVE APIS & ADVANCED FIELD CAPACITY SOIL SATURATION MODEL ---
  const fetchLiveAPIDataForRegion = async (regionName) => {
    setActiveRegion(regionName);
    setLoadingAPIs(true);
    try {
      const { lat, lng, slope, lithology, hillCutting, historicalFailures, surfaceCrack } = regionCoordinates[regionName];

      // 1. Open-Meteo Weather & Deep Soil (27-81cm)
      const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=precipitation,soil_moisture_27_to_81cm&daily=precipitation_sum&timezone=auto&past_days=3&forecast_days=1`);
      const weatherData = await weatherRes.json();
      
      const currentRain = weatherData.current?.precipitation || 0.0;
      const rainData = weatherData.daily?.precipitation_sum || [];
      const rain72h = (rainData[0] || 0) + (rainData[1] || 0) + (rainData[2] || 0);

      // 2. Advanced Geotechnical Field Capacity Model for Mizoram's Surma Group
      const rawVwc = weatherData.current?.soil_moisture_27_to_81cm || 0.29;
      const THETA_FC = 0.26; // Field Capacity (safe bound water)
      const THETA_S = 0.45;  // Porosity (liquefaction point)
      
      let calculatedSaturation = 0.0;
      if (rawVwc > THETA_FC) {
          calculatedSaturation = (rawVwc - THETA_FC) / (THETA_S - THETA_FC);
      }
      calculatedSaturation = Math.max(0.0, Math.min(calculatedSaturation, 1.0));

      // 3. Open Topo Data SRTM 30m Slope Calculation
      const offsetLon = lng + 0.00027; 
      let calculatedSlope = slope;
      try {
        const topoRes = await fetch(`https://api.opentopodata.org/v1/srtm30m?locations=${lat},${lng}|${lat},${offsetLon}`);
        const topoData = await topoRes.json();
        if (topoData.results && topoData.results.length >= 2) {
          const targetElevation = topoData.results[0].elevation;
          const offsetElevation = topoData.results[1].elevation;
          const rise = Math.abs(targetElevation - offsetElevation);
          calculatedSlope = Math.atan(rise / 30.0) * (180 / Math.PI);
        }
      } catch (topoErr) {
        console.error("Topo API error:", topoErr);
      }

      // 4. Live OSRM Road Distance Calculation
      let roadDistance = 120.0;
      try {
        const osrmRes = await fetch(`https://router.project-osrm.org/nearest/v1/driving/${lng},${lat}`);
        const osrmData = await osrmRes.json();
        if (osrmData.code === "Ok" && osrmData.waypoints && osrmData.waypoints.length > 0) {
          roadDistance = osrmData.waypoints[0].distance;
        }
      } catch (osrmErr) {
        console.error("OSRM API error:", osrmErr);
      }

      // 5. Live USGS Earthquake Activity (250km radius, 30 days back, min magnitude 1.0)
      let maxMag = 0.0;
      try {
        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const usgsRes = await fetch(`https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&latitude=${lat}&longitude=${lng}&maxradiuskm=250&starttime=${startDate}&endtime=${endDate}&minmagnitude=1.0`);
        const usgsData = await usgsRes.json();
        const features = usgsData.features || [];
        if (features.length > 0) {
          maxMag = Math.max(...features.map(f => f.properties.mag));
        }
      } catch (usgsErr) {
        console.error("USGS API error:", usgsErr);
      }

      // Update Sliders with Real API Data and Unique Regional Baselines
      setValues((prev) => ({
        ...prev,
        Rainfall_mm: Number(currentRain.toFixed(1)),
        Rainfall_72h_mm: Number(rain72h.toFixed(1)),
        Soil_Saturation: Number(calculatedSaturation.toFixed(2)),
        Slope_Angle: Number(calculatedSlope.toFixed(1)),
        Distance_to_Road_m: Number(roadDistance.toFixed(1)),
        Earthquake_Activity: Number(maxMag.toFixed(1)),
        Lithology_Weakness: lithology,
        Hill_Cutting_Severity: hillCutting,
        Historical_Failure_Count: historicalFailures,
        Surface_Crack_Width_cm: surfaceCrack
      }));

    } catch (error) {
      console.error("API Fetch Error:", error);
      alert("Failed to fetch live API data for " + regionName);
    } finally {
      setLoadingAPIs(false);
    }
  };
  // --- SEND 10-FACTOR PAYLOAD TO LOCAL ML BACKEND VIA NGROK ---
  const generatePrediction = async () => {
    setLoading(true);
    setPredicted(false);
    
    try {
      const { lat, lng } = regionCoordinates[activeRegion];
      const payload = {
        latitude: lat,
        longitude: lng,
        Rainfall_mm: values.Rainfall_mm,
        Slope_Angle: values.Slope_Angle,
        Soil_Saturation: values.Soil_Saturation,
        Earthquake_Activity: values.Earthquake_Activity,
        Rainfall_72h_mm: values.Rainfall_72h_mm,
        Lithology_Weakness: values.Lithology_Weakness,
        Hill_Cutting_Severity: values.Hill_Cutting_Severity,
        Historical_Failure_Count: values.Historical_Failure_Count,
        Surface_Crack_Width_cm: values.Surface_Crack_Width_cm,
        Distance_to_Road_m: values.Distance_to_Road_m
      };

      const response = await fetch("https://shortage-recolor-radar.ngrok-free.dev/predict", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true" 
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        const numericRisk = typeof data.risk_score === 'string' ? parseFloat(data.risk_score.replace("%", "")) : (data.probability_percentage || 0);
        const statusLevel = data.alert_level || data.status || "CRITICAL";

        setRisk(numericRisk);
        setLevel(statusLevel);
        setPredicted(true);
        
        if (data.calculated_road_distance_m !== undefined) {
          setValues(prev => ({ ...prev, Distance_to_Road_m: data.calculated_road_distance_m }));
        }

        // Save globally AND region-specifically so Dashboard syncs up instantly
        const riskPayload = { risk: numericRisk, level: statusLevel };
        localStorage.setItem("latestRisk", JSON.stringify(riskPayload));
        localStorage.setItem(`risk_${activeRegion}`, JSON.stringify(riskPayload));
        localStorage.setItem("activeCommandRegion", JSON.stringify({
          region: activeRegion,
          risk: numericRisk,
          level: statusLevel,
          rain72h: values.Rainfall_72h_mm,
          soilSat: Math.round(values.Soil_Saturation * 100),
          slope: values.Slope_Angle
        }));
        
      } else {
        alert("API Validation Error:\n" + JSON.stringify(data));
      }
    } catch (error) {
      console.error("Network Error:", error);
      alert("Failed to connect to backend. Is Uvicorn and Ngrok running?");
    } finally {
      setLoading(false);
    }
  };

  const liveFields = ["Rainfall_mm", "Rainfall_72h_mm", "Soil_Saturation", "Slope_Angle", "Earthquake_Activity", "Distance_to_Road_m", "Lithology_Weakness", "Hill_Cutting_Severity", "Historical_Failure_Count", "Surface_Crack_Width_cm"];

  return (
    <div className="min-h-screen bg-slate-950 px-4 pb-24 pt-6 text-white sm:px-6">
      <div className="mx-auto max-w-5xl">

        {/* HEADER & REGION SELECTOR */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-cyan-400">AI / ML • LIVE ENGINE</p>
            <h1 className="mt-1 text-2xl font-black sm:text-3xl">Risk Prediction Engine</h1>
            <p className="mt-1 text-sm text-slate-400">Inference engine linked to Random Forest & Live APIs (10 Parameters).</p>
          </div>

          <div className="relative">
            <select
              value={activeRegion}
              onChange={(e) => fetchLiveAPIDataForRegion(e.target.value)}
              className="appearance-none rounded-2xl border border-cyan-400/30 bg-cyan-950/20 px-4 py-3 pr-10 text-sm font-bold text-cyan-300 outline-none cursor-pointer"
            >
              <option value="Aizawl">Aizawl Region</option>
              <option value="Lunglei">Lunglei Region</option>
              <option value="Champhai">Champhai Region</option>
              <option value="Kolasib">Kolasib Region</option>
            </select>
            <ChevronDown className="absolute right-3 top-3.5 text-cyan-400 pointer-events-none" size={18} />
          </div>
        </div>

        {/* RESULT BANNER */}
        <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                Predicted Landslide Risk for <span className="text-cyan-400 font-bold">{activeRegion}</span>
              </p>
              <div className="mt-2 flex items-end gap-3">
                <span className={`text-5xl font-black ${getRiskClass(risk)}`}>{risk}%</span>
                <span className={`mb-2 rounded-full bg-slate-800 px-3 py-1 text-xs font-bold ${getRiskClass(risk)}`}>
                  {level}
                </span>
              </div>
            </div>
            <div className="flex h-32 w-32 items-center justify-center rounded-full border-8 border-slate-800 sm:h-36 sm:w-36">
              <div className="text-center">
                <Brain className="mx-auto text-cyan-400" size={25} />
                <p className="mt-1 text-[10px] text-slate-500">AI SCORE</p>
              </div>
            </div>
          </div>
          <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-800">
            

  <div
    className={`h-full rounded-full transition-all duration-1000 ${
      risk >= 65
        ? "bg-red-500"
        : risk >= 35
        ? "bg-orange-500"
        : "bg-green-500"
    }`}
    style={{ width: `${risk}%` }}
  />
</div>
        </div>

        {/* CONTROLS */}
        <div className="mb-6">
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold">Risk Factors ({activeRegion})</h2>
              <p className="text-xs text-slate-500">10 Monitored Parameters (District Baselines & Live APIs Linked)</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchLiveAPIDataForRegion(activeRegion)}
                disabled={loadingAPIs}
                className="flex items-center gap-1.5 rounded-xl bg-blue-500/20 border border-blue-500/50 px-3 py-2 text-xs font-semibold text-blue-400 hover:bg-blue-500/30 transition disabled:opacity-50"
              >
                {loadingAPIs ? <Loader2 size={14} className="animate-spin" /> : <Globe size={14} />}
                Fetch Live APIs for {activeRegion}
              </button>
              <button
                onClick={reset}
                className="flex items-center gap-1.5 rounded-xl border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 hover:border-cyan-400/30"
              >
                <RotateCcw size={14} /> Reset
              </button>
            </div>
          </div>

          {/* SLIDERS GRID (10 FACTORS) */}
          <div className="grid gap-3 sm:grid-cols-2">
            {factorConfig.map((factor) => {
              const Icon = factor.icon;
              const value = values[factor.key];
              const isLiveData = liveFields.includes(factor.key);

              return (
                <div key={factor.key} className={`rounded-2xl border ${isLiveData ? 'border-blue-500/30 bg-blue-900/10' : 'border-slate-800 bg-slate-900/70'} p-4 transition-colors`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-slate-800 p-2">
                        <Icon size={18} className={isLiveData ? "text-blue-400" : "text-cyan-400"} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{factor.label}</p>
                        <p className="text-[10px] text-slate-500">{isLiveData ? "Field-Capacity API Linked" : "District Baseline"}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-black">{value}</span>
                      <span className="ml-1 text-xs text-slate-500">{factor.unit}</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min={factor.min}
                    max={factor.max}
                    step={factor.step}
                    value={value}
                    onChange={(event) => updateValue(factor.key, event.target.value)}
                    className={`mt-4 w-full ${isLiveData ? 'accent-blue-400' : 'accent-cyan-400'}`}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* ACTION BUTTON */}
        <button
          onClick={generatePrediction}
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-5 py-4 text-sm font-black text-slate-950 transition hover:bg-cyan-300 disabled:opacity-50"
        >
          {loading ? <Loader2 size={19} className="animate-spin" /> : <Brain size={19} />}
          {loading ? "Running Random Forest Inference..." : `Generate Risk Prediction for ${activeRegion}`}
        </button>

      </div>
    </div>
  );
}

export default RiskPrediction;