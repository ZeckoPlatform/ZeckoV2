import styled from 'styled-components';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';

const LayoutWrapper = styled.div`
  min-height: 100vh;
  display: grid;
  grid-template-areas:
    "header header"
    "sidebar main"
    "footer footer";
  grid-template-columns: auto 1fr;
  grid-template-rows: auto 1fr auto;
`;

const Main = styled.main`
  grid-area: main;
  padding: ${({ theme }) => theme?.spacing?.lg || '1.5rem'};
  background: ${({ theme }) => theme?.colors?.background?.default || '#FFFFFF'};
`;

const Layout = ({ children }) => {
  return (
    <LayoutWrapper>
      <Header />
      <Sidebar />
      <Main>{children}</Main>
      <Footer />
    </LayoutWrapper>
  );
};

export default Layout; 