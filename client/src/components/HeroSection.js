import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const HeroContainer = styled.section`
  background: linear-gradient(
    135deg,
    #1a237e 0%,
    #0d47a1 35%,
    #2962ff 100%
  );
  position: relative;
  color: white;
  padding: 180px 20px;
  text-align: center;
  margin-top: -60px;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 20% 150%, rgba(41, 98, 255, 0.15) 0%, transparent 50%),
      radial-gradient(circle at 80% -50%, rgba(255, 255, 255, 0.13) 0%, transparent 50%);
    z-index: 1;
  }

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    opacity: 0.1;
    z-index: 1;
  }
`;

const HeroContent = styled(motion.div)`
  position: relative;
  max-width: 900px;
  margin: 0 auto;
  z-index: 2;
`;

const HeroTitle = styled(motion.h1)`
  font-size: 4em;
  font-weight: 800;
  margin-bottom: 20px;
  background: linear-gradient(135deg, #ffffff 0%, #e3f2fd 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    font-size: 2.5em;
  }
`;

const HeroSubtitle = styled(motion.p)`
  font-size: 1.5em;
  margin-bottom: 40px;
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  line-height: 1.6;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;

  @media (max-width: 768px) {
    font-size: 1.2em;
  }
`;

const CTAButton = styled(motion(Link))`
  display: inline-block;
  padding: 18px 48px;
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 1) 0%,
    rgba(255, 255, 255, 0.9) 100%
  );
  color: #1a237e;
  text-decoration: none;
  border-radius: 50px;
  font-weight: bold;
  font-size: 1.2em;
  transition: transform 0.3s, box-shadow 0.3s;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  text-transform: uppercase;
  letter-spacing: 1px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
  }

  @media (max-width: 768px) {
    padding: 15px 35px;
    font-size: 1.1em;
  }
`;

const HighlightSpan = styled.span`
  color: #82b1ff;
  font-weight: bold;
`;

const FloatingShapes = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  pointer-events: none;
`;

export function HeroSection() {
  return (
    <HeroContainer>
      <FloatingShapes
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      />
      <HeroContent
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <HeroTitle
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Connect with Top Professionals
        </HeroTitle>
        <HeroSubtitle
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          Find and collaborate with <HighlightSpan>skilled experts</HighlightSpan> who can help grow your business
        </HeroSubtitle>
        <CTAButton
          to="/register"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          Get Started
        </CTAButton>
      </HeroContent>
    </HeroContainer>
  );
}
