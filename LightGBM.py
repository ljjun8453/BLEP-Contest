"""
애들아 이거 라이브러리 불러오는 건데 하나하나 설명해보면
판다스(pandas) : CSV/엑셀 등의 데이터셋 불러와서 읽고 전처리하는 것
넘파이(numpy) : 수치 계산하는 것
사이킷런(scikit-learn) : 얘는 굳이 없어도 되는 건데 LightGBM모델 학습할 때
                        도와주는 라이브러리 도구 같은 애라 사용하면 편리
AI모델(LightGBM) : 얘가 인공지능 모델인데 수치 회귀 분석/학습 하는 거라는데 내부적으로
                수학적으로 어떻게 되는지는 나도 잘 몰라
매트플롯라이브러리(matplotlib) : 시각화 도구야, 한마디로 다양한 그래프로 학습 결과 보여주는 대시보드용,
                                웹페이지에 띄울 때 이거 쓰면 돼.
"""
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score
from lightgbm import LGBMRegressor
import lightgbm as lgb
import matplotlib.pyplot as plt
import platform


"""
우리 교통사고 csv 불러오기(csv_path에 경로는 본인PC에서 불러올 csv경로).
보통 경로에는 영어/숫자 이외에 없는게 좋아서 나는 바탕화면 경로에다가 했어.
띄어쓰기도 리눅스에서는 있으면 안되는데 나는 지금 윈도우고 따옴표로 묶어서 문자열 취급.
"""
csv_path = r"C:\Users\Lim Jae-Jun\Desktop\dataset.csv"
try:
    df = pd.read_csv(csv_path, encoding="utf-8-sig")
except UnicodeDecodeError:
    df = pd.read_csv(csv_path, encoding="cp949")



# 여기는 필요한 컬럼만 가져다 쓰는 거
cat_cols = [
    "도로형태","노면상태","사고유형","사고유형 - 세부분류","법규위반",
    "가해운전자 차종","가해운전자 성별","피해운전자 차종","피해운전자 성별",
    "피해운전자 상해정도","가해운전자 상해정도"
]
num_like_cols = ["가해운전자 연령","피해운전자 연령","사망자수","중상자수","경상자수","부상자수"]
target = "사고위험도"

use_cols = [c for c in cat_cols + num_like_cols + [target] if c in df.columns]
df = df[use_cols].copy()


"""
결측처리라고 해서 중간중간 비어있는 값이 있으면 오류나 왜곡된 학습을 할 수 있으니까
빈칸을 다른 값으로 채우거나 열 자체를 삭제하는 거.
여기서는 나이는 숫자만 남기고 공백/한글 싹 없앴어.
그리고 빈칸이 있으면 그냥 빈칸(NaN)그대로 리턴.
"""
def to_age(x):
    if pd.isna(x): return np.nan
    s = str(x).strip().replace("세","")
    return pd.to_numeric(s, errors="coerce")

for c in ["가해운전자 연령","피해운전자 연령"]:
    if c in df.columns:
        df[c] = df[c].map(to_age)


# 이건 안해도 되는데 부상정도에 따라서 숫자로 다시 매핑.
severity_map = {"상해없음":0, "부상신고":1, "경상":2, "중상":3, "사망":4}
for c in ["피해운전자 상해정도","가해운전자 상해정도"]:
    if c in df.columns:
        df[c] = df[c].map(severity_map)

# 숫자로 매핑된 부상정도 컬럼은 cat_cols에서 제외하는 거.
severity_cols = ["피해운전자 상해정도","가해운전자 상해정도"]
cat_cols = [c for c in cat_cols if c not in severity_cols]


"""
타깃을 강제로 숫자로 바꾸는 거.
안바꿔지면 NaN으로 만들기.
"""
df[target] = pd.to_numeric(df[target], errors="coerce")


# 얘도 결측처리. 아까랑 같음.
df[num_like_cols] = df[num_like_cols].fillna(0)
df = df.dropna(subset=[target])


# 범주를 LightGBM이 직접 처리하도록 이관하는 거.
for c in cat_cols:
    if c in df.columns:
        df[c] = df[c].astype("category")


"""
이건 우리가 넣은 데이터셋을 학습용과 테스트용으로 분리하는 건데
데이터를 80%는 학습용으로 쓰고 20%는 예측검증용으로 쓰는거야.
학습용 -> 모델이 공부하는 데이터
테스트용 -> 모델이 공부 안 해본 데이터(실제예측검증용)
X -> 입력데이터('사고위험도' 제외한 모든 컬럼이 X값으로 들어감)
Y -> 타깃데이터(우리가 예측하고 싶은 값은 '사고위험도'야)
"""
X = df.drop(columns=[target])
y = df[target].astype(float)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

cat_idx = [X.columns.get_loc(c) for c in cat_cols if c in X.columns]

# 모델 학습하는 거.
model = LGBMRegressor(
    n_estimators=700,
    learning_rate=0.05,
    num_leaves=31,
    max_depth=-1,
    subsample=0.8,
    colsample_bytree=0.8,
    random_state=42,
)
model.fit(X_train, y_train, categorical_feature=cat_idx)


"""
이건 나중에 돌려보면 프롬프트에 MAE 얼마얼마 R2 얼마얼마 뜰텐데
MAE는 에측값과 실제값의 오차를 말하는거고
R2는 모델이 데이터를 얼마나 잘 말하고 있는가를 나타내는 거야.
MAE : 0.1 -> 예측이 평균적으로 0.1 정도 오차가 있다.
R2 : 0.92 -> 모델이 데이터의 92% 패턴을 잘 설명한다.
"""
pred = model.predict(X_test)
print("MAE :", round(mean_absolute_error(y_test, pred), 4))
print("R2  :", round(r2_score(y_test, pred), 4))


# 이건 시각화할 때 한글설정 해주는거.
if platform.system() == 'Windows':
    plt.rc('font', family='Malgun Gothic')
elif platform.system() == 'Darwin':
    plt.rc('font', family='AppleGothic')
else:
    plt.rc('font', family='NanumGothic')
plt.rcParams['axes.unicode_minus'] = False

ax = lgb.plot_importance(model, max_num_features=15, height=0.6)
plt.title("LightGBM 변수 중요도")
plt.tight_layout()
plt.show()


"""
백엔드/대시보드 연동용으로 예측 결과 csv파일로 저장하는 거.
나는 바탕화면에 저장했어.
웹페이지에 띄울 때 pred_eclo.csv파일 보내줌.
"""
out = X_test.copy()
out["실제값"] = y_test.values
out["예측값"] = pred
out.to_csv(r"C:\Users\Lim Jae-Jun\Desktop\pred_eclo.csv", index=False, encoding="utf-8-sig")
print("예측 결과 저장 완료.")
