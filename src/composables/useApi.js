import { ref } from 'vue'

export function useApi() {
  const loading = ref(false)
  const error = ref(null)

  async function fetch(url, options = {}) {
    loading.value = true
    error.value = null

    try {
      const response = await window.fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {})
        },
        ...options
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
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

  return { fetch, post, get, loading, error }
}
