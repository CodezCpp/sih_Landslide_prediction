import { Link } from "react-router-dom";
import {
  AlertTriangle,
  Map,
  Brain,
  ArrowUpRight,
  ShieldAlert,
  CloudRain,
  Mountain,
  Route,
  Activity,
} from "lucide-react";

const highRiskLocations = [
  {
    name: "Aizawl",
    district: "Aizawl District",
    risk: 86,
    level: "CRITICAL",
    rainfall: "184 mm",
    slope: "42°",
    factor: "Heavy rainfall + steep slope",
  },
  {
    name: "Lunglei",
    district: "Lunglei District",
    risk: 78,
    level: "HIGH",
    rainfall: "156 mm",
    slope: "39°",
    factor: "Weak lithology + rainfall",
  },
  {
    name: "Champhai",
    district: "Champhai District",
    risk: 72,
    level: "HIGH",
    rainfall: "141 mm",
    slope: "37°",
    factor: "Hill cutting + slope instability",
  },
  {
    name: "Kolasib",
    district: "Kolasib District",
    risk: 69,
    level: "HIGH",
    rainfall: "132 mm",
    slope: "35°",
    factor: "Road proximity + rainfall",
  },
];

function riskColor(risk) {
  if (risk >= 80) return "text-red-400";
  if (risk >= 60) return "text-orange-400";
  return "text-green-400";
}

function riskBg(risk) {
  if (risk >= 80) return "bg-red-500/10 border-red-500/30";
  if (risk >= 60) return "bg-orange-500/10 border-orange-500/30";
  return "bg-green-500/10 border-green-500/30";
}

function HighRisk() {
  return (
    <div className="min-h-screen bg-slate-950 px-4 pb-28 pt-6 text-white sm:px-6">

      {/* HEADER */}
      <div className="mx-auto max-w-6xl">

        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400">
              Mizoram • NER
            </p>

            <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
              High Risk Zones
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              Areas requiring immediate monitoring and response
            </p>
          </div>

          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-3">
            <ShieldAlert className="text-red-400" size={25} />
          </div>
        </div>

        {/* ALERT BANNER */}
        <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4">
          <div className="flex gap-3">
            <AlertTriangle
              className="mt-0.5 shrink-0 text-red-400"
              size={22}
            />

            <div>
              <p className="font-bold text-red-300">
                Immediate Attention Required
              </p>

              <p className="mt-1 text-sm leading-5 text-slate-300">
                Multiple locations in Mizoram are currently showing elevated
                landslide risk based on rainfall, terrain and other monitored
                factors.
              </p>
            </div>
          </div>
        </div>

        {/* SUMMARY */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <p className="text-xs text-slate-500">High Risk</p>
            <p className="mt-1 text-2xl font-bold text-red-400">14</p>
            <p className="text-[11px] text-slate-500">zones detected</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <p className="text-xs text-slate-500">Critical</p>
            <p className="mt-1 text-2xl font-bold text-red-400">4</p>
            <p className="text-[11px] text-slate-500">priority zones</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <p className="text-xs text-slate-500">Rainfall</p>
            <p className="mt-1 text-2xl font-bold text-cyan-400">184</p>
            <p className="text-[11px] text-slate-500">mm / 72h</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <p className="text-xs text-slate-500">Sensors</p>
            <p className="mt-1 text-2xl font-bold text-green-400">320</p>
            <p className="text-[11px] text-slate-500">monitoring</p>
          </div>

        </div>

        {/* LOCATION LIST */}
        <div className="mb-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold">Priority Locations</h2>

            <Link
              to="/map"
              className="flex items-center gap-1 text-xs font-semibold text-cyan-400"
            >
              View Map
              <ArrowUpRight size={14} />
            </Link>
          </div>

          <div className="space-y-3">

            {highRiskLocations.map((location) => (
              <div
                key={location.name}
                className={`rounded-2xl border p-4 transition hover:border-slate-600 ${riskBg(
                  location.risk
                )}`}
              >
                {/* TOP */}
                <div className="flex items-start justify-between gap-3">

                  <div className="flex min-w-0 items-center gap-3">

                    <div className="rounded-xl bg-slate-950/70 p-2.5">
                      <Mountain
                        size={20}
                        className={riskColor(location.risk)}
                      />
                    </div>

                    <div className="min-w-0">
                      <h3 className="font-bold">{location.name}</h3>

                      <p className="truncate text-xs text-slate-500">
                        {location.district}
                      </p>
                    </div>

                  </div>

                  <div className="text-right">
                    <p
                      className={`text-2xl font-black ${riskColor(
                        location.risk
                      )}`}
                    >
                      {location.risk}%
                    </p>

                    <p
                      className={`text-[10px] font-bold tracking-wider ${riskColor(
                        location.risk
                      )}`}
                    >
                      {location.level}
                    </p>
                  </div>

                </div>

                {/* RISK BAR */}
                <div className="mt-4">
                  <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className={`h-full rounded-full ${
                        location.risk >= 80
                          ? "bg-red-500"
                          : "bg-orange-500"
                      }`}
                      style={{ width: `${location.risk}%` }}
                    />
                  </div>
                </div>

                {/* METRICS */}
                <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">

                  <div className="rounded-xl bg-slate-950/50 p-2.5">
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <CloudRain size={14} />
                      <span className="text-[10px]">Rainfall</span>
                    </div>

                    <p className="mt-1 text-xs font-bold">
                      {location.rainfall}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-950/50 p-2.5">
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Mountain size={14} />
                      <span className="text-[10px]">Slope</span>
                    </div>

                    <p className="mt-1 text-xs font-bold">
                      {location.slope}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-950/50 p-2.5">
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Activity size={14} />
                      <span className="text-[10px]">Risk</span>
                    </div>

                    <p className="mt-1 text-xs font-bold">
                      {location.level}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-950/50 p-2.5">
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Route size={14} />
                      <span className="text-[10px]">Priority</span>
                    </div>

                    <p className="mt-1 text-xs font-bold">
                      {location.risk >= 80 ? "Immediate" : "High"}
                    </p>
                  </div>

                </div>

                {/* FACTOR */}
                <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
                  <span className="font-semibold text-slate-500">
                    Major factor:
                  </span>

                  {location.factor}
                </div>

                {/* ACTIONS */}
                <div className="mt-4 flex gap-2">

                  <Link
                    to="/map"
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2.5 text-xs font-bold text-slate-200 transition hover:border-cyan-500/40 hover:text-cyan-400"
                  >
                    <Map size={15} />
                    View on Map
                  </Link>

                  <Link
                    to="/predict"
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-cyan-400 px-3 py-2.5 text-xs font-bold text-slate-950 transition hover:bg-cyan-300"
                  >
                    <Brain size={15} />
                    Analyze
                  </Link>

                </div>

              </div>
            ))}

          </div>
        </div>

        {/* RESPONSE PRIORITY */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">

          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-cyan-400/10 p-2.5">
              <ShieldAlert className="text-cyan-400" size={20} />
            </div>

            <div>
              <h2 className="font-bold">Emergency Response Priority</h2>
              <p className="text-xs text-slate-500">
                Recommended operational sequence
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-3">

            <div className="flex items-center gap-3 rounded-xl bg-slate-950/60 p-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-red-500/15 text-xs font-bold text-red-400">
                1
              </span>

              <div>
                <p className="text-sm font-semibold">Aizawl</p>
                <p className="text-xs text-slate-500">
                  Critical risk — immediate monitoring
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl bg-slate-950/60 p-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-500/15 text-xs font-bold text-orange-400">
                2
              </span>

              <div>
                <p className="text-sm font-semibold">Lunglei</p>
                <p className="text-xs text-slate-500">
                  High risk — field verification recommended
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl bg-slate-950/60 p-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-500/15 text-xs font-bold text-orange-400">
                3
              </span>

              <div>
                <p className="text-sm font-semibold">Champhai & Kolasib</p>
                <p className="text-xs text-slate-500">
                  High risk — continue sensor monitoring
                </p>
              </div>
            </div>

          </div>

          <Link
            to="/early-warning"
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-red-400"
          >
            <AlertTriangle size={17} />
            Open Warning Center
          </Link>

        </div>

        {/* DISCLAIMER */}
        <p className="mt-6 text-center text-[10px] leading-4 text-slate-600">
          Prototype monitoring data for demonstration. Final risk levels
          should be generated from validated AI/ML models, sensor data,
          rainfall observations and authoritative geological datasets.
        </p>

      </div>
    </div>
  );
}

export default HighRisk;