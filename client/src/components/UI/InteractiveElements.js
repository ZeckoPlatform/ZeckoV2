import styled from 'styled-components';
import { motion } from 'framer-motion';

export const InteractiveCard = styled(motion.div)`
  ${cardStyle}
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.medium};

  &:hover {
    transform: translateY(-5px);
    box-shadow: ${({ theme }) => theme.shadows.hover};
  }

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle at var(--mouse-x) var(--mouse-y), 
                rgba(255,255,255,0.1) 0%, 
                rgba(255,255,255,0) 80%);
    opacity: 0;
    transition: opacity 0.3s;
  }

  &:hover::after {
    opacity: 1;
  }
`;

export const RippleButton = styled(motion.button)`
  position: relative;
  overflow: hidden;
  
  &::after {
    content: '';
    position: absolute;
    width: 100px;
    height: 100px;
    background: radial-gradient(circle, 
                rgba(255,255,255,0.8) 0%, 
                rgba(255,255,255,0) 80%);
    transform: scale(0);
    opacity: 0;
    pointer-events: none;
  }

  &:active::after {
    transform: scale(4);
    opacity: 0;
    transition: 0s;
  }
`;

export const HoverGlow = styled(motion.div)`
  position: relative;

  &::before {
    content: '';
    position: absolute;
    inset: -1px;
    background: ${({ theme }) => theme.colors.primary.gradient};
    filter: blur(15px);
    opacity: 0;
    transition: opacity 0.3s;
  }

  &:hover::before {
    opacity: 0.5;
  }
`; 