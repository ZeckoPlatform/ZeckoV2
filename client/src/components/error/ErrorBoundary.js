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

class ErrorBoundaryClass extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    // Log the error to help with debugging
    console.error('Error caught in getDerivedStateFromError:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log detailed error information
    console.error('Error caught in componentDidCatch:', {
      error,
      componentStack: errorInfo.componentStack
    });
    
    // Update state with error info for potential logging
    this.setState({
      errorInfo
    });

    // Here you could also send the error to your error tracking service
    // if (typeof window.errorTracker === 'function') {
    //   window.errorTracker(error, errorInfo);
    // }
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    if (this.props.navigate) {
      this.props.navigate('/');
      this.setState({ hasError: false, error: null, errorInfo: null });
    } else {
      window.location.href = '/';
    }
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
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <pre style={{ marginTop: '1rem', textAlign: 'left', fontSize: '0.8rem' }}>
                {this.state.error.toString()}
              </pre>
            )}
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

// Wrap with navigate hook, but make it optional
const ErrorBoundary = (props) => {
  let navigate;
  try {
    navigate = useNavigate();
  } catch (error) {
    // If useNavigate fails, we'll fall back to window.location
    navigate = null;
  }
  return <ErrorBoundaryClass {...props} navigate={navigate} />;
};

export default ErrorBoundary; 