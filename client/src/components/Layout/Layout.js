import styled from 'styled-components';

const LayoutContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const MainContent = styled.main`
  flex: 1;
  margin-left: ${props => props.hasSidebar ? '280px' : '0'};
  padding: ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.background.main};
  transition: margin-left ${({ theme }) => theme.transitions.medium};

  @media (max-width: 768px) {
    margin-left: 0;
  }
`;

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  animation: fadeIn ${({ theme }) => theme.transitions.medium} ease-in;
`; 