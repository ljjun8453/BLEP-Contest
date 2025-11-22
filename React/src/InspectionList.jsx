import { useState } from "react";
import ScheduleModal from "./ScheduleModal";
import styled from "styled-components";

const InspectionSection = styled.section`
  padding: 30px 0 30px 30px;
  background: #f8f9fa;
`;

const InspectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`;

const SectionIcon = styled.div`
  font-size: 32px;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const HeaderText = styled.div`
  h2 {
    margin: 0;
    font-size: 24px;
    color: #212529;
  }

  p {
    margin: 5px 0 0 0;
    color: #6c757d;
    font-size: 14px;
  }
`;

const TotalCount = styled.span`
  background: #e3f2fd;
  color: #1976d2;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
`;

const FilterControls = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
`;

const FilterBtn = styled.button`
  padding: 8px 16px;
  border: 1px solid #dee2e6;
  background: ${(props) => (props.$active ? "#007bff" : "white")};
  color: ${(props) => (props.$active ? "white" : "#212529")};
  border-color: ${(props) => (props.$active ? "#007bff" : "#dee2e6")};
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${(props) => (props.$active ? "#0056b3" : "#f8f9fa")};
  }
`;

const InspectionListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-height: 600px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;

    &:hover {
      background: #a8a8a8;
    }
  }
`;

const InspectionItem = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  gap: 20px;
  transition: all 0.2s;
  opacity: ${(props) => (props.$completed ? 0.7 : 1)};

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  }

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 15px;
  }
`;

const ItemPriority = styled.div`
  flex-shrink: 0;
`;

const PriorityNumber = styled.div`
  color: white;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  text-align: center;
  min-width: 60px;
  background: ${(props) => props.color};
`;

const ItemContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ItemHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 10px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const ItemTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  color: #212529;
`;

const ItemTags = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const Tag = styled.span`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  color: white;
  background: ${(props) => {
    if (props.type === "priority") return props.color;
    if (props.type === "location") return "#6c757d";
    if (props.type === "time") return "#17a2b8";
    return "#6c757d";
  }};
`;

const RiskScore = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
`;

const ScoreLabel = styled.div`
  font-size: 14px;
  color: #6c757d;
  min-width: 80px;
`;

const ScoreBar = styled.div`
  flex: 1;
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
`;

const ScoreFill = styled.div`
  height: 100%;
  width: ${(props) => props.$score}%;
  background: ${(props) => props.$color};
  transition: width 0.3s ease;
`;

const ScoreText = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #495057;
  min-width: 60px;
`;

const ItemDescription = styled.div`
  font-size: 14px;
  color: #6c757d;
  line-height: 1.4;
`;

const ItemActions = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 8px;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const ActionButton = styled.button`
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;

  &.schedule-btn {
    background: #f8f9fa;
    color: #495057;
    border: 1px solid #dee2e6;

    &:hover {
      background: #e9ecef;
    }
  }

  &.complete-btn {
    background: ${(props) => (props.$completed ? "#28a745" : "#dc3545")};
    color: white;

    &:hover:not(:disabled) {
      background: ${(props) => (props.$completed ? "#1e7e34" : "#c82333")};
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }
`;

const InspectionList = ({ inspections, onComplete, onAddSchedule }) => {
  const [filter, setFilter] = useState("all");
  const [modalState, setModalState] = useState({
    isOpen: false,
    selectedInspection: null,
  });

  const filteredInspections = inspections
    .filter((item) => {
      if (filter === "all") return true;
      if (filter === "pending") return item.status === "pending";
      return item.priority === filter;
    })
    .sort((a, b) => {
      // 점검 완료 상태 분류 (완료된 것은 맨 아래로)
      if (a.status === "completed" && b.status !== "completed") return 1;
      if (a.status !== "completed" && b.status === "completed") return -1;

      // 우선순위에 따른 분류
      return b.riskScore - a.riskScore;
    });

  const getPriorityColor = (priority) => {
    const colors = {
      urgent: "#dc3545",
      high: "#fd7e14",
      medium: "#ffc107",
      low: "#28a745",
    };
    return colors[priority] || "#6c757d";
  };

  const getPriorityText = (priority) => {
    const texts = {
      urgent: "긴급",
      high: "높음",
      medium: "보통",
      low: "낮음",
    };
    return texts[priority] || priority;
  };

  const pendingCount = inspections.filter((i) => i.status === "pending").length;

  const handleScheduleClick = (inspection) => {
    setModalState({
      isOpen: true,
      selectedInspection: inspection,
    });
  };

  const handleModalClose = () => {
    setModalState({
      isOpen: false,
      selectedInspection: null,
    });
  };

  const handleScheduleConfirm = (scheduleData) => {
    const newSchedule = {
      id: Date.now(),
      inspectionId: modalState.selectedInspection.id,
      location: modalState.selectedInspection.location,
      district: modalState.selectedInspection.district,
      priority: modalState.selectedInspection.priority,
      riskScore: modalState.selectedInspection.riskScore,
      date: scheduleData.date,
      time: scheduleData.time,
      notes: scheduleData.notes,
      status: "scheduled",
      createdAt: new Date().toISOString(),
    };

    try {
      // 로컬 스토리지에서 기존 일정 가져오기
      const existingSchedules = JSON.parse(localStorage.getItem("inspection-schedules") || "[]");

      // 새 일정 추가 (최신 순으로 정렬하기 위해 앞에 추가)
      const updatedSchedules = [newSchedule, ...existingSchedules];

      // 로컬 스토리지에 저장
      localStorage.setItem("inspection-schedules", JSON.stringify(updatedSchedules));

      console.log("점검 일정이 저장되었습니다:", newSchedule);

      // 부모 컴포넌트에 알림
      if (onAddSchedule) {
        onAddSchedule(modalState.selectedInspection.id, newSchedule);
      }

      // 성공 알림
      alert(`${modalState.selectedInspection.location} 점검 일정이 추가되었습니다.\n날짜: ${scheduleData.date} ${scheduleData.time}`);
    } catch (error) {
      console.error("일정 저장 실패:", error);
      alert("일정 저장에 실패했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <InspectionSection>
      <InspectionHeader>
        <HeaderLeft>
          <SectionIcon>🎯</SectionIcon>
          <HeaderText>
            <h2>점검 우선순위 목록</h2>
            <p>위험도가 높은 순서로 정렬됩니다</p>
          </HeaderText>
        </HeaderLeft>
        <TotalCount>대기 {pendingCount}건</TotalCount>
      </InspectionHeader>

      <FilterControls>
        <FilterBtn $active={filter === "all"} onClick={() => setFilter("all")}>
          전체
        </FilterBtn>
        <FilterBtn $active={filter === "pending"} onClick={() => setFilter("pending")}>
          대기중
        </FilterBtn>
        <FilterBtn $active={filter === "urgent"} onClick={() => setFilter("urgent")}>
          긴급
        </FilterBtn>
        <FilterBtn $active={filter === "high"} onClick={() => setFilter("high")}>
          높음
        </FilterBtn>
        <FilterBtn $active={filter === "medium"} onClick={() => setFilter("medium")}>
          보통
        </FilterBtn>
      </FilterControls>

      <InspectionListContainer>
        {filteredInspections.map((item, index) => (
          <InspectionItem key={item.id} $completed={item.status === "completed"}>
            <ItemPriority>
              <PriorityNumber color={getPriorityColor(item.priority)}>순위 {index + 1}</PriorityNumber>
            </ItemPriority>

            <ItemContent>
              <ItemHeader>
                <ItemTitle>{item.location}</ItemTitle>
                <ItemTags>
                  <Tag type="priority" color={getPriorityColor(item.priority)}>
                    {getPriorityText(item.priority)}
                  </Tag>
                  <Tag type="location">📍 {item.district}</Tag>
                </ItemTags>
              </ItemHeader>

              <RiskScore>
                <ScoreLabel>위험도 점수</ScoreLabel>
                <ScoreBar>
                  <ScoreFill $score={item.riskScore} $color={getPriorityColor(item.priority)} />
                </ScoreBar>
                <ScoreText>{item.riskScore} / 100</ScoreText>
              </RiskScore>

              <ItemDescription>{item.description}</ItemDescription>

              <ItemActions>
                <ActionButton className="schedule-btn" onClick={() => handleScheduleClick(item)}>
                  📅 점검 일정 추가
                </ActionButton>
                <ActionButton
                  className="complete-btn"
                  $completed={item.status === "completed"}
                  onClick={() => onComplete(item.id)}
                  disabled={item.status === "completed"}
                >
                  {item.status === "completed" ? "✅ 점검 완료" : "🔄 점검 완료"}
                </ActionButton>
              </ItemActions>
            </ItemContent>
          </InspectionItem>
        ))}
      </InspectionListContainer>

      {/* 모달 추가 */}
      <ScheduleModal isOpen={modalState.isOpen} onClose={handleModalClose} inspection={modalState.selectedInspection} onConfirm={handleScheduleConfirm} />
    </InspectionSection>
  );
};

export default InspectionList;
