<template>
  <div>
    <!-- 悬浮控制按钮 -->
    <button 
      @click="togglePlayer"
      class="fixed bottom-5 right-5 z-[1000] bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105"
    >
      {{ isPlayerVisible ? '关闭音乐' : '打开音乐' }}
    </button>
    
    <!-- 悬浮播放器容器 -->
    <div 
      v-if="isPlayerVisible"
      ref="playerContainer"
      class="fixed z-[999] cursor-move rounded-xl shadow-xl backdrop-blur-md bg-white/80 border border-gray-200"
      :style="{ top: position.y + 'px', left: position.x + 'px' }"
      @mousedown="startDrag"
    >
      <!-- 关闭按钮 -->
      <button 
        @click="isPlayerVisible = false"
        class="absolute -top-2 -right-2 z-[1001] bg-gray-800 hover:bg-gray-900 text-white w-6 h-6 rounded-full flex items-center justify-center shadow-md"
      >
        ×
      </button>
      
      <!-- 音乐播放器 -->
      <iframe 
        frameborder="0"
        width="330"
        height="86"
        :src="`//music.163.com/outchain/player?type=2&id=2694767342&auto=1&height=66`"
        class="rounded-xl"
      ></iframe>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const isPlayerVisible = ref(true);
const position = ref({ x: 20, y: 20 });
const playerContainer = ref(null);
let isDragging = false;
let startX = 0, startY = 0;

// 初始化时读取保存的位置
onMounted(() => {
  if (process.client) {
    const savedPos = localStorage.getItem('playerPos');
    if (savedPos) position.value = JSON.parse(savedPos);
  }
});

const togglePlayer = () => {
  isPlayerVisible.value = !isPlayerVisible.value;
};

const startDrag = (e) => {
  if (e.target.tagName === 'BUTTON') return;
  isDragging = true;
  startX = e.clientX - position.value.x;
  startY = e.clientY - position.value.y;
  document.addEventListener('mousemove', handleDrag);
  document.addEventListener('mouseup', stopDrag);
  playerContainer.value.classList.add('cursor-grabbing', 'shadow-2xl');
};

const handleDrag = (e) => {
  if (!isDragging) return;
  position.value.x = e.clientX - startX;
  position.value.y = e.clientY - startY;
};

const stopDrag = () => {
  if (!isDragging) return;
  isDragging = false;
  localStorage.setItem('playerPos', JSON.stringify(position.value));
  document.removeEventListener('mousemove', handleDrag);
  document.removeEventListener('mouseup', stopDrag);
  playerContainer.value.classList.remove('cursor-grabbing', 'shadow-2xl');
};
</script>

<style>
/* 添加拖动时的视觉反馈 */
.cursor-grabbing {
  cursor: grabbing;
  transition: box-shadow 0.2s;
}
</style>