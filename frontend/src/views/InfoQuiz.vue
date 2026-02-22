<template>
  <div class="min-h-screen p-4 md:p-8 flex flex-col items-center">
    <div class="w-full max-w-2xl">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8 w-full">
        <h1 class="text-3xl font-amiri gold-text">اختبار بنك المعلومات</h1>
        <div class="flex gap-4">
          <button @click="resetQuiz" class="text-red-400 hover:text-red-300 text-sm">إعادة من الأول</button>
          <router-link to="/info" class="text-ramadan-gold hover:underline text-sm">خروج</router-link>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center h-64">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-ramadan-gold"></div>
      </div>

      <!-- Result View -->
      <div v-else-if="finished" class="glass-panel p-8 text-center animate-fade-in">
        <div class="text-6xl mb-4">🎊</div>
        <h2 class="text-3xl font-bold mb-6">انتهى الاختبار!</h2>
        
        <div class="grid grid-cols-3 gap-4 mb-8">
          <div class="p-4 bg-green-500/20 rounded-lg border border-green-500/50">
            <div class="text-2xl font-bold text-green-400">{{ correctCount }}</div>
            <div class="text-xs text-gray-400">أصاب</div>
          </div>
          <div class="p-4 bg-red-500/20 rounded-lg border border-red-500/50">
            <div class="text-2xl font-bold text-red-400">{{ wrongCount }}</div>
            <div class="text-xs text-gray-400">أخطأ</div>
          </div>
          <div class="p-4 bg-ramadan-gold/20 rounded-lg border border-ramadan-gold/50">
            <div class="text-2xl font-bold text-ramadan-gold">{{ percentage }}%</div>
            <div class="text-xs text-gray-400">النسبة</div>
          </div>
        </div>

        <button 
          @click="resetQuiz"
          class="w-full py-4 bg-ramadan-gold hover:bg-ramadan-gold/80 text-black font-bold rounded-xl transition-all shadow-lg shadow-ramadan-gold/20"
        >
          إعادة الاختبار مرة أخرى
        </button>
      </div>

      <!-- Quiz View -->
      <div v-else-if="currentQuestion" class="w-full">
        <!-- Progress Bar -->
        <div class="w-full bg-gray-700 h-2 rounded-full mb-8 overflow-hidden">
          <div 
            class="bg-ramadan-gold h-full transition-all duration-500"
            :style="{ width: ((currentIndex / questions.length) * 100) + '%' }"
          ></div>
        </div>

        <div class="mb-2 text-gray-400 text-sm">سؤال {{ currentIndex + 1 }} من {{ questions.length }}</div>
        
        <div class="glass-panel p-8 mb-6 relative overflow-hidden">
          <h2 class="text-2xl font-bold leading-relaxed mb-8">{{ currentQuestion.text }}</h2>

          <div class="grid grid-cols-1 gap-4">
            <button
              v-for="(option, idx) in currentQuestion.options"
              :key="idx"
              @click="handleAnswer(option)"
              :disabled="answered"
              class="p-4 text-right rounded-xl border-2 transition-all flex items-center justify-between"
              :class="[
                answered 
                  ? option === currentQuestion.correctAnswer 
                    ? 'border-green-500 bg-green-500/20 text-green-100' 
                    : selectedAnswer === option 
                      ? 'border-red-500 bg-red-500/20 text-red-100' 
                      : 'border-white/10 text-gray-500'
                  : 'border-white/10 hover:border-ramadan-gold/50 hover:bg-white/5'
              ]"
            >
              <span>{{ option }}</span>
              <span v-if="answered && option === currentQuestion.correctAnswer" class="text-green-500">✓</span>
              <span v-if="answered && selectedAnswer === option && option !== currentQuestion.correctAnswer" class="text-red-500">✗</span>
            </button>
          </div>

          <!-- Feedback & Explanation -->
          <div v-if="answered" class="mt-8 pt-8 border-t border-white/10 animate-slide-up">
            <div class="flex items-center gap-2 mb-2" :class="isCorrect ? 'text-green-400' : 'text-red-400'">
              <span class="font-bold text-lg">{{ isCorrect ? 'إجابة صحيحة!' : 'إجابة خاطئة' }}</span>
            </div>
            <p v-if="currentQuestion.explanation" class="text-gray-300 bg-white/5 p-4 rounded-lg italic">
              {{ currentQuestion.explanation }}
            </p>
            
            <button 
              @click="nextQuestion"
              class="mt-6 w-full py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-lg transition-all"
            >
              {{ isLastQuestion ? 'عرض النتيجة' : 'السؤال التالي' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const modelId = route.params.modelId;

const questions = ref([]);
const currentIndex = ref(0);
const results = ref([]); // Store boolean results
const loading = ref(true);
const answered = ref(false);
const selectedAnswer = ref(null);
const finished = ref(false);

const currentQuestion = computed(() => questions.value[currentIndex.value]);
const isCorrect = computed(() => selectedAnswer.value === currentQuestion.value?.correctAnswer);
const isLastQuestion = computed(() => currentIndex.value === questions.value.length - 1);

const correctCount = computed(() => results.value.filter(r => r === true).length);
const wrongCount = computed(() => results.value.filter(r => r === false).length);
const percentage = computed(() => questions.value.length ? Math.round((correctCount.value / questions.value.length) * 100) : 0);

const fetchQuestions = async () => {
  try {
    const res = await axios.get(`/api/info/questions/${modelId}`);
    questions.value = res.data;
    loadProgress();
  } catch (error) {
    console.error('Error fetching questions:', error);
  } finally {
    loading.value = false;
  }
};

const handleAnswer = (option) => {
  if (answered.value) return;
  selectedAnswer.value = option;
  answered.value = true;
  results.value[currentIndex.value] = option === currentQuestion.value.correctAnswer;
  saveProgress();
};

const nextQuestion = () => {
  if (isLastQuestion.value) {
    finished.value = true;
    saveProgress();
  } else {
    currentIndex.value++;
    answered.value = false;
    selectedAnswer.value = null;
    saveProgress();
  }
};

const resetQuiz = () => {
  if (confirm('هل أنت متأكد من إعادة الاختبار من البداية؟')) {
    currentIndex.value = 0;
    results.value = [];
    answered.value = false;
    selectedAnswer.value = null;
    finished.value = false;
    localStorage.removeItem(`quiz_progress_${modelId}`);
    // Re-fetch or just reset local state
    if (questions.value.length === 0) fetchQuestions();
  }
};

const saveProgress = () => {
  const data = {
    currentIndex: currentIndex.value,
    results: results.value,
    finished: finished.value
  };
  localStorage.setItem(`quiz_progress_${modelId}`, JSON.stringify(data));
};

const loadProgress = () => {
  const saved = localStorage.getItem(`quiz_progress_${modelId}`);
  if (saved) {
    const data = JSON.parse(saved);
    currentIndex.value = data.currentIndex || 0;
    results.value = data.results || [];
    finished.value = data.finished || false;
    
    // If a question was mid-progress but not nexted, we reset its answered state 
    // to allow answering again if not saved as answered, or keep it.
    // For simplicity, we just resume at the index.
    answered.value = false; 
    selectedAnswer.value = null;
  }
};

onMounted(fetchQuestions);
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.5s ease-out forwards;
}
.animate-slide-up {
  animation: slideUp 0.3s ease-out forwards;
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
</style>
