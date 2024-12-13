import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const HeroContainer = styled.section`
  background: linear-gradient(135deg, 
    #1a237e 0%, 
    #0d47a1 50%, 
    #01579b 100%
  );
  position: relative;
  color: white;
  padding: 150px 20px;
  text-align: center;
  margin-top: -60px; // To offset the navbar height
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 20% 150%, 
      rgba(255, 255, 255, 0.1) 0%, 
      rgba(255, 255, 255, 0.05) 50%, 
      transparent 100%
    );
  }
`;

const HeroContent = styled(motion.div)`
  position: relative;
  max-width: 800px;
  margin: 0 auto;
  z-index: 1;
`;

const HeroTitle = styled(motion.h1)`
  font-size: 3.5em;
  margin-bottom: 20px;
  background: linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const HeroSubtitle = styled(motion.p)`
  font-size: 1.4em;
  margin-bottom: 30px;
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
`;

const CTAButton = styled(motion(Link))`
  display: inline-block;
  padding: 15px 40px;
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 1) 0%,
    rgba(255, 255, 255, 0.9) 100%
  );
  color: #1a237e;
  text-decoration: none;
  border-radius: 30px;
  font-weight: bold;
  font-size: 1.2em;
  transition: transform 0.3s, box-shadow 0.3s;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
  }
`;

export function HeroSection() {
  return (
    <HeroContainer>
      <HeroContent
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <HeroTitle>Find Your Perfect Match</HeroTitle>
        <HeroSubtitle>
          Connect with skilled professionals and grow your business
        </HeroSubtitle>
        <CTAButton
          to="/register"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Start Here
        </CTAButton>
      </HeroContent>
    </HeroContainer>
  );
}
