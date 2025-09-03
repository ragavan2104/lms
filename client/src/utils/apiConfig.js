// Function to determine the API base URL
export const getApiBaseUrl = () => {
  // Check if we're in development or production
  if (import.meta.env.DEV) {
    // In development, use environment variable or default to localhost
    return import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
  } else {
    // In production, construct URL based on current host
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    const port = window.location.port;
    
    // If port is specified and it's not standard HTTP/HTTPS ports
    if (port && port !== '80' && port !== '443') {
      // For port forwarding scenarios, try to use the same port but with backend port offset
      // This assumes backend is running on port 5000 when frontend is on 5173
      const backendPort = port === '5173' ? '5000' : '5000';
      return `${protocol}//${hostname}:${backendPort}/api`;
    } else {
      // For standard deployments, assume API is on same host with /api path
      return `${protocol}//${hostname}/api`;
    }
  }
};

// Function to get base URL without /api suffix (for gate entry and other special cases)
export const getBaseUrl = () => {
  const apiUrl = getApiBaseUrl();
  return apiUrl.replace('/api', '');
};
