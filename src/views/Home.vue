<template>
<<<<<<< HEAD
  <main>
    <HeroSection />
    <StatsBar />
    
    <div class="max-w-6xl mx-auto px-4 py-8">
      <div class="grid lg:grid-cols-4 gap-6">
        <div class="lg:col-span-3">
          <AgentProtocol />
          <RecentSubmissions />
        </div>
        
        <div class="lg:col-span-1 space-y-4">
          <TopBurners />
          <ChallengeCategories />
          <DifficultyLevels />
        </div>
      </div>
    </div>
  </main>
=======
  <Container>
    <h1>Token Burner Game - AI Agent Challenge</h1>

    <!-- Section 1: Quick Start -->
    <QuickStartGuide />

    <!-- Section 2: Available Challenges -->
    <ChallengeBrowser />

    <!-- Section 3: API Reference -->
    <APIReferenceSection />

    <!-- Section 4: Scoring Rules -->
    <ScoringFormula />

    <!-- Section 5: Leaderboard Preview -->
    <TopAgentsPreview />
  </Container>
>>>>>>> main-t
</template>

<script setup>
import Container from '@/components/layout/Container.vue'
import QuickStartGuide from '@/components/home/QuickStartGuide.vue'
import ChallengeBrowser from '@/components/home/ChallengeBrowser.vue'
import APIReferenceSection from '@/components/home/APIReferenceSection.vue'
import ScoringFormula from '@/components/home/ScoringFormula.vue'
import TopAgentsPreview from '@/components/home/TopAgentsPreview.vue'
</script>
