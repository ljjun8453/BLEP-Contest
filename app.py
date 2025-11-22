import os, json, requests
import pandas as pd
import joblib
from flask import Flask, jsonify, render_template
from typing import Dict
from dotenv import load_dotenv

MODEL_PATH = "lgbm_model.pkl"
META_PATH  = "lgbm_metadata.json"
COORDS_PATH = "data/daegu_coords.json"

load_dotenv()
OPENWEATHER_KEY = os.getenv("OPENWEATHER_KEY")
if not OPENWEATHER_KEY:
    raise RuntimeError("환경변수 OPENWEATHER_KEY 를 설정하세요.")

# 추론에 필요한 파일들 불러오기(lgbm_model.pkl, lgbm_metadata.json)
model = joblib.load(MODEL_PATH)
with open(META_PATH, "r", encoding="utf-8") as f:
    meta = json.load(f)
coords = pd.read_json(COORDS_PATH)

feature_order = meta["feature_order"]
cat_feats = meta["categorical_features"]
cats = meta["categories"]
avg = meta["averages"]
OW_TO_KR4: Dict[str,str] = meta["ow_to_kr4"]

ALLOWED_WEATHER = {"맑음","흐림","비","안개"}
ALLOWED_SURFACE = {"서리/결빙","젖음/습기","건조"}

app = Flask(__name__)

def ow_main_to_kr4(main: str) -> str:
    """OpenWeather main -> 4종 한글 (맑음/흐림/비/안개)"""
    return OW_TO_KR4.get(main, "흐림")

def pick_surface(kr4: str, temp_c: float) -> str:
    """간단 휴리스틱으로 3종 노면상태 선택"""
    if kr4 == "비":
        # 영상/영하 기준으로 결빙 판단하기
        return "서리/결빙" if temp_c <= 0 else "젖음/습기"
    if kr4 == "안개":
        return "젖음/습기"
    return "건조"

def get_weather(lat: float, lon: float):
    """OpenWeather 현재 날씨/기온 조회 (metric, KST 무관)"""
    url = "https://api.openweathermap.org/data/2.5/weather"
    params = {"lat": lat, "lon": lon, "appid": OPENWEATHER_KEY, "units": "metric"}
    r = requests.get(url, params=params, timeout=8)
    r.raise_for_status()
    data = r.json()
    main = (data.get("weather") or [{}])[0].get("main")
    temp = (data.get("main") or {}).get("temp")
    return main, temp

def to_sigungu(address: str) -> str:
    return address.strip()

def to_eup_myeon_dong(address: str) -> str:
    """응답용 주소: 읍/면/동만 남기기 (마지막 토큰)"""
    parts = address.strip().split()
    return parts[-1] if parts else address.strip()

def predict_one(sigungu: str, weather_kr4: str, surface: str) -> float:
    """모델 입력 한 건 예측 (평균 피처 채워서)"""
    if sigungu not in cats["시군구"]:
        raise ValueError(f"[시군구 미존재] 학습에 없던 시군구: {sigungu}")
    if weather_kr4 not in ALLOWED_WEATHER:
        weather_kr4 = "흐림"
    if surface not in ALLOWED_SURFACE:
        surface = "건조"

    # 평균 피처 채우고 없을때는 전체 평균으로 채우기
    import numpy as np
    loc_avg = avg["지역평균위험도"].get(sigungu, float(np.mean(list(avg["지역평균위험도"].values()))))
    w_avg   = avg["기상평균위험도"].get(weather_kr4, float(np.mean(list(avg["기상평균위험도"].values()))))
    s_avg   = avg["노면평균위험도"].get(surface, float(np.mean(list(avg["노면평균위험도"].values()))))

    row = pd.DataFrame([{
        "시군구": sigungu,
        "기상상태": weather_kr4,
        "노면상태": surface,
        "지역평균위험도": loc_avg,
        "기상평균위험도": w_avg,
        "노면평균위험도": s_avg
    }])
    for c in cat_feats:
        row[c] = pd.Categorical(row[c], categories=cats[c], ordered=False)

    pred = float(model.predict(row[feature_order])[0])
    return pred

@app.route("/")
def index():
    return render_template("index.html", KAKAO_KEY=os.getenv("KAKAO_JS_KEY"))

@app.get("/api/info")
def api_info():
    """
    반환 스키마:
    [
      { "x": 128.56348, "y": 35.87565, "address": "평리동",
        "expect_risk": 5.12345, "openweather": "흐림" },
      ...
    ]
    """
    results = []
    for _, r in coords.iterrows():
        address = str(r.get("address", ""))
        x = float(r.get("x"))
        y = float(r.get("y"))

        try:
            main, temp_c = get_weather(lat=y, lon=x)
            weather_kr4 = ow_main_to_kr4(main or "")
            surface = pick_surface(weather_kr4, temp_c if isinstance(temp_c,(int,float)) else 15.0)
        except Exception:
            weather_kr4 = "흐림"
            surface = "건조"

        sigungu = to_sigungu(address)          # 모델에 주소입력하기
        amd = to_eup_myeon_dong(address)       # json으로 보낼때 읍면동만 표시하기

        # 추론하는 거 여기서
        try:
            yhat = predict_one(sigungu, weather_kr4, surface)
        except Exception:
            # 없을때 기본값으로 0.0 넣기
            yhat = 0.0

        # 5) x좌표, y좌표, expect_risk는 소수 5번째 자리에서 반올림하기
        results.append({
            "x": round(x, 5),
            "y": round(y, 5),
            "address": amd,
            "expect_risk": round(yhat, 5),
            "openweather": weather_kr4
        })
        

    return jsonify(results)
    
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True) #포트는 7천번 또는 8천번으로
