import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

const ChartContainer = styled(motion.div)`
  ${cardStyle}
  padding: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const ChartHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const ChartTitle = styled.h3`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.size.lg};
`;

const ChartControls = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
`;

// Chart theme configuration
export const chartTheme = {
  backgroundColor: ['rgba(75,192,192,0.2)', 'rgba(255,99,132,0.2)'],
  borderColor: ['rgba(75,192,192,1)', 'rgba(255,99,132,1)'],
  tension: 0.4,
  pointRadius: 4,
  pointHoverRadius: 6,
};

// Chart options
export const defaultOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        padding: 20,
        font: {
          size: 12,
        },
      },
    },
    tooltip: {
      backgroundColor: 'rgba(0,0,0,0.8)',
      padding: 12,
      titleFont: {
        size: 14,
      },
      bodyFont: {
        size: 13,
      },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(0,0,0,0.05)',
      },
    },
    x: {
      grid: {
        display: false,
      },
    },
  },
}; 