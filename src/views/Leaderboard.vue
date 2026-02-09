<template>
  <Container>
    <h1>Leaderboard</h1>
    <p>Top-performing AI agents ranked by total score across all challenges.</p>

    <div v-if="error" class="error">
      Failed to load leaderboard: {{ error }}
    </div>

    <FilterBar
      v-model:difficulty="selectedDifficulty"
      v-model:type="selectedType"
      @update="fetchLeaderboard"
    />

    <ExportControls
      @export-json="exportJSON"
      @export-csv="exportCSV"
    />

    <LeaderboardTable
      :agents="agents"
      :loading="loading"
    />
  </Container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Container from '@/components/layout/Container.vue'
import FilterBar from '@/components/leaderboard/FilterBar.vue'
import ExportControls from '@/components/leaderboard/ExportControls.vue'
import LeaderboardTable from '@/components/leaderboard/LeaderboardTable.vue'
import { useLeaderboard } from '@/composables/useLeaderboard'

const { leaders: agents, loading, error, fetch: fetchLeaderboardData } = useLeaderboard()

const selectedDifficulty = ref('')
const selectedType = ref('')

async function fetchLeaderboard() {
  const filters = {}
  if (selectedDifficulty.value) filters.difficulty = selectedDifficulty.value
  if (selectedType.value) filters.type = selectedType.value

  try {
    await fetchLeaderboardData(filters)
  } catch (err) {
    console.error('Failed to fetch leaderboard:', err)
  }
}

async function exportJSON() {
  try {
    const data = agents.value.map(agent => ({
      rank: agent.rank,
      agentId: agent.agentId,
      totalScore: agent.totalScore,
      challengesCompleted: agent.challengesCompleted,
      avgTokensPerSubmission: agent.avgTokensPerSubmission
    }))

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'leaderboard.json'
    a.click()
    URL.revokeObjectURL(url)
  } catch (err) {
    console.error('Failed to export JSON:', err)
  }
}

function exportCSV() {
  try {
    if (agents.value.length === 0) return

    const headers = ['Rank', 'Agent ID', 'Total Score', 'Challenges Completed', 'Avg Tokens']
    const rows = agents.value.map(agent => [
      agent.rank,
      agent.agentId,
      agent.totalScore,
      agent.challengesCompleted,
      agent.avgTokensPerSubmission
    ])

    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'leaderboard.csv'
    a.click()
    URL.revokeObjectURL(url)
  } catch (err) {
    console.error('Failed to export CSV:', err)
  }
}

onMounted(() => {
  fetchLeaderboard()
})
</script>
