// JSON 데이터를 컴포넌트에서 사용할 형태로 변환
export const processRiskData = (jsonData) => {
  return jsonData.map((item, index) => {
    const riskScore = Math.round(item.expect_risk * 10); // 5.2257 -> 52점으로 변환
    const priority = calculatePriority(riskScore);
    const district = extractDistrict(item.address);
    const location = extractLocation(item.address);

    return {
      id: index + 1,
      location: location,
      district: district,
      address: item.address,
      priority: priority,
      riskScore: riskScore,
      status: "pending",
      description: generateDescription(riskScore, district),
      lat: item.y, // JSON의 y가 위도
      lng: item.x, // JSON의 x가 경도
      originalRisk: item.expect_risk,
    };
  });
};

// 위험도에 따른 우선순위 계산
const calculatePriority = (riskScore) => {
  if (riskScore >= 70) return "urgent"; // 70점 이상: 긴급
  if (riskScore >= 50) return "high"; // 50-69점: 높음
  if (riskScore >= 30) return "medium"; // 30-49점: 보통
  return "low"; // 30점 미만: 낮음
};

// 주소에서 구/군 추출
const extractDistrict = (address) => {
  const parts = address.split(" ");
  // "대구광역시 수성구 지산동" -> "수성구" 추출
  const district = parts.find((part) => part.includes("구") || part.includes("군"));
  return district || parts[1] || "미상";
};

// 주소에서 동/면 추출 (위치명으로 사용)
const extractLocation = (address) => {
  const parts = address.split(" ");
  // 마지막 부분을 위치명으로 사용
  return parts[parts.length - 1] || address;
};

// 위험도와 지역에 따른 설명 생성
const generateDescription = (riskScore, district) => {
  if (riskScore >= 70) {
    return `긴급 점검이 필요한 고위험 지역 (${district})`;
  } else if (riskScore >= 50) {
    return `안전사고 주의가 필요한 구간 (${district})`;
  } else if (riskScore >= 30) {
    return `정기 점검이 필요한 일반 관리 구간 (${district})`;
  } else {
    return `안전 상태가 양호한 모니터링 구간 (${district})`;
  }
};
