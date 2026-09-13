import { createContext, useContext, useState } from "react";

const LanguageContext = createContext(null);

const translations = {
  // =========================================================
  // ENGLISH
  // =========================================================
  en: {
    landslideMonitor: "Landslide Risk Monitoring System",
    aiEarlyWarning: "AI-Powered Early Warning & Telemetry Dashboard",

    latestML: "Latest ML Inference",
    liveBaseline: "Live Baseline Data",
    liveTelemetry: "Live Telemetry",
    fetchingTelemetry: "Fetching Telemetry...",
    syncedOpenMeteo: "Synced via Open-Meteo GPS Coordinates",
    syncedApis: "Synced via Open-Meteo, OSRM, & USGS APIs",

    criticalMessage:
      "Critical risk threshold exceeded. Immediate district alert protocols active.",
    warningMessage:
      "Elevated environmental stress detected. Heightened monitoring required.",
    safeMessage:
      "Parameters within nominal safety baselines.",

    viewRiskMap: "View Risk Map",
    runDeepInference: "Run Deep Inference",

    criticalZones: "Critical Zones",
    rainfall72h: "Rainfall (72h)",
    apiAggregator: "API Aggregator",
    osrmMapping: "OSRM Mapping",
    osrmUsgsApis: "OSRM & USGS APIs",

    quickActions: "Quick Actions",
    riskMap: "Risk Map",
    aiPrediction: "AI Prediction",
    warningCenter: "Warning Center",
    fieldReport: "Field Report",

    riskForecast: "24-Hour Risk Forecast",
    predictedRiskTrend: "Predicted landslide risk trend",

    riskPriority: "Priority Locations",
    clickRegion: "Click a region to fetch live telemetry",

    baseFactors: "Base Factors",
    liveDataLinked: "Field-Capacity API Linked",
    fetchingGPS: "Fetching GPS...",
    parametersPydantic:
      "10 Monitored Parameters formatted for Pydantic Schema",
    analyze: "Analyze",

    rainfall: "Rainfall (72h)",
    soilSaturation: "Soil Saturation",
    slopeAngle: "Slope Angle",
    currentRainfall: "Current Rainfall",
    hillCutting: "Hill Cutting Severity",
    lithologyWeakness: "Lithology Weakness",
    historicalFailures: "Historical Failures",
    surfaceCrack: "Surface Crack Width",
    distanceRoad: "Distance to Road",
    earthquakeActivity: "Earthquake Activity",

    weatherLinked: "Weather-linked",
    openMeteoLive: "Open-Meteo API (Live)",
    mlBackend: "ML Backend",
    randomForest: "Random Forest via Ngrok",
    routingSync: "Routing Sync",
    roadDistance: "OSRM Road Distance API",

    productionArchitecture: "Production Architecture",
    vercelFrontend: "Vercel Frontend",
    fastapiBackend: "FastAPI Backend",

    critical: "CRITICAL",
    warning: "WARNING",
    safe: "SAFE",
    events: "events",
  },

  // =========================================================
  // ASSAMESE
  // =========================================================
  as: {
    landslideMonitor: "ভূমিস্খলন নিৰীক্ষণ ব্যৱস্থা",
    aiEarlyWarning:
      "AI-ভিত্তিক আগতীয়া সতৰ্কবাণী আৰু টেলিমেট্ৰি ডেশ্বব'ৰ্ড",

    latestML: "শেহতীয়া ML অনুমান",
    liveBaseline: "লাইভ বেছলাইন ডাটা",
    liveTelemetry: "লাইভ টেলিমেট্ৰি",
    fetchingTelemetry: "টেলিমেট্ৰি সংগ্ৰহ হৈ আছে...",
    syncedOpenMeteo: "Open-Meteo GPS স্থানাংকৰ সৈতে সংযুক্ত",
    syncedApis:
      "Open-Meteo, OSRM আৰু USGS API-ৰ সৈতে সংযুক্ত",

    criticalMessage:
      "অতি বিপদজনক সীমা অতিক্ৰম কৰা হৈছে। তাৎক্ষণিক জিলা সতৰ্কতা প্ৰট'কল সক্ৰিয় কৰা হৈছে।",
    warningMessage:
      "পৰিৱেশৰ চাপ বৃদ্ধি পাইছে। অধিক নিৰীক্ষণ প্ৰয়োজন।",
    safeMessage:
      "পেৰামিটাৰসমূহ বৰ্তমান সুৰক্ষিত সীমাৰ ভিতৰত আছে।",

    viewRiskMap: "বিপদৰ মানচিত্ৰ চাওক",
    runDeepInference: "Deep Inference চলাওক",

    criticalZones: "অতি বিপদজনক অঞ্চল",
    rainfall72h: "৭২ ঘণ্টাৰ বৰষুণ",
    apiAggregator: "API Aggregator",
    osrmMapping: "OSRM Mapping",
    osrmUsgsApis: "OSRM আৰু USGS APIs",

    quickActions: "দ্ৰুত কাৰ্য",
    riskMap: "বিপদৰ মানচিত্ৰ",
    aiPrediction: "AI অনুমান",
    warningCenter: "সতৰ্কবাণী কেন্দ্ৰ",
    fieldReport: "ক্ষেত্ৰ প্ৰতিবেদন",

    riskForecast: "২৪ ঘণ্টাৰ বিপদ অনুমান",
    predictedRiskTrend:
      "ভূমিস্খলনৰ অনুমান কৰা বিপদৰ ধাৰা",

    riskPriority: "অগ্ৰাধিকাৰ স্থানসমূহ",
    clickRegion:
      "লাইভ টেলিমেট্ৰি পাবলৈ অঞ্চলত ক্লিক কৰক",

    baseFactors: "মূল বিপদ কাৰক",
    liveDataLinked: "Field-Capacity API সংযুক্ত",
    fetchingGPS: "GPS সংগ্ৰহ হৈ আছে...",
    parametersPydantic:
      "Pydantic Schema-ৰ বাবে ১০টা পেৰামিটাৰ প্ৰস্তুত",
    analyze: "বিশ্লেষণ",

    rainfall: "৭২ ঘণ্টাৰ বৰষুণ",
    soilSaturation: "মাটিৰ আৰ্দ্ৰতা",
    slopeAngle: "ঢালৰ কোণ",
    currentRainfall: "বৰ্তমান বৰষুণ",
    hillCutting: "পাহাৰ কটা",
    lithologyWeakness: "ভূতাত্ত্বিক দুৰ্বলতা",
    historicalFailures: "পূৰ্বৰ ভূমিস্খলন",
    surfaceCrack: "পৃষ্ঠৰ ফাট",
    distanceRoad: "পথৰ পৰা দূৰত্ব",
    earthquakeActivity: "ভূমিকম্প কাৰ্যকলাপ",

    weatherLinked: "বতৰৰ সৈতে সংযুক্ত",
    openMeteoLive: "Open-Meteo API (Live)",
    mlBackend: "ML Backend",
    randomForest: "Random Forest via Ngrok",
    routingSync: "Routing Sync",
    roadDistance: "OSRM Road Distance API",

    productionArchitecture: "Production Architecture",
    vercelFrontend: "Vercel Frontend",
    fastapiBackend: "FastAPI Backend",

    critical: "অতি বিপদ",
    warning: "সতৰ্কবাণী",
    safe: "সুৰক্ষিত",
    events: "ঘটনা",
  },

  // =========================================================
  // BENGALI
  // =========================================================
  bn: {
    landslideMonitor: "ভূমিধস পর্যবেক্ষণ ব্যবস্থা",
    aiEarlyWarning:
      "AI-চালিত আগাম সতর্কতা ও টেলিমেট্রি ড্যাশবোর্ড",

    latestML: "সর্বশেষ ML অনুমান",
    liveBaseline: "লাইভ বেসলাইন ডেটা",
    liveTelemetry: "লাইভ টেলিমেট্রি",
    fetchingTelemetry: "টেলিমেট্রি সংগ্রহ হচ্ছে...",
    syncedOpenMeteo:
      "Open-Meteo GPS অবস্থানের সাথে সংযুক্ত",
    syncedApis:
      "Open-Meteo, OSRM এবং USGS API-এর সাথে সংযুক্ত",

    criticalMessage:
      "গুরুতর ঝুঁকির সীমা অতিক্রম করেছে। অবিলম্বে জেলা সতর্কতা প্রোটোকল সক্রিয় করা হয়েছে।",
    warningMessage:
      "পরিবেশগত চাপ বৃদ্ধি পেয়েছে। আরও পর্যবেক্ষণ প্রয়োজন।",
    safeMessage:
      "পরামিতিগুলি বর্তমানে নিরাপদ সীমার মধ্যে রয়েছে।",

    viewRiskMap: "ঝুঁকি মানচিত্র দেখুন",
    runDeepInference: "Deep Inference চালান",

    criticalZones: "গুরুতর ঝুঁকিপূর্ণ অঞ্চল",
    rainfall72h: "৭২ ঘণ্টার বৃষ্টিপাত",
    apiAggregator: "API Aggregator",
    osrmMapping: "OSRM Mapping",
    osrmUsgsApis: "OSRM ও USGS APIs",

    quickActions: "দ্রুত কার্যক্রম",
    riskMap: "ঝুঁকি মানচিত্র",
    aiPrediction: "AI পূর্বাভাস",
    warningCenter: "সতর্কতা কেন্দ্র",
    fieldReport: "ফিল্ড রিপোর্ট",

    riskForecast: "২৪ ঘণ্টার ঝুঁকি পূর্বাভাস",
    predictedRiskTrend:
      "পূর্বাভাসিত ভূমিধস ঝুঁকির প্রবণতা",

    riskPriority: "অগ্রাধিকার স্থানসমূহ",
    clickRegion:
      "লাইভ টেলিমেট্রি পেতে অঞ্চল নির্বাচন করুন",

    baseFactors: "মূল ঝুঁকি উপাদান",
    liveDataLinked: "Field-Capacity API সংযুক্ত",
    fetchingGPS: "GPS সংগ্রহ হচ্ছে...",
    parametersPydantic:
      "Pydantic Schema-এর জন্য ১০টি প্যারামিটার প্রস্তুত",
    analyze: "বিশ্লেষণ",

    rainfall: "৭২ ঘণ্টার বৃষ্টিপাত",
    soilSaturation: "মাটির জলীয় পরিপূর্ণতা",
    slopeAngle: "ঢালের কোণ",
    currentRainfall: "বর্তমান বৃষ্টিপাত",
    hillCutting: "পাহাড় কাটা",
    lithologyWeakness: "ভূতাত্ত্বিক দুর্বলতা",
    historicalFailures: "ঐতিহাসিক ভূমিধস",
    surfaceCrack: "ভূ-পৃষ্ঠের ফাটল",
    distanceRoad: "রাস্তা থেকে দূরত্ব",
    earthquakeActivity: "ভূমিকম্প কার্যকলাপ",

    weatherLinked: "আবহাওয়ার সাথে সংযুক্ত",
    openMeteoLive: "Open-Meteo API (Live)",
    mlBackend: "ML Backend",
    randomForest: "Random Forest via Ngrok",
    routingSync: "Routing Sync",
    roadDistance: "OSRM Road Distance API",

    productionArchitecture: "Production Architecture",
    vercelFrontend: "Vercel Frontend",
    fastapiBackend: "FastAPI Backend",

    critical: "গুরুতর",
    warning: "সতর্কতা",
    safe: "নিরাপদ",
    events: "ঘটনা",
  },

  // =========================================================
  // NEPALI
  // =========================================================
  ne: {
    landslideMonitor: "पहिरो जोखिम निगरानी प्रणाली",
    aiEarlyWarning:
      "AI-आधारित प्रारम्भिक चेतावनी र टेलिमेट्री ड्यासबोर्ड",

    latestML: "पछिल्लो ML अनुमान",
    liveBaseline: "लाइभ बेसलाइन डेटा",
    liveTelemetry: "लाइभ टेलिमेट्री",
    fetchingTelemetry: "टेलिमेट्री सङ्कलन हुँदैछ...",
    syncedOpenMeteo:
      "Open-Meteo GPS स्थानसँग सिंक गरिएको",
    syncedApis:
      "Open-Meteo, OSRM र USGS API सँग जडान गरिएको",

    criticalMessage:
      "गम्भीर जोखिमको सीमा नाघेको छ। तत्काल जिल्ला चेतावनी प्रोटोकल सक्रिय गरिएको छ।",
    warningMessage:
      "वातावरणीय दबाब बढेको छ। थप निगरानी आवश्यक छ।",
    safeMessage:
      "प्यारामिटरहरू हाल सुरक्षित सीमाभित्र छन्।",

    viewRiskMap: "जोखिम नक्सा हेर्नुहोस्",
    runDeepInference: "Deep Inference चलाउनुहोस्",

    criticalZones: "गम्भीर जोखिम क्षेत्र",
    rainfall72h: "७२ घण्टाको वर्षा",
    apiAggregator: "API Aggregator",
    osrmMapping: "OSRM Mapping",
    osrmUsgsApis: "OSRM र USGS APIs",

    quickActions: "द्रुत कार्यहरू",
    riskMap: "जोखिम नक्सा",
    aiPrediction: "AI पूर्वानुमान",
    warningCenter: "चेतावनी केन्द्र",
    fieldReport: "फिल्ड रिपोर्ट",

    riskForecast: "२४ घण्टाको जोखिम पूर्वानुमान",
    predictedRiskTrend:
      "पूर्वानुमान गरिएको पहिरो जोखिम प्रवृत्ति",

    riskPriority: "प्राथमिकता स्थानहरू",
    clickRegion:
      "लाइभ टेलिमेट्री प्राप्त गर्न क्षेत्र चयन गर्नुहोस्",

    baseFactors: "मुख्य जोखिम कारक",
    liveDataLinked: "Field-Capacity API जडान",
    fetchingGPS: "GPS सङ्कलन हुँदैछ...",
    parametersPydantic:
      "Pydantic Schema का लागि १० प्यारामिटर तयार",
    analyze: "विश्लेषण",

    rainfall: "७२ घण्टाको वर्षा",
    soilSaturation: "माटोको संतृप्ति",
    slopeAngle: "ढलान कोण",
    currentRainfall: "हालको वर्षा",
    hillCutting: "पहाड कटान",
    lithologyWeakness: "भूगर्भीय कमजोरी",
    historicalFailures: "ऐतिहासिक पहिरो",
    surfaceCrack: "सतहको चिरा",
    distanceRoad: "सडकदेखि दूरी",
    earthquakeActivity: "भूकम्प गतिविधि",

    weatherLinked: "मौसमसँग जोडिएको",
    openMeteoLive: "Open-Meteo API (Live)",
    mlBackend: "ML Backend",
    randomForest: "Random Forest via Ngrok",
    routingSync: "Routing Sync",
    roadDistance: "OSRM Road Distance API",

    productionArchitecture: "Production Architecture",
    vercelFrontend: "Vercel Frontend",
    fastapiBackend: "FastAPI Backend",

    critical: "गम्भीर",
    warning: "चेतावनी",
    safe: "सुरक्षित",
    events: "घटनाहरू",
  },

  // =========================================================
  // MIZO
  // =========================================================
  lus: {
    landslideMonitor: "Leilung Ngawlhna System",
    aiEarlyWarning:
      "AI hmanga Vauhawm leh Telemetry Monitoring Dashboard",

    latestML: "ML Prediction Thar Ber",
    liveBaseline: "Live Baseline Data",
    liveTelemetry: "Live Telemetry",
    fetchingTelemetry: "Telemetry lak mek...",
    syncedOpenMeteo:
      "Open-Meteo GPS Coordinates nen sync",
    syncedApis:
      "Open-Meteo, OSRM leh USGS API te nen inzawm",

    criticalMessage:
      "Risk sang tak limit a paltlang. District warning protocol chu active a ni.",
    warningMessage:
      "Environment pressure sang zawk a ni. Vilna nasa zawk a ngai.",
    safeMessage:
      "Parameter-te hi tunah safe limit chhunga an awm.",

    viewRiskMap: "Risk Map en",
    runDeepInference: "Deep Inference run",

    criticalZones: "Risk sang ber khuate",
    rainfall72h: "Darkar 72 chhung ruah",
    apiAggregator: "API Aggregator",
    osrmMapping: "OSRM Mapping",
    osrmUsgsApis: "OSRM & USGS APIs",

    quickActions: "Hna rang zawngte",
    riskMap: "Risk Map",
    aiPrediction: "AI Prediction",
    warningCenter: "Vauhawm Centre",
    fieldReport: "Field Report",

    riskForecast: "Darkar 24 chhung Risk Prediction",
    predictedRiskTrend:
      "Landslide risk prediction trend",

    riskPriority: "Hmun pawimawh zawngte",
    clickRegion:
      "Live telemetry data lak turin region thlang rawh",

    baseFactors: "Risk thil pawimawh",
    liveDataLinked: "Field-Capacity API inzawm",
    fetchingGPS: "GPS lak mek...",
    parametersPydantic:
      "Pydantic Schema atan parameters 10 siam",
    analyze: "Enchiang",

    rainfall: "Darkar 72 chhung ruah",
    soilSaturation: "Lei tuihnem zat",
    slopeAngle: "Slope Angle",
    currentRainfall: "Ruah tunlai",
    hillCutting: "Tlang tan",
    lithologyWeakness: "Lei leh lung chak lohna",
    historicalFailures: "Landslide thleng tawh",
    surfaceCrack: "Lei chung crack",
    distanceRoad: "Kawngpui atanga hla zat",
    earthquakeActivity: "Leivung activity",

    weatherLinked: "Weather nen inzawm",
    openMeteoLive: "Open-Meteo API (Live)",
    mlBackend: "ML Backend",
    randomForest: "Random Forest via Ngrok",
    routingSync: "Routing Sync",
    roadDistance: "OSRM Road Distance API",

    productionArchitecture: "Production Architecture",
    vercelFrontend: "Vercel Frontend",
    fastapiBackend: "FastAPI Backend",

    critical: "RISK SANG",
    warning: "VAUHAWM",
    safe: "SAFE",
    events: "thil thleng",
  },
};

// =========================================================
// LANGUAGE PROVIDER
// =========================================================

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState("en");

  const changeLanguage = (lang) => {
    setLanguage(lang);
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        changeLanguage,
        t: translations[language] || translations.en,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

// =========================================================
// CUSTOM HOOK
// =========================================================

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error(
      "useLanguage must be used inside LanguageProvider"
    );
  }

  return context;
}