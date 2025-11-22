import { useState, useEffect } from "react";
import styled, { createGlobalStyle } from "styled-components";
import NavBar from "./NavBar";
import Dashboard from "./Dashboard";
import KakaoMap from "./KakaoMap";
import InspectionList from "./InspectionList";
import MemoSection from "./MemoSection";
import SchedulePanel from "./SchedulePanel";
import { processRiskData } from "./Data/dataProcessor";

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: #f8f9fa;
  }

  button {
    font-family: inherit;
  }

  h1, h2, h3, h4, h5, h6 {
    font-weight: 600;
  }

  /* 스크롤바 전역 스타일 */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 4px;

    &:hover {
      background: #a8a8a8;
    }
  }
`;

const AppContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const MainContent = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;

  @media (max-width: 768px) {
    padding: 0;
  }
`;

const AnimatedSection = styled.div`
  animation: fadeIn 0.5s ease-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const InspectionContainer = styled.div`
  display: flex;
  gap: 20px;
  padding: 0 30px;
  background: #f8f9fa;

  @media (max-width: 1200px) {
    flex-direction: column;
    gap: 0;
  }
`;

const LeftSection = styled.div`
  flex: 2;
  min-width: 0;
`;

const RightSection = styled.div`
  flex: 1;
  min-width: 350px;
  max-width: 400px;

  @media (max-width: 1200px) {
    max-width: none;
  }
`;

function App() {
  const [inspections, setInspections] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [currentWeatherGroup, setCurrentWeatherGroup] = useState("흐림");
  const [dataLoading, setDataLoading] = useState(true);
  const [stats, setStats] = useState({
    pending: 0,
    completed: 0,
    urgent: 0,
    scheduled: 0,
  });

  // 로컬 스토리지에서 일정 데이터 불러오기
  useEffect(() => {
    const loadSchedulesFromStorage = () => {
      try {
        const savedSchedules = localStorage.getItem("inspection-schedules");
        if (savedSchedules) {
          const parsedSchedules = JSON.parse(savedSchedules);
          setSchedules(parsedSchedules);
          console.log("저장된 일정 불러오기:", parsedSchedules);
        }
      } catch (error) {
        console.error("일정 데이터 로드 실패:", error);
      }
    };

    loadSchedulesFromStorage();
  }, []);

  // 앱 시작 시 데이터 로드
  useEffect(() => {
    loadRiskDataFromAPI();
  }, [currentWeatherGroup]);

  // API에서 위험지역 데이터 로드
  const loadRiskDataFromAPI = async () => {
    try {
      setDataLoading(true);

      const response = await fetch("/api/info");

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const jsonData = await response.json();

      // 현재 선택된 날씨에 맞는 데이터만 필터링
      const filteredData = jsonData.filter((item) => item.openweather === currentWeatherGroup);

      // 필터링된 데이터가 없으면 전체 데이터 사용
      const dataToProcess = filteredData.length > 0 ? filteredData : jsonData;

      let processedData = processRiskData(dataToProcess);

      // 저장된 점검 완료 상태 복원
      try {
        const savedCompletedInspections = localStorage.getItem("completed-inspections");
        if (savedCompletedInspections) {
          const completedIds = JSON.parse(savedCompletedInspections);
          processedData = processedData.map((inspection) => ({
            ...inspection,
            status: completedIds.includes(inspection.id) ? "completed" : "pending",
          }));
          console.log("점검 완료 상태 복원:", completedIds);
        }
      } catch (error) {
        console.error("완료 상태 복원 실패:", error);
      }

      setInspections(processedData);
    } catch (error) {
      console.error("위험지역 데이터 로드 실패:", error);

      // 폴백 데이터
      const fallbackData = [
        {
          address: "대구광역시 중구 기본지역",
          expect_risk: 5.0,
          x: 128.6014,
          y: 35.8714,
          openweather: "맑음",
        },
      ];

      setInspections(processRiskData(fallbackData));
    } finally {
      setDataLoading(false);
    }
  };

  // 날씨 그룹 변경 핸들러
  const handleWeatherGroupChange = (weatherGroup) => {
    console.log("날씨 그룹 변경:", weatherGroup);
    setCurrentWeatherGroup(weatherGroup);

    // 새로운 날씨로 데이터 다시 로드하거나 필터링
    loadRiskDataFromAPI();
  };

  // 통계 업데이트
  useEffect(() => {
    const pending = inspections.filter((item) => item.status === "pending").length;
    const completed = inspections.filter((item) => item.status === "completed").length;
    const urgent = inspections.filter((item) => item.priority === "urgent").length;

    // 로컬 스토리지에서 실시간 일정 수 가져오기
    const getScheduledCount = () => {
      try {
        const savedSchedules = localStorage.getItem("inspection-schedules");
        if (savedSchedules) {
          const parsedSchedules = JSON.parse(savedSchedules);
          return parsedSchedules.length;
        }
        return 0;
      } catch (error) {
        console.error("일정 수 계산 실패:", error);
        return schedules.length; // 폴백으로 기존 schedules 사용
      }
    };

    const scheduled = getScheduledCount();

    setStats({ pending, completed, urgent, scheduled });
  }, [inspections, schedules]);

  //점검 완료 처리
  const handleCompleteInspection = (id) => {
    setInspections((prev) => {
      const updated = prev.map((item) => (item.id === id ? { ...item, status: "completed" } : item));

      // 완료된 점검 ID들을 로컬 스토리지에 저장
      try {
        const completedIds = updated.filter((item) => item.status === "completed").map((item) => item.id);

        localStorage.setItem("completed-inspections", JSON.stringify(completedIds));
        console.log("점검 완료 상태 저장:", completedIds);
      } catch (error) {
        console.error("완료 상태 저장 실패:", error);
      }

      return updated;
    });

    // 점검 완료 시 해당 일정도 로컬 스토리지에서 제거
    try {
      const savedSchedules = localStorage.getItem("inspection-schedules");
      if (savedSchedules) {
        const parsedSchedules = JSON.parse(savedSchedules);
        const updatedSchedules = parsedSchedules.filter((schedule) => schedule.inspectionId !== id);
        localStorage.setItem("inspection-schedules", JSON.stringify(updatedSchedules));
        setSchedules(updatedSchedules);
      }
    } catch (error) {
      console.error("일정 삭제 실패:", error);
    }
  };

  const handleAddSchedule = (inspectionId, scheduleData) => {
    const inspection = inspections.find((item) => item.id === inspectionId);
    if (inspection) {
      const newSchedule = {
        id: Date.now(),
        inspectionId,
        location: inspection.location,
        district: inspection.district,
        priority: inspection.priority,
        riskScore: inspection.riskScore,
        weather: inspection.weather,
        date: scheduleData.date,
        time: scheduleData.time,
        notes: scheduleData.notes,
        status: "scheduled",
        createdAt: new Date().toISOString(),
      };

      try {
        // 로컬 스토리지에서 기존 일정 가져오기
        const savedSchedules = localStorage.getItem("inspection-schedules");
        const existingSchedules = savedSchedules ? JSON.parse(savedSchedules) : [];

        // 새 일정 추가
        const updatedSchedules = [newSchedule, ...existingSchedules];

        // 로컬 스토리지에 저장
        localStorage.setItem("inspection-schedules", JSON.stringify(updatedSchedules));

        // 상태 업데이트
        setSchedules(updatedSchedules);

        console.log("일정 추가 완료:", newSchedule);
      } catch (error) {
        console.error("일정 저장 실패:", error);
      }
    }
  };

  // 일정 삭제 (로컬 스토리지에서도 삭제)
  const handleRemoveSchedule = (scheduleId) => {
    try {
      const savedSchedules = localStorage.getItem("inspection-schedules");
      if (savedSchedules) {
        const parsedSchedules = JSON.parse(savedSchedules);
        const updatedSchedules = parsedSchedules.filter((schedule) => schedule.id !== scheduleId);
        localStorage.setItem("inspection-schedules", JSON.stringify(updatedSchedules));
        setSchedules(updatedSchedules);
      }
    } catch (error) {
      console.error("일정 삭제 실패:", error);
    }
  };

  return (
    <>
      <GlobalStyle />
      <AppContainer>
        <NavBar onWeatherGroupChange={handleWeatherGroupChange} />
        <MainContent>
          <AnimatedSection>
            <Dashboard stats={stats} />
          </AnimatedSection>
          <AnimatedSection>
            <KakaoMap inspections={inspections} />
          </AnimatedSection>

          <InspectionContainer>
            <LeftSection>
              <AnimatedSection>
                {dataLoading ? (
                  <div style={{ padding: "50px", textAlign: "center" }}>
                    <div>현재 날씨({currentWeatherGroup})에 맞는 위험지역 데이터를 로드 중...</div>
                  </div>
                ) : (
                  <InspectionList inspections={inspections} onComplete={handleCompleteInspection} onAddSchedule={handleAddSchedule} />
                )}
              </AnimatedSection>
            </LeftSection>

            <RightSection>
              <AnimatedSection>
                <SchedulePanel schedules={schedules} onRemoveSchedule={handleRemoveSchedule} />
              </AnimatedSection>
            </RightSection>
          </InspectionContainer>

          <AnimatedSection>
            <MemoSection />
          </AnimatedSection>
        </MainContent>
      </AppContainer>
    </>
  );
}

export default App;
