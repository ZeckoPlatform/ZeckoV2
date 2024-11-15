import styled from 'styled-components';
import { fadeIn, slideUp } from '../../styles/animations';
import { cardStyle, glassEffect } from '../../styles/common';

const DashboardContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  animation: ${fadeIn} ${({ theme }) => theme.transitions.medium} ease-in;
`;

const DashboardCard = styled.div`
  ${cardStyle};
  padding: ${({ theme }) => theme.spacing.lg};
  animation: ${slideUp} ${({ theme }) => theme.transitions.medium} ease-out;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const StatCard = styled.div`
  ${cardStyle};
  ${glassEffect};
  padding: ${({ theme }) => theme.spacing.lg};
  text-align: center;
`;

const StatValue = styled.div`
  font-size: ${({ theme }) => theme.typography.size.h2};
  font-weight: ${({ theme }) => theme.typography.weight.bold};
  color: ${({ theme }) => theme.colors.primary.main};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const StatLabel = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.size.sm};
`;

const ChartContainer = styled.div`
  height: 300px;
  margin-top: ${({ theme }) => theme.spacing.lg};
`;

const ActivityFeed = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const ActivityItem = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ theme }) => theme.colors.background.paper};

  &:hover {
    background: ${({ theme }) => `${theme.colors.primary.main}05`};
  }
`;

const Dashboard = () => {
  return (
    <DashboardContainer>
      {/* Your dashboard content */}
    </DashboardContainer>
  );
};

export default Dashboard; 