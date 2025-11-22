import React from 'react';
import styled from 'styled-components';

const PanelContainer = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  height: fit-content;
  position: sticky;
  top: 20px;
  margin: 30px 30px 30px 0;
`;

const PanelHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
`;

const PanelIcon = styled.div`
  font-size: 24px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e3f2fd;
  border-radius: 8px;
`;

const PanelTitle = styled.h3`
  margin: 0;
  font-size: 20px;
  color: #212529;
`;

const ScheduleCount = styled.span`
  background: #007bff;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  margin-left: auto;
`;

const ScheduleList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 500px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 2px;
  }

  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 2px;

    &:hover {
      background: #a8a8a8;
    }
  }
`;

const ScheduleItem = styled.div`
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 16px;
  transition: all 0.2s;

  &:hover {
    background: #e9ecef;
    border-color: #dee2e6;
  }
`;

const ScheduleHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
`;

const ScheduleLocation = styled.h4`
  margin: 0;
  font-size: 16px;
  color: #212529;
`;

const PriorityBadge = styled.span`
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 500;
  color: white;
  background: ${props => {
    const colors = {
      urgent: '#dc3545',
      high: '#fd7e14',
      medium: '#ffc107',
      low: '#28a745'
    };
    return colors[props.$priority] || '#6c757d';
  }};
`;

const ScheduleInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 8px;
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #6c757d;
`;

const ScheduleNotes = styled.p`
  margin: 0;
  font-size: 12px;
  color: #495057;
  line-height: 1.4;
  background: white;
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #e9ecef;
`;

const RemoveButton = styled.button`
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 11px;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-top: 8px;

  &:hover {
    background: #c82333;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #6c757d;

  .empty-icon {
    font-size: 48px;
    margin-bottom: 16px;
  }

  h4 {
    margin: 0 0 8px 0;
    font-size: 16px;
    color: #495057;
  }

  p {
    margin: 0;
    font-size: 14px;
  }
`;

const SchedulePanel = ({ schedules, onRemoveSchedule }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    const dayName = dayNames[date.getDay()];
    
    return `${month}월 ${day}일 (${dayName})`;
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? '오후' : '오전';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    
    return `${ampm} ${displayHour}:${minutes}`;
  };

  const getPriorityText = (priority) => {
    const texts = {
      urgent: '긴급',
      high: '높음',
      medium: '보통',
      low: '낮음'
    };
    return texts[priority] || priority;
  };

  // 날짜순으로 정렬
  const sortedSchedules = [...schedules].sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}`);
    const dateB = new Date(`${b.date}T${b.time}`);
    return dateA - dateB;
  });

  return (
    <PanelContainer>
      <PanelHeader>
        <PanelIcon>📅</PanelIcon>
        <PanelTitle>점검 일정</PanelTitle>
        <ScheduleCount>{schedules.length}</ScheduleCount>
      </PanelHeader>

      <ScheduleList>
        {sortedSchedules.length === 0 ? (
          <EmptyState>
            <div className="empty-icon">📅</div>
            <h4>예정된 점검이 없습니다</h4>
            <p>점검 목록에서 일정을 추가해보세요</p>
          </EmptyState>
        ) : (
          sortedSchedules.map(schedule => (
            <ScheduleItem key={schedule.id}>
              <ScheduleHeader>
                <ScheduleLocation>{schedule.location}</ScheduleLocation>
                <PriorityBadge $priority={schedule.priority}>
                  {getPriorityText(schedule.priority)}
                </PriorityBadge>
              </ScheduleHeader>

              <ScheduleInfo>
                <InfoItem>
                  📍 {schedule.district}
                </InfoItem>
                <InfoItem>
                  📅 {formatDate(schedule.date)}
                </InfoItem>
                <InfoItem>
                  🕐 {formatTime(schedule.time)}
                </InfoItem>
              </ScheduleInfo>

              {schedule.notes && (
                <ScheduleNotes>{schedule.notes}</ScheduleNotes>
              )}

              <RemoveButton onClick={() => onRemoveSchedule(schedule.id)}>
                일정 삭제
              </RemoveButton>
            </ScheduleItem>
          ))
        )}
      </ScheduleList>
    </PanelContainer>
  );
};

export default SchedulePanel;