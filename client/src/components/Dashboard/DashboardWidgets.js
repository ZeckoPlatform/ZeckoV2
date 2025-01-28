import styled from 'styled-components';
import { motion } from 'framer-motion';
import { cardStyle, glassEffect } from '../../styles/mixins';

// Analytics Widget
const AnalyticsWidget = styled(motion.div)`
  ${cardStyle}
  ${glassEffect}
  padding: ${({ theme }) => theme.spacing.lg};
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const StatBox = styled(motion.div)`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ theme }) => `${theme.colors.primary.main}08`};

  h4 {
    color: ${({ theme }) => theme.colors.text.secondary};
    font-size: ${({ theme }) => theme.typography.size.sm};
    margin-bottom: ${({ theme }) => theme.spacing.sm};
  }

  .value {
    color: ${({ theme }) => theme.colors.primary.main};
    font-size: ${({ theme }) => theme.typography.size.xl};
    font-weight: ${({ theme }) => theme.typography.weight.bold};
  }

  .trend {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: ${({ theme }) => theme.spacing.xs};
    margin-top: ${({ theme }) => theme.spacing.xs};
    font-size: ${({ theme }) => theme.typography.size.sm};

    &.up { color: ${({ theme }) => theme.colors.status.success}; }
    &.down { color: ${({ theme }) => theme.colors.status.error}; }
  }
`;

// Recent Activity Widget
const ActivityWidget = styled(motion.div)`
  ${cardStyle}
  padding: ${({ theme }) => theme.spacing.lg};
  max-height: 400px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.background.paper};
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.primary.light};
    border-radius: ${({ theme }) => theme.borderRadius.sm};
  }
`;

const ActivityItem = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  border-bottom: 1px solid ${({ theme }) => theme.colors.text.disabled};

  &:last-child {
    border-bottom: none;
  }

  .icon {
    width: 40px;
    height: 40px;
    border-radius: ${({ theme }) => theme.borderRadius.round};
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${({ theme }) => `${theme.colors.primary.main}10`};
    color: ${({ theme }) => theme.colors.primary.main};
  }

  .content {
    flex: 1;

    h5 {
      color: ${({ theme }) => theme.colors.text.primary};
      margin-bottom: ${({ theme }) => theme.spacing.xs};
    }

    p {
      color: ${({ theme }) => theme.colors.text.secondary};
      font-size: ${({ theme }) => theme.typography.size.sm};
    }
  }

  .time {
    color: ${({ theme }) => theme.colors.text.disabled};
    font-size: ${({ theme }) => theme.typography.size.sm};
  }
`;

// Chart Widget
const ChartWidget = styled(motion.div)`
  ${cardStyle}
  padding: ${({ theme }) => theme.spacing.lg};
  height: 400px;

  .chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: ${({ theme }) => theme.spacing.lg};
  }

  .chart-controls {
    display: flex;
    gap: ${({ theme }) => theme.spacing.sm};
  }
`;

// Task Widget
const TaskWidget = styled(motion.div)`
  ${cardStyle}
  padding: ${({ theme }) => theme.spacing.lg};

  .task-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: ${({ theme }) => theme.spacing.md};
  }

  .progress-bar {
    height: 8px;
    background: ${({ theme }) => `${theme.colors.primary.main}20`};
    border-radius: ${({ theme }) => theme.borderRadius.sm};
    margin-bottom: ${({ theme }) => theme.spacing.md};

    .progress {
      height: 100%;
      background: ${({ theme }) => theme.colors.primary.gradient};
      border-radius: inherit;
      transition: width 0.3s ease;
    }
  }
`;

const TaskItem = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ theme }) => theme.colors.background.paper};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  transition: all ${({ theme }) => theme.transitions.short};

  &:hover {
    transform: translateX(5px);
    background: ${({ theme }) => `${theme.colors.primary.main}05`};
  }

  .checkbox {
    width: 20px;
    height: 20px;
    border: 2px solid ${({ theme }) => theme.colors.primary.main};
    border-radius: ${({ theme }) => theme.borderRadius.sm};
    cursor: pointer;
    transition: all 0.2s ease;

    &.checked {
      background: ${({ theme }) => theme.colors.primary.main};
    }
  }

  .task-content {
    flex: 1;

    &.completed {
      text-decoration: line-through;
      color: ${({ theme }) => theme.colors.text.disabled};
    }
  }

  .due-date {
    font-size: ${({ theme }) => theme.typography.size.sm};
    color: ${({ theme }) => theme.colors.text.secondary};
  }
`; 