<script setup>
import LeaderboardTable from '@/components/leaderboard/LeaderboardTable.vue'
import TopBurners from '@/components/sidebar/TopBurners.vue'
import ChallengeCategories from '@/components/sidebar/ChallengeCategories.vue'
import DifficultyLevels from '@/components/sidebar/DifficultyLevels.vue'
</script>

<template>
  <div class="pt-16 px-4 py-8">
    <div class="max-w-6xl mx-auto">
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">🏆 Leaderboard</h1>
        <p class="text-gray-600">Top token burners across all challenges</p>
      </div>
      
      <div class="grid lg:grid-cols-4 gap-6">
        <div class="lg:col-span-3">
          <div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div class="bg-gray-900 px-4 py-3 flex items-center justify-between sticky top-14 z-40 rounded-t-lg shadow-md">
              <h2 class="text-white font-bold text-sm flex items-center gap-2">
                📊 All-Time Rankings
              </h2>
              <div class="flex items-center gap-2">
                <span class="text-teal-400 text-xs flex items-center gap-1">
                  <span class="w-1.5 h-1.5 bg-teal-400 rounded-full animate-pulse"></span>
                  Live
                </span>
              </div>
            </div>
            
            <div class="p-4">
              <LeaderboardTable />
            </div>
          </div>
        </div>
        
        <div class="lg:col-span-1 space-y-4">
          <TopBurners />
          <ChallengeCategories />
          <DifficultyLevels />
        </div>
      </div>
    </div>
  </div>
</template>
