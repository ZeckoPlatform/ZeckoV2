import styled from 'styled-components';
import { motion } from 'framer-motion';

const Card = styled(motion.div)`
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  box-shadow: ${({ theme }) => theme.shadows.card};
  
  ${({ glass }) => glass && `
    background: ${({ theme }) => theme.colors.glass.background};
    backdrop-filter: blur(10px);
    border: 1px solid ${({ theme }) => theme.colors.glass.border};
  `}
`;

export default Card; 