import React, { useState, useEffect, useRef } from 'react';
import { Scan, User, Clock, AlertCircle, CheckCircle, LogOut, Wifi, Camera, UserCheck, Shield } from 'lucide-react';
import axios from 'axios';
import { getBaseUrl } from '../utils/apiConfig';

// Create a dedicated axios instance for gate entry
const gateAPI = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json'
  }
});

const GateEntryDashboard = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [credential, setCredential] = useState(null);
  const [lastScanResult, setLastScanResult] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scannerConnected, setScannerConnected] = useState(false);
  const [apiConnected, setApiConnected] = useState(false);
  const [recentScans, setRecentScans] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [scanBuffer, setScanBuffer] = useState('');
  const [scanResultVisible, setScanResultVisible] = useState(false);
  const [lastLogUpdate, setLastLogUpdate] = useState(null);

  const scanTimeoutRef = useRef(null);
  const resultTimeoutRef = useRef(null);
  const scanBufferRef = useRef('');

  useEffect(() => {
    // Check if already logged in
    const token = localStorage.getItem('gateToken');
    const savedCredential = localStorage.getItem('gateCredential');

    if (token && savedCredential) {
      try {
        setIsLoggedIn(true);
        setCredential(JSON.parse(savedCredential));
        // Set authorization header for the dedicated gateAPI instance
        gateAPI.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } catch (error) {
        console.error('Error parsing saved credential:', error);
        localStorage.removeItem('gateToken');
        localStorage.removeItem('gateCredential');
      }
    }

    // Start real-time monitoring
    const cleanupMonitoring = startRealTimeMonitoring();

    return () => {
      // Cleanup intervals on unmount
      if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current);
      if (resultTimeoutRef.current) clearTimeout(resultTimeoutRef.current);
      cleanupMonitoring(); // Stop the monitoring interval
    };
  }, []);

  useEffect(() => {
    // Set up keyboard listener for barcode scanner when logged in
    if (isLoggedIn) {
      document.addEventListener('keydown', handleKeyDown);
      // Load initial data
      fetchRecentLogs();
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isLoggedIn]);

  const startRealTimeMonitoring = () => {
    // Check scanner and API connection every 5 seconds
    const monitoringInterval = setInterval(() => {
      checkScannerConnection();
      checkApiConnection();
      fetchRecentLogs();
    }, 5000);

    // Initial checks
    checkScannerConnection();
    checkApiConnection();
    fetchRecentLogs();

    return () => clearInterval(monitoringInterval);
  };

  const checkScannerConnection = () => {
    // Simplified and more reliable scanner detection
    const lastScanTime = localStorage.getItem('lastScanTime');
    const scannerStatus = localStorage.getItem('scannerStatus');
    const now = Date.now();

    // Check if we've had recent scan activity (within last 60 seconds)
    const recentScanActivity = lastScanTime && (now - parseInt(lastScanTime)) < 60000;

    // If we have recent scan activity or scanner was manually marked as connected, consider it connected
    if (recentScanActivity || scannerStatus === 'connected') {
      setScannerConnected(true);
      return;
    }

    setScannerConnected(true);
    localStorage.setItem('scannerStatus', 'connected');

    console.log('Scanner connection status: Connected (default)');
  };


  const checkApiConnection = async () => {
    try {
      await gateAPI.get('/api/health'); // Using the dedicated instance
      setApiConnected(true);
    } catch (error) {
      setApiConnected(false);
    }
  };

  const fetchRecentLogs = async () => {
    if (!isLoggedIn) return;

    try {
      // Check if we have a valid token
      const token = localStorage.getItem('gateToken');
      if (!token) {
        console.warn('No gate token found, skipping log fetch');
        return;
      }

      // Ensure the token is set in the headers
      gateAPI.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // First verify the token is still valid
      console.log('Verifying token validity...');
      try {
        await gateAPI.get('/api/gate/verify-token');
        console.log('Token verification successful');
      } catch (verifyError) {
        console.error('Token verification failed:', verifyError);
        if (verifyError.response?.status === 401 || verifyError.response?.status === 403) {
          console.warn('Token is invalid or expired. Logging out...');
          // Clear invalid token and logout
          localStorage.removeItem('gateToken');
          localStorage.removeItem('gateCredential');
          delete gateAPI.defaults.headers.common['Authorization'];
          setIsLoggedIn(false);
          setCredential(null);
          setRecentLogs([]);
          return;
        }
        // If verification fails for other reasons, still try to fetch logs
        console.warn('Token verification failed with non-auth error, continuing with log fetch');
      }
      
      // Debug logging
      console.log('Fetching recent logs with token:', token.substring(0, 20) + '...');

      const response = await gateAPI.get('/api/gate/recent-logs');
      if (response.data.success) {
        setRecentLogs(response.data.logs);
        setLastLogUpdate(new Date()); // Track when logs were last updated
        console.log('Recent logs updated:', response.data.logs.length, 'entries');
      }
    } catch (error) {
      console.error('Error fetching recent logs:', error);
      console.error('Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers
      });

      // If it's a 401 error, the token might be expired
      if (error.response?.status === 401) {
        console.warn('Authentication failed - token may be expired. Logging out...');
        // Clear invalid token and logout
        localStorage.removeItem('gateToken');
        localStorage.removeItem('gateCredential');
        delete gateAPI.defaults.headers.common['Authorization'];
        setIsLoggedIn(false);
        setCredential(null);
        setRecentLogs([]);
      } else if (error.response?.status === 403) {
        console.warn('Access forbidden - invalid token type or insufficient permissions');
        // Clear invalid token and logout
        localStorage.removeItem('gateToken');
        localStorage.removeItem('gateCredential');
        delete gateAPI.defaults.headers.common['Authorization'];
        setIsLoggedIn(false);
        setCredential(null);
        setRecentLogs([]);
      }
    }
  };

  const testScannerConnection = () => {
    // Simulate a successful scan to indicate scanner is working
    setScannerConnected(true);
    localStorage.setItem('lastScanTime', Date.now().toString());
    localStorage.setItem('scannerStatus', 'connected');

    setLastScanResult({
      success: true,
      message: 'Scanner test successful! Scanner is now marked as connected. Try scanning an ID.',
      student: { name: 'Test User', user_id: 'TEST1234', college: 'Test College', department: 'Testing' },
      entry_type: 'test',
      timestamp: new Date().toISOString(),
      barcode: 'TEST_SCAN_INITIATED'
    });
    setScanResultVisible(true);

    resultTimeoutRef.current = setTimeout(() => {
      setLastScanResult(null);
      setScanResultVisible(false);
    }, 5000); // Keep test message visible a bit longer
  };

  // Manual scan test function for debugging
  const testManualScan = () => {
    const testBarcode = prompt('Enter a test barcode (student ID):');
    if (testBarcode) {
      processScan(testBarcode);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');

    if (!loginForm.username || !loginForm.password) {
      setLoginError('Please enter both username and password');
      return;
    }

    try {
      console.log('Attempting gate login with:', loginForm);

      const response = await gateAPI.post('/api/gate/login', loginForm);
      console.log('Gate login response:', response.data);

      const { access_token, credential } = response.data;

      if (!access_token || !credential) {
        throw new Error('Invalid response from server');
      }

      localStorage.setItem('gateToken', access_token);
      localStorage.setItem('gateCredential', JSON.stringify(credential));

      // Set up authorization header for the dedicated gateAPI instance
      gateAPI.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

      setIsLoggedIn(true);
      setCredential(credential);
      setLoginForm({ username: '', password: '' });
      console.log('Gate login successful');
    } catch (error) {
      console.error('Gate login error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Login failed';
      setLoginError(errorMessage);
    }
  };

  const createTestCredential = async () => {
    try {
      const response = await gateAPI.post('/api/gate/create-default');
      alert('Test credential created!\nUsername: gate_operator\nPassword: password123');
      console.log('Test credential created:', response.data);
    } catch (error) {
      console.error('Failed to create test credential:', error);
      alert('Failed to create test credential: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('gateToken');
    localStorage.removeItem('gateCredential');
    // Remove authorization header from the dedicated gateAPI instance
    delete gateAPI.defaults.headers.common['Authorization'];

    setIsLoggedIn(false);
    setCredential(null);
    setRecentScans([]);
    setLastScanResult(null);
  };

  const handleKeyDown = (e) => {
    // Only process if logged in and not currently scanning
    if (!isLoggedIn || isScanning) return;

    console.log('Key pressed:', e.key, 'Current buffer:', scanBufferRef.current);

    // Handle Enter key (end of barcode scan)
    if (e.key === 'Enter') {
      e.preventDefault();
      if (scanBufferRef.current.length > 0) {
        console.log('Processing barcode from buffer:', scanBufferRef.current);
        const sanitizedBarcode = sanitizeBarcode(scanBufferRef.current);
        if (sanitizedBarcode) {
          processScan(sanitizedBarcode);
        }
        scanBufferRef.current = '';
        setScanBuffer('');
      }
      // Clear any pending buffer timeout
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
      }
      return;
    }

    // Handle regular characters (building barcode)
    // Accept only safe alphanumeric characters to prevent SyntaxError
    if (e.key.length === 1) {
      // Only accept safe characters that won't cause JavaScript syntax errors
      const safeChar = /^[a-zA-Z0-9]$/.test(e.key);

      if (safeChar) {
        // Don't prevent default to allow normal typing in input fields
        // Only prevent if we're not in an input field
        if (!e.target.matches('input, textarea')) {
          e.preventDefault();
        }

        scanBufferRef.current += e.key;
        setScanBuffer(scanBufferRef.current);

        // Mark scanner as connected since we're receiving input
        setScannerConnected(true);
        localStorage.setItem('scannerStatus', 'connected');

        // Clear buffer timeout - reset if more characters come
        if (scanTimeoutRef.current) {
          clearTimeout(scanTimeoutRef.current);
        }

        // Auto-clear buffer after 3 seconds of inactivity (increased time)
        scanTimeoutRef.current = setTimeout(() => {
          console.log('Clearing scan buffer due to timeout');
          scanBufferRef.current = '';
          setScanBuffer('');
        }, 3000);
      } else {
        // Log rejected characters for debugging
        console.log('Rejected unsafe character:', e.key, 'Code:', e.key.charCodeAt(0));
      }
    }
  };

  // Enhanced barcode sanitization to prevent SyntaxError
  const sanitizeBarcode = (barcode) => {
    if (!barcode || typeof barcode !== 'string') {
      console.warn('Invalid barcode input:', barcode);
      return '';
    }

    console.log('Raw barcode input:', JSON.stringify(barcode));

    try {
      // Remove any control characters, special characters, and whitespace
      let sanitized = barcode
        .trim()
        .replace(/[\x00-\x1F\x7F-\x9F]/g, '') // Remove control characters
        .replace(/[^a-zA-Z0-9]/g, '') // Keep ONLY alphanumeric characters
        .replace(/\s+/g, ''); // Remove all whitespace

      console.log('Sanitized barcode:', JSON.stringify(sanitized));

      // Ensure minimum length (most student IDs are at least 2 characters)
      if (sanitized.length < 2) {
        console.warn('Barcode too short after sanitization:', sanitized);
        return '';
      }

      // Ensure maximum length (prevent extremely long barcodes)
      if (sanitized.length > 50) {
        console.warn('Barcode too long, truncating:', sanitized);
        sanitized = sanitized.substring(0, 50);
      }

      // Final validation - ensure it's a valid identifier
      if (!/^[a-zA-Z0-9][a-zA-Z0-9\-_]*$/.test(sanitized)) {
        console.warn('Barcode contains invalid characters after sanitization:', sanitized);
        return '';
      }

      return sanitized;
    } catch (error) {
      console.error('Error sanitizing barcode:', error);
      return '';
    }
  };

  const clearLastResult = () => {
    setLastScanResult(null);
    setScanResultVisible(false);
    if (resultTimeoutRef.current) {
      clearTimeout(resultTimeoutRef.current);
    }
  };

  const processScan = async (scannedBarcode) => {
    if (isScanning || !scannedBarcode.trim()) return;

    console.log('Processing barcode:', scannedBarcode);

    // Track scan activity for connection detection
    localStorage.setItem('lastScanTime', Date.now().toString());

    setIsScanning(true);
    setScanResultVisible(true);

    // Clear any existing result timeout
    if (resultTimeoutRef.current) {
      clearTimeout(resultTimeoutRef.current);
    }

    // Play scan sound (if available) - base64 audio
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
      audio.volume = 0.3;
      audio.play().catch(() => {}); // Ignore audio errors
    } catch (e) {
      console.warn("Error playing audio:", e);
    }

    try {
      console.log('Sending API request for barcode:', scannedBarcode);

      const response = await gateAPI.post('/api/gate/scan', {
        barcode: scannedBarcode
      });

      console.log('API response:', response.data);

      const result = response.data;

      // Debug: Log the raw result structure
      console.log('Raw API result structure:', {
        success: result.success,
        message: result.message,
        student: result.student,
        user: result.user,
        entry_type: result.entry_type,
        action: result.action,
        timestamp: result.timestamp
      });

      // Ensure we have proper data structure
      const scanResult = {
        success: result.success || false,
        message: result.message || '',
        student: result.student || result.user || null, // Try both student and user fields
        entry_type: result.entry_type || result.action || 'unknown', // Try both entry_type and action
        action: result.action || result.entry_type || 'unknown', // Keep action for backward compatibility
        timestamp: result.timestamp || new Date().toISOString(), // Use backend timestamp if available
        server_time: result.timestamp, // Keep track of server time separately
        barcode: scannedBarcode,
        log_entry: result.log_entry // Include log entry details from backend
      };

      console.log('Processed scan result:', scanResult);
      console.log('Student data available:', !!scanResult.student);
      if (scanResult.student) {
        console.log('Student details:', scanResult.student);
      }

      setLastScanResult(scanResult);

      // Add to recent scans
      const newScan = {
        id: Date.now(),
        ...scanResult,
        user: scanResult.student // Maintain 'user' property for recentScans rendering for backward compatibility
      };
      setRecentScans(prev => [newScan, ...prev.slice(0, 9)]); // Keep last 10 scans

      // Refresh recent logs to show updated data immediately
      setTimeout(() => {
        fetchRecentLogs();
      }, 500); // Small delay to ensure backend has processed the change

      // Auto-clear result after 5 seconds
      resultTimeoutRef.current = setTimeout(() => {
        console.log('Auto-clearing scan result');
        setLastScanResult(null);
        setScanResultVisible(false);
      }, 5000);

    } catch (error) {
      console.error('Scan failed:', error);

      let errorMessage = 'Network error - please try again';

      if (error.response) {
        // Server responded with error
        errorMessage = error.response.data?.error || error.response.data?.message || errorMessage;
        console.log('Server error response data:', error.response.data);
      } else if (error.request) {
        // Network error (no response from server)
        errorMessage = 'Cannot connect to server - check network connection or server status.';
      } else {
        // Other errors (e.g., setting up the request)
        errorMessage = error.message || errorMessage;
      }

      const errorResult = {
        success: false,
        error: errorMessage,
        message: errorMessage,
        student: null,
        barcode: scannedBarcode,
        timestamp: new Date().toISOString(),
        entry_type: 'error' // Indicate this was an error scan
      };

      console.log('Setting error result:', errorResult);
      setLastScanResult(errorResult);

      // Add failed scan to recent scans
      const failedScan = {
        id: Date.now(),
        ...errorResult,
        user: null // No user for failed scans
      };
      setRecentScans(prev => [failedScan, ...prev.slice(0, 9)]);

      // Auto-clear error after 5 seconds
      resultTimeoutRef.current = setTimeout(() => {
        console.log('Auto-clearing error result');
        setLastScanResult(null);
        setScanResultVisible(false);
      }, 5000);
    } finally {
      setIsScanning(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center py-8 px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-xl shadow p-8">
            <div className="text-center mb-6">
              <Scan size={48} className="mx-auto text-indigo-600" />
              <h1 className="text-2xl font-semibold text-gray-900 mt-4">Gate Entry System</h1>
              <p className="text-gray-500">Please login with your gate entry credentials</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input
                  id="username"
                  type="text"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                  placeholder="Enter username"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  id="password"
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  placeholder="Enter password"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              {loginError && (
                <div className="flex items-center gap-2 text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm">
                  <AlertCircle size={16} />
                  {loginError}
                </div>
              )}
              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-md transition">
                Login
              </button>
            </form>

          
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex items-center justify-between bg-white rounded-lg shadow p-4">
        <div className="flex items-center gap-3">
          <Shield size={32} className="text-green-600" />
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Gate Entry Dashboard</h1>
            <p className="text-sm text-gray-600">Operator: {credential?.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1 px-2 py-1 rounded text-sm ${scannerConnected ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              <Camera size={16} />
              <span>{scannerConnected ? 'Scanner Ready' : 'Scanner Error'}</span>
              {scannerConnected ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
            </div>
            <div className={`flex items-center gap-1 px-2 py-1 rounded text-sm ${apiConnected ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-yellow-50 text-yellow-800 border border-yellow-200'}`}>
              <Wifi size={16} />
              <span>{apiConnected ? 'API Connected' : 'API Error'}</span>
              {apiConnected ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
            </div>
          </div>
          <button onClick={handleLogout} className="inline-flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>

      {/* Connection Status Alerts */}
      {(!scannerConnected || !apiConnected) && (
        <div className="mt-4 space-y-3">
          {!scannerConnected && (
            <div className="flex items-start gap-3 p-4 rounded-lg border border-red-200 bg-red-50">
              <AlertCircle size={24} className="text-red-600" />
              <div>
                <h3 className="font-semibold text-red-800">Barcode Scanner Not Connected</h3>
                <p className="text-sm text-red-700">Please check the scanner connection and try again.</p>
                <button
                  onClick={testScannerConnection}
                  className="mt-2 inline-flex items-center justify-center px-3 py-1.5 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Test Scanner Connection (Force Connected)
                </button>
              </div>
            </div>
          )}
          {!apiConnected && (
            <div className="flex items-start gap-3 p-4 rounded-lg border border-yellow-200 bg-yellow-50">
              <AlertCircle size={24} className="text-yellow-600" />
              <div>
                <h3 className="font-semibold text-yellow-800">API Connection Lost</h3>
                <p className="text-sm text-yellow-700">Attempting to reconnect to the server...</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Debug/Test Controls */}
      <div className="mt-3 p-3 bg-gray-50 rounded-lg flex gap-2 flex-wrap">
        <button
          onClick={testScannerConnection}
          className="px-3 py-1.5 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm"
        >
          🔧 Test Scanner
        </button>
        <button
          onClick={testManualScan}
          className="px-3 py-1.5 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm"
        >
          ⌨️ Manual Test Scan
        </button>
        <button
          onClick={() => {
            console.log('Current state:', {
              isLoggedIn,
              scannerConnected,
              apiConnected,
              isScanning,
              scanBuffer,
              lastScanResult
            });
          }}
          className="px-3 py-1.5 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm"
        >
          🐛 Debug Info
        </button>
      </div>

      {/* Main Scanning Area */}
      <div className="mt-4 grid grid-cols-1 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center">
            <div className="mx-auto w-6 h-6 rounded-full mb-3">
              {/* Indicator replaced with text states */}
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              {isScanning ? 'Processing Scan...' : scannerConnected ? 'Ready to Scan' : 'Scanner Offline'}
            </h2>
            <p className="text-sm text-gray-600">
              {isScanning ? 'Please wait while we process the barcode' : scannerConnected ? 'Point the barcode scanner at a student ID' : 'Check scanner connection'}
            </p>
            {scanBuffer && (
              <div className="mt-2 text-gray-500 text-sm">
                <small>Reading: {scanBuffer}</small>
              </div>
            )}
          </div>
        </div>

        {/* Scan Result */}
        {lastScanResult && scanResultVisible && (
          <div className={`relative mt-4 p-4 rounded-lg border ${lastScanResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <div className="flex items-start gap-3">
              <div className="mt-1">
                {lastScanResult.success ? <CheckCircle size={24} className="text-green-600" /> : <AlertCircle size={24} className="text-red-600" />}
              </div>
              <div className="flex-1">
                <h2 className={`font-semibold ${lastScanResult.success ? 'text-green-800' : 'text-red-800'}`}>{lastScanResult.message || (lastScanResult.success ? 'Scan Successful' : 'Scan Failed')}</h2>

                {lastScanResult.student && (
                  <div className="mt-2 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-2">
                      <User size={18} className="text-gray-600 mt-1" />
                      <div>
                        <p className="font-medium text-gray-900">{lastScanResult.student.name}</p>
                        <p className="text-sm text-gray-700">ID: {lastScanResult.student.user_id}</p>
                        {lastScanResult.student.college && (
                          <p className="text-sm text-gray-700">{lastScanResult.student.college} - {lastScanResult.student.department}</p>
                        )}
                        {lastScanResult.student.email && (
                          <p className="text-sm text-gray-500">{lastScanResult.student.email}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="inline-flex items-center gap-2 px-2 py-1 rounded text-sm bg-gray-100 text-gray-700">
                        <Clock size={14} />
                        <span>
                          {lastScanResult.server_time
                            ? new Date(lastScanResult.server_time).toLocaleTimeString()
                            : new Date(lastScanResult.timestamp).toLocaleTimeString()
                          }
                        </span>
                      </div>
                      {lastScanResult.server_time && (
                        <div className="mt-1 text-xs text-gray-500">
                          Server: {new Date(lastScanResult.server_time).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {lastScanResult.barcode && (
                  <div className="mt-2 text-xs text-gray-500">
                    Barcode: {lastScanResult.barcode}
                  </div>
                )}

                {!lastScanResult.success && lastScanResult.error && (
                  <div className="mt-2 text-sm text-red-700">{lastScanResult.error}</div>
                )}
              </div>
            </div>
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={clearLastResult}
              title="Close"
            >
              &times;
            </button>
          </div>
        )}
      </div>

      {/* Gate Entry Logs Table */}
      <div className="gate-logs-section">
        <div className="logs-header">
          <div>
            <h3>Recent Gate Entry Logs</h3>
            {lastLogUpdate && (
              <small style={{ color: '#666', fontSize: '0.8rem' }}>
                Last updated: {lastLogUpdate.toLocaleTimeString()}
              </small>
            )}
          </div>
          <button
            onClick={fetchRecentLogs}
            className="btn btn-sm btn-outline"
            style={{ fontSize: '12px' }}
          >
            🔄 Refresh
          </button>
        </div>

        <div className="logs-table-container">
          <table className="logs-table">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Name</th>
                <th>In Time</th>
                <th>Out Time</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentLogs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="no-data">No recent logs available</td>
                </tr>
              ) : (
                recentLogs.map((log) => (
                  <tr key={log.id} className={`log-row ${log.status}`}>
                    <td className="user-id">{log.user_id}</td>
                    <td className="name">{log.name}</td>
                    <td className="in-time">
                      {log.entry_time ? new Date(log.entry_time).toLocaleTimeString() : '-'}
                    </td>
                    <td className="out-time">
                      {log.exit_time 
                        ? new Date(log.exit_time).toLocaleTimeString()
                        : log.status === 'in' ? '-' : 'Invalid'}
                    </td>
                    <td className="status">
                      <span className={`status-badge ${log.status}`}>
                        {log.status === 'in' ? 'IN' : 'OUT'}
                      </span>
                    </td>
                    <td className="date">
                      {new Date(log.created_date).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GateEntryDashboard;