import styled from 'styled-components';
import { motion } from 'framer-motion';

const DashboardCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.background.paper};
  padding: ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.card};
  
  ${({ fullWidth }) => fullWidth && `
    width: 100%;
  `}
  
  ${({ variant }) => variant === 'outlined' && `
    background: transparent;
    border: 1px solid ${({ theme }) => theme.colors.text.disabled}20;
    box-shadow: none;
  `}
`;

export default DashboardCard; 