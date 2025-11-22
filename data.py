import json
import pandas as pd
from sklearn.model_selection import train_test_split
from lightgbm import LGBMRegressor
import joblib

DATA_PATH = "data/dataset.csv"     # 데이터셋
MODEL_PATH = "lgbm_model.pkl"      # 학습 완료 모델(가중치/트리)
META_PATH  = "lgbm_metadata.json"  # 카테고리/평균값 등 메타

# 데이터셋 불러와서 컬럼 정하기기
df = pd.read_csv(DATA_PATH)
required = {"시군구", "기상상태", "노면상태", "사고위험도"}
missing = required - set(df.columns)
if missing:
    raise ValueError(f"누락 컬럼: {missing}")

# 필요한 라벨 정의하기
ALLOWED_WEATHER = {"맑음","흐림","비","안개"}
ALLOWED_SURFACE = {"서리/결빙","젖음/습기","건조"}

df = df[df["기상상태"].isin(ALLOWED_WEATHER)]
df = df[df["노면상태"].isin(ALLOWED_SURFACE)]

# 피처 정하기 평균으로 (시군구, 기상상태, 노면상태)
loc_risk = df.groupby("시군구")["사고위험도"].mean().reset_index().rename(
    columns={"사고위험도":"지역평균위험도"})
weather_risk = df.groupby("기상상태")["사고위험도"].mean().reset_index().rename(
    columns={"사고위험도":"기상평균위험도"})
surface_risk = df.groupby("노면상태")["사고위험도"].mean().reset_index().rename(
    columns={"사고위험도":"노면평균위험도"})

merged = (df
          .merge(loc_risk, on="시군구", how="left")
          .merge(weather_risk, on="기상상태", how="left")
          .merge(surface_risk, on="노면상태", how="left"))

# AI모델에 입력할 컬럼들들
feature_cols = ["시군구","기상상태","노면상태","지역평균위험도","기상평균위험도","노면평균위험도"]
X = merged[feature_cols].copy()
y = merged["사고위험도"].copy()

for c in ["시군구","기상상태","노면상태"]:
    X[c] = X[c].astype("category")

# 학습시켜보기기
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
model = LGBMRegressor(n_estimators=700, learning_rate=0.05, num_leaves=31, random_state=42)
model.fit(X_train, y_train, categorical_feature=["시군구","기상상태","노면상태"])

# 저장하기기
joblib.dump(model, MODEL_PATH)

# ---- 8) 저장(메타데이터: 카테고리/평균/매핑) ----
region_cats  = list(X["시군구"].cat.categories)
weather_cats = list(X["기상상태"].cat.categories)
surface_cats = list(X["노면상태"].cat.categories)

loc_avg = dict(loc_risk.values.tolist())
weather_avg = dict(weather_risk.values.tolist())
surface_avg = dict(surface_risk.values.tolist())

#openweather에서 받아오는 날씨명을 우리 것과 맞게 매핑하기
OW_TO_KR4 = {
    "Clear": "맑음",
    "Clouds": "흐림",
    "Rain": "비",
    "Drizzle": "비",
    "Thunderstorm": "비",
    "Snow": "비",
    "Mist": "안개",
    "Fog": "안개",
    "Haze": "안개",
    "Smoke": "안개",
    "Dust": "안개",
    "Sand": "안개",
    "Ash": "안개",
    "Squall": "흐림",
    "Tornado": "흐림"
}

meta = {
    "feature_order": feature_cols,
    "categorical_features": ["시군구","기상상태","노면상태"],
    "categories": {"시군구": region_cats, "기상상태": weather_cats, "노면상태": surface_cats},
    "averages": {"지역평균위험도": loc_avg, "기상평균위험도": weather_avg, "노면평균위험도": surface_avg},
    "ow_to_kr4": OW_TO_KR4
}
with open(META_PATH, "w", encoding="utf-8") as f:
    json.dump(meta, f, ensure_ascii=False, indent=2)

print("✅ 모델 저장:", MODEL_PATH)
print("✅ 메타 저장:", META_PATH)
