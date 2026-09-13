from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import joblib
import numpy as np

app = FastAPI(title="Hybrid Landslide Prediction & Expert System")

# 1. CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Load ML Artifacts
try:
    model = joblib.load("landslide_model.pkl")
    scaler = joblib.load("scaler.pkl")
except Exception as e:
    print(f"Error loading ML artifacts: {e}")

# 3. Strict Data Validation (10 features matching training order)
class SensorPayload(BaseModel):
    Soil_Saturation: float = Field(..., ge=0.0, le=1.0)
    Slope_Angle: float = Field(..., ge=0.0, le=90.0)
    Rainfall_72h_mm: float = Field(..., ge=0.0)
    Rainfall_mm: float = Field(..., ge=0.0)
    Earthquake_Activity: float = Field(..., ge=0.0)
    Lithology_Weakness: float = Field(..., ge=0.0, le=1.0)
    Surface_Crack_Width_cm: float = Field(..., ge=0.0)
    Hill_Cutting_Severity: float = Field(..., ge=0.0, le=1.0)
    Distance_to_Road_m: float = Field(..., ge=0.0)
    Historical_Failure_Count: int = Field(..., ge=0)

@app.get("/")
def read_root():
    return {"message": "Hybrid Landslide Prediction API is active."}

@app.get("/health")
def health_check():
    return {
        "status": "online",
        "model_loaded": True if model and scaler else False
    }

@app.post("/predict")
def predict_landslide(data: SensorPayload):
    try:
        # Prepare features for ML model
        features = np.array([[
            data.Rainfall_mm,
            data.Slope_Angle,
            data.Soil_Saturation,
            data.Earthquake_Activity,
            data.Rainfall_72h_mm,
            data.Distance_to_Road_m,
            data.Lithology_Weakness,
            data.Historical_Failure_Count,
            data.Hill_Cutting_Severity,
            data.Surface_Crack_Width_cm
        ]])

        # Base Machine Learning Inference
        prediction = model.predict(features)[0]
        probability = model.predict_proba(features)[0][1]
        prob_pct = round((probability * 100)-15, 2)
        
        if prob_pct >= 65.0:
            alert_status = "DANGER 🔴"
        elif prob_pct >= 35.0:
            alert_status = "WARNING 🟠"
        else:
            alert_status = "SAFE 🟢"

        # OVERRIDE LAYER: 50 Deterministic Geotechnical Guardrails
        boundary_exceeded = False

        if data.Slope_Angle >= 80.0 and data.Lithology_Weakness >= 0.90 and data.Soil_Saturation <= 0.30:
            alert_status = "DANGER 🔴 | CRITICAL EVENT: Brittle Rockfall on Degraded Cliff Face"
            prob_pct = 95.0
            boundary_exceeded = True

        elif data.Historical_Failure_Count >= 3 and (data.Rainfall_mm >= 50.0 or data.Earthquake_Activity >= 3.0):
            alert_status = "DANGER 🔴 | CRITICAL EVENT: Reactivation of Historical Shear Zone"
            prob_pct = 92.0
            boundary_exceeded = True

        elif data.Slope_Angle >= 75.0 and data.Soil_Saturation >= 0.85:
            alert_status = "DANGER 🔴 | CRITICAL EVENT: Hydrostatic Shear Failure on High-Gradient Slope"
            prob_pct = 90.0
            boundary_exceeded = True

        elif data.Surface_Crack_Width_cm >= 5.0 and data.Soil_Saturation >= 0.90:
            alert_status = "DANGER 🔴 | CRITICAL EVENT: Hydrostatic Wedging and Fissure Expansion"
            prob_pct = 94.0
            boundary_exceeded = True

        elif data.Surface_Crack_Width_cm >= 4.0 and data.Soil_Saturation >= 0.85 and data.Slope_Angle >= 45.0:
            alert_status = "DANGER 🔴 | CRITICAL EVENT: Progressive Slump and Impending Liquefaction"
            prob_pct = 88.0
            boundary_exceeded = True

        elif data.Distance_to_Road_m <= 5.0 and data.Hill_Cutting_Severity >= 0.90 and data.Slope_Angle >= 60.0:
            alert_status = "DANGER 🔴 | CRITICAL EVENT: Basal Undercutting Collapse Near Roadway"
            prob_pct = 91.0
            boundary_exceeded = True

        elif data.Hill_Cutting_Severity >= 0.85 and data.Distance_to_Road_m <= 10.0 and data.Rainfall_mm >= 100.0:
            alert_status = "DANGER 🔴 | CRITICAL EVENT: Extreme Highway Excavation Washout"
            prob_pct = 89.0
            boundary_exceeded = True

        elif data.Earthquake_Activity >= 4.0 and data.Soil_Saturation >= 0.80:
            alert_status = "DANGER 🔴 | CRITICAL EVENT: Seismic Liquefaction of Saturated Soil"
            prob_pct = 96.0
            boundary_exceeded = True

        elif data.Rainfall_72h_mm >= 300.0 or data.Rainfall_mm >= 150.0:
            alert_status = "DANGER 🔴 | CRITICAL EVENT: Catastrophic Flash Flood Washout"
            prob_pct = 98.0
            boundary_exceeded = True
            
        elif data.Earthquake_Activity >= 6.0:
            alert_status = "DANGER 🔴 | CRITICAL EVENT: Massive Seismic Shear Plane Failure"
            prob_pct = 99.0
            boundary_exceeded = True

        elif data.Lithology_Weakness >= 0.85 and data.Hill_Cutting_Severity >= 0.85:
            alert_status = "DANGER 🔴 | CRITICAL EVENT: Anthropogenic Excavation Failure in Weak Strata"
            prob_pct = 87.0
            boundary_exceeded = True

        elif data.Surface_Crack_Width_cm >= 10.0:
            alert_status = "DANGER 🔴 | CRITICAL EVENT: Advanced Tension Crack Disconnect"
            prob_pct = 93.0
            boundary_exceeded = True

        elif data.Earthquake_Activity >= 3.5 and data.Rainfall_mm >= 80.0:
            alert_status = "DANGER 🔴 | CRITICAL EVENT: Post-Seismic Hydrostatic Lubrication"
            prob_pct = 91.0
            boundary_exceeded = True

        elif data.Distance_to_Road_m <= 3.0 and data.Soil_Saturation >= 0.95 and data.Slope_Angle >= 45.0:
            alert_status = "DANGER 🔴 | CRITICAL EVENT: Basal Saturation and Toe Blowout"
            prob_pct = 94.0
            boundary_exceeded = True

        elif data.Lithology_Weakness >= 0.95 and data.Surface_Crack_Width_cm >= 8.0:
            alert_status = "DANGER 🔴 | CRITICAL EVENT: Spontaneous Geologic Disintegration"
            prob_pct = 95.0
            boundary_exceeded = True

        elif data.Distance_to_Road_m <= 2.0 and data.Hill_Cutting_Severity >= 0.85 and data.Historical_Failure_Count >= 1 and data.Earthquake_Activity >= 2.5:
            alert_status = "DANGER 🔴 | CRITICAL EVENT: Low-Frequency Vibration Collapse on Fractured Cut"
            prob_pct = 89.0
            boundary_exceeded = True

        elif data.Rainfall_72h_mm >= 250.0 and data.Soil_Saturation >= 0.90 and data.Lithology_Weakness >= 0.65 and data.Slope_Angle >= 35.0:
            alert_status = "DANGER 🔴 | CRITICAL EVENT: Deep-Seated Rotational Shear Plane Detachment"
            prob_pct = 92.0
            boundary_exceeded = True

        elif data.Slope_Angle >= 60.0 and data.Lithology_Weakness >= 0.85 and data.Earthquake_Activity >= 4.5:
            alert_status = "DANGER 🔴 | CRITICAL EVENT: Cohesionless Seismic Shatter of Brittle Strata"
            prob_pct = 96.0
            boundary_exceeded = True

        elif data.Rainfall_72h_mm >= 350.0 and data.Lithology_Weakness >= 0.75 and data.Slope_Angle >= 50.0:
            alert_status = "DANGER 🔴 | CRITICAL EVENT: Internal Subsurface Piping and Basal Blowout"
            prob_pct = 97.0
            boundary_exceeded = True

        elif data.Surface_Crack_Width_cm >= 6.0 and data.Historical_Failure_Count >= 2 and data.Slope_Angle >= 55.0 and data.Lithology_Weakness >= 0.70:
            alert_status = "DANGER 🔴 | CRITICAL EVENT: Accelerated Tension Rupture of Unstable Shear Plane"
            prob_pct = 90.0
            boundary_exceeded = True

        elif data.Rainfall_mm <= 10.0 and data.Rainfall_72h_mm >= 200.0 and data.Soil_Saturation >= 0.85:
            alert_status = "DANGER 🔴 | CRITICAL EVENT: Delayed Post-Storm Pore Pressure Liquefaction"
            prob_pct = 86.0
            boundary_exceeded = True

        elif data.Hill_Cutting_Severity >= 0.95 and data.Distance_to_Road_m <= 1.0 and data.Slope_Angle >= 85.0:
            alert_status = "DANGER 🔴 | CRITICAL EVENT: Catastrophic Oversteepening of Unbuttressed Highway Cut"
            prob_pct = 98.0
            boundary_exceeded = True

        elif data.Surface_Crack_Width_cm >= 4.0 and data.Earthquake_Activity >= 3.5 and data.Slope_Angle >= 50.0:
            alert_status = "DANGER 🔴 | CRITICAL EVENT: Seismically Induced Tension Fracture Propagation"
            prob_pct = 89.0
            boundary_exceeded = True

        elif data.Slope_Angle >= 75.0 and data.Lithology_Weakness >= 0.80 and data.Rainfall_mm >= 120.0:
            alert_status = "DANGER 🔴 | CRITICAL EVENT: Rain-Induced Brittle Rock Avalanche"
            prob_pct = 94.0
            boundary_exceeded = True

        elif data.Distance_to_Road_m <= 2.0 and data.Soil_Saturation >= 0.95 and data.Historical_Failure_Count >= 2:
            alert_status = "DANGER 🔴 | CRITICAL EVENT: Basal Subgrade Liquefaction and Toe Subsidence"
            prob_pct = 92.0
            boundary_exceeded = True

        elif data.Historical_Failure_Count >= 4 and data.Surface_Crack_Width_cm >= 7.0 and data.Slope_Angle >= 40.0:
            alert_status = "DANGER 🔴 | CRITICAL EVENT: Terminal Acceleration of Chronic Creep Zone"
            prob_pct = 91.0
            boundary_exceeded = True

        elif data.Hill_Cutting_Severity >= 0.90 and data.Distance_to_Road_m <= 3.0 and data.Earthquake_Activity >= 2.0 and data.Lithology_Weakness >= 0.70:
            alert_status = "DANGER 🔴 | CRITICAL EVENT: Acoustic/Vibration-Induced Shear on Unbuttressed Cut"
            prob_pct = 88.0
            boundary_exceeded = True

        elif data.Lithology_Weakness >= 0.85 and data.Surface_Crack_Width_cm >= 5.0 and data.Rainfall_mm >= 100.0:
            alert_status = "DANGER 🔴 | CRITICAL EVENT: Deep Fracture-Flow Hydrostatic Blowout"
            prob_pct = 93.0
            boundary_exceeded = True

        elif data.Soil_Saturation >= 0.85 and data.Earthquake_Activity >= 5.0 and data.Rainfall_mm >= 80.0:
            alert_status = "DANGER 🔴 | CRITICAL EVENT: Multi-Hazard Synergistic Topographical Collapse"
            prob_pct = 99.0
            boundary_exceeded = True

        elif data.Rainfall_72h_mm <= 10.0 and data.Surface_Crack_Width_cm >= 12.0 and data.Lithology_Weakness >= 0.90:
            alert_status = "DANGER 🔴 | CRITICAL EVENT: A-Hydrous Gravitational Mass Subsidence"
            prob_pct = 90.0
            boundary_exceeded = True

        elif data.Distance_to_Road_m <= 3.0 and data.Rainfall_72h_mm >= 250.0 and data.Slope_Angle >= 45.0 and data.Soil_Saturation >= 0.85:
            alert_status = "DANGER 🔴 | CRITICAL EVENT: Hydrologically Accelerated Toe Scour and Subsidence"
            prob_pct = 91.0
            boundary_exceeded = True

        elif data.Historical_Failure_Count >= 5 and data.Earthquake_Activity >= 3.0 and data.Lithology_Weakness >= 0.60:
            alert_status = "DANGER 🔴 | CRITICAL EVENT: Kinetic Reactivation of Paleolandslide Shear Plane"
            prob_pct = 94.0
            boundary_exceeded = True

        elif data.Rainfall_72h_mm >= 300.0 and data.Rainfall_mm <= 5.0 and data.Soil_Saturation >= 0.95 and data.Slope_Angle >= 50.0:
            alert_status = "DANGER 🔴 | CRITICAL EVENT: Rapid Drawdown Pore Pressure Imbalance"
            prob_pct = 95.0
            boundary_exceeded = True

        elif data.Hill_Cutting_Severity >= 0.95 and data.Lithology_Weakness >= 0.80 and data.Rainfall_mm >= 20.0 and data.Distance_to_Road_m <= 5.0:
            alert_status = "DANGER 🔴 | CRITICAL EVENT: Frictional Loss via Micro-Lubrication on Unretained Cut"
            prob_pct = 87.0
            boundary_exceeded = True

        elif data.Surface_Crack_Width_cm >= 15.0 and data.Historical_Failure_Count >= 3 and data.Slope_Angle >= 65.0:
            alert_status = "DANGER 🔴 | CRITICAL EVENT: Terminal Aseismic Gravitational Shearing"
            prob_pct = 96.0
            boundary_exceeded = True

        elif data.Hill_Cutting_Severity >= 0.85 and data.Lithology_Weakness >= 0.85 and data.Soil_Saturation >= 0.90:
            alert_status = "DANGER 🔴 | CRITICAL EVENT: Anthropogenic Surcharge on Liquefied Basal Strata"
            prob_pct = 92.0
            boundary_exceeded = True

        elif data.Lithology_Weakness >= 0.95 and data.Slope_Angle >= 55.0 and data.Rainfall_mm >= 60.0:
            alert_status = "DANGER 🔴 | CRITICAL EVENT: Advanced Lithological Disintegration and Debris Flow"
            prob_pct = 93.0
            boundary_exceeded = True

        elif data.Surface_Crack_Width_cm >= 8.0 and data.Slope_Angle >= 70.0 and data.Earthquake_Activity >= 3.5:
            alert_status = "DANGER 🔴 | CRITICAL EVENT: Seismic Resonance Detachment of Fractured Rock Mass"
            prob_pct = 95.0
            boundary_exceeded = True

        elif data.Distance_to_Road_m <= 1.0 and data.Hill_Cutting_Severity >= 0.90 and data.Historical_Failure_Count >= 2:
            alert_status = "DANGER 🔴 | CRITICAL EVENT: Infrastructure-Induced Basal Plane Undermining"
            prob_pct = 91.0
            boundary_exceeded = True

        elif data.Rainfall_72h_mm >= 400.0 and data.Rainfall_mm >= 200.0 and data.Soil_Saturation >= 0.98:
            alert_status = "DANGER 🔴 | CRITICAL EVENT: Complete Monsoonal Subgrade Liquefaction and Mass Wasting"
            prob_pct = 99.9
            boundary_exceeded = True

        elif data.Rainfall_72h_mm == 0.0 and data.Rainfall_mm == 0.0 and data.Soil_Saturation >= 0.90 and data.Historical_Failure_Count >= 1:
            alert_status = "DANGER 🔴 | CRITICAL EVENT: Aseismic Capillary Saturation and Base Yielding"
            prob_pct = 85.0
            boundary_exceeded = True

        elif data.Slope_Angle >= 80.0 and data.Surface_Crack_Width_cm >= 10.0 and data.Distance_to_Road_m <= 1.0 and data.Hill_Cutting_Severity >= 0.80:
            alert_status = "DANGER 🔴 | CRITICAL EVENT: Traffic-Induced Acoustic Resonance on Fractured Overhang"
            prob_pct = 94.0
            boundary_exceeded = True

        elif data.Hill_Cutting_Severity >= 0.90 and data.Lithology_Weakness >= 0.90 and data.Earthquake_Activity >= 3.0:
            alert_status = "DANGER 🔴 | CRITICAL EVENT: Seismic Subsidence of Unconsolidated Fill"
            prob_pct = 90.0
            boundary_exceeded = True

        elif data.Soil_Saturation >= 0.95 and data.Lithology_Weakness >= 0.85 and data.Rainfall_mm <= 10.0:
            alert_status = "DANGER 🔴 | CRITICAL EVENT: Expansive Soil Hydration and Strata Swell Collapse"
            prob_pct = 88.0
            boundary_exceeded = True

        elif data.Surface_Crack_Width_cm >= 8.0 and data.Soil_Saturation >= 0.85 and data.Earthquake_Activity >= 2.5:
            alert_status = "DANGER 🔴 | CRITICAL EVENT: Pre-Seismic Creep Acceleration and Impending Shear"
            prob_pct = 92.0
            boundary_exceeded = True

        elif data.Rainfall_mm >= 100.0 and data.Earthquake_Activity >= 4.5:
            alert_status = "DANGER 🔴 | CRITICAL EVENT: Hydro-Kinetic Shockwave Liquefaction"
            prob_pct = 97.0
            boundary_exceeded = True

        elif data.Slope_Angle >= 85.0 and data.Hill_Cutting_Severity >= 0.95 and data.Historical_Failure_Count >= 1:
            alert_status = "DANGER 🔴 | CRITICAL EVENT: Undermined Structural Overhang Collapse"
            prob_pct = 96.0
            boundary_exceeded = True

        elif data.Rainfall_72h_mm >= 350.0 and data.Distance_to_Road_m <= 1.0 and data.Soil_Saturation >= 0.90:
            alert_status = "DANGER 🔴 | CRITICAL EVENT: Catastrophic Highway Embankment Washout"
            prob_pct = 98.0
            boundary_exceeded = True

        elif data.Slope_Angle >= 70.0 and data.Lithology_Weakness >= 0.95 and data.Rainfall_72h_mm <= 10.0:
            alert_status = "DANGER 🔴 | CRITICAL EVENT: Gravitational Tearing of Degraded Escarpment"
            prob_pct = 89.0
            boundary_exceeded = True

        elif data.Hill_Cutting_Severity >= 1.0 and data.Lithology_Weakness >= 0.90 and data.Distance_to_Road_m <= 1.0 and data.Slope_Angle >= 60.0:
            alert_status = "DANGER 🔴 | CRITICAL EVENT: Absolute Structural Yield and Systematic Failure"
            prob_pct = 99.5
            boundary_exceeded = True

        # Final Response Packaging
        return {
            "landslide_risk": 1 if "DANGER" in alert_status or boundary_exceeded else int(prediction),
            "probability_percentage": prob_pct,
            "status": alert_status
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))