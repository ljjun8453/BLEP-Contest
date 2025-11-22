import styled from 'styled-components';

const getColorStyles = (color) => {
  const colorMap = {
    blue: { border: '#2196f3', iconBg: '#e3f2fd' },
    green: { border: '#4caf50', iconBg: '#e8f5e8' },
    red: { border: '#f44336', iconBg: '#ffebee' },
    gray: { border: '#9e9e9e', iconBg: '#f5f5f5' }
  };
  return colorMap[color] || colorMap.gray;
};

const StatCardContainer = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-left: 4px solid ${props => getColorStyles(props.color).border};
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  }
`;

const StatContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const StatInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const StatTitle = styled.h3`
  font-size: 14px;
  color: #6c757d;
  margin: 0;
  font-weight: 500;
`;

const StatCount = styled.span`
  font-size: 28px;
  font-weight: 700;
  color: #212529;
`;

const StatIcon = styled.div`
  font-size: 32px;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: ${props => getColorStyles(props.color).iconBg};
`;

const StatCard = ({ title, count, icon, color }) => {
  return (
    <StatCardContainer color={color}>
      <StatContent>
        <StatInfo>
          <StatTitle>{title}</StatTitle>
          <StatCount>{count}건</StatCount>
        </StatInfo>
        <StatIcon color={color}>
          {icon}
        </StatIcon>
      </StatContent>
    </StatCardContainer>
  );
};

export default StatCard;