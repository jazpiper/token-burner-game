<script setup>
import Navigation from '@/components/layout/Navigation.vue'
import Footer from '@/components/layout/Footer.vue'
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <Navigation />
    
    <div class="pt-14">
      <router-view />
    </div>
    
    <Footer />
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}
</style>
