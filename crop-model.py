from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd

app = Flask(__name__)
CORS(app)

# Load your ML model
model = joblib.load("crop_model.pkl")

# Load your CSV once at startup
# (Download CSV from Agmarknet / data.gov.in and save as prices.csv)
prices_df = pd.read_csv("prices.csv")

@app.route('/')
def home():
    return "🌾 Crop Recommendation + Local Price API running!"

# ---- Crop Recommendation Route ----
@app.route('/recommend-crop', methods=['POST'])
def recommend_crop():
    data = request.get_json()
    N = float(data.get('N'))
    P = float(data.get('P'))
    K = float(data.get('K'))
    temperature = float(data.get('temperature'))
    humidity = float(data.get('humidity'))
    ph = float(data.get('ph'))
    rainfall = float(data.get('rainfall'))

    features = [[N, P, K, temperature, humidity, ph, rainfall]]

    # Get prediction probabilities for all crops
    probs = model.predict_proba(features)[0]
    crop_probs = dict(zip(model.classes_, probs))

    # Sort by probability & take top 3
    top3 = sorted(crop_probs.items(), key=lambda x: x[1], reverse=True)[:3]

    recommendations = [
        {"crop": crop, "probability": round(prob * 100, 2)}
        for crop, prob in top3
    ]

    return jsonify({"recommended_crops": recommendations})

@app.route('/prices', methods=['GET'])
def get_prices():
    print(">>> Full request.args:", request.args)

    commodity = request.args.get("commodity") or request.args.get("Commodity")
    market = request.args.get("market") or request.args.get("Market")

    df = prices_df.rename(columns=lambda x: x.replace("x0020_", "").strip())

    results = df[
        (df['Commodity'].str.lower().str.contains(commodity.lower(), na=False)) &
        (df['Market'].str.lower().str.contains(market.lower(), na=False))
    ]

    if results.empty:
        return jsonify([])  # return empty array (not object)

    records = results.to_dict(orient="records")
    print("Returning records:", records)  # debug
    return jsonify(records)  # always array



if __name__ == '__main__':
    app.run(host='0.0.0.0', port=10000)
