import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
  background: ${({ theme }) => theme?.colors?.background?.paper || '#F5F5F5'};
  color: ${({ theme }) => theme?.colors?.text?.primary || '#333333'};
`;

const IconWrapper = styled.div`
  color: ${({ theme }) => theme?.colors?.status?.error || '#F44336'};
  font-size: 4rem;
  margin-bottom: 1rem;
`;

const Title = styled.h2`
  color: ${({ theme }) => theme?.colors?.text?.primary || '#333333'};
  margin-bottom: 1rem;
`;

const Message = styled.p`
  color: ${({ theme }) => theme?.colors?.text?.secondary || '#666666'};
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
  border-radius: ${({ theme }) => theme?.borderRadius?.md || '8px'};
  border: none;
  background: ${({ theme, outlined }) => 
    outlined ? 'transparent' : theme?.colors?.primary?.main || '#4CAF50'};
  color: ${({ theme, outlined }) => 
    outlined ? theme?.colors?.primary?.main || '#4CAF50' : theme?.colors?.primary?.text || '#FFFFFF'};
  border: ${({ theme, outlined }) => 
    outlined ? `1px solid ${theme?.colors?.primary?.main || '#4CAF50'}` : 'none'};
  cursor: pointer;
  font-weight: 500;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.9;
  }
`;

const ErrorDetails = styled.div`
  margin-top: 20px;
  text-align: left;
  background: ${({ theme }) => theme?.colors?.background?.default || '#FFFFFF'};
  padding: 1rem;
  border-radius: 8px;
  max-width: 800px;
  overflow-x: auto;
`;

const ErrorCode = styled.pre`
  white-space: pre-wrap;
  font-family: monospace;
  font-size: 0.9rem;
  color: ${({ theme }) => theme?.colors?.text?.secondary || '#666666'};
  margin: 0.5rem 0;
`;

class ErrorBoundaryClass extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null,
      errorCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    console.error('Error caught in getDerivedStateFromError:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to your error reporting service
    console.error('Error caught by boundary:', error);
    console.error('Component stack:', errorInfo.componentStack);
    
    this.setState(prevState => ({ 
      errorInfo,
      errorCount: prevState.errorCount + 1
    }));

    // Optional: Send error to your error tracking service
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(error);
      this.logErrorToService(error, errorInfo);
    }
  }

  logErrorToService = (error, errorInfo) => {
    // Implement your error logging logic here
    const errorData = {
      error: error.toString(),
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };
    
    console.error('Error logged:', errorData);
  };

  handleReload = () => {
    // Clear any cached data that might be causing the error
    sessionStorage.clear();
    window.location.reload();
  };

  handleGoHome = () => {
    // Clear error state and navigate home
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      const isDevelopment = process.env.NODE_ENV !== 'production';
      const showDetailedError = isDevelopment || this.state.errorCount > 3;

      return (
        <ErrorContainer>
          <IconWrapper>
            <FiAlertTriangle />
          </IconWrapper>
          <Title>
            {this.state.errorCount > 3 
              ? 'Persistent Error Detected'
              : 'Oops! Something went wrong'}
          </Title>
          <Message>
            {this.state.errorCount > 3 
              ? 'We\'re experiencing technical difficulties. Our team has been notified.'
              : 'We\'re sorry for the inconvenience. Please try again or return to the home page.'}
          </Message>
          
          {showDetailedError && (
            <ErrorDetails>
              <ErrorCode>
                {this.state.error && this.state.error.toString()}
              </ErrorCode>
              {this.state.errorInfo && (
                <ErrorCode>
                  {this.state.errorInfo.componentStack}
                </ErrorCode>
              )}
            </ErrorDetails>
          )}

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

export default ErrorBoundaryClass; 