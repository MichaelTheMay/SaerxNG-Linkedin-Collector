import React, { Component, ReactNode } from 'react';
import { Alert, Box, Button, Typography } from '@mui/material';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: string | null;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo: errorInfo.componentStack
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Box sx={{ p: 3 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="h6" component="div" sx={{ mb: 1 }}>
              Something went wrong
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              {this.state.error?.message || 'An unexpected error occurred'}
            </Typography>
            <Button variant="outlined" onClick={this.handleReset}>
              Try Again
            </Button>
          </Alert>

          {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Error details:
              </Typography>
              <Box
                component="pre"
                sx={{
                  fontSize: '0.75rem',
                  backgroundColor: 'grey.100',
                  p: 1,
                  borderRadius: 1,
                  overflow: 'auto',
                  maxHeight: 200
                }}
              >
                {this.state.errorInfo}
              </Box>
            </Box>
          )}
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;