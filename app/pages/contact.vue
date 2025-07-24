<template>
  <div class="contact-page">
    <BlogHeader />
    
    <main class="main-content">
      <div class="content-container">
        <section class="contact-section">
          <h1 class="page-title">联系我</h1>
          <p class="subtitle">通过以下方式与我取得联系</p>
          
          <div class="contact-methods">
            <div class="contact-card">
              <div class="method-icon">
                <i class="fas fa-envelope"></i>
              </div>
              <div class="method-details">
                <h2>电子邮件</h2>
                <p>3308225809@qq.com</p>
                <a href="mailto:3308225809@qq.com" class="method-link">
                  <i class="fas fa-paper-plane"></i> 发送邮件
                </a>
              </div>
            </div>
            
            <div class="contact-card">
              <div class="method-icon">
                <i class="fab fa-telegram"></i>
              </div>
              <div class="method-details">
                <h2>QQ</h2>
                <p>3308225809</p>
                <a href="https://im.qq.com" target="_blank" class="method-link">
                  <i class="fas fa-paper-plane"></i> 发送消息
                </a>
              </div>
            </div>
            
            <div class="contact-card">
              <div class="method-icon">
                <i class="fab fa-discord"></i>
              </div>
              <div class="method-details">
                <h2>GitHub</h2>
                <p>NiceHuanyu</p>
                <a href="https://github.com/NiceHuanYu" target="_blank" class="method-link">
                  <i class="fas fa-user-plus"></i> 点点关注
                </a>
              </div>
            </div>
            
            <div class="contact-card">
              <div class="method-icon">
                <i class="fab fa-bilibili"></i>
              </div>
              <div class="method-details">
                <h2>Bilibili</h2>
                <p>寰宇Actor</p>
                <a href="https://space.bilibili.com/621662356" target="_blank" class="method-link">
                  <i class="fas fa-external-link-alt"></i> 访问主页
                </a>
              </div>
            </div>
          </div>
          
          <div class="social-media-section">
            <h2 class="section-title">社交媒体</h2>
            <div class="social-links">
              <a href="https://github.com/NiceHuanYu" target="_blank" class="social-link">
                <i class="fab fa-github"></i>
                <span>GitHub</span>
              </a>
              <a href="https://space.bilibili.com/621662356" target="_blank" class="social-link">
                <i class="fab fa-bilibili"></i>
                <span>Bilibili</span>
              </a>
            </div>
          </div>
        </section>
      </div>
    </main>
    
    <BlogFooter />
  </div>
</template>

<script setup>
import BlogHeader from '@/components/BlogHeader.vue'
import BlogFooter from '@/components/BlogFooter.vue'
</script>

<style scoped>
.contact-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f9f9f9;
}

.main-content {
  flex: 1;
  padding: 2rem 0;
}

.content-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.page-title {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 0.5rem;
  text-align: center;
  position: relative;
  padding-bottom: 0.5rem;
}

.page-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 3px;
  background-color: #42b983;
}

.subtitle {
  font-size: 1.2rem;
  color: #666;
  text-align: center;
  margin-bottom: 3rem;
}

.contact-methods {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  margin-bottom: 3rem;
}

@media (min-width: 768px) {
  .contact-methods {
    grid-template-columns: 1fr 1fr;
  }
}

.contact-card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
  transition: transform 0.3s, box-shadow 0.3s;
}

.contact-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.method-icon {
  width: 50px;
  height: 50px;
  background-color: #f0f7f0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #42b983;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.method-details {
  flex: 1;
}

.method-details h2 {
  font-size: 1.3rem;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.method-details p {
  color: #666;
  margin-bottom: 1rem;
}

.method-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #42b983;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s;
}

.method-link:hover {
  color: #3aa876;
  text-decoration: underline;
}

.method-link i {
  font-size: 0.9rem;
}

.social-media-section {
  text-align: center;
  padding: 2rem 0;
}

.section-title {
  font-size: 1.5rem;
  color: #2c3e50;
  margin-bottom: 1.5rem;
  position: relative;
  display: inline-block;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: #42b983;
}

.social-links {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.social-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  color: #2c3e50;
  text-decoration: none;
  transition: color 0.3s;
  width: 80px;
}

.social-link:hover {
  color: #42b983;
}

.social-link i {
  font-size: 2rem;
}

.social-link span {
  font-size: 0.9rem;
}
</style>