<template>
  <div class="min-h-screen p-4 md:p-8">
    <div class="max-w-4xl mx-auto">
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-4xl font-amiri gold-text">بنك المعلومات</h1>
        <router-link to="/" class="text-ramadan-gold hover:underline">العودة للرئيسية</router-link>
      </div>

      <div v-if="loading" class="flex justify-center items-center h-64">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-ramadan-gold"></div>
      </div>

      <div v-else-if="categories.length === 0" class="text-center py-12 glass-panel">
        <p class="text-gray-400">لا توجد أقسام متوفرة حالياً</p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div 
          v-for="cat in categories" 
          :key="cat._id"
          @click="$router.push(`/info/${cat._id}`)"
          class="glass-panel p-6 cursor-pointer hover:bg-ramadan-gold/10 transition-all group flex items-center gap-4"
          :style="{ borderColor: cat.color + '44' }"
        >
          <div class="text-4xl group-hover:scale-110 transition-transform">{{ cat.icon }}</div>
          <div>
            <h2 class="text-2xl font-bold mb-1">{{ cat.name }}</h2>
            <p class="text-sm text-gray-400">اضغط لاستكشاف النماذج</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const categories = ref([]);
const loading = ref(true);

const fetchCategories = async () => {
  try {
    const res = await axios.get('/api/info/categories');
    categories.value = res.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchCategories);
</script>
