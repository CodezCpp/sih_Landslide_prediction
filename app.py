import streamlit as st
import requests

st.title("🏔️ SIH Landslide Risk Predictor")
st.markdown("Enter the geotechnical and environmental parameters to assess structural vulnerability.")

# Create two columns for a cleaner dashboard layout
col1, col2 = st.columns(2)

with col1:
    soil_saturation = st.slider("Soil Saturation (0.0 - 1.0)", 0.0, 1.0, 0.15)
    slope_angle = st.number_input("Slope Angle (Degrees)", min_value=0.0, max_value=90.0, value=55.0)
    rainfall_72h = st.number_input("72h Cumulative Rainfall (mm)", min_value=0.0, value=0.0)
    rainfall_24h = st.number_input("24h Rainfall (mm)", min_value=0.0, value=0.0)
    earthquake = st.number_input("Earthquake Activity (Magnitude)", min_value=0.0, max_value=10.0, value=0.0)

with col2:
    lithology = st.slider("Lithology Weakness (0.0 - 1.0)", 0.0, 1.0, 0.65)
    crack_width = st.number_input("Surface Crack Width (cm)", min_value=0.0, value=0.0)
    hill_cutting = st.slider("Hill Cutting Severity (0.0 - 1.0)", 0.0, 1.0, 0.95)
    road_dist = st.number_input("Distance to Road (m)", min_value=0.0, value=1.5)
    hist_failures = st.number_input("Historical Failure Count", min_value=0, step=1, value=0)

if st.button("Predict Landslide Risk", type="primary"):
    # Match the exact keys from your FastAPI SensorPayload
    payload = {
        "Soil_Saturation": soil_saturation,
        "Slope_Angle": slope_angle,
        "Rainfall_72h_mm": rainfall_72h,
        "Rainfall_mm": rainfall_24h,
        "Earthquake_Activity": earthquake,
        "Lithology_Weakness": lithology,
        "Surface_Crack_Width_cm": crack_width,
        "Hill_Cutting_Severity": hill_cutting,
        "Distance_to_Road_m": road_dist,
        "Historical_Failure_Count": hist_failures
    }

    try:
        # Send the payload to your local Uvicorn server
        response = requests.post("http://127.0.0.1:8000/predict", json=payload)
        response.raise_for_status()
        data = response.json()
        
        prob = data["probability_percentage"]
        status = data["status"]

        # Display dynamic UI alerts based on the backend emojis
        st.subheader(f"Probability of Failure: {prob}%")
        
        if "DANGER" in status:
            st.error(f"Status: {status} - Immediate Evacuation Recommended")
        elif "WARNING" in status:
            st.warning(f"Status: {status} - High Vulnerability, Monitor Closely")
        else:
            st.success(f"Status: {status} - Structural Integrity Stable")
            
    except requests.exceptions.ConnectionError:
        st.error("Backend offline. Ensure FastAPI is running on port 8000.")