import { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import api from '@/services/api';

/**
 * Custom hook to monitor API connectivity status
 * @returns Object containing the connection status to the API
 */
export const useApiStatus = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const checkConnection = async () => {
    try {
      // Simple ping endpoint - adjust the URL based on your actual health check endpoint
      await api.get('/health');
      setIsConnected(true);
      setError(null);
    } catch (err) {
      setIsConnected(false);
      
      // Type guard for AxiosError
      if (axios.isAxiosError(err)) {
        const axiosError = err as AxiosError;
        
        if (axiosError.code === 'ECONNABORTED') {
          setError('Connection timeout. Server may be down.');
        } else if (axiosError.code === 'ERR_NETWORK') {
          setError('Network error. Check your connection or the server status.');
        } else if (axiosError.response) {
          setError(`Server responded with error: ${axiosError.response.status}`);
        } else {
          setError('Unknown connection error');
        }
      } else {
        setError('Failed to connect to the API');
      }
    } finally {
      setLastChecked(new Date());
    }
  };

  // Check connection on mount
  useEffect(() => {
    checkConnection();
    
    // Optional: Set up periodic checking
    const interval = setInterval(checkConnection, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, []);

  return {
    isConnected,
    lastChecked,
    error,
    checkConnection
  };
};