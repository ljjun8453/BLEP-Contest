import pandas as pd

# 엑셀 파일 경로
excel_path = r"C:\Users\Lim Jae-Jun\Desktop\dataset.xlsx"
csv_path = r"C:\Users\Lim Jae-Jun\Desktop\dataset.csv"

# 엑셀 파일 읽기
df = pd.read_excel(excel_path)

# CSV로 저장
df.to_csv(csv_path, index=False, encoding='utf-8-sig')

print("CSV 파일이 저장되었습니다:", csv_path)