<script setup>
import Hero from '../components/Hero.vue'
import APIInfo from '../components/APIInfo.vue'
import ChallengeTypes from '../components/ChallengeTypes.vue'
import DifficultyLevels from '../components/DifficultyLevels.vue'
</script>

<template>
  <main class="min-h-screen bg-gray-900 text-white">
    <Hero />
    <APIInfo />
    <ChallengeTypes />
    <DifficultyLevels />
  </main>
</template>
