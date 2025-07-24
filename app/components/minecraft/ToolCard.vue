<template>
  <NuxtLink :to="link" class="tool-card">
    <div class="tool-icon">{{ icon }}</div>
    <div class="tool-content">
      <span class="tool-category">{{ category }}</span>
      <h3 class="tool-title">{{ title }}</h3>
      <p class="tool-description">{{ description }}</p>
    </div>
  </NuxtLink>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  link: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  }
})
</script>

<style scoped>
.tool-card {
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s, box-shadow 0.3s;
  text-decoration: none;
  color: inherit;
  height: 100%;
}

.tool-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.tool-icon {
  font-size: 3rem;
  text-align: center;
  padding: 1.5rem;
  background-color: #f0f7ff;
  color: #2c3e50;
}

.tool-content {
  padding: 1.5rem;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.tool-category {
  display: inline-block;
  background-color: #e1f5e8;
  color: #2c3e50;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  margin-bottom: 0.8rem;
  align-self: flex-start;
}

.tool-title {
  font-size: 1.2rem;
  margin-bottom: 0.8rem;
  color: #2c3e50;
}

.tool-description {
  color: #666;
  margin-top: auto;
  line-height: 1.5;
}
</style>