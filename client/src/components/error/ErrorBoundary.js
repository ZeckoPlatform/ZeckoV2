import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { logger } from '../../services/logger/Logger';
import { FiAlertTriangle, FiRefreshCw, FiHome } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useEffect } from 'react';

const ErrorContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.xl};
  text-align: center;
  min-height: 400px;
`;

const ErrorIcon = styled(motion.div)`
  color: ${({ theme }) => theme.colors.status.error};
  font-size: 4rem;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const ErrorTitle = styled.h2`
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const ErrorMessage = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  max-width: 600px;
`;

const ErrorActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
`;

const Button = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: none;
  background: ${({ theme, variant }) => 
    variant === 'outlined' 
      ? 'transparent'
      : theme.colors.primary.gradient};
  color: ${({ theme, variant }) => 
    variant === 'outlined'
      ? theme.colors.primary.main
      : theme.colors.primary.text};
  cursor: pointer;
  font-weight: 500;
  border: ${({ theme, variant }) =>
    variant === 'outlined'
      ? `1px solid ${theme.colors.primary.main}`
      : 'none'};

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

// Wrap the class component to use hooks
const ErrorBoundaryWithRouter = (props) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  return <ErrorBoundary {...props} navigate={navigate} logout={logout} />;
};

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null,
      isAuthError: false,
      isTimeout: false
    };
  }

  static getDerivedStateFromError(error) {
    return { 
      hasError: true,
      isAuthError: error.message?.includes('Authentication failed'),
      isTimeout: error.message?.includes('timeout') || error.code === 'ECONNABORTED'
    };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo
    });

    logger.error('React Error Boundary Caught Error:', error, {
      componentStack: errorInfo.componentStack,
      url: window.location.href,
      isAuthError: error.message?.includes('Authentication failed'),
      isTimeout: error.message?.includes('timeout') || error.code === 'ECONNABORTED'
    });

    // Handle auth errors
    if (error.message?.includes('Authentication failed')) {
      this.handleAuthError();
    }
  }

  handleAuthError = async () => {
    await this.props.logout();
    this.props.navigate('/login');
  };

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      isAuthError: false,
      isTimeout: false
    });
  };

  handleGoHome = () => {
    this.props.navigate('/');
    this.handleReset();
  };

  getErrorMessage = () => {
    if (this.state.isAuthError) {
      return "Your session has expired. Please log in again.";
    }
    if (this.state.isTimeout) {
      return "The request took too long to complete. Please try again.";
    }
    return this.props.fallbackMessage || 
      "We're sorry, but something went wrong. Please try again or contact support if the problem persists.";
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorContainer
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <ErrorIcon
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <FiAlertTriangle />
          </ErrorIcon>
          <ErrorTitle>
            {this.state.isAuthError ? 'Session Expired' : 'Oops! Something went wrong'}
          </ErrorTitle>
          <ErrorMessage>
            {this.getErrorMessage()}
          </ErrorMessage>
          <ErrorActions>
            {!this.state.isAuthError && (
              <Button
                onClick={this.handleReload}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FiRefreshCw /> Reload Page
              </Button>
            )}
            {this.state.isAuthError ? (
              <Button
                onClick={() => this.props.navigate('/login')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Log In Again
              </Button>
            ) : (
              <Button
                variant="outlined"
                onClick={this.handleReset}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Try Again
              </Button>
            )}
            <Button
              variant="outlined"
              onClick={this.handleGoHome}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FiHome /> Go Home
            </Button>
          </ErrorActions>
          {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
            <details style={{ marginTop: '20px', textAlign: 'left' }}>
              <summary>Error Details</summary>
              <pre style={{ margin: '10px', whiteSpace: 'pre-wrap' }}>
                {this.state.error && this.state.error.toString()}
                <br />
                {this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}
        </ErrorContainer>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundaryWithRouter; 