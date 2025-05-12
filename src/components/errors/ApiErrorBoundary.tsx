import React, { useState, useEffect } from 'react';
import { useApiStatus } from '@/hooks/useApiStatus';

interface ApiErrorBoundaryProps {
  children: React.ReactNode;
}

/**
 * Component to handle API connection errors and provide a user-friendly message
 */
const ApiErrorBoundary: React.FC<ApiErrorBoundaryProps> = ({ children }) => {
  const { isConnected, error, checkConnection } = useApiStatus();
  const [showError, setShowError] = useState<boolean>(false);
  
  // Show error message after a slight delay to avoid flashing during quick connections
  useEffect(() => {
    if (isConnected === false) {
      const timer = setTimeout(() => {
        setShowError(true);
      }, 500);
      
      return () => clearTimeout(timer);
    } else {
      setShowError(false);
    }
  }, [isConnected]);
  
  if (showError) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Connection Error</h2>
          <p className="text-gray-700 mb-6">
            {error || "Could not connect to the backend service. Please check your connection and try again."}
          </p>
          <div className="flex justify-end">
            <button
              onClick={checkConnection}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return <>{children}</>;
};

export default ApiErrorBoundary;