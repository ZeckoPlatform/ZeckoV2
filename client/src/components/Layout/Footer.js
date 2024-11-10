import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

const FooterWrapper = styled.footer`
  background: ${({ theme }) => theme.colors.background.paper};
  padding: ${({ theme }) => theme.spacing.xl} 0;
  margin-top: auto;
`;

const FooterContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 ${({ theme }) => theme.spacing.lg};
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${({ theme }) => theme.spacing.xl};
`;

const FooterSection = styled.div`
  h3 {
    color: ${({ theme }) => theme.colors.text.primary};
    margin-bottom: ${({ theme }) => theme.spacing.md};
  }
`;

const FooterLink = styled(Link)`
  display: block;
  color: ${({ theme }) => theme.colors.text.secondary};
  text-decoration: none;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  transition: color 0.2s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.primary.main};
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