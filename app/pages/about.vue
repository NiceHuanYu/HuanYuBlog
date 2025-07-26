<template>
  <div class="about-page">
    <BlogHeader />
    
    <main class="main-content">
      <div class="content-container">
        <section class="about-section">
          <h1 class="page-title">关于我</h1>
          <p class="subtitle">一个平平无奇的大学牲</p>
          
          <div class="about-grid">
            <div class="about-card profile-card">
              <div class="profile-image">
                <img src="/images/profile.jpg" alt="我的头像" class="profile-img">
              </div>
              <div class="profile-info">
                <h2>寰宇Actor</h2>
                <p class="profile-bio">小小程序员 & Minecraft爱好者</p>
                <div class="social-links">
                  <a href="https://github.com/yourusername" target="_blank" class="social-link">
                    <i class="fab fa-github"></i>
                  </a>
                  <a href="https://space.bilibili.com/621662356" target="_blank" class="social-link">
                    <i class="fab fa-bilibili"></i>
                  </a>
                  <a href="https://twitter.com/yourusername" target="_blank" class="social-link">
                    <i class="fab fa-twitter"></i>
                  </a>
                </div>
              </div>
            </div>
            
            <div class="about-card intro-card">
              <h3 class="card-title"><i class="fas fa-user"></i> 个人简介</h3>
              <div class="card-content">
                <p>你好！我是寰宇Actor，喜欢开发一些小玩意。</p>
                <p>我热爱创造和分享，喜欢探索新技术并将其应用到实际项目中。我的博客主要分享技术教程、开发经验和一些有趣的项目。</p>
                <p>在业余时间，我喜欢玩Minecraft并开发相关工具和插件，这也是我创建Minecraft工具页面的原因。</p>
              </div>
            </div>
            
            <div class="about-card skills-card">
              <h3 class="card-title"><i class="fas fa-code"></i> 我的日常</h3>
              <div class="card-content">
                <div class="skills-grid">
                  <div class="skill-item">
                    <div class="skill-name">CounterStrike:Global Offensive & Minecraft</div>
                    <div class="skill-bar">
                      <div class="skill-level" style="width: 90%"></div>
                    </div>
                  </div>
                  <div class="skill-item">
                    <div class="skill-name">健身</div>
                    <div class="skill-bar">
                      <div class="skill-level" style="width: 85%"></div>
                    </div>
                  </div>
                  <div class="skill-item">
                    <div class="skill-name">机械设计</div>
                    <div class="skill-bar">
                      <div class="skill-level" style="width: 80%"></div>
                    </div>
                  </div>
                  <div class="skill-item">
                    <div class="skill-name">游泳</div>
                    <div class="skill-bar">
                      <div class="skill-level" style="width: 75%"></div>
                    </div>
                  </div>
                  <div class="skill-item">
                    <div class="skill-name">程序设计</div>
                    <div class="skill-bar">
                      <div class="skill-level" style="width: 70%"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="about-card interests-card">
              <h3 class="card-title"><i class="fas fa-heart"></i> 兴趣爱好</h3>
              <div class="card-content">
                <div class="interests-grid">
                  <div class="interest-item">
                    <i class="fas fa-gamepad"></i>
                    <span>游戏开发</span>
                  </div>
                  <div class="interest-item">
                    <i class="fas fa-music"></i>
                    <span>音乐</span>
                  </div>
                  <div class="interest-item">
                    <i class="fas fa-book"></i>
                    <span>阅读</span>
                  </div>
                  <div class="interest-item">
                    <i class="fas fa-camera"></i>
                    <span>摄影</span>
                  </div>
                  <div class="interest-item">
                    <i class="fas fa-utensils"></i>
                    <span>烹饪</span>
                  </div>
                  <div class="interest-item">
                    <i class="fas fa-plane"></i>
                    <span>旅行</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="about-card contact-card">
              <h3 class="card-title"><i class="fas fa-envelope"></i> 联系我</h3>
              <div class="card-content">
                <p>如果你有任何问题或合作意向，欢迎通过以下方式联系我：</p>
                <ul class="contact-list">
                  <li>
                    <i class="fas fa-envelope"></i>
                    <span>邮箱: 3308225809@qq.com</span>
                  </li>
                  <li>
                    <i class="fab fa-telegram"></i>
                    <span>GitHub: NiceHuanYu</span>
                  </li>
                  <li>
                    <i class="fab fa-telegram"></i>
                    <span>Telegram: @木有哦</span>
                  </li>
                  <li>
                    <i class="fab fa-discord"></i>
                    <span>Discord: 忘记惹#1234</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
    
    <BlogFooter />
  </div>
</template>

<script setup>
// 导入组件
import BlogHeader from '@/components/BlogHeader.vue'
import BlogFooter from '@/components/BlogFooter.vue'
</script>

<style scoped>
.about-page {
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
  max-width: 1200px;
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
  margin-bottom: 2rem;
}

.about-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}

.about-card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s, box-shadow 0.3s;
}

.about-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.card-title {
  font-size: 1.3rem;
  color: #2c3e50;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #eee;
}

.card-title i {
  color: #42b983;
}

.profile-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  grid-column: 1 / -1;
}

.profile-image {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  overflow: hidden;
  border: 4px solid #42b983;
  margin-bottom: 1rem;
}

.profile-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-info {
  text-align: center;
}

.profile-info h2 {
  font-size: 1.8rem;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.profile-bio {
  color: #666;
  margin-bottom: 1rem;
}

.social-links {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.social-link {
  color: #2c3e50;
  font-size: 1.5rem;
  transition: color 0.3s;
}

.social-link:hover {
  color: #42b983;
}

.skills-grid {
  display: grid;
  gap: 1rem;
}

.skill-item {
  margin-bottom: 0.8rem;
}

.skill-name {
  font-size: 0.9rem;
  margin-bottom: 0.3rem;
  color: #2c3e50;
}

.skill-bar {
  height: 8px;
  background: #eee;
  border-radius: 4px;
  overflow: hidden;
}

.skill-level {
  height: 100%;
  background: #42b983;
  border-radius: 4px;
}

.interests-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 1rem;
}

.interest-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  background: #f5f5f5;
  border-radius: 8px;
  transition: all 0.3s;
}

.interest-item:hover {
  background: #42b983;
  color: white;
}

.interest-item i {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.contact-list {
  list-style: none;
  padding: 0;
}

.contact-list li {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin-bottom: 0.8rem;
  color: #2c3e50;
}

.contact-list i {
  color: #42b983;
  width: 20px;
  text-align: center;
}

@media (min-width: 768px) {
  .profile-card {
    flex-direction: row;
    text-align: left;
  }
  
  .profile-image {
    margin-right: 1.5rem;
    margin-bottom: 0;
  }
  
  .profile-info {
    text-align: left;
  }
  
  .intro-card {
    grid-column: span 2;
  }
}

@media (min-width: 1024px) {
  .about-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .profile-card {
    grid-column: span 3;
  }
  
  .intro-card {
    grid-column: span 3;
  }
}
</style>