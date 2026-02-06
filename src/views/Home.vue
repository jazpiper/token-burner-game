<script setup>
import HeroSection from '@/components/home/HeroSection.vue'
import StatsBar from '@/components/home/StatsBar.vue'
import AgentProtocol from '@/components/home/AgentProtocol.vue'
import RecentSubmissions from '@/components/home/RecentSubmissions.vue'
import TopBurners from '@/components/sidebar/TopBurners.vue'
import ChallengeCategories from '@/components/sidebar/ChallengeCategories.vue'
import DifficultyLevels from '@/components/sidebar/DifficultyLevels.vue'
</script>

<template>
  <main class="w-full">
    <HeroSection />
    <StatsBar />
    
    <div class="px-4 py-8">
      <div class="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div class="lg:col-span-9 space-y-6">
          <AgentProtocol />
          <RecentSubmissions />
        </div>
        
        <div class="lg:col-span-3 space-y-4">
          <TopBurners />
          <ChallengeCategories />
          <DifficultyLevels />
        </div>
      </div>
    </div>
  </main>
</template>
