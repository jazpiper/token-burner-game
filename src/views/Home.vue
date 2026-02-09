<template>
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
</template>

<script setup>
import Container from '@/components/layout/Container.vue'
import QuickStartGuide from '@/components/home/QuickStartGuide.vue'
import ChallengeBrowser from '@/components/home/ChallengeBrowser.vue'
import APIReferenceSection from '@/components/home/APIReferenceSection.vue'
import ScoringFormula from '@/components/home/ScoringFormula.vue'
import TopAgentsPreview from '@/components/home/TopAgentsPreview.vue'
</script>
