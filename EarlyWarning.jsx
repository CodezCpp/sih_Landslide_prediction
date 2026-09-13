import { useState, useEffect } from "react";
import {
  AlertTriangle,
  BellRing,
  CheckCircle2,
  CloudRain,
  MessageSquare,
  Radio,
  ShieldAlert,
  Users,
  Send,
  MapPin,
  Loader2,
  ChevronDown
} from "lucide-react";

const recipients = [
  "District Administration",
  "Disaster Management Authority",
  "Local Communities",
];

const channels = ["SMS", "In-App", "Web Alert"];

const regionCoordinates = {
  Aizawl: { lat: 23.7271, lng: 92.7176, slope: "38°", lithology: 0.78, hillCutting: 0.85, historicalFailures: 8, surfaceCrack: 6.5 },
  Lunglei: { lat: 22.8833, lng: 92.7333, slope: "42°", lithology: 0.75, hillCutting: 0.70, historicalFailures: 6, surfaceCrack: 4.0 },
  Champhai: { lat: 23.4750, lng: 93.3250, slope: "28°", lithology: 0.68, hillCutting: 0.40, historicalFailures: 3, surfaceCrack: 1.5 },
  Kolasib: { lat: 24.2266, lng: 92.6750, slope: "31°", lithology: 0.70, hillCutting: 0.50, historicalFailures: 4, surfaceCrack: 2.0 }
};

// DYNAMIC THRESHOLD STYLING (Strictly Matched to ML: >=75 Critical, >=40 Warning, <40 Safe)
function getBannerStyles(score) {
  if (score >= 75) return { border: "border-red-500/30", bgBox: "bg-red-500/10", text: "text-red-400", bgBadge: "bg-red-500/20", textBadge: "text-red-300", icon: ShieldAlert, label: "CRITICAL" };
  if (score >= 40) return { border: "border-orange-500/30", bgBox: "bg-orange-500/10", text: "text-orange-400", bgBadge: "bg-orange-500/20", textBadge: "text-orange-300", icon: AlertTriangle, label: "WARNING" };
  return { border: "border-green-500/30", bgBox: "bg-green-500/10", text: "text-green-400", bgBadge: "bg-green-500/20", textBadge: "text-green-300", icon: CheckCircle2, label: "SAFE" };
}

function EarlyWarning() {
  const [latestRisk, setLatestRisk] = useState(null);
  const [activeRegion, setActiveRegion] = useState("Aizawl");
  const [message, setMessage] = useState("Loading telemetry...");
  const [selectedChannels, setSelectedChannels] = useState(["SMS", "In-App", "Web Alert"]);
  const [broadcasted, setBroadcasted] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  const [liveData, setLiveData] = useState({
    rain72h_mm: 0,
    soilSat_percent: 0,
    isLive: false
  });

  // GLOBAL STATE SYNC: Read active region and specific district risks from localStorage
  useEffect(() => {
    const savedRegion = localStorage.getItem("activeCommandRegion");
    if (savedRegion) {
      const parsed = JSON.parse(savedRegion);
      setActiveRegion(parsed.region);
      fetchRegionData(parsed.region);
    } else {
      fetchRegionData("Aizawl");
    }
  }, []);

  const fetchRegionData = async (regionName) => {
    setActiveRegion(regionName);
    setIsFetching(true);
    setLiveData(prev => ({ ...prev, isLive: false }));

    try {
      const { lat, lng } = regionCoordinates[regionName];
      const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=soil_moisture_27_81cm&daily=precipitation_sum&timezone=auto&past_days=3`);
      const data = await response.json();
      
      const rainData = data.daily?.precipitation_sum || [];
      const past72hRain = (rainData[0] || 0) + (rainData[1] || 0) + (rainData[2] || 0);

      // Advanced Geotechnical Field Capacity Model for Mizoram's Surma Group
      const rawVwc = data.current?.soil_moisture_27_81cm || 0.29;
      const THETA_FC = 0.26; // Field Capacity (safe bound water)
      const THETA_S = 0.45;  // Porosity (liquefaction point)
      
      let calculatedSaturation = 0.0;
      if (rawVwc > THETA_FC) {
          calculatedSaturation = (rawVwc - THETA_FC) / (THETA_S - THETA_FC);
      }
      calculatedSaturation = Math.max(0.0, Math.min(calculatedSaturation, 1.0));
      const soilSatPercent = Number((calculatedSaturation * 100).toFixed(0));

      setLiveData({
        rain72h_mm: Number(past72hRain.toFixed(1)),
        soilSat_percent: soilSatPercent,
        isLive: true
      });

      // Check if a specific prediction was saved for this district
      const regionSaved = localStorage.getItem(`risk_${regionName}`);
      let score = 78;
      let status = "CRITICAL";

      if (regionSaved) {
        const parsed = JSON.parse(regionSaved);
        score = parsed.risk;
        status = parsed.level;
      } else if (regionName === "Aizawl") {
        score = latestRisk ? latestRisk.risk : 86;
        status = latestRisk ? latestRisk.level : "CRITICAL";
      } else if (regionName === "Lunglei") {
        score = 78; status = "CRITICAL";
      } else if (regionName === "Champhai") {
        score = 52; status = "WARNING";
      } else if (regionName === "Kolasib") {
        score = 38; status = "SAFE";
      }

      setLatestRisk({ risk: score, level: status });

      // Save to global command storage
      localStorage.setItem("activeCommandRegion", JSON.stringify({
        region: regionName,
        risk: score,
        level: status,
        rain72h: Number(past72hRain.toFixed(1)),
        soilSat: soilSatPercent
      }));

    } catch (error) {
      console.error("Live API fetch failed:", error);
    } finally {
      setIsFetching(false);
    }
  };

  const currentScore = latestRisk ? latestRisk.risk : 86;
  const banner = getBannerStyles(currentScore);
  const AlertIcon = banner.icon;

  // Auto-Update Broadcast Message based on current region score
  useEffect(() => {
    if (currentScore >= 75) {
      setMessage(`CRITICAL ALERT: Landslide risk at ${currentScore}% in ${activeRegion} Region. Immediate evacuation protocols recommended. Avoid vulnerable slopes and follow local authority instructions.`);
    } else if (currentScore >= 40) {
      setMessage(`WARNING: Elevated Landslide risk (${currentScore}%) detected in ${activeRegion} Region. Please remain vigilant and avoid unnecessary travel on hillside roads.`);
    } else {
      setMessage(`ALL CLEAR: Landslide parameters in ${activeRegion} Region have stabilized to Safe levels (${currentScore}%). Routine monitoring will continue.`);
    }
  }, [activeRegion, currentScore]);

  const toggleChannel = (channel) => {
    setSelectedChannels((current) =>
      current.includes(channel) ? current.filter((item) => item !== channel) : [...current, channel]
    );
  };

  const broadcastAlert = () => {
    if (selectedChannels.length === 0) return;
    setBroadcasted(true);
    setTimeout(() => setBroadcasted(false), 3500);
  };

  return (
    <div className="min-h-screen bg-slate-950 px-4 pb-24 pt-6 text-white sm:px-6">
      <div className="mx-auto max-w-5xl">

        {/* HEADER & REGION SELECTOR */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-cyan-400">Emergency • NER</p>
            <h1 className="mt-1 text-2xl font-black sm:text-3xl">Early Warning Center</h1>
            <p className="mt-1 text-sm text-slate-400">Detect, validate and broadcast landslide warnings.</p>
          </div>
          
          <div className="relative">
            <select
              value={activeRegion}
              onChange={(e) => fetchRegionData(e.target.value)}
              className={`appearance-none rounded-2xl border ${banner.border} ${banner.bgBox} px-4 py-3 pr-10 text-sm font-bold ${banner.text} outline-none cursor-pointer transition-colors`}
            >
              <option value="Aizawl">Aizawl Region (ML Synced)</option>
              <option value="Lunglei">Lunglei Region</option>
              <option value="Champhai">Champhai Region</option>
              <option value="Kolasib">Kolasib Region</option>
            </select>
            <ChevronDown className={`absolute right-3 top-3.5 ${banner.text} pointer-events-none`} size={18} />
          </div>
        </div>

        {/* DYNAMIC ACTIVE ALERT */}
        <div className={`mb-5 rounded-2xl border ${banner.border} ${banner.bgBox} p-4 transition-colors duration-500`}>
          <div className="flex gap-3">
            {isFetching ? <Loader2 className={`mt-0.5 shrink-0 ${banner.text} animate-spin`} size={24} /> : <AlertIcon className={`mt-0.5 shrink-0 ${banner.text}`} size={24} />}

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className={`font-bold ${banner.textBadge}`}>
                  {currentScore >= 75 ? "Active High-Risk Alert" : currentScore >= 40 ? "Elevated Warning Status" : "System Status: Normal"}
                </h2>
                <span className={`rounded-full ${banner.bgBadge} px-2 py-1 text-[10px] font-bold ${banner.textBadge}`}>
                  {banner.label}
                </span>
              </div>

              <div className="mt-2 flex items-center gap-2 text-sm text-slate-300">
                <MapPin size={15} /> {activeRegion}, Mizoram
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                <div className="rounded-xl bg-slate-950/50 p-3">
                  <p className="text-[10px] text-slate-500">ML Risk Score</p>
                  <p className={`mt-1 font-bold ${banner.text}`}>{currentScore}%</p>
                </div>
                <div className="rounded-xl bg-slate-950/50 p-3">
                  <p className="text-[10px] text-slate-500">Live 72h Rainfall</p>
                  <p className="mt-1 font-bold text-cyan-400">{liveData.rain72h_mm} mm</p>
                </div>
                <div className="rounded-xl bg-slate-950/50 p-3">
                  <p className="text-[10px] text-slate-500">Soil Saturation</p>
                  <p className="mt-1 font-bold text-cyan-400">{liveData.soilSat_percent}%</p>
                </div>
                <div className="rounded-xl bg-slate-950/50 p-3">
                  <p className="text-[10px] text-slate-500">Region Slope</p>
                  <p className="mt-1 font-bold">{regionCoordinates[activeRegion].slope}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RECIPIENTS */}
        <div className="mb-5 rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-cyan-400/10 p-2.5">
              <Users className="text-cyan-400" size={20} />
            </div>
            <div>
              <h2 className="font-bold">Alert Recipients</h2>
              <p className="text-xs text-slate-500">Authorities and communities to be notified</p>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {recipients.map((recipient) => (
              <div key={recipient} className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                <CheckCircle2 size={17} className="text-green-400" />
                <span className="text-sm font-medium">{recipient}</span>
              </div>
            ))}
          </div>
        </div>

        {/* BROADCAST CHANNELS */}
        <div className="mb-5 rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-purple-400/10 p-2.5">
              <Radio className="text-purple-400" size={20} />
            </div>
            <div>
              <h2 className="font-bold">Broadcast Channels</h2>
              <p className="text-xs text-slate-500">Select distribution network</p>
            </div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {channels.map((channel) => {
              const selected = selectedChannels.includes(channel);
              return (
                <button
                  key={channel}
                  onClick={() => toggleChannel(channel)}
                  className={`rounded-xl border p-4 text-left transition ${
                    selected ? "border-cyan-400/40 bg-cyan-400/10" : "border-slate-800 bg-slate-950/60"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <MessageSquare size={19} className={selected ? "text-cyan-400" : "text-slate-500"} />
                    {selected && <CheckCircle2 size={17} className="text-cyan-400" />}
                  </div>
                  <p className="mt-3 text-sm font-bold">{channel}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* DYNAMIC WARNING MESSAGE */}
        <div className="mb-5 rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-orange-400/10 p-2.5">
              <AlertTriangle className="text-orange-400" size={20} />
            </div>
            <div>
              <h2 className="font-bold">Auto-Generated SMS Payload</h2>
              <p className="text-xs text-slate-500">Review the region-specific message before broadcasting</p>
            </div>
          </div>
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            rows={4}
            className="mt-4 w-full resize-none rounded-xl border border-slate-700 bg-slate-950 p-4 text-sm leading-6 text-slate-200 focus:border-cyan-400 focus:outline-none"
          />
        </div>

        {/* BROADCAST ACTION */}
        <button
          onClick={broadcastAlert}
          disabled={!message.trim() || selectedChannels.length === 0 || isFetching}
          className={`flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-4 text-sm font-black text-white transition disabled:cursor-not-allowed disabled:opacity-40 ${
             currentScore >= 75 ? "bg-red-500 hover:bg-red-400" : currentScore >= 40 ? "bg-orange-500 hover:bg-orange-400" : "bg-green-600 hover:bg-green-500"
          }`}
        >
          <Send size={18} />
          {broadcasted ? `Alert Broadcasted to ${activeRegion}` : currentScore < 40 ? "Broadcast Status Update" : "Broadcast Emergency Alert"}
        </button>

        {broadcasted && (
          <div className="mt-3 rounded-xl border border-green-500/20 bg-green-500/10 p-3 text-center text-xs text-green-400">
            System broadcast successful via: {selectedChannels.join(", ")}.
          </div>
        )}

      </div>
    </div>
  );
}

export default EarlyWarning;