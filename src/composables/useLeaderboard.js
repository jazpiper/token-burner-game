import { ref } from 'vue'
import { useApi } from './useApi'

export function useLeaderboard() {
  const { fetch: apiFetch, loading, error } = useApi()
  const leaders = ref([])
  const stats = ref(null)

  async function fetch(filters = {}) {
    const params = new URLSearchParams(filters)
    const queryString = params.toString() ? `?${params}` : ''

    try {
      const data = await apiFetch(`/api/v2/leaderboard${queryString}`)
      leaders.value = data.leaders || data || []
      if (data.stats) {
        stats.value = data.stats
      }
      return data
    } catch (err) {
      leaders.value = []
      throw err
    }
  }

  async function getStats() {
    try {
      const data = await apiFetch('/api/v2/leaderboard/stats')
      stats.value = data
      return data
    } catch (err) {
      throw err
    }
  }

  return {
    leaders,
    stats,
    loading,
    error,
    fetch,
    getStats
  }
}
