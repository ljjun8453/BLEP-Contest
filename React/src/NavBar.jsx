import { useState, useEffect } from "react";
import styled from "styled-components";
import { getWeatherIcon, getWeatherDescription, getWindDirection } from "./data/weatherUtils";
import { mapWeatherToGroup } from "./data/weatherGroupMapper";

const NavBarContainer = styled.nav`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 120px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 20px;
    padding: 20px;
  }
`;

const NavSection = styled.div`
  flex: 1;

  h3 {
    font-size: 16px;
    margin-bottom: 10px;
    opacity: 0.9;
    font-weight: normal;
  }
`;

const DateDisplay = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const DateText = styled.span`
  font-size: 24px;
  font-weight: 500;
`;

const TimeText = styled.span`
  font-size: 36px;
  font-weight: 700;
`;

const NavCenter = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 40px;

  @media (max-width: 768px) {
    gap: 20px;
  }
`;

const WeatherMain = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
`;

const WeatherDesc = styled.div`
  font-size: 18px;
`;

const Temperature = styled.div`
  font-size: 32px;
  font-weight: 700;
`;

const WeatherDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const WeatherItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;

  .label {
    font-size: 14px;
    opacity: 0.8;
  }

  .value {
    font-size: 18px;
    font-weight: 600;
  }
`;

const NavRight = styled.div`
  flex: 1;
  display: flex;
  gap: 10px;
  justify-content: center;
`;

const AlertBanner = styled.div`
  background: rgba(255, 255, 255, 0.2);
  padding: 12px 24px;
  border-radius: 25px;
  font-size: 16px;
  backdrop-filter: blur(10px);
`;

const WeatherIcon = styled.div`
  font-size: 48px;
  margin-right: 15px;
`;

const LoadingText = styled.div`
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
`;

const ErrorText = styled.div`
  color: #ffcdd2;
  font-size: 14px;
`;

const NavBar = ({ onWeatherGroupChange }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [weatherError, setWeatherError] = useState(null);
  const [weatherGroup, setWeatherGroup] = useState("맑음");

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 날씨 데이터 가져오기
  useEffect(() => {
    fetchWeatherData();

    // 10분마다 날씨 데이터 업데이트
    const weatherTimer = setInterval(fetchWeatherData, 600000);

    return () => clearInterval(weatherTimer);
  }, []);

  const fetchWeatherData = async () => {
    const API_KEY = import.meta.env.VITE_APP_OPENWEATHER_API_KEY;

    if (!API_KEY) {
      setWeatherError("API 키가 설정되지 않았습니다");
      setWeatherLoading(false);
      return;
    }

    try {
      setWeatherLoading(true);

      // 대구시 좌표 (위도, 경도)
      const lat = 35.8714;
      const lon = 128.6014;

      const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=kr`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // 날씨 그룹 계산
      const currentWeatherGroup = mapWeatherToGroup(data.weather[0].id, data.weather[0].main);

      setWeatherGroup(currentWeatherGroup);

      // 부모 컴포넌트에 날씨 그룹 전달
      if (onWeatherGroupChange) {
        onWeatherGroupChange(currentWeatherGroup);
      }

      setWeather({
        temperature: Math.round(data.main.temp),
        description: getWeatherDescription(data.weather[0].description),
        humidity: data.main.humidity,
        windSpeed: Math.round(data.wind.speed),
        windDirection: getWindDirection(data.wind.deg),
        icon: getWeatherIcon(data.weather[0].icon),
        pressure: data.main.pressure,
        feelsLike: Math.round(data.main.feels_like),
        visibility: data.visibility ? Math.round(data.visibility / 1000) : null,
      });

      setWeatherError(null);
    } catch (error) {
      console.error("날씨 데이터를 가져오는 중 오류 발생:", error);
      setWeatherError("날씨 정보를 불러올 수 없습니다");
    } finally {
      setWeatherLoading(false);
    }
  };

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
    const dayName = dayNames[date.getDay()];

    return `${year}년 ${month}월 ${day}일 (${dayName})`;
  };

  const formatTime = (date) => {
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    return `${hours}:${minutes}:${seconds}`;
  };

  // 날씨 기반 알림 메시지 생성
  const getWeatherAlert = () => {
    if (!weather) return null;

    if (weather.temperature <= 0) {
      return "❄️ 빙판길 주의보";
    } else if (weather.temperature >= 35) {
      return "🌡️ 폭염 주의보";
    } else if (weather.description.includes("비")) {
      return "🌧️ 강우 주의보";
    } else if (weather.description.includes("눈")) {
      return "🌨️ 대설 주의보";
    } else if (weather.windSpeed >= 10) {
      return "💨 강풍 주의보";
    }

    return "✅ 양호한 기상 상태";
  };

  return (
    <NavBarContainer>
      <NavSection>
        <h3>오늘 날짜</h3>
        <DateDisplay>
          <DateText>{formatDate(currentTime)}</DateText>
          <TimeText>{formatTime(currentTime)}</TimeText>
        </DateDisplay>
      </NavSection>

      <WeatherDetails>
        {weatherLoading ? (
          <LoadingText>날씨 정보를 불러오는 중...</LoadingText>
        ) : weatherError ? (
          <ErrorText>{weatherError}</ErrorText>
        ) : weather ? (
          <>
            <WeatherMain>
              <WeatherIcon>{weather.icon}</WeatherIcon>
              <div>
                <WeatherDesc>{weather.description}</WeatherDesc>
                <Temperature>{weather.temperature}°C</Temperature>
                <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '4px' }}>
                  현재 상태: {weatherGroup}
                </div>
                {weather.feelsLike !== weather.temperature && <div style={{ fontSize: "14px", opacity: 0.8 }}>체감 {weather.feelsLike}°C</div>}
              </div>
            </WeatherMain>

            <NavRight>
              <WeatherItem>
                <span className="label">습도</span>
                <span className="value">{weather.humidity}%</span>
              </WeatherItem>
              <WeatherItem>
                <span className="label">풍속</span>
                <span className="value">{weather.windSpeed}m/s</span>
              </WeatherItem>
              {weather.windDirection && (
                <WeatherItem>
                  <span className="label">풍향</span>
                  <span className="value">{weather.windDirection}</span>
                </WeatherItem>
              )}
              {weather.visibility && (
                <WeatherItem>
                  <span className="label">가시거리</span>
                  <span className="value">{weather.visibility}km</span>
                </WeatherItem>
              )}
            </NavRight>

            <AlertBanner>{getWeatherAlert()}</AlertBanner>
          </>
        ) : null}
      </WeatherDetails>
    </NavBarContainer>
  );
};

export default NavBar;
