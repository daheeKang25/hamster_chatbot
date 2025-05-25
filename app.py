from flask import Flask, render_template, request, jsonify
import pickle
import numpy as np

app = Flask(__name__)

# 모델 로드
with open("ham_model.pkl", "rb") as f:
    model = pickle.load(f)
with open("vectorizer.pkl", "rb") as f:
    vectorizer = pickle.load(f)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/predict", methods=["POST"])
def predict():
    user_input = request.json.get("message", "")
    X = vectorizer.transform([user_input])
    prob = model.predict_proba(X)[0]
    label = int(np.argmax(prob))
    confidence = float(np.max(prob))  # 최대 확률을 confidence로 사용
    return jsonify({"result": label, "confidence": confidence})

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)

