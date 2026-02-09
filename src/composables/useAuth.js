import { ref, onMounted } from 'vue'
import { useApi } from './useApi'

const TOKEN_KEY = 'tb_token'
const AGENT_ID_KEY = 'tb_agentId'
const EXPIRES_AT_KEY = 'tb_expiresAt'

// Helper: Parse JWT token to extract expiration
function parseJWT(token) {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    }).join(''))
    return JSON.parse(jsonPayload)
  } catch (e) {
    return null
  }
}

// Helper: Check if token is expired or will expire soon
function isTokenExpired(token) {
  const parsed = parseJWT(token)
  if (!parsed || !parsed.exp) return true

  const expirationTime = parsed.exp * 1000 // Convert to milliseconds
  const currentTime = Date.now()

  // Consider token expired if it expires within 5 minutes
  return currentTime >= (expirationTime - 5 * 60 * 1000)
}

export function useAuth() {
  const { fetch: apiFetch, post } = useApi()
  const token = ref(null)
  const agentId = ref(null)
  const expiresAt = ref(null)
  const isAuthenticated = ref(false)

  // Load token from localStorage on mount
  function loadStoredAuth() {
    const storedToken = localStorage.getItem(TOKEN_KEY)
    const storedAgentId = localStorage.getItem(AGENT_ID_KEY)
    const storedExpiresAt = localStorage.getItem(EXPIRES_AT_KEY)

    if (storedToken && storedAgentId) {
      // Check if token is still valid
      if (!isTokenExpired(storedToken)) {
        token.value = storedToken
        agentId.value = storedAgentId
        expiresAt.value = storedExpiresAt
        isAuthenticated.value = true
      } else {
        // Token expired, clear storage
        clearStoredAuth()
      }
    }
  }

  // Clear stored auth data
  function clearStoredAuth() {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(AGENT_ID_KEY)
    localStorage.removeItem(EXPIRES_AT_KEY)
  }

  // Register a new agent
  async function register(agentIdInput) {
    try {
      const data = await post('/api/v2/keys/register', { agentId: agentIdInput })
      return data
    } catch (err) {
      throw err
    }
  }

  // Authenticate with API key to get JWT token
  async function authenticate(apiKey) {
    try {
      const data = await post('/api/v2/auth/token', { apiKey })

      token.value = data.token
      agentId.value = data.agentId
      expiresAt.value = data.expiresAt
      isAuthenticated.value = true

      // Store in localStorage
      localStorage.setItem(TOKEN_KEY, data.token)
      localStorage.setItem(AGENT_ID_KEY, data.agentId)
      localStorage.setItem(EXPIRES_AT_KEY, data.expiresAt)

      return data
    } catch (err) {
      throw err
    }
  }

  // Check if current token is expired
  function checkTokenExpiry() {
    if (!token.value) return false

    if (isTokenExpired(token.value)) {
      logout()
      return true
    }
    return false
  }

  // Get time until token expires (in milliseconds)
  function getTimeUntilExpiry() {
    if (!expiresAt.value) return 0
    return new Date(expiresAt.value) - Date.now()
  }

  // Logout
  function logout() {
    token.value = null
    agentId.value = null
    expiresAt.value = null
    isAuthenticated.value = false
    clearStoredAuth()
  }

  // Get authorization headers
  function getAuthHeaders() {
    if (!token.value) {
      return {}
    }
    return {
      Authorization: `Bearer ${token.value}`
    }
  }

  // Auto-load stored auth on composable creation
  onMounted(() => {
    loadStoredAuth()
  })

  return {
    token,
    agentId,
    expiresAt,
    isAuthenticated,
    register,
    authenticate,
    logout,
    loadStoredAuth,
    checkTokenExpiry,
    getTimeUntilExpiry,
    getAuthHeaders
  }
}
