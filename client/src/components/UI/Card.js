import styled from 'styled-components';
import { motion } from 'framer-motion';

const Card = styled(motion.div)`
  background: ${({ theme }) => theme?.colors?.background?.paper || '#F5F5F5'};
  border-radius: ${({ theme }) => theme?.borderRadius?.lg || '12px'};
  padding: ${({ theme }) => theme?.spacing?.lg || '24px'};
  box-shadow: ${({ theme }) => theme?.shadows?.card || '0 2px 4px rgba(0,0,0,0.1)'};
  
  ${({ glass }) => glass && `
    background: ${({ theme }) => theme?.colors?.glass?.background || 'rgba(255, 255, 255, 0.05)'};
    backdrop-filter: blur(10px);
    border: 1px solid ${({ theme }) => theme?.colors?.glass?.border || 'rgba(255, 255, 255, 0.1)'};
  `}
`;

export default Card; 