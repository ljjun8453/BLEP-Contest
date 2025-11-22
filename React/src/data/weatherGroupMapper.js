// OpenWeather 날씨 코드를 4개 그룹으로 매핑
export const mapWeatherToGroup = (weatherCode, mainWeather) => {
  // OpenWeather 날씨 코드 참조
  // 2xx = Thunderstorm, 3xx = Drizzle, 5xx = Rain
  // 6xx = Snow, 7xx = Atmosphere, 800 = Clear, 80x = Clouds
  
  if (weatherCode === 800 || mainWeather === "Clear") {
    return "맑음";
  }
  
  if ((weatherCode >= 801 && weatherCode <= 804) || mainWeather === "Clouds") {
    return "흐림";
  }
  
  if (
    (weatherCode >= 200 && weatherCode < 600) ||
    mainWeather === "Thunderstorm" ||
    mainWeather === "Drizzle" ||
    mainWeather === "Rain"
  ) {
    return "비";
  }
  
  if (
    (weatherCode >= 700 && weatherCode < 800) ||
    mainWeather === "Mist" ||
    mainWeather === "Fog" ||
    mainWeather === "Haze" ||
    mainWeather === "Smoke"
  ) {
    return "안개";
  }
  
  // 기본값 (눈 등 기타 날씨)
  return "맑음";
};

// 날씨 그룹에 따른 위험지역 데이터 파일 매핑
export const getDataFileByWeatherGroup = (weatherGroup) => {
  const fileMap = {
    "맑음": "data/weather_clear.json",
    "흐림": "data/weather_cloudy.json", 
    "비": "data/weather_rain.json",
    "안개": "data/weather_fog.json"
  };
  
  return fileMap[weatherGroup] || "data/weather_clear.json";
};