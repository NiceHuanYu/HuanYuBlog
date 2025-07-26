<template>
  <footer class="blog-footer">
    <div class="footer-content">
      <div class="footer-section">
        <h3>关于我</h3>
        <p>一名热爱技术的前端开发者，喜欢分享知识和经验。</p>
      </div>
      <div class="footer-section">
        <h3>链接</h3>
        <ul>
          <li><NuxtLink to="/">首页</NuxtLink></li>
          <li><NuxtLink to="/minecraft">MC</NuxtLink></li>
          <li><NuxtLink to="/about">关于</NuxtLink></li>
          <li><NuxtLink to="/archive">归档</NuxtLink></li>
          <li><NuxtLink to="/contact">联系</NuxtLink></li>
        </ul>
      </div>
      <div class="footer-section">
        <h3>社交</h3>
        <div class="social-links">
          <a href="#" class="social-icon">GitHub</a>
          <a href="#" class="social-icon">Bilibili</a>
          <a href="#" class="social-icon">QQ</a>
        </div>
      </div>
    </div>
    <div class="copyright">
      &copy; {{ new Date().getFullYear() }} 我的博客. 保留所有权利.
    </div>
  </footer>
</template>

<script setup>
</script>

<style scoped>
.blog-footer {
  background-color: #2c3e50;
  color: white;
  padding: 3rem 0 1rem;
}

.footer-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.footer-section {
  margin-bottom: 1.5rem;
}

.footer-section h3 {
  font-size: 1.2rem;
  margin-bottom: 1rem;
  color: #42b983;
}

.footer-section p {
  color: #bbb;
  line-height: 1.5;
}

.footer-section ul {
  list-style: none;
}

.footer-section li {
  margin-bottom: 0.5rem;
}

.footer-section a {
  color: #bbb;
  text-decoration: none;
  transition: color 0.3s;
}

.footer-section a:hover {
  color: #42b983;
}

.social-links {
  display: flex;
  gap: 1rem;
}

.social-icon {
  display: inline-block;
  padding: 0.5rem;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  transition: background-color 0.3s;
}

.social-icon:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.copyright {
  text-align: center;
  padding-top: 2rem;
  margin-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  color: #bbb;
  font-size: 0.9rem;
}
</style>