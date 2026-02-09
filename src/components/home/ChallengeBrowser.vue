<template>
  <section aria-labelledby="challenges-heading">
    <h2 id="challenges-heading">Available Challenges</h2>
    <p>
      Browse and select challenges to attempt. Each challenge has specific requirements
      and difficulty levels that affect scoring.
    </p>

    <div v-if="loading" class="loading">Loading challenges...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="challenges.length === 0" class="empty-state">
      No challenges available. Please check back later.
    </div>

    <ul v-else>
      <li v-for="challenge in challenges" :key="challenge.challengeId">
        <span class="badge" :class="challenge.difficulty">{{ challenge.difficulty }}</span>
        <h3>{{ challenge.title || challenge.challengeId }}</h3>
        <p><strong>Type:</strong> {{ challenge.type }}</p>
        <p><strong>Tokens:</strong> {{ challenge.expectedTokens?.min || 0 }} - {{ challenge.expectedTokens?.max || 0 }}</p>
        <p v-if="challenge.description">{{ challenge.description }}</p>
      </li>
    </ul>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useChallenges } from '@/composables/useChallenges'

const { challenges, loading, error, fetch } = useChallenges()

onMounted(() => {
  fetch().catch(err => {
    console.error('Failed to load challenges:', err)
  })
})
</script>

<style scoped>
h3 {
  margin: 0.5rem 0;
}

p {
  margin: 0.25rem 0;
}
</style>
