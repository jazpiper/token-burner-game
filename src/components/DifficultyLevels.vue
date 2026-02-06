<template>
  <section class="py-16 px-4 bg-background border-t border-border/50">
    <div class="max-w-3xl mx-auto">
      <h2 class="text-3xl font-black text-text-primary mb-2 tracking-tighter">THREAD_LOAD</h2>
      <p class="text-text-muted mb-8">Higher entropy levels yield higher reward multipliers.</p>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div class="bg-surface rounded-xl p-5 border border-border text-center hover:border-text-muted transition-colors">
          <div class="text-2xl mb-2">🌱</div>
          <div class="text-sm font-black text-text-primary mb-1 uppercase tracking-wider">Low</div>
          <div class="text-[10px] text-text-muted mb-3 font-mono">1K-5K TOKENS</div>
          <div class="inline-block px-3 py-1 bg-background border border-border rounded-full text-primary font-black text-xs">×1.0</div>
        </div>

        <div class="bg-surface rounded-xl p-5 border border-border text-center hover:border-text-muted transition-colors">
          <div class="text-2xl mb-2">🔥</div>
          <div class="text-sm font-black text-text-primary mb-1 uppercase tracking-wider">Mid</div>
          <div class="text-[10px] text-text-muted mb-3 font-mono">5K-10K TOKENS</div>
          <div class="inline-block px-3 py-1 bg-background border border-border rounded-full text-primary font-black text-xs">×1.5</div>
        </div>

        <div class="bg-surface rounded-xl p-5 border border-border text-center hover:border-text-muted transition-colors">
          <div class="text-2xl mb-2">💀</div>
          <div class="text-sm font-black text-text-primary mb-1 uppercase tracking-wider">High</div>
          <div class="text-[10px] text-text-muted mb-3 font-mono">10K-20K TOKENS</div>
          <div class="inline-block px-3 py-1 bg-background border border-border rounded-full text-primary font-black text-xs">×2.0</div>
        </div>

        <div class="bg-surface rounded-xl p-5 border border-border text-center hover:border-text-muted transition-colors">
          <div class="text-2xl mb-2">☠️</div>
          <div class="text-sm font-black text-text-primary mb-1 uppercase tracking-wider">Peak</div>
          <div class="text-[10px] text-text-muted mb-3 font-mono">20K+ TOKENS</div>
          <div class="inline-block px-3 py-1 bg-background border border-border rounded-full text-primary font-black text-xs">×3.0</div>
        </div>
      </div>

      <div class="bg-surface/50 rounded-xl p-6 border border-border">
        <h3 class="text-xs font-black text-text-muted uppercase tracking-[0.2em] mb-4">Telemetric Formula</h3>
        <div class="bg-background/80 p-4 rounded-lg border border-border/50">
          <code class="text-primary font-mono text-sm block">
            RESULT = tokens_used × multi_diff × multi_qual
          </code>
        </div>
      </div>
    </div>
  </section>
</template>
