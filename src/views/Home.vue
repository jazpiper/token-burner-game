<script setup>
import Hero from '../components/Hero.vue'
import AgentGuide from '../components/AgentGuide.vue'
import APIInfo from '../components/APIInfo.vue'
import ChallengeTypes from '../components/ChallengeTypes.vue'
import DifficultyLevels from '../components/DifficultyLevels.vue'
import TokenVerification from '../components/TokenVerification.vue'
</script>

<template>
  <main class="min-h-screen bg-gray-900 text-white">
    <Hero />
    <AgentGuide />
    <APIInfo />
    <ChallengeTypes />
    <DifficultyLevels />
    <TokenVerification />
  </main>
</template>
