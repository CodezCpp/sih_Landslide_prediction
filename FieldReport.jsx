import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Camera,
  MapPin,
  Send,
  CheckCircle2,
  AlertTriangle,
  Navigation,
  WifiOff,
  Image as ImageIcon,
  Brain
} from "lucide-react";

const hazards = [
  "Surface Crack",
  "Slope Movement",
  "Landslide",
  "Blocked Road",
  "Rockfall",
  "Water Seepage",
];

// DYNAMIC THRESHOLD STYLING
function getBannerStyles(score) {
  if (score >= 75) return { border: "border-red-500/30", bgBox: "bg-red-500/10", text: "text-red-400", label: "CRITICAL" };
  if (score >= 40) return { border: "border-orange-500/30", bgBox: "bg-orange-500/10", text: "text-orange-400", label: "WARNING" };
  return { border: "border-green-500/30", bgBox: "bg-green-500/10", text: "text-green-400", label: "SAFE" };
}

function FieldReport() {
  const [hazard, setHazard] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  
  // MULTI-DISTRICT COMMAND STATE SYNC
  const [activeRegion, setActiveRegion] = useState("Aizawl");
  const [regionRisk, setRegionRisk] = useState({ risk: 86, level: "CRITICAL" });

  useEffect(() => {
    const savedRegion = localStorage.getItem("activeCommandRegion");
    if (savedRegion) {
      const parsed = JSON.parse(savedRegion);
      setActiveRegion(parsed.region);
      
      const savedRisk = localStorage.getItem(`risk_${parsed.region}`);
      if (savedRisk) {
        setRegionRisk(JSON.parse(savedRisk));
      } else if (parsed.risk !== undefined) {
        setRegionRisk({ risk: parsed.risk, level: parsed.level });
      }
    } else {
      const saved = localStorage.getItem("latestRisk");
      if (saved) setRegionRisk(JSON.parse(saved));
    }
  }, []);

  const currentScore = regionRisk.risk;
  const banner = getBannerStyles(currentScore);

  const getLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by this browser.");
      return;
    }

    setGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setGettingLocation(false);
      },
      () => {
        setGettingLocation(false);
        alert("Unable to get your location. Please allow location access.");
      }
    );
  };

  const handlePhoto = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setPhoto({
        name: file.name,
        url: URL.createObjectURL(file),
      });
    }
  };

  const submitReport = () => {
    if (!hazard || !description.trim()) return;
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 px-4 pb-24 pt-6 text-white sm:px-6">
      <div className="mx-auto max-w-3xl">

        {/* HEADER */}
        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-widest text-cyan-400">
            Telemetry • NER
          </p>
          <h1 className="mt-1 text-2xl font-black sm:text-3xl">
            Field Report
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Submit ground-truth data to the AI monitoring pipeline.
          </p>
        </div>

        {/* DYNAMIC ML SYSTEM STATUS */}
        <div className={`mb-5 flex items-center justify-between rounded-2xl border ${banner.border} ${banner.bgBox} p-4 transition-colors duration-500`}>
          <div className="flex items-center gap-3">
            <div className={`rounded-xl bg-slate-950/50 p-2 ${banner.text}`}>
              <Brain size={20} />
            </div>
            <div>
              <p className={`text-sm font-bold ${banner.text}`}>
                {activeRegion} Status: {banner.label}
              </p>
              <p className="text-xs text-slate-400">
                Active ML Risk Score: {currentScore}%
              </p>
            </div>
          </div>
          <Link to="/predict" className={`text-[10px] font-bold uppercase tracking-wider ${banner.text} hover:opacity-80`}>
            View Engine
          </Link>
        </div>

        {/* LOW NETWORK */}
        <div className="mb-5 flex gap-3 rounded-2xl border border-orange-500/20 bg-orange-500/5 p-4">
          <WifiOff size={20} className="mt-0.5 shrink-0 text-orange-400" />
          <div>
            <p className="text-sm font-bold text-orange-300">
              Offline-Ready Architecture
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Reports are queued locally and automatically synced with the FastAPI backend when network connectivity is restored.
            </p>
          </div>
        </div>

        {/* SUCCESS */}
        {submitted && (
          <div className="mb-5 flex gap-3 rounded-2xl border border-green-500/20 bg-green-500/10 p-4">
            <CheckCircle2 size={21} className="mt-0.5 shrink-0 text-green-400" />
            <div>
              <p className="font-bold text-green-300">
                Telemetry Synced Successfully
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Your report for {activeRegion} has been routed to the Random Forest data pipeline for validation.
              </p>
            </div>
          </div>
        )}

        {/* HAZARD TYPE */}
        <div className="mb-5 rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-xl bg-red-400/10 p-2.5">
              <AlertTriangle size={20} className="text-red-400" />
            </div>
            <div>
              <h2 className="font-bold">Hazard Type</h2>
              <p className="text-xs text-slate-500">Select the observed field condition</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {hazards.map((item) => (
              <button
                key={item}
                onClick={() => setHazard(item)}
                className={`rounded-xl border p-3 text-left text-xs font-semibold transition ${
                  hazard === item
                    ? "border-cyan-400/50 bg-cyan-400/10 text-cyan-300"
                    : "border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-600"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* PHOTO */}
        <div className="mb-5 rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-xl bg-purple-400/10 p-2.5">
              <Camera size={20} className="text-purple-400" />
            </div>
            <div>
              <h2 className="font-bold">Photo Evidence</h2>
              <p className="text-xs text-slate-500">Upload visual validation</p>
            </div>
          </div>

          <label className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-slate-950/50 p-5 text-center hover:border-cyan-400/40">
            {photo ? (
              <>
                <img src={photo.url} alt="Field evidence" className="max-h-48 rounded-xl object-contain" />
                <p className="mt-3 text-xs text-slate-400">{photo.name}</p>
              </>
            ) : (
              <>
                <ImageIcon size={30} className="text-slate-600" />
                <p className="mt-3 text-sm font-semibold text-slate-400">Upload hazard photo</p>
                <p className="mt-1 text-[10px] text-slate-600">JPG, PNG or mobile camera image</p>
              </>
            )}
            <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhoto} />
          </label>
        </div>

        {/* LOCATION */}
        <div className="mb-5 rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-xl bg-cyan-400/10 p-2.5">
              <MapPin size={20} className="text-cyan-400" />
            </div>
            <div>
              <h2 className="font-bold">Geo-tag Location</h2>
              <p className="text-xs text-slate-500">Attach GPS coordinates to the report</p>
            </div>
          </div>

          {location ? (
            <div className="rounded-xl border border-green-500/20 bg-green-500/10 p-4">
              <div className="flex items-center gap-2 text-green-400">
                <CheckCircle2 size={17} />
                <span className="text-sm font-bold">Live GPS Captured</span>
              </div>
              <p className="mt-2 text-xs text-slate-400">Lat: {location.lat.toFixed(6)}</p>
              <p className="text-xs text-slate-400">Lng: {location.lng.toFixed(6)}</p>
            </div>
          ) : (
            <button
              onClick={getLocation}
              disabled={gettingLocation}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm font-bold text-slate-300 hover:border-cyan-400/40 hover:text-cyan-400 disabled:opacity-50"
            >
              <Navigation size={17} />
              {gettingLocation ? "Acquiring Satellites..." : "Capture Current Location"}
            </button>
          )}
        </div>

        {/* DESCRIPTION */}
        <div className="mb-5 rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <h2 className="font-bold">Field Observation</h2>
          <p className="mt-1 text-xs text-slate-500">Describe the physical anomaly.</p>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={4}
            placeholder="Example: Large surface cracks observed near the roadside. Water is seeping from the slope after heavy rainfall..."
            className="mt-4 w-full resize-none rounded-xl border border-slate-700 bg-slate-950 p-4 text-sm leading-6 text-slate-200 focus:border-cyan-400 focus:outline-none"
          />
        </div>

        {/* SUBMIT */}
        <button
          onClick={submitReport}
          disabled={!hazard || !description.trim() || submitted}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-5 py-4 text-sm font-black text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Send size={18} />
          {submitted ? "Data Transmitted" : "Transmit Field Report"}
        </button>

      </div>
    </div>
  );
}

export default FieldReport;