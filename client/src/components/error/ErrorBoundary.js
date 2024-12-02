import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FiAlertTriangle, FiRefreshCw, FiHome } from 'react-icons/fi';

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
  min-height: 400px;
  background: ${({ theme }) => theme.colors.background.paper};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const IconWrapper = styled.div`
  color: ${({ theme }) => theme.colors.status.error};
  font-size: 4rem;
  margin-bottom: 1rem;
`;

const Title = styled.h2`
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 1rem;
`;

const Message = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: 2rem;
  max-width: 600px;
`;

const ActionsContainer = styled.div`
  display: flex;
  gap: 1rem;
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: none;
  background: ${({ theme, outlined }) => outlined ? 'transparent' : theme.colors.primary.main};
  color: ${({ theme, outlined }) => outlined ? theme.colors.primary.main : theme.colors.primary.text};
  border: ${({ theme, outlined }) => outlined ? `1px solid ${theme.colors.primary.main}` : 'none'};
  cursor: pointer;
  font-weight: 500;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.9;
  }
`;

class ErrorBoundaryClass extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error);
    console.error('Error info:', errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    this.props.navigate('/');
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorContainer>
          <IconWrapper>
            <FiAlertTriangle />
          </IconWrapper>
          <Title>
            Oops! Something went wrong
          </Title>
          <Message>
            We're sorry for the inconvenience. Please try again or return to the home page.
          </Message>
          <ActionsContainer>
            <Button onClick={this.handleReload}>
              <FiRefreshCw /> Reload Page
            </Button>
            <Button outlined onClick={this.handleGoHome}>
              <FiHome /> Go Home
            </Button>
          </ActionsContainer>
        </ErrorContainer>
      );
    }

    return this.props.children;
  }
}

// Wrap with navigate hook
const ErrorBoundary = (props) => {
  const navigate = useNavigate();
  return <ErrorBoundaryClass {...props} navigate={navigate} />;
};

export default ErrorBoundary; 