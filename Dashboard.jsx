import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import {
  AlertTriangle,
  ArrowUpRight,
  BellRing,
  Brain,
  Camera,
  CloudRain,
  Map,
  Mountain,
  Radio,
  Route,
  ShieldAlert,
  Activity,
  CheckCircle2,
  Loader2,
} from "lucide-react";

import { useLanguage } from "../context/LanguageContext";
import AIAssistant from "../components/AIAssistant";

// ======================================================
// REGIONAL CONSTANTS & MIZORAM GEOLOGICAL BASELINES
// ======================================================

const regionCoordinates = {
  Aizawl: {
    lat: 23.7271,
    lng: 92.7176,
    slope: 38.0,
    lithology: 0.78,
    hillCutting: 0.85,
    historicalFailures: 8,
    surfaceCrack: 6.5,
  },

  Lunglei: {
    lat: 22.8833,
    lng: 92.7333,
    slope: 42.0,
    lithology: 0.75,
    hillCutting: 0.70,
    historicalFailures: 6,
    surfaceCrack: 4.0,
  },

  Champhai: {
    lat: 23.4750,
    lng: 93.3250,
    slope: 28.0,
    lithology: 0.68,
    hillCutting: 0.40,
    historicalFailures: 3,
    surfaceCrack: 1.5,
  },

  Kolasib: {
    lat: 24.2266,
    lng: 92.6750,
    slope: 31.0,
    lithology: 0.70,
    hillCutting: 0.50,
    historicalFailures: 4,
    surfaceCrack: 2.0,
  },
};

// ======================================================
// RISK COLOR SYSTEM
//
// 0 - 39   = SAFE / GREEN
// 40 - 59  = LOW-MEDIUM / YELLOW
// 60 - 74  = MEDIUM-HIGH / ORANGE
// 75 - 100 = CRITICAL / RED
// ======================================================

function riskColor(risk) {
  if (risk >= 65) return "text-red-400";
  if (risk >= 40) return "text-orange-400";
  return "text-green-400";
}

function riskBg(risk) {
  if (risk >= 65) return "bg-red-500";
  if (risk >= 40) return "bg-orange-500";
  return "bg-green-500";
}
// ======================================================
// TOP BANNER STYLE
// ======================================================

function getBannerStyles(score) {
  if (score >= 65) {
    return {
      border: "border-red-500/30",
      bgBox: "bg-red-500/10",
      text: "text-red-400",
      dot: "bg-red-500",
      label: "text-red-300",
      icon: ShieldAlert,
    };
  }

  if (score >= 35) {
    return {
      border: "border-orange-500/30",
      bgBox: "bg-orange-500/10",
      text: "text-orange-400",
      dot: "bg-orange-500",
      label: "text-orange-300",
      icon: AlertTriangle,
    };
  }

  // SAFE
  return {
    border: "border-green-500/30",
    bgBox: "bg-green-500/10",
    text: "text-green-400",
    dot: "bg-green-500",
    label: "text-green-300",
    icon: CheckCircle2,
  };
}

// ======================================================
// DASHBOARD
// ======================================================

function Dashboard() {
  const { language, changeLanguage, t } = useLanguage();

  const [activeRegion, setActiveRegion] = useState("Aizawl");
  const [isFetching, setIsFetching] = useState(false);
  const [latestRisk, setLatestRisk] = useState(null);

  const [liveData, setLiveData] = useState({
    currentRain_mm: 0.0,
    rain72h_mm: 0.0,
    soilSat_percent: 0,
    slope_deg: 38.0,
    road_dist_m: 120.0,
    earthquake_mag: 0.0,
    lithology_val: 0.78,
    hill_cutting: 0.85,
    historical_failures: 8,
    surface_crack: 6.5,
    isLive: false,
  });

  // ====================================================
  // INITIAL LOAD
  // ====================================================

  useEffect(() => {
    const saved = localStorage.getItem("latestRisk");

    if (saved) {
      setLatestRisk(JSON.parse(saved));
    }

    const savedRegion =
      localStorage.getItem("activeCommandRegion");

    if (savedRegion) {
      const parsed = JSON.parse(savedRegion);

      setActiveRegion(parsed.region);
      fetchRegionData(parsed.region);
    } else {
      fetchRegionData("Aizawl");
    }
  }, []);

  // ====================================================
  // FETCH LIVE REGION DATA
  // ====================================================

  const fetchRegionData = async (regionName) => {
    setActiveRegion(regionName);
    setIsFetching(true);

    setLiveData((prev) => ({
      ...prev,
      isLive: false,
    }));

    try {
      const {
        lat,
        lng,
        slope,
        lithology,
        hillCutting,
        historicalFailures,
        surfaceCrack,
      } = regionCoordinates[regionName];

      // ------------------------------------------------
      // 1. OSRM ROAD DISTANCE
      // ------------------------------------------------

      let roadDistance = 120.0;

      try {
        const osrmRes = await fetch(
          `https://router.project-osrm.org/nearest/v1/driving/${lng},${lat}`
        );

        const osrmData = await osrmRes.json();

        if (
          osrmData.code === "Ok" &&
          osrmData.waypoints &&
          osrmData.waypoints.length > 0
        ) {
          roadDistance =
            osrmData.waypoints[0].distance;
        }
      } catch (osrmErr) {
        console.error(
          "OSRM API error:",
          osrmErr
        );
      }

      // ------------------------------------------------
      // 2. USGS EARTHQUAKE ACTIVITY
      // ------------------------------------------------

      let maxMag = 0.0;

      try {
        const endDate = new Date()
          .toISOString()
          .split("T")[0];

        const startDate = new Date(
          Date.now() -
            30 * 24 * 60 * 60 * 1000
        )
          .toISOString()
          .split("T")[0];

        const usgsRes = await fetch(
          `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&latitude=${lat}&longitude=${lng}&maxradiuskm=250&starttime=${startDate}&endtime=${endDate}&minmagnitude=1.0`
        );

        const usgsData =
          await usgsRes.json();

        const features =
          usgsData.features || [];

        if (features.length > 0) {
          maxMag = Math.max(
            ...features.map(
              (f) => f.properties.mag || 0
            )
          );
        }
      } catch (usgsErr) {
        console.error(
          "USGS API error:",
          usgsErr
        );
      }
      // ------------------------------------------------
      // 3. OPEN-METEO WEATHER + SOIL
      // ------------------------------------------------

      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=precipitation,soil_moisture_27_81cm&daily=precipitation_sum&timezone=auto&past_days=3&forecast_days=1`
      );

      const data = await response.json();

      const rainData =
        data.daily?.precipitation_sum || [];

      const past72hRain =
        (rainData[0] || 0) +
        (rainData[1] || 0) +
        (rainData[2] || 0);

      const todayRain =
        data.current?.precipitation || 0;

      // ------------------------------------------------
      // 4. SOIL FIELD CAPACITY MODEL
      // ------------------------------------------------

      const rawVwc =
        data.current
          ?.soil_moisture_27_81cm || 0.29;

      const THETA_FC = 0.26;
      const THETA_S = 0.45;

      let calculatedSaturation = 0.0;

      if (rawVwc > THETA_FC) {
        calculatedSaturation =
          (rawVwc - THETA_FC) /
          (THETA_S - THETA_FC);
      }

      calculatedSaturation = Math.max(
        0.0,
        Math.min(
          calculatedSaturation,
          1.0
        )
      );

      const soilSatPercent = Number(
        (
          calculatedSaturation * 100
        ).toFixed(0)
      );

      // ------------------------------------------------
      // UPDATE LIVE DATA
      // ------------------------------------------------

      setLiveData({
        currentRain_mm: Number(
          todayRain.toFixed(1)
        ),

        rain72h_mm: Number(
          past72hRain.toFixed(1)
        ),

        soilSat_percent:
          soilSatPercent,

        slope_deg: slope,

        road_dist_m: Number(
          roadDistance.toFixed(1)
        ),

        earthquake_mag: Number(
          maxMag.toFixed(1)
        ),

        lithology_val:
          lithology,

        hill_cutting:
          hillCutting,

        historical_failures:
          historicalFailures,

        surface_crack:
          surfaceCrack,

        isLive: true,
      });

      // ------------------------------------------------
      // REGION RISK
      // ------------------------------------------------

      const regionSaved =
        localStorage.getItem(
          `risk_${regionName}`
        );

      let score = 78;
      let status = "CRITICAL";

      if (regionSaved) {
        const parsed =
          JSON.parse(regionSaved);

        score = parsed.risk;
        status = parsed.level;

      } else if (
        regionName === "Aizawl"
      ) {
        score = latestRisk
          ? latestRisk.risk
          : 86;

        status = latestRisk
          ? latestRisk.level
          : "CRITICAL";

      } else if (
        regionName === "Lunglei"
      ) {
        score = 78;
        status = "CRITICAL";

      } else if (
        regionName === "Champhai"
      ) {
        score = 52;
        status = "WARNING";

      } else if (
        regionName === "Kolasib"
      ) {
        score = 38;
        status = "SAFE";
      }

      // ------------------------------------------------
      // SAVE RISK FOR THIS REGION + ACTIVE REGION
      // ------------------------------------------------
      // Saving the calculated risk here makes the Priority Locations
      // cards update immediately when a region is selected/fetched.
      localStorage.setItem(
        `risk_${regionName}`,
        JSON.stringify({
          risk: score,
          level: status,
        })
      );

      localStorage.setItem(
        "activeCommandRegion",
        JSON.stringify({
          region: regionName,

          risk: score,

          level: status,

          rain72h: Number(
            past72hRain.toFixed(1)
          ),

          soilSat:
            soilSatPercent,

          slope: slope,

          roadDist: Number(
            roadDistance.toFixed(1)
          ),

          earthquakeMag: Number(
            maxMag.toFixed(1)
          ),

          lithology:
            lithology,
        })
      );

    } catch (error) {
      console.error(
        "Live API fetch failed:",
        error
      );

    } finally {
      setIsFetching(false);
    }
  };

  // ====================================================
  // ACTIVE SCORE
  // ====================================================

  const getActiveScore = () => {

    const regionSaved =
      localStorage.getItem(
        `risk_${activeRegion}`
      );

    if (regionSaved) {

      const parsed =
        JSON.parse(regionSaved);

      return {
        score: parsed.risk,
        status: parsed.level,
      };
    }

    if (
      activeRegion === "Aizawl"
    ) {
      return {
        score: latestRisk
          ? latestRisk.risk
          : 86,

        status: latestRisk
          ? latestRisk.level
          : "CRITICAL",
      };
    }

    if (
      activeRegion === "Lunglei"
    ) {
      return {
        score: 78,
        status: "CRITICAL",
      };
    }

    if (
      activeRegion === "Champhai"
    ) {
      return {
        score: 52,
        status: "WARNING",
      };
    }

    if (
      activeRegion === "Kolasib"
    ) {
      return {
        score: 38,
        status: "SAFE",
      };
    }

    return {
      score: 0,
      status: "SAFE",
    };
  };

 const {
  score: currentScore,
} = getActiveScore();

const currentStatus =
  currentScore >= 65
    ? "CRITICAL"
    : currentScore >= 40
    ? "WARNING"
    : "SAFE";
    
  const banner =
    getBannerStyles(
      currentScore
    );

  // ====================================================
  // 10 RISK FACTORS
  // ====================================================

  const riskFactors = [
    [
      t.rainfall,
      `${liveData.rain72h_mm} mm`,
    ],

    [
      t.soilSaturation,
      `${liveData.soilSat_percent}%`,
    ],

    [
      t.slopeAngle,
      `${liveData.slope_deg}°`,
    ],

    [
      t.currentRainfall,
      `${liveData.currentRain_mm} mm`,
    ],

    [
      t.hillCutting,
      `${liveData.hill_cutting} ratio`,
    ],

    [
      t.lithologyWeakness,
      `${liveData.lithology_val} ratio`,
    ],

    [
      t.historicalFailures,
      `${liveData.historical_failures} ${t.events}`,
    ],

    [
      t.surfaceCrack,
      `${liveData.surface_crack} cm`,
    ],

    [
      t.distanceRoad,
      `${liveData.road_dist_m} m`,
    ],

    [
      t.earthquakeActivity,
      `${liveData.earthquake_mag} mag`,
    ],
  ];

  // ====================================================
  // PRIORITY LOCATIONS
  // ====================================================

  // IMPORTANT: Always derive the displayed level from the risk score.
  // This prevents old localStorage values such as { risk: 50.33, level: "SAFE" }
  // from making a WARNING score appear as SAFE.
  const getRiskLevel = (risk) => {
    const numericRisk = Number(risk) || 0;
    if (numericRisk >= 65) return "CRITICAL";
    if (numericRisk >= 40) return "WARNING";
    return "SAFE";
  };

  const dynamicLocations = [
    {
      name: "Aizawl",
      district: "Aizawl District",
      risk: localStorage.getItem("risk_Aizawl")
        ? Number(JSON.parse(localStorage.getItem("risk_Aizawl")).risk)
        : latestRisk
        ? Number(latestRisk.risk)
        : 86,
    },
    {
      name: "Lunglei",
      district: "Lunglei District",
      risk: localStorage.getItem("risk_Lunglei")
        ? Number(JSON.parse(localStorage.getItem("risk_Lunglei")).risk)
        : 78,
    },
    {
      name: "Champhai",
      district: "Champhai District",
      risk: localStorage.getItem("risk_Champhai")
        ? Number(JSON.parse(localStorage.getItem("risk_Champhai")).risk)
        : 52,
    },
    {
      name: "Kolasib",
      district: "Kolasib District",
      risk: localStorage.getItem("risk_Kolasib")
        ? Number(JSON.parse(localStorage.getItem("risk_Kolasib")).risk)
        : 38,
    },
  ].map((location) => ({
    ...location,
    level: getRiskLevel(location.risk),
  }));

  // ====================================================
  // RENDER
  // ====================================================

  return (
    <div className="min-h-screen bg-slate-950 px-4 pb-24 pt-5 text-white sm:px-6">

      <div className="mx-auto max-w-7xl">

        {/* =================================================
            HEADER
        ================================================== */}

        <div className="flex items-start justify-between gap-4">

          <div>

            <p className="text-xs font-bold uppercase tracking-widest text-cyan-400">
              NER • MIZORAM
            </p>

            <h1 className="mt-1 text-2xl font-black sm:text-3xl">
              {t.landslideMonitor}
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              {t.aiEarlyWarning}
            </p>

          </div>

          {/* LANGUAGE SELECTOR */}

          <select
            value={language}
            onChange={(e) =>
              changeLanguage(
                e.target.value
              )
            }
            className="rounded-xl border border-slate-700 bg-slate-900 px-2 py-2 text-xs font-medium outline-none"
          >

            <option value="en">
              English
            </option>

            <option value="as">
              অসমীয়া
            </option>

            <option value="bn">
              বাংলা
            </option>

            <option value="ne">
              नेपाली
            </option>

            <option value="lus">
              Mizo
            </option>

          </select>

        </div>

        {/* =================================================
            TOP RISK BANNER
        ================================================== */}

        <div
          className={`mt-6 rounded-2xl border ${banner.border} ${banner.bgBox} p-5 shadow-xl transition-colors duration-500`}
        >

          <div className="flex items-start justify-between gap-4">

            <div>

              <div className="flex items-center gap-2">

                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    isFetching
                      ? "animate-pulse bg-cyan-400"
                      : banner.dot
                  }`}
                />

                <p
                  className={`text-xs font-bold uppercase tracking-wider ${
                    isFetching
                      ? "text-cyan-400"
                      : banner.label
                  }`}
                >
                  {isFetching
                    ? t.fetchingTelemetry
                    : `${activeRegion} ${t.liveTelemetry}`}
                </p>

              </div>

              <h2 className="mt-2 text-2xl font-black">
                {activeRegion} Region
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                {t.syncedApis}
              </p>

              <p className="mt-3 max-w-xl text-xs leading-5 text-slate-400">
                {currentScore >= 75
                  ? t.criticalMessage
                  : currentScore >= 40
                  ? t.warningMessage
                  : t.safeMessage}
              </p>

            </div>

            <div className="text-right">

              <p
                className={`text-5xl font-black ${banner.text}`}
              >
                {currentScore}%
              </p>

              <p
                className={`text-xs font-bold tracking-widest ${banner.label}`}
              >
                {currentStatus ===
                "CRITICAL"
                  ? t.critical
                  : currentStatus ===
                    "WARNING"
                  ? t.warning
                  : t.safe}
              </p>

            </div>

          </div>

          {/* RISK PROGRESS */}

          <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-800">

            <div
              className={`h-full rounded-full ${banner.dot} transition-all duration-1000`}
              style={{
                width: `${Math.min(
                  currentScore,
                  100
                )}%`,
              }}
            />

          </div>

          {/* ACTION BUTTONS */}

          <div className="mt-4 flex flex-wrap gap-2">

            <Link
              to="/map"
              className={`flex items-center gap-2 rounded-xl ${banner.dot} px-4 py-2.5 text-xs font-bold text-white hover:opacity-80`}
            >

              <Map size={15} />

              {t.viewRiskMap}

              <ArrowUpRight
                size={13}
              />

            </Link>

            <Link
              to="/predict"
              className={`flex items-center gap-2 rounded-xl border ${banner.border} bg-slate-950/40 px-4 py-2.5 text-xs font-bold ${banner.label}`}
            >

              <Brain size={15} />

              {t.runDeepInference}

            </Link>

          </div>

        </div>

        {/* =================================================
            QUICK STATS
        ================================================== */}

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">

            <CloudRain
              className="text-cyan-400"
              size={20}
            />

            <p className="mt-3 text-2xl font-black">
              {liveData.rain72h_mm} mm
            </p>

            <p className="text-xs text-slate-500">
              {t.rainfall72h}
            </p>

          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">

            <Radio
              className="text-green-400"
              size={20}
            />

            <p className="mt-3 text-2xl font-black">
              Online
            </p>

            <p className="text-xs text-slate-500">
              {t.apiAggregator}
            </p>

          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">

            <Route
              className="text-orange-400"
              size={20}
            />

            <p className="mt-3 text-2xl font-black">
              Active
            </p>

            <p className="text-xs text-slate-500">
              {t.osrmUsgsApis}
            </p>

          </div>

        </div>
        {/* =================================================
            QUICK ACTIONS
        ================================================== */}

        <div className="mt-6">

          <h2 className="mb-3 text-lg font-bold">
            {t.quickActions}
          </h2>

          <div className="grid grid-cols-2 gap-3">

            <Link
              to="/map"
              className="flex items-center justify-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm font-bold text-cyan-300 hover:bg-cyan-400/20"
            >
              <Map size={17} />
              {t.riskMap}
            </Link>

            <Link
              to="/predict"
              className="flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 py-3 text-sm font-bold text-slate-950 hover:bg-cyan-300"
            >
              <Brain size={17} />
              {t.aiPrediction}
            </Link>

            <Link
              to="/early-warning"
              className="flex items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-300 hover:bg-red-500/20"
            >
              <BellRing size={17} />
              {t.warningCenter}
            </Link>

            <Link
              to="/field-report"
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-bold text-slate-300 hover:border-cyan-400/30 hover:text-cyan-300"
            >
              <Camera size={17} />
              {t.fieldReport}
            </Link>

          </div>

        </div>

        {/* =================================================
            PRIORITY LOCATIONS
        ================================================== */}

        <div className="mt-6">

          <div className="mb-3 flex items-center justify-between">

            <div>

              <h2 className="text-lg font-bold">
                {t.riskPriority}
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                {t.clickRegion}
              </p>

            </div>

          </div>

          <div className="grid gap-3 sm:grid-cols-2">

            {dynamicLocations.map(
              (location) => {

                const isActive =
                  activeRegion ===
                  location.name;

                return (
                  <button
                    key={location.name}
                    onClick={() =>
                      fetchRegionData(
                        location.name
                      )
                    }
                    className={`w-full rounded-2xl border p-4 text-left transition duration-300 ${
                      isActive
                        ? "border-cyan-400/50 bg-cyan-900/10"
                        : "border-slate-800 bg-slate-900/70 hover:border-slate-600"
                    }`}
                  >

                    <div className="flex items-center justify-between">

                      <div className="flex items-center gap-3">

                        <div
                          className={`rounded-xl p-2 ${
                            isActive
                              ? "bg-cyan-950 text-cyan-400"
                              : "bg-slate-800 text-slate-400"
                          }`}
                        >

                          <Mountain
                            size={20}
                            className={
                              isActive
                                ? ""
                                : riskColor(
                                    location.risk
                                  )
                            }
                          />

                        </div>

                        <div>

                          <p className="font-bold">
                            {location.name}
                          </p>

                          <p className="text-xs text-slate-500">
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
                          className={`text-[10px] font-bold ${riskColor(
                            location.risk
                          )}`}
                        >
                          {location.level ===
                          "CRITICAL"
                            ? t.critical
                            : location.level ===
                              "WARNING"
                            ? t.warning
                            : t.safe}
                        </p>

                      </div>

                    </div>

                    {/* RISK BAR */}

                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-800">

                      <div
                        className={`h-full rounded-full ${riskBg(
                          location.risk
                        )}`}
                        style={{
                          width: `${Math.min(
                            location.risk,
                            100
                          )}%`,
                        }}
                      />

                    </div>

                  </button>
                );
              }
            )}

          </div>

        </div>

        {/* =================================================
            DYNAMIC RISK FACTORS
        ================================================== */}

        <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-5">

          <div className="flex items-center justify-between">

            <div>

              <div className="flex items-center gap-2">

                <h2 className="font-bold">
                  {activeRegion}{" "}
                  {t.baseFactors}
                </h2>

                {liveData.isLive ? (

                  <span className="flex items-center gap-1 rounded-full bg-green-500/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-green-400">

                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-400" />

                    {t.liveDataLinked}

                  </span>

                ) : (

                  <span className="flex items-center gap-1 rounded-full bg-cyan-500/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-cyan-400">

                    <Loader2
                      size={10}
                      className="animate-spin"
                    />

                    {t.fetchingGPS}

                  </span>

                )}

              </div>

              <p className="text-xs text-slate-500">
                10{" "}
                {t.parametersPydantic}
              </p>

            </div>

            <Link
              to="/predict"
              className="text-xs font-bold text-cyan-400"
            >
              {t.analyze}
            </Link>

          </div>

          {/* 10 FACTORS */}

          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">

            {riskFactors.map(
              ([name, value]) => (

                <div
                  key={name}
                  className="rounded-xl bg-slate-950/60 p-3"
                >

                  <p className="text-[10px] text-slate-500">
                    {name}
                  </p>

                  <p className="mt-1 text-sm font-bold text-cyan-400">
                    {value}
                  </p>

                </div>

              )
            )}

          </div>

        </div>

        {/* =================================================
            AI ASSISTANT
        ================================================== */}

        <AIAssistant />

        {/* =================================================
            DATA STATUS
        ================================================== */}

        <div className="mt-6">

          <div className="mb-3 flex items-center gap-2">

            <Activity
              size={18}
              className="text-cyan-400"
            />

            <h2 className="text-lg font-bold">
              Data Status
            </h2>

          </div>

          <div className="grid gap-3 sm:grid-cols-3">

            {/* WEATHER */}

            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">

              <CloudRain
                size={18}
                className="text-cyan-400"
              />

              <p className="mt-2 text-xs font-bold">
                {t.weatherLinked}
              </p>

              <p className="mt-1 text-[10px] text-slate-500">
                {t.openMeteoLive}
              </p>

            </div>

            {/* ML BACKEND */}

            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">

              <Activity
                size={18}
                className="text-green-400"
              />

              <p className="mt-2 text-xs font-bold">
                {t.mlBackend}
              </p>

              <p className="mt-1 text-[10px] text-slate-500">
                {t.randomForest}
              </p>

            </div>

            {/* ROUTING */}

            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">

              <Route
                size={18}
                className="text-orange-400"
              />

              <p className="mt-2 text-xs font-bold">
                {t.routingSync}
              </p>

              <p className="mt-1 text-[10px] text-slate-500">
                {t.roadDistance}
              </p>

            </div>

          </div>

        </div>

        {/* =================================================
            PRODUCTION ARCHITECTURE
        ================================================== */}

        <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/50 p-5">

          <div className="flex items-center gap-2">

            <ShieldAlert
              size={18}
              className="text-cyan-400"
            />

            <h2 className="font-bold">
              {t.productionArchitecture}
            </h2>

          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">

            {/* FRONTEND */}

            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">

              <div className="flex items-center gap-2">

                <Radio
                  size={18}
                  className="text-cyan-400"
                />

                <p className="text-xs font-bold">
                  {t.vercelFrontend}
                </p>

              </div>

              <p className="mt-2 text-[10px] leading-4 text-slate-500">
                React + Vite +
                Tailwind dashboard
              </p>

            </div>

            {/* BACKEND */}

            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">

              <div className="flex items-center gap-2">

                <Brain
                  size={18}
                  className="text-green-400"
                />

                <p className="text-xs font-bold">
                  {t.fastapiBackend}
                </p>

              </div>

              <p className="mt-2 text-[10px] leading-4 text-slate-500">
                Risk prediction and
                ML inference
              </p>

            </div>

            {/* EXTERNAL APIs */}

            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">

              <div className="flex items-center gap-2">

                <Route
                  size={18}
                  className="text-orange-400"
                />

                <p className="text-xs font-bold">
                  External APIs
                </p>

              </div>

              <p className="mt-2 text-[10px] leading-4 text-slate-500">
                Open-Meteo • OSRM • USGS
              </p>

            </div>

          </div>

          <p className="mt-6 text-center text-[10px] leading-4 text-slate-600">
            {t.vercelFrontend} •{" "}
            {t.fastapiBackend}
          </p>

        </div>

      </div>
    </div>
  );
}

export default Dashboard;