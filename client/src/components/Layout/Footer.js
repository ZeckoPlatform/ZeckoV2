import styled from 'styled-components';
import { flexBetween } from '../../styles/mixins';

const FooterContainer = styled.footer`
  background: ${({ theme }) => theme.colors.background.paper};
  padding: ${({ theme }) => `${theme.spacing.xl} ${theme.spacing.lg}`};
  margin-top: auto;
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${({ theme }) => theme.spacing.xl};
`;

const FooterSection = styled.div`
  h4 {
    color: ${({ theme }) => theme.colors.text.primary};
    margin-bottom: ${({ theme }) => theme.spacing.md};
  }
`;

const FooterLinks = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const FooterLink = styled.a`
  color: ${({ theme }) => theme.colors.text.secondary};
  transition: color ${({ theme }) => theme.transitions.short};

  &:hover {
    color: ${({ theme }) => theme.colors.primary.main};
  }
`;

const FooterBottom = styled.div`
  ${flexBetween};
  padding-top: ${({ theme }) => theme.spacing.lg};
  margin-top: ${({ theme }) => theme.spacing.lg};
  border-top: 1px solid ${({ theme }) => theme.colors.text.disabled};
  color: ${({ theme }) => theme.colors.text.secondary};
`; 