import pandas as pd
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB
import pickle
import os
import re

#전처리 함수 추가
def preprocess(text) :
    text = text.lower()
    text = re.sub(r'[^ㄱ-ㅎ가-힣a-zA-Z0-9 ]', '', text)
    return text.strip()

# 상위 경로 (프로젝트 루트)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# CSV 파일 경로
csv_path = os.path.join(BASE_DIR, 'modeltrain', 'hamburger_data.csv')
df = pd.read_csv(csv_path)

# 벡터화
vectorizer = CountVectorizer()
X = vectorizer.fit_transform(df['text'])
y = df['label']

# 모델 훈련
model = MultinomialNB()
model.fit(X, y)

# 모델 및 벡터 저장 경로
model_path = os.path.join(BASE_DIR, 'ham_model.pkl')
vectorizer_path = os.path.join(BASE_DIR, 'vectorizer.pkl')

with open(model_path, "wb") as f:
    pickle.dump(model, f)

with open(vectorizer_path, "wb") as f:
    pickle.dump(vectorizer, f)

print("모델저장 완료!")
