import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Check if it's a camera-related error
    const errorMessage = error?.message || error?.toString() || '';
    if (errorMessage.includes('NotReadableError') || 
        errorMessage.includes('Could not start video source') ||
        errorMessage.includes('userMedia') ||
        errorMessage.includes('getUserMedia')) {
      return { 
        hasError: true, 
        error: 'Camera error: Could not start video source. Please close other apps using the camera and try again.' 
      };
    }
    return { hasError: true, error: errorMessage };
  }

  componentDidCatch(error, errorInfo) {
    // Suppress React error overlay for camera errors
    if (error?.message?.includes('NotReadableError') || 
        error?.message?.includes('Could not start video source')) {
      // Prevent React error overlay from showing
      console.error('Camera error caught by boundary:', error);
      return;
    }
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '20px',
          backgroundColor: '#fee',
          border: '2px solid #fcc',
          borderRadius: '8px',
          margin: '20px',
          color: '#c33'
        }}>
          <h3>⚠️ Camera Error</h3>
          <p>{this.state.error}</p>
          <button 
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            style={{
              marginTop: '10px',
              padding: '10px 20px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

