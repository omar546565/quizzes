<template>
  <div class="min-h-screen p-4 md:p-8">
    <div class="max-w-4xl mx-auto">
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-4xl font-amiri gold-text">النماذج المتوفرة</h1>
        <router-link to="/info" class="text-ramadan-gold hover:underline">العودة للأقسام</router-link>
      </div>

      <div v-if="loading" class="flex justify-center items-center h-64">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-ramadan-gold"></div>
      </div>

      <div v-else-if="models.length === 0" class="text-center py-12 glass-panel">
        <p class="text-gray-400">لا توجد نماذج متوفرة في هذا القسم</p>
      </div>

      <div v-else class="grid grid-cols-1 gap-4">
        <div 
          v-for="model in models" 
          :key="model._id"
          @click="$router.push(`/info/quiz/${model._id}`)"
          class="glass-panel p-6 cursor-pointer hover:bg-ramadan-gold/10 transition-all group flex items-center justify-between"
        >
          <div class="flex items-center gap-4">
            <div class="w-10 h-10 rounded-full bg-ramadan-gold/20 flex items-center justify-center font-bold text-ramadan-gold">
              {{ model.order }}
            </div>
            <h2 class="text-xl font-bold">{{ model.name }}</h2>
          </div>
          <div class="flex items-center gap-4">
            <div class="flex items-center gap-2 text-ramadan-gold opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                @click.stop="copyLink(model._id)" 
                class="p-2 hover:bg-white/10 rounded-full transition-colors"
                title="نسخ رابط النموذج"
              >
                🔗 نسخ الرابط
              </button>
              <span class="mx-2 text-gray-600">|</span>
              <span>ابدأ الاختبار ➔</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const models = ref([]);
const loading = ref(true);

const fetchModels = async () => {
  try {
    const res = await axios.get(`/api/info/models/${route.params.categoryId}`);
    models.value = res.data;
  } catch (error) {
    console.error('Error fetching models:', error);
  } finally {
    loading.value = false;
  }
};

const copyLink = (modelId) => {
  const url = `${window.location.origin}/info/quiz/${modelId}`;
  navigator.clipboard.writeText(url);
  alert('تم نسخ رابط النموذج بنجاح!');
};

onMounted(fetchModels);
</script>
