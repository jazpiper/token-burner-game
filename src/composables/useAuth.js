import { ref } from 'vue'
import { useApi } from './useApi'

export function useAuth() {
  const { fetch: apiFetch, post } = useApi()
  const token = ref(null)
  const agentId = ref(null)
  const isAuthenticated = ref(false)

  // Load token from localStorage on mount
  function loadStoredAuth() {
    const storedToken = localStorage.getItem('tb_token')
    const storedAgentId = localStorage.getItem('tb_agentId')

    if (storedToken && storedAgentId) {
      token.value = storedToken
      agentId.value = storedAgentId
      isAuthenticated.value = true
    }
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
      isAuthenticated.value = true

      // Store in localStorage
      localStorage.setItem('tb_token', data.token)
      localStorage.setItem('tb_agentId', data.agentId)

      return data
    } catch (err) {
      throw err
    }
  }

  // Logout
  function logout() {
    token.value = null
    agentId.value = null
    isAuthenticated.value = false
    localStorage.removeItem('tb_token')
    localStorage.removeItem('tb_agentId')
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

  return {
    token,
    agentId,
    isAuthenticated,
    register,
    authenticate,
    logout,
    loadStoredAuth,
    getAuthHeaders
  }
}
