import { ref, onUnmounted } from 'vue'

export function useApi() {
  const loading = ref(false)
  const error = ref(null)
  const abortController = ref(null)

  // Cancel any ongoing request
  function cancelRequest() {
    if (abortController.value) {
      abortController.value.abort()
      abortController.value = null
    }
  }

  async function fetch(url, options = {}) {
    // Cancel previous request if exists
    cancelRequest()

    // Create new AbortController for this request
    const controller = new AbortController()
    abortController.value = controller

    loading.value = true
    error.value = null

    // Only set Content-Type for requests with a body
    const headers = {}
    if (options.body || options.method === 'POST' || options.method === 'PUT' || options.method === 'PATCH') {
      headers['Content-Type'] = 'application/json'
    }

    try {
      const response = await window.fetch(url, {
        headers: {
          ...headers,
          ...(options.headers || {})
        },
        signal: controller.signal,
        ...options
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (err) {
      // Don't set error if request was aborted
      if (err.name === 'AbortError') {
        loading.value = false
        return null
      }
      error.value = err.message
      throw err
    } finally {
      loading.value = false
      abortController.value = null
    }
  }

  async function post(url, data) {
    return fetch(url, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async function get(url) {
    return fetch(url, {
      method: 'GET'
    })
  }

  // Cleanup on unmount
  onUnmounted(() => {
    cancelRequest()
  })

  return {
    fetch,
    post,
    get,
    loading,
    error,
    cancelRequest
  }
}
