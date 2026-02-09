<template>
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
