<template>
  <section class="hero-section">
    <div class="hero-content">
      <h1>{{ title }}</h1>
      <p class="subtitle">{{ subtitle }}</p>
      <NuxtLink 
        v-if="ctaText" 
        :to="ctaLink" 
        class="cta-button"
        :target="ctaTarget"
      >
        {{ ctaText }}
      </NuxtLink>
    </div>
  </section>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    required: true
  },
  ctaText: {
    type: String,
    default: ''
  },
  ctaLink: {
    type: [String, Object], // 支持字符串路径或Nuxt路由对象
    default: '/'
  },
  ctaTarget: {
    type: String,
    default: '_self', // 默认在当前标签页打开
    validator: (value) => ['_self', '_blank'].includes(value)
  }
})
</script>

<style scoped>
.hero-section {
  background: linear-gradient(135deg, #2a8f58, #1e5f3a);
  color: white;
  padding: 5rem 1.5rem;
  text-align: center;
  margin-bottom: 3rem;
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
}

.hero-section h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.subtitle {
  font-size: 1.2rem;
  margin-bottom: 2rem;
  opacity: 0.9;
}

.cta-button {
  display: inline-block;
  background-color: #f0c14b;
  color: #111;
  padding: 0.8rem 1.5rem;
  border-radius: 4px;
  text-decoration: none;
  font-weight: bold;
  transition: background-color 0.3s;
}

.cta-button:hover {
  background-color: #ddb347;
}
</style>