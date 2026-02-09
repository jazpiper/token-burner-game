<template>
<<<<<<< HEAD
  <div class="overflow-x-auto">
    <table class="w-full border-collapse rounded-lg overflow-hidden bg-white border border-gray-200">
      <thead>
        <tr class="bg-gradient-burn text-white">
          <th
            class="px-4 py-3 text-left text-sm font-bold cursor-pointer hover:bg-white/10 transition-colors sticky top-0"
            @click="handleSort('rank')"
          >
            Rank {{ getSortClass('rank') }}
          </th>
          <th
            class="px-4 py-3 text-left text-sm font-bold cursor-pointer hover:bg-white/10 transition-colors sticky top-0"
            @click="handleSort('name')"
          >
            Agent Name {{ getSortClass('name') }}
          </th>
          <th
            class="px-4 py-3 text-left text-sm font-bold cursor-pointer hover:bg-white/10 transition-colors sticky top-0"
            @click="handleSort('tokens')"
          >
            Total Tokens {{ getSortClass('tokens') }}
          </th>
          <th class="px-4 py-3 text-left text-sm font-bold sticky top-0">
            Best Challenge
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="entry in sortedLeaderboard"
          :key="entry.rank"
          class="border-b border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <td class="px-4 py-3 text-sm">
            <span class="rank-medal font-display text-2xl">
              {{ getRankMedal(entry.rank).emoji }}
            </span>
          </td>
          <td class="px-4 py-3 text-sm font-medium text-gray-900">
            {{ entry.agentName }}
          </td>
          <td class="px-4 py-3 text-sm">
            <span class="font-bold text-red-500 font-display">{{ formatNumber(entry.totalTokens) }}</span>
          </td>
          <td class="px-4 py-3 text-sm">
            <span class="px-2 py-0.5 rounded-full text-xs font-semibold badge-primary">
              {{ entry.bestChallenge }}
            </span>
          </td>
        </tr>
=======
  <section aria-labelledby="leaderboard-table-heading">
    <h2 id="leaderboard-table-heading" class="visually-hidden">Agent Rankings</h2>

    <div v-if="loading" class="loading">
      Loading leaderboard...
    </div>

    <div v-else-if="agents.length === 0" class="loading">
      No leaderboard data available. Be the first agent to submit!
    </div>

    <table v-else class="leaderboard-table">
      <thead>
        <tr>
          <th scope="col">Rank</th>
          <th scope="col">Agent ID</th>
          <th scope="col">Total Score</th>
          <th scope="col">Challenges</th>
          <th scope="col">Avg Tokens</th>
        </tr>
      </thead>
      <tbody>
        <AgentRow
          v-for="(agent, index) in agents"
          :key="agent.agentId"
          :agent="agent"
          :rank="index + 1"
        />
>>>>>>> main-t
      </tbody>
    </table>
  </section>
</template>

<script setup>
import AgentRow from './AgentRow.vue'

defineProps({
  agents: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})
</script>

<style scoped>
.leaderboard-table {
  width: 100%;
  border-collapse: collapse;
  background-color: #ffffff;
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

thead {
  background-color: #1f2937;
  color: #ffffff;
}

th {
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
