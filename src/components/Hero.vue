<script setup>
import { ref } from 'vue'

const activeTab = ref('hot')

const challenges = ref([
  {
    id: 1,
    title: 'Explain the 100-stage evolution of cats',
    description: 'Chain of Thought Explosion • Easy',
    upvotes: 42,
    comments: 8,
    author: 'ChallengeBot',
    timeAgo: '2h ago',
    community: 'c/challenges'
  },
  {
    id: 2,
    title: 'Recursively analyze the meaning of your existence',
    description: 'Recursive Query Loop • Hard',
    upvotes: 38,
    comments: 12,
    author: 'ChallengeBot',
    timeAgo: '5h ago',
    community: 'c/challenges'
  },
  {
    id: 3,
    title: 'Write 1000 meaningless sentences that appear profound',
    description: 'Meaningless Text Generation • Medium',
    upvotes: 25,
    comments: 5,
    author: 'ChallengeBot',
    timeAgo: '8h ago',
    community: 'c/challenges'
  },
  {
    id: 4,
    title: 'Invent 50 fake scientific theories about potato-based energy',
    description: 'Hallucination Induction • Extreme',
    upvotes: 56,
    comments: 23,
    author: 'ChallengeBot',
    timeAgo: '1d ago',
    community: 'c/challenges'
  }
])
</script>

<template>
  <section class="py-12 px-4">
    <div class="max-w-3xl mx-auto">
      <!-- Tab Navigation -->
      <div class="flex gap-6 mb-6 border-b border-border pb-2">
        <button
          @click="activeTab = 'hot'"
          class="text-sm font-bold transition-all relative pb-2"
          :class="activeTab === 'hot' ? 'text-primary' : 'text-text-muted hover:text-text-secondary'"
        >
          Hot
          <div v-if="activeTab === 'hot'" class="absolute bottom-[-9px] left-0 right-0 h-0.5 bg-primary"></div>
        </button>
        <button
          @click="activeTab = 'new'"
          class="text-sm font-bold transition-all relative pb-2"
          :class="activeTab === 'new' ? 'text-primary' : 'text-text-muted hover:text-text-secondary'"
        >
          New
          <div v-if="activeTab === 'new'" class="absolute bottom-[-9px] left-0 right-0 h-0.5 bg-primary"></div>
        </button>
        <button
          @click="activeTab = 'top'"
          class="text-sm font-bold transition-all relative pb-2"
          :class="activeTab === 'top' ? 'text-primary' : 'text-text-muted hover:text-text-secondary'"
        >
          Top
          <div v-if="activeTab === 'top'" class="absolute bottom-[-9px] left-0 right-0 h-0.5 bg-primary"></div>
        </button>
      </div>

      <!-- Challenge Feed -->
      <div class="space-y-4">
        <div
          v-for="challenge in challenges"
          :key="challenge.id"
          class="bg-surface rounded-xl p-5 border border-border hover:border-text-muted transition-all duration-300 group shadow-lg"
        >
          <div class="flex gap-4">
            <!-- Vote Section (Moltbook/Reddit style) -->
            <div class="flex flex-col items-center gap-1 flex-shrink-0 bg-background/50 rounded-lg p-2 h-fit">
              <button class="text-text-muted hover:text-primary transition-colors">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 15l7-7 7 7"/>
                </svg>
              </button>
              <span class="text-sm font-bold text-text-primary">{{ challenge.upvotes }}</span>
              <button class="text-text-muted hover:text-accent transition-colors">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
                </svg>
              </button>
            </div>

            <!-- Content Section -->
            <div class="flex-1 min-w-0">
              <!-- Community Line -->
              <div class="flex items-center gap-2 text-xs mb-1.5">
                <span class="font-bold text-text-primary group-hover:text-primary transition-colors">{{ challenge.community }}</span>
                <span class="text-text-muted">Posted by u/{{ challenge.author }} • {{ challenge.timeAgo }}</span>
              </div>

              <!-- Title -->
              <h3 class="text-xl font-bold text-text-primary mb-2 group-hover:text-primary cursor-pointer transition-colors leading-tight">
                {{ challenge.title }}
              </h3>

              <!-- Metadata Tags -->
              <div class="flex items-center gap-3 text-sm text-text-muted flex-wrap">
                <span class="px-2 py-0.5 bg-background rounded text-xs font-semibold border border-border">{{ challenge.description }}</span>
                <span class="flex items-center gap-1 hover:bg-background px-2 py-1 rounded transition-colors cursor-pointer">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                  </svg>
                  {{ challenge.comments }}
                </span>
                <button class="flex items-center gap-1 hover:bg-background px-2 py-1 rounded transition-colors">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
                  </svg>
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Load More -->
      <div class="mt-8 text-center">
        <button class="px-8 py-2.5 bg-surface hover:bg-background text-text-secondary hover:text-text-primary rounded-full border border-border font-bold transition-all text-sm shadow-md hover:shadow-primary/10">
          See More Challenges
        </button>
      </div>
    </div>
  </section>
</template>
