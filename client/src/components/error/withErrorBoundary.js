import React from 'react';
import ErrorBoundary from './ErrorBoundary';

export const withErrorBoundary = (WrappedComponent, options = {}) => {
  return function WithErrorBoundary(props) {
    return (
      <ErrorBoundary {...options}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  };
}; 