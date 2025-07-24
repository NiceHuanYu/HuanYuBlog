<template>
  <section class="recent-posts">
    <h2 class="section-title">最新文章</h2>
    <div class="posts-list">
      <article v-for="post in posts" :key="post.id" class="recent-post">
        <div class="post-info">
          <span class="post-category">{{ post.category }}</span>
          <h3 class="post-title">{{ post.title }}</h3>
          <p class="post-excerpt">{{ post.excerpt }}</p>
          <div class="post-meta">
            <time :datetime="post.date">{{ formatDate(post.date) }}</time>
            <NuxtLink :to="`/posts/${post.id}`" class="read-more">阅读更多</NuxtLink>
          </div>
        </div>
      </article>
    </div>
    <NuxtLink to="/archive" class="view-all">查看所有文章 →</NuxtLink>
  </section>
</template>

<script setup>
const props = defineProps({
  posts: {
    type: Array,
    required: true
  }
})

const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' }
  return new Date(dateString).toLocaleDateString('zh-CN', options)
}
</script>

<style scoped>
.recent-posts {
  margin-bottom: 4rem;
}

.posts-list {
  margin-bottom: 2rem;
}

.recent-post {
  padding: 1.5rem 0;
  border-bottom: 1px solid #eee;
}

.recent-post:last-child {
  border-bottom: none;
}

.post-info {
  max-width: 800px;
  margin: 0 auto;
}

.post-category {
  display: inline-block;
  background-color: #f0f0f0;
  color: #666;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  margin-bottom: 0.8rem;
}

.post-title {
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
  color: #2c3e50;
}

.post-excerpt {
  color: #666;
  margin-bottom: 1rem;
  line-height: 1.5;
}

.post-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #888;
  font-size: 0.9rem;
}

.read-more {
  color: #42b983;
  text-decoration: none;
  font-weight: bold;
}

.read-more:hover {
  text-decoration: underline;
}

.view-all {
  display: block;
  text-align: center;
  color: #42b983;
  text-decoration: none;
  font-weight: bold;
  margin-top: 2rem;
}

.view-all:hover {
  text-decoration: underline;
}
</style>