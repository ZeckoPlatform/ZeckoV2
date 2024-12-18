import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { HeroSection } from '../components/HeroSection';
import SimpleCarousel from '../components/SimpleCarousel';
import api from '../services/api';

const DebugBox = styled.div`
  position: fixed;
  top: 70px;
  left: 10px;
  background: #f0f0f0;
  padding: 10px;
  border: 2px solid red;
  z-index: 9999;
`;

const Home = () => {
  console.log('Home component rendering');

  return (
    <div>
      <DebugBox>
        Debug: Home Component is rendering
      </DebugBox>
      
      <div style={{ 
        marginTop: '60px', 
        padding: '20px',
        background: '#e0e0e0',
        minHeight: '100vh'
      }}>
        <h1>Welcome to Zecko</h1>
        <p>This is a test render</p>
      </div>
    </div>
  );
};

export default Home;
