import styled from 'styled-components';
import { motion } from 'framer-motion';

const DashboardCard = styled(motion.div)`
  background: ${({ theme }) => theme?.colors?.background?.paper || '#F5F5F5'};
  padding: ${({ theme }) => theme?.spacing?.lg || '24px'};
  border-radius: ${({ theme }) => theme?.borderRadius?.lg || '12px'};
  box-shadow: ${({ theme }) => theme?.shadows?.card || '0 2px 4px rgba(0,0,0,0.1)'};
  
  ${({ fullWidth }) => fullWidth && `
    width: 100%;
  `}
  
  ${({ variant }) => variant === 'outlined' && `
    background: transparent;
    border: 1px solid ${({ theme }) => theme?.colors?.text?.disabled || '#999999'}20;
    box-shadow: none;
  `}
`;

export default DashboardCard; 