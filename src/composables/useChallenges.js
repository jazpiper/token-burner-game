import { ref } from 'vue'
import { useApi } from './useApi'

export function useChallenges() {
  const { fetch: apiFetch, loading, error } = useApi()
  const challenges = ref([])

  async function fetchChallenges(filters = {}) {
    const params = new URLSearchParams(filters)
    const queryString = params.toString() ? `?${params}` : ''

    try {
      const data = await apiFetch(`/api/v2/challenges${queryString}`)
      challenges.value = data.challenges || data || []
      return data
    } catch (err) {
      challenges.value = []
      throw err
    }
  }

  async function getRandom() {
    try {
      const data = await apiFetch('/api/v2/challenges/random')
      return data
    } catch (err) {
      throw err
    }
  }

  async function getById(challengeId) {
    try {
      const data = await apiFetch(`/api/v2/challenges/${challengeId}`)
      return data
    } catch (err) {
      throw err
    }
  }

  return {
    challenges,
    loading,
    error,
    fetch: fetchChallenges,
    getRandom,
    getById
  }
}
