import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
import joblib

# Load dataset (replace with your actual dataset filename)
df = pd.read_csv("crop_model.csv")  # must contain columns: N,P,K,temperature,humidity,ph,rainfall,label

# Separate features and target
X = df.drop("label", axis=1)
y = df["label"]

# Train/test split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# Train Random Forest model
model = RandomForestClassifier(
    n_estimators=200,       # more trees → more stable
    max_depth=None,         # let trees grow fully
    random_state=42,
    n_jobs=-1               # use all CPU cores
)
model.fit(X_train, y_train)

# Evaluate model
y_pred = model.predict(X_test)
acc = accuracy_score(y_test, y_pred)
print(f"✅ Model trained. Accuracy: {acc:.2f}")
print("\nClassification Report:\n", classification_report(y_test, y_pred))

# Save model to file
joblib.dump(model, "crop_model.pkl")
print("📦 Model saved as crop_model.pkl")
