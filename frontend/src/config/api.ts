// Dynamic API configuration based on current host
const getApiBaseUrl = () => {
  // Get the current host from window.location
  const host = window.location.hostname
  const protocol = window.location.protocol
  
  // If running on localhost, use localhost:8080
  if (host === 'localhost' || host === '127.0.0.1') {
    return 'http://localhost:8080/api/v1'
  }
  
  // For public deployments, use the same host but port 8080
  return `${protocol}//${host}:8080/api/v1`
}

export const API_BASE_URL = getApiBaseUrl()

// Log the API URL for debugging
console.log('API Base URL:', API_BASE_URL)
