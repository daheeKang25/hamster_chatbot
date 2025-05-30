import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
import pickle
import os
import re
from konlpy.tag import Okt

# 형태소 분석기
okt = Okt()

# 전처리 함수 정의
def preprocess(text):
    text = str(text).lower()
    text = re.sub(r'[^ㄱ-ㅎ가-힣a-zA-Z0-9 ]', '', text)
    tokens = okt.morphs(text)  # 형태소 분석
    return ' '.join(tokens)

# 상위 경로 (프로젝트 루트)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# CSV 파일 경로
csv_path = os.path.join(BASE_DIR, 'modeltrain', 'hamburger_data.csv')
df = pd.read_csv(csv_path)

# 전처리 적용
df['text'] = df['text'].apply(preprocess)

# 벡터화
vectorizer = TfidfVectorizer()
X = vectorizer.fit_transform(df['text'])
y = df['label']

# 모델 훈련
model = LogisticRegression(max_iter=1000)
model.fit(X, y)

# 모델 및 벡터 저장
model_path = os.path.join(BASE_DIR, 'ham_model.pkl')
vectorizer_path = os.path.join(BASE_DIR, 'vectorizer.pkl')

with open(model_path, "wb") as f:
    pickle.dump(model, f)

with open(vectorizer_path, "wb") as f:
    pickle.dump(vectorizer, f)

print("모델저장 완료!")