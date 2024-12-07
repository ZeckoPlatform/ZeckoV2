import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

const FooterWrapper = styled.footer`
  background: ${({ theme }) => theme?.colors?.background?.paper || '#F5F5F5'};
  padding: ${({ theme }) => theme?.spacing?.xl || '2rem'} 0;
  margin-top: auto;
`;

const FooterContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 ${({ theme }) => theme?.spacing?.lg || '1.5rem'};
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${({ theme }) => theme?.spacing?.xl || '2rem'};
`;

const FooterSection = styled.div`
  h3 {
    color: ${({ theme }) => theme?.colors?.text?.primary || '#333333'};
    margin-bottom: ${({ theme }) => theme?.spacing?.md || '1rem'};
  }
`;

const FooterLink = styled(Link)`
  display: block;
  color: ${({ theme }) => theme?.colors?.text?.secondary || '#666666'};
  text-decoration: none;
  margin-bottom: ${({ theme }) => theme?.spacing?.sm || '0.5rem'};
  transition: color 0.2s ease;

  &:hover {
    color: ${({ theme }) => theme?.colors?.primary?.main || '#4CAF50'};
  }
`;

const Footer = () => {
  return (
    <FooterWrapper>
      <FooterContent>
        <FooterSection>
          <h3>About Us</h3>
          <FooterLink to="/about">About</FooterLink>
          <FooterLink to="/contact">Contact</FooterLink>
          <FooterLink to="/careers">Careers</FooterLink>
        </FooterSection>

        <FooterSection>
          <h3>Customer Service</h3>
          <FooterLink to="/help">Help Center</FooterLink>
          <FooterLink to="/shipping">Shipping Info</FooterLink>
          <FooterLink to="/returns">Returns</FooterLink>
        </FooterSection>

        <FooterSection>
          <h3>Legal</h3>
          <FooterLink to="/privacy">Privacy Policy</FooterLink>
          <FooterLink to="/terms">Terms of Service</FooterLink>
        </FooterSection>

        <FooterSection>
          <h3>Connect With Us</h3>
          {/* Add social media links */}
        </FooterSection>
      </FooterContent>
    </FooterWrapper>
  );
};

export default Footer; 