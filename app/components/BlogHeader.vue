<template>
  <header class="blog-header">
    <div class="container">
      <div class="logo">
        <NuxtLink to="/">我的博客</NuxtLink>
      </div>
      <nav class="main-nav">
        <ul>
          <li><NuxtLink to="/">首页</NuxtLink></li>
          <li><NuxtLink to="/minecraft">MC</NuxtLink></li>
          <li><NuxtLink to="/about">关于</NuxtLink></li>
          <li><NuxtLink to="/archive">归档</NuxtLink></li>
          <li><NuxtLink to="/contact">联系</NuxtLink></li>
        </ul>
      </nav>
    </div>
  </header>
</template>

<script setup>
</script>

<style scoped>
.blog-header {
  background-color: #2c3e50;
  color: white;
  padding: 1rem 0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.logo a {
  color: white;
  font-size: 1.5rem;
  font-weight: bold;
  text-decoration: none;
}

.main-nav ul {
  display: flex;
  list-style: none;
  gap: 1.5rem;
}

.main-nav a {
  color: white;
  text-decoration: none;
  transition: color 0.3s;
}

.main-nav a:hover {
  color: #42b983;
}

.main-nav a.router-link-active {
  color: #42b983;
  font-weight: bold;
}
</style>