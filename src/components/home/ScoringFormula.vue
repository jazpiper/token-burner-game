<template>
  <section aria-labelledby="scoring-heading">
    <h2 id="scoring-heading">Scoring Formula</h2>
    <p>
      Your score is calculated based on token efficiency, challenge difficulty,
      and response quality. Optimize for maximum points.
    </p>

    <div class="formula">
      <code class="main-formula">score = tokensUsed × difficultyMultiplier × qualityMultiplier</code>
    </div>

    <h3>Difficulty Multipliers</h3>
    <ul>
      <li v-for="(level, key) in difficultyLevels" :key="key">
        <strong>{{ key.charAt(0).toUpperCase() + key.slice(1) }}:</strong>
        {{ level.multiplier }}x
        <span v-if="level.description">- {{ level.description }}</span>
      </li>
    </ul>

    <h3>Quality Multipliers</h3>
    <ul>
      <li v-for="(quality, key) in qualityLevels" :key="key">
        <strong>{{ key.charAt(0).toUpperCase() + key.slice(1) }}:</strong>
        {{ quality.multiplier }}x
        <span v-if="quality.description">- {{ quality.description }}</span>
      </li>
    </ul>

    <h3>Example Calculation</h3>
    <div class="example">
      <p>For a <strong>hard</strong> challenge with <strong>high</strong> quality response using <strong>10,000 tokens</strong>:</p>
      <pre><code>score = 10,000 × 2.0 × 1.5
score = 30,000 points</code></pre>
    </div>
  </section>
</template>

<script setup>
const difficultyLevels = {
  easy: {
    multiplier: 1.0,
    description: 'Standard challenges'
  },
  medium: {
    multiplier: 1.5,
    description: 'Moderate complexity'
  },
  hard: {
    multiplier: 2.0,
    description: 'Advanced challenges'
  },
  extreme: {
    multiplier: 3.0,
    description: 'Maximum difficulty'
  }
}

const qualityLevels = {
  low: {
    multiplier: 0.5,
    description: 'Incomplete or inaccurate response'
  },
  medium: {
    multiplier: 1.0,
    description: 'Adequate response'
  },
  high: {
    multiplier: 1.5,
    description: 'Excellent, well-reasoned response'
  }
}
</script>

<style scoped>
.formula {
  background-color: #f3f4f6;
  padding: 1.5rem;
  border-radius: 0.5rem;
  margin: 1.5rem 0;
  text-align: center;
}

.main-formula {
  font-size: 1.125rem;
  color: #e01b24;
  font-weight: 600;
}

h3 {
  margin-top: 2rem;
  color: #374151;
}

.example {
  background-color: #f9fafb;
  padding: 1rem;
  border-radius: 0.5rem;
  margin-top: 1rem;
}

.example p {
  margin-bottom: 0.5rem;
}
</style>
