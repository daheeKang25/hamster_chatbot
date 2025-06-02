from flask import Flask, render_template, request, jsonify
import pickle
import json
import numpy as np
import re
import pandas as pd

app = Flask(__name__)

#전처리 함수 정의(render에서 okt를 못읽어서 호환성 위해 okt부분 app.py에서만 삭제)
def preprocess(text):
    text = str(text).lower()
    text = re.sub(r'[^ㄱ-ㅎ가-힣a-zA-Z0-9]', ' ', text)
    return text.strip()
#rules 불러오기
with open("rules.json", "r", encoding="utf-8") as f:
    rules = json.load(f)
#텍스트 무조건 분류함수
def rule_based_prediction(text):
    if text in rules.get("yes", []):
        return 1
    elif text in rules.get("no", []):
        return 0
    return None

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

    # 절대 데이터값 우선 처리
    rule_result = rule_based_prediction(user_input)
    if rule_result is not None:
        return jsonify({"result": rule_result, "confidence": 1.0})

    #모델 기반 예측
    preprocessed_input = preprocess(user_input)
    X = vectorizer.transform([preprocessed_input])
    prob = model.predict_proba(X)[0]
    label = int(np.argmax(prob))
    confidence = float(np.max(prob))
    return jsonify({"result": label, "confidence": confidence})


@app.route("/view-data")
def view_data():
    df = pd.read_csv("modeltrain/hamburger_data.csv")
    pos = df[df['label'] == 1]['text'].tolist()
    neg = df[df['label'] == 0]['text'].tolist()
    return render_template("view_data.html", positive=pos, negative=neg)

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)

