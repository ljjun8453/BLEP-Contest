import styled from 'styled-components';
import StatCard from './StatCard';

const DashboardContainer = styled.section`
  padding: 30px;
  background: #f8f9fa;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  max-width: 1200px;
  margin: 0 auto;

  @media (max-width: 968px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const Dashboard = ({ stats }) => {
  return (
    <DashboardContainer>
      <StatsGrid>
        <StatCard
          title="점검 대기"
          count={stats.pending}
          icon="📋"
          color="blue"
        />
        <StatCard
          title="점검 완료"
          count={stats.completed}
          icon="✅"
          color="green"
        />
        <StatCard
          title="긴급 점검"
          count={stats.urgent}
          icon="❗"
          color="red"
        />
        <StatCard
          title="점검 일정"
          count={stats.scheduled}
          icon="📅"
          color="gray"
        />
      </StatsGrid>
    </DashboardContainer>
  );
};

export default Dashboard;