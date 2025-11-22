// 날씨 상태에 따른 이모지 아이콘
export const getWeatherIcon = (weatherCode, isDay = true) => {
  const iconMap = {
    '01d': '☀️', '01n': '🌙', // 맑음
    '02d': '⛅', '02n': '☁️', // 약간 구름
    '03d': '☁️', '03n': '☁️', // 구름
    '04d': '☁️', '04n': '☁️', // 많은 구름
    '09d': '🌦️', '09n': '🌧️', // 소나기
    '10d': '🌧️', '10n': '🌧️', // 비
    '11d': '⛈️', '11n': '⛈️', // 천둥번개
    '13d': '🌨️', '13n': '❄️', // 눈
    '50d': '🌫️', '50n': '🌫️', // 안개
  };
  
  return iconMap[weatherCode] || '🌤️';
};

// 날씨 상태 한국어 번역
export const getWeatherDescription = (description) => {
  const descriptionMap = {
    'clear sky': '맑음',
    'few clouds': '약간 흐림',
    'scattered clouds': '구름 많음',
    'broken clouds': '흐림',
    'shower rain': '소나기',
    'rain': '비',
    'thunderstorm': '뇌우',
    'snow': '눈',
    'mist': '안개',
    'light rain': '약한 비',
    'moderate rain': '보통 비',
    'heavy intensity rain': '강한 비',
    'light snow': '약한 눈',
    'heavy snow': '강한 눈'
  };
  
  return descriptionMap[description] || description;
};

// 풍향 계산
export const getWindDirection = (degrees) => {
  const directions = ['북', '북동', '동', '남동', '남', '남서', '서', '북서'];
  const index = Math.round(degrees / 45) % 8;
  return directions[index];
};