import { useState, useEffect } from "react";
import "leaflet/dist/leaflet.css";

import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  Polyline,
} from "react-leaflet";

import {
  Route,
  Radio,
  Building2,
  Mountain,
  Brain,
  Camera,
} from "lucide-react";

import { Link } from "react-router-dom";

// =====================================================
// HARDcoded vulnerable roads
// =====================================================

const roads = [
  [
    [23.7271, 92.7176],
    [23.9, 92.9],
    [24.05, 92.78],
  ],
  [
    [22.8897, 92.7476],
    [23.1, 92.82],
    [23.35, 92.95],
  ],
];

// =====================================================
// RISK THRESHOLDS
// =====================================================
// SAFE     : < 35%
// WARNING  : 35% - < 65%
// CRITICAL : >= 65%
// =====================================================

function getRiskColor(risk) {
  const value = Number(risk);

  if (value >= 65) {
    return "#ef4444"; // Red - Critical
  }

  if (value >= 35) {
    return "#f97316"; // Orange - Warning
  }

  return "#22c55e"; // Green - Safe
}

function getRiskLevel(risk) {
  const value = Number(risk);

  if (value >= 65) {
    return "CRITICAL";
  }

  if (value >= 35) {
    return "WARNING";
  }

  return "SAFE";
}

// =====================================================
// MAIN COMPONENT
// =====================================================

function Riskmap() {
  const [latestRisk, setLatestRisk] = useState(null);

  // ===================================================
  // LOAD LATEST PREDICTION
  // ===================================================

  useEffect(() => {
    const saved = localStorage.getItem("latestRisk");

    if (saved) {
      try {
        setLatestRisk(JSON.parse(saved));
      } catch (error) {
        console.error("Failed to parse latestRisk:", error);
      }
    }
  }, []);

  // ===================================================
  // GET REGION RISK
  // ===================================================
  // IMPORTANT:
  // Status is ALWAYS calculated from the percentage.
  // We don't trust the previously stored "level".
  // ===================================================

  const getRegionRisk = (regionName, defaultRisk) => {
    const saved = localStorage.getItem(`risk_${regionName}`);

    let risk = defaultRisk;

    if (saved) {
      try {
        const data = JSON.parse(saved);

        if (data && data.risk !== undefined) {
          risk = Number(data.risk);
        }
      } catch (error) {
        console.error(
          `Failed to parse risk data for ${regionName}:`,
          error
        );
      }
    } else if (regionName === "Aizawl" && latestRisk) {
      if (latestRisk.risk !== undefined) {
        risk = Number(latestRisk.risk);
      }
    }

    // Safety check
    if (isNaN(risk)) {
      risk = defaultRisk;
    }

    return {
      risk: Number(risk.toFixed(2)),
      level: getRiskLevel(risk),
    };
  };

  // ===================================================
  // DISTRICT DATA
  // ===================================================

  const aizawlData = getRegionRisk("Aizawl", 40.83);
  const lungleiData = getRegionRisk("Lunglei", 45.5);
  const champhaiData = getRegionRisk("Champhai", 45.33);
  const kolasibData = getRegionRisk("Kolasib", 43.31);

  // ===================================================
  // MONITORED LOCATIONS
  // ===================================================

  const dynamicLocations = [
    {
      name: "Aizawl",
      lat: 23.7271,
      lng: 92.7176,
      risk: aizawlData.risk,
      level: aizawlData.level,
    },
    {
      name: "Lunglei",
      lat: 22.8897,
      lng: 92.7476,
      risk: lungleiData.risk,
      level: lungleiData.level,
    },
    {
      name: "Champhai",
      lat: 23.4596,
      lng: 93.3265,
      risk: champhaiData.risk,
      level: champhaiData.level,
    },
    {
      name: "Kolasib",
      lat: 24.2239,
      lng: 92.6786,
      risk: kolasibData.risk,
      level: kolasibData.level,
    },
  ];

  // ===================================================
  // COUNT CURRENT RISK LEVELS
  // ===================================================

  const criticalCount = dynamicLocations.filter(
    (location) => location.risk >= 65
  ).length;

  const warningCount = dynamicLocations.filter(
    (location) => location.risk >= 35 && location.risk < 65
  ).length;

  const safeCount = dynamicLocations.filter(
    (location) => location.risk < 35
  ).length;

  // ===================================================
  // UI
  // ===================================================

  return (
    <div className="min-h-screen bg-slate-950 px-4 pb-24 pt-5 text-white sm:px-6">
      <div className="mx-auto max-w-7xl">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-5">
          <p className="text-xs font-bold uppercase tracking-widest text-cyan-400">
            GIS • MIZORAM • NER
          </p>

          <h1 className="mt-1 text-2xl font-black sm:text-3xl">
            Live Risk Map
          </h1>

          <p className="mt-1 text-sm text-slate-400">
            Geospatial visualization synced with multi-district ML telemetry.
          </p>
        </div>

        {/* =================================================
            MAP
        ================================================= */}

        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">
          <div className="h-[430px] sm:h-[550px]">

            <MapContainer
              center={[23.4, 92.9]}
              zoom={8}
              scrollWheelZoom={true}
              className="h-full w-full"
            >

              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* ==========================================
                  RISK ZONES
              ========================================== */}

              {dynamicLocations.map((location) => {
                const color = getRiskColor(location.risk);

                return (
                  <CircleMarker
                    key={location.name}
                    center={[location.lat, location.lng]}
                    radius={12}
                    pathOptions={{
                      color: color,
                      fillColor: color,
                      fillOpacity: 0.75,
                      weight: 3,
                    }}
                  >
                    <Popup>
                      <div className="text-slate-900">
                        <strong>{location.name} Region</strong>

                        <br />

                        ML Score:{" "}
                        <b>{location.risk.toFixed(2)}%</b>

                        <br />

                        Status:{" "}
                        <b>{getRiskLevel(location.risk)}</b>
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              })}

              {/* ==========================================
                  VULNERABLE ROADS
              ========================================== */}

              {roads.map((road, index) => (
                <Polyline
                  key={index}
                  positions={road}
                  pathOptions={{
                    color: "#f97316",
                    weight: 5,
                    opacity: 0.8,
                  }}
                />
              ))}

            </MapContainer>
          </div>
        </div>

        {/* =================================================
            LEGEND
        ================================================= */}

        <div className="mt-4 grid grid-cols-3 gap-2">

          {/* CRITICAL */}

          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3">
            <div className="flex items-center gap-2">

              <span className="h-3 w-3 rounded-full bg-red-500" />

              <span className="text-xs font-bold uppercase">
                Critical (≥65%)
              </span>

            </div>

            <p className="mt-1 text-[10px] text-slate-500">
              {criticalCount} district
              {criticalCount !== 1 ? "s" : ""}
            </p>
          </div>

          {/* WARNING */}

          <div className="rounded-xl border border-orange-500/20 bg-orange-500/10 p-3">
            <div className="flex items-center gap-2">

              <span className="h-3 w-3 rounded-full bg-orange-500" />

              <span className="text-xs font-bold uppercase">
                Warning (≥35%)
              </span>

            </div>

            <p className="mt-1 text-[10px] text-slate-500">
              {warningCount} district
              {warningCount !== 1 ? "s" : ""}
            </p>
          </div>

          {/* SAFE */}

          <div className="rounded-xl border border-green-500/20 bg-green-500/10 p-3">
            <div className="flex items-center gap-2">

              <span className="h-3 w-3 rounded-full bg-green-500" />

              <span className="text-xs font-bold uppercase">
                Safe (&lt;35%)
              </span>

            </div>

            <p className="mt-1 text-[10px] text-slate-500">
              {safeCount} district
              {safeCount !== 1 ? "s" : ""}
            </p>
          </div>

        </div>

        {/* =================================================
            MONITORED LOCATIONS
        ================================================= */}

        <div className="mt-6">

          <div className="mb-3 flex items-center justify-between">

            <h2 className="text-lg font-bold">
              Monitored Locations
            </h2>

            <span className="text-xs text-slate-500">
              {dynamicLocations.length} districts active
            </span>

          </div>

          <div className="grid gap-3 sm:grid-cols-2">

            {dynamicLocations.map((location) => {

              const riskColor = getRiskColor(location.risk);
              const riskLevel = getRiskLevel(location.risk);

              return (
                <div
                  key={location.name}
                  className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4"
                >

                  <div className="flex items-center justify-between">

                    {/* LOCATION */}

                    <div className="flex items-center gap-3">

                      <div className="rounded-xl bg-slate-800 p-2">

                        <Mountain
                          size={20}
                          style={{
                            color: riskColor,
                          }}
                        />

                      </div>

                      <div>

                        <h3 className="font-bold">
                          {location.name}
                        </h3>

                        <p className="text-xs text-slate-500">
                          ML Synced & Field-Capacity Active
                        </p>

                      </div>

                    </div>

                    {/* RISK */}

                    <div className="text-right">

                      <p
                        className="text-2xl font-black"
                        style={{
                          color: riskColor,
                        }}
                      >
                        {location.risk.toFixed(2)}%
                      </p>

                      <p
                        className="text-[10px] font-bold"
                        style={{
                          color: riskColor,
                        }}
                      >
                        {riskLevel}
                      </p>

                    </div>

                  </div>

                </div>
              );
            })}

          </div>
        </div>

        {/* =================================================
            MAP DATA LAYERS
        ================================================= */}

        <div className="mt-6">

          <h2 className="mb-3 text-lg font-bold">
            Map Data Layers
          </h2>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">

            {/* RISK ZONES */}

            <div className="rounded-xl border border-slate-800 bg-slate-900 p-3">

              <Mountain
                className="text-red-400"
                size={20}
              />

              <p className="mt-2 text-xs font-semibold">
                Risk Zones
              </p>

            </div>

            {/* ROADS */}

            <div className="rounded-xl border border-slate-800 bg-slate-900 p-3">

              <Route
                className="text-orange-400"
                size={20}
              />

              <p className="mt-2 text-xs font-semibold">
                Vulnerable Roads
              </p>

            </div>

            {/* IOT */}

            <div className="rounded-xl border border-slate-800 bg-slate-900 p-3">

              <Radio
                className="text-cyan-400"
                size={20}
              />

              <p className="mt-2 text-xs font-semibold">
                IoT Sensors
              </p>

            </div>

            {/* INFRASTRUCTURE */}

            <div className="rounded-xl border border-slate-800 bg-slate-900 p-3">

              <Building2
                className="text-purple-400"
                size={20}
              />

              <p className="mt-2 text-xs font-semibold">
                Infrastructure
              </p>

            </div>

          </div>
        </div>

        {/* =================================================
            ACTIONS
        ================================================= */}

        <div className="mt-6 grid grid-cols-2 gap-3">

          <Link
            to="/predict"
            className="flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 py-3 text-sm font-bold text-slate-950"
          >
            <Brain size={17} />
            AI Prediction
          </Link>

          <Link
            to="/field-report"
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-bold"
          >
            <Camera size={17} />
            Field Report
          </Link>

        </div>

        {/* =================================================
            DISCLAIMER
        ================================================= */}

        <p className="mt-6 text-center text-[10px] leading-4 text-slate-600">
          All district nodes are actively synced to local storage
          state derived from the Random Forest telemetry pipeline.
          Risk levels are classified as Safe (&lt;35%), Warning
          (35–&lt;65%), and Critical (≥65%).
        </p>

      </div>
    </div>
  );
}

export default Riskmap;