import React from 'react';
import { FiAlertTriangle, FiRefreshCw, FiHome } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

// Basic styles
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    textAlign: 'center',
    minHeight: '400px',
    color: '#ffffff'
  },
  icon: {
    color: '#f44336',
    fontSize: '4rem',
    marginBottom: '1rem'
  },
  title: {
    color: '#ffffff',
    marginBottom: '1rem'
  },
  message: {
    color: '#bdbdbd',
    marginBottom: '2rem',
    maxWidth: '600px'
  },
  actions: {
    display: 'flex',
    gap: '1rem'
  },
  button: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    border: 'none',
    background: '#4CAF50',
    color: '#ffffff',
    cursor: 'pointer',
    fontWeight: 500,
    transition: 'opacity 0.2s ease'
  },
  outlinedButton: {
    background: 'transparent',
    border: '1px solid #4CAF50',
    color: '#4CAF50'
  }
};

class ErrorBoundaryClass extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.log('Error caught by boundary:', error);
    console.log('Error info:', errorInfo);
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
        <div style={styles.container}>
          <div style={styles.icon}>
            <FiAlertTriangle />
          </div>
          <h2 style={styles.title}>
            Oops! Something went wrong
          </h2>
          <p style={styles.message}>
            We're sorry for the inconvenience. Please try again or return to the home page.
          </p>
          <div style={styles.actions}>
            <button
              onClick={this.handleReload}
              style={styles.button}
            >
              <FiRefreshCw /> Reload Page
            </button>
            <button
              onClick={this.handleGoHome}
              style={{ ...styles.button, ...styles.outlinedButton }}
            >
              <FiHome /> Go Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Wrap with navigate
const ErrorBoundary = (props) => {
  const navigate = useNavigate();
  return <ErrorBoundaryClass {...props} navigate={navigate} />;
};

export default ErrorBoundary; 