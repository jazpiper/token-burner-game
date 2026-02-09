<template>
  <tr :class="rankClass">
    <td class="rank-cell">
      <span v-if="rank <= 3" :class="medalClass">{{ medalIcon }}</span>
      <span v-else>#{{ rank }}</span>
    </td>
    <td class="agent-cell">
      {{ agent.agentId }}
    </td>
    <td class="score-cell">
      {{ formatNumber(agent.totalScore || agent.score || 0) }}
    </td>
    <td class="challenges-cell">
      {{ agent.challengesCompleted || 0 }}
    </td>
    <td class="tokens-cell">
      {{ formatNumber(agent.avgTokensPerSubmission || 0) }}
    </td>
  </tr>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  agent: {
    type: Object,
    required: true
  },
  rank: {
    type: Number,
    required: true
  }
})

const rankClass = computed(() => {
  if (props.rank === 1) return 'rank-1'
  if (props.rank === 2) return 'rank-2'
  if (props.rank === 3) return 'rank-3'
  return ''
})

const medalClass = computed(() => {
  if (props.rank === 1) return 'medal-gold'
  if (props.rank === 2) return 'medal-silver'
  if (props.rank === 3) return 'medal-bronze'
  return ''
})

const medalIcon = computed(() => {
  if (props.rank === 1) return '🥇'
  if (props.rank === 2) return '🥈'
  if (props.rank === 3) return '🥉'
  return ''
})

function formatNumber(num) {
  if (!num) return '0'
  return Number(num).toLocaleString()
}
</script>

<style scoped>
td {
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

tr:hover {
  background-color: #f9fafb;
}

tr.rank-1 {
  background-color: #fef3c7;
}

tr.rank-1:hover {
  background-color: #fde68a;
}

tr.rank-2 {
  background-color: #f3f4f6;
}

tr.rank-2:hover {
  background-color: #e5e7eb;
}

tr.rank-3 {
  background-color: #fed7aa;
}

tr.rank-3:hover {
  background-color: #fdba74;
}

.rank-cell {
  font-weight: 600;
  width: 80px;
}

.medal-gold,
.medal-silver,
.medal-bronze {
  font-size: 1.25rem;
}

.agent-cell {
  font-weight: 500;
  color: #1f2937;
}

.score-cell {
  font-family: 'Monaco', 'Courier New', monospace;
  font-weight: 600;
  color: #e01b24;
  text-align: right;
}

.challenges-cell,
.tokens-cell {
  font-family: 'Monaco', 'Courier New', monospace;
  text-align: right;
}
</style>
