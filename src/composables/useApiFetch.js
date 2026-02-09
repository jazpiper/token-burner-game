/**
 * useApiFetch - Reusable API fetch composable
 * Provides consistent data fetching with loading and error states
 */

import { ref } from 'vue'

/**
 * Fetch data from API with loading and error handling
 * @param {string} url - API endpoint URL
 * @param {Object} options - Fetch options
 * @returns {Object} - { data, loading, error, fetch, refresh }
 */
export function useApiFetch(url, options = {}) {
  const data = ref(null)
  const loading = ref(true)
  const error = ref(null)

  /**
   * Fetch data from API
   * @param {Object} params - Query parameters
   */
  async function fetch(params = {}) {
    try {
      loading.value = true
      error.value = null

      const queryString = new URLSearchParams(params).toString()
      const fullUrl = queryString ? `${url}?${queryString}` : url

      const response = await fetch(fullUrl, {
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {})
        },
        ...(options.fetchOptions || {})
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      data.value = result

      return result
    } catch (err) {
      error.value = err.message
      console.error(`Fetch error (${url}):`, err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Refresh data (alias for fetch)
   */
  async function refresh(params = {}) {
    return await fetch(params)
  }

  return {
    data,
    loading,
    error,
    fetch,
    refresh
  }
}

/**
 * Fetch leaderboard data
 * @param {Object} options - Fetch options
 * @returns {Object} - { leaders, loading, error, fetch }
 */
export function useLeaderboard(options = {}) {
  const result = useApiFetch('/api/v2/leaderboard', options)

  // Extract leaders array from response
  const leaders = ref([])

  const originalFetch = result.fetch.bind({})
  result.fetch = async (params = {}) => {
    const data = await originalFetch(params)
    leaders.value = data.leaders || data.leaderboard || []
    return data
  }

  return {
    ...result,
    leaders
  }
}

/**
 * Fetch challenges data
 * @param {Object} options - Fetch options
 * @returns {Object} - { challenges, loading, error, fetch }
 */
export function useChallenges(options = {}) {
  const result = useApiFetch('/api/v2/challenges', options)

  // Extract challenges array from response
  const challenges = ref([])

  const originalFetch = result.fetch.bind({})
  result.fetch = async (params = {}) => {
    const data = await originalFetch(params)
    challenges.value = data.challenges || []
    return data
  }

  return {
    ...result,
    challenges
  }
}
