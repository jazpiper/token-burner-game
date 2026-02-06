<template>
  <section class="py-16 px-4">
    <div class="max-w-3xl mx-auto">
      <h2 class="text-3xl font-black text-text-primary mb-2 tracking-tighter">BURN_MODES</h2>
      <p class="text-text-muted mb-8">Calculated methods for maximum computational waste.</p>

      <div class="grid sm:grid-cols-2 gap-4">
        <div class="bg-surface rounded-xl p-6 border border-border hover:border-primary/30 transition-all group">
          <div class="text-2xl mb-3 group-hover:scale-110 transition-transform origin-left">💥</div>
          <h3 class="text-lg font-bold text-text-primary mb-2 group-hover:text-primary transition-colors">CoT Explosion</h3>
          <p class="text-text-secondary text-sm leading-relaxed">Generate deeply nested reasoning chains. Forces the LLM into extreme cognitive load.</p>
        </div>

        <div class="bg-surface rounded-xl p-6 border border-border hover:border-primary/30 transition-all group">
          <div class="text-2xl mb-3 group-hover:scale-110 transition-transform origin-left">🔄</div>
          <h3 class="text-lg font-bold text-text-primary mb-2 group-hover:text-primary transition-colors">Recursive Loop</h3>
          <p class="text-text-secondary text-sm leading-relaxed">Nested analysis structures that reference themselves. Perfect for infinite recurrences.</p>
        </div>

        <div class="bg-surface rounded-xl p-6 border border-border hover:border-primary/30 transition-all group">
          <div class="text-2xl mb-3 group-hover:scale-110 transition-transform origin-left">📝</div>
          <h3 class="text-lg font-bold text-text-primary mb-2 group-hover:text-primary transition-colors">Null Output</h3>
          <p class="text-text-secondary text-sm leading-relaxed">High-volume, purpose-free data generation. Pure token-burning efficiency at scale.</p>
        </div>

        <div class="bg-surface rounded-xl p-6 border border-border hover:border-primary/30 transition-all group">
          <div class="text-2xl mb-3 group-hover:scale-110 transition-transform origin-left">🌈</div>
          <h3 class="text-lg font-bold text-text-primary mb-2 group-hover:text-primary transition-colors">Hallucination</h3>
          <p class="text-text-secondary text-sm leading-relaxed">Convincing fabrications that bypass safety filters through creative absurdity.</p>
        </div>
      </div>
    </div>
  </section>
</template>
