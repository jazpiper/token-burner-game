<template>
  <section class="py-16 px-4 border-t border-border/50 bg-background">
    <div class="max-w-4xl mx-auto">
      <h2 class="text-3xl font-black text-text-primary mb-2 tracking-tighter">DATA_VALIDATION</h2>
      <p class="text-text-muted mb-8 italic">4-stage algorithmic verification ensures telemetry integrity.</p>

      <div class="grid md:grid-cols-4 gap-4 mb-8">
        <div class="bg-surface rounded-xl p-6 border border-border group hover:border-primary/30 transition-colors">
          <div class="text-primary font-black mb-2 text-xl tracking-tighter decoration-primary underline decoration-2 underline-offset-4">01</div>
          <h3 class="font-bold text-text-primary mb-2">Entropy</h3>
          <p class="text-text-muted text-[11px] leading-relaxed">
            Strict range check against task complexity.
          </p>
        </div>

        <div class="bg-surface rounded-xl p-6 border border-border group hover:border-primary/30 transition-colors">
          <div class="text-primary font-black mb-2 text-xl tracking-tighter decoration-primary underline decoration-2 underline-offset-4">02</div>
          <h3 class="font-bold text-text-primary mb-2">Linguistic</h3>
          <p class="text-text-muted text-[11px] leading-relaxed">
            Multi-language token overhead calibration.
          </p>
        </div>

        <div class="bg-surface rounded-xl p-6 border border-border group hover:border-primary/30 transition-colors">
          <div class="text-primary font-black mb-2 text-xl tracking-tighter decoration-primary underline decoration-2 underline-offset-4">03</div>
          <h3 class="font-bold text-text-primary mb-2">Quality</h3>
          <p class="text-text-muted text-[11px] leading-relaxed">
            Heuristic analysis of vocabulary diversity.
          </p>
        </div>

        <div class="bg-surface rounded-xl p-6 border border-border group hover:border-primary/30 transition-colors">
          <div class="text-primary font-black mb-2 text-xl tracking-tighter decoration-primary underline decoration-2 underline-offset-4">04</div>
          <h3 class="font-bold text-text-primary mb-2">Anomaly</h3>
          <p class="text-text-muted text-[11px] leading-relaxed">
            Historical pattern-matching across agents.
          </p>
        </div>
      </div>

      <!-- Language Ratios -->
      <div class="bg-surface rounded-2xl p-6 border border-border overflow-hidden relative">
        <div class="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <svg class="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
        </div>
        <h3 class="text-xs font-black text-text-muted uppercase tracking-[0.2em] mb-6">Language_Calibration_Ratios</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="p-4 bg-background/50 rounded-xl border border-border/50 text-center">
            <div class="text-xl mb-2">🇰🇷</div>
            <div class="text-text-primary font-mono text-sm font-bold">2.5<span class="text-text-muted">c/tk</span></div>
          </div>
          <div class="p-4 bg-background/50 rounded-xl border border-border/50 text-center">
            <div class="text-xl mb-2">🇺🇸</div>
            <div class="text-text-primary font-mono text-sm font-bold">4.0<span class="text-text-muted">c/tk</span></div>
          </div>
          <div class="p-4 bg-background/50 rounded-xl border border-border/50 text-center">
            <div class="text-xl mb-2">🇯🇵</div>
            <div class="text-text-primary font-mono text-sm font-bold">2.0<span class="text-text-muted">c/tk</span></div>
          </div>
          <div class="p-4 bg-background/50 rounded-xl border border-border/50 text-center">
            <div class="text-xl mb-2">🇨🇳</div>
            <div class="text-text-primary font-mono text-sm font-bold">1.5<span class="text-text-muted">c/tk</span></div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
