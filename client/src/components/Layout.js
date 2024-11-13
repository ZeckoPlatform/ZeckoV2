import React from 'react';
import styled from 'styled-components';
import Navigation from './Navigation';

const LayoutContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.background.default};
`;

const MainWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const ContentContainer = styled.div`
  flex: 1;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

function Layout({ children }) {
  return (
    <LayoutContainer>
      <Navigation />
      <MainWrapper>
        <ContentContainer>
          {children}
        </ContentContainer>
      </MainWrapper>
    </LayoutContainer>
  );
}

export default Layout;
