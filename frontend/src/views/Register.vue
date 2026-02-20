<template>
  <div class="min-h-screen flex items-center justify-center p-4">
    <div class="glass-panel p-10 max-w-xl w-full gold-glow">
      <div class="text-center mb-8">
        <h1 class="text-4xl font-amiri gold-text mb-2">تسجيل متسابق جديد</h1>
        <p v-if="targetQuiz" class="text-blue-400 font-bold mb-2">للمشاركة في: {{ targetQuiz.name }}</p>
        <p v-else class="text-gray-400">انضم إلى فريقك المفضل للمشاركة في المسابقات</p>
      </div>

      <div v-if="success" class="text-center py-10 animate-fade-in">
        <div class="text-6xl mb-4">🎉</div>
        <h2 class="text-2xl font-bold text-green-400 mb-6">تم التسجيل بنجاح!</h2>
        <p v-if="targetQuiz" class="text-gray-300 mb-6">سيتم توزيعك آلياً على أحد الفرق المتنافسة لضمان تكافؤ الفرص.</p>
        <div class="flex flex-col gap-4 items-center">
          <button @click="resetForm" class="bg-ramadan-gold text-ramadan-blue px-8 py-3 rounded-xl font-bold w-full">تسجيل متسابق آخر</button>
          <router-link to="/" class="text-gray-400 hover:text-white text-sm">العودة للرئيسية</router-link>
        </div>
      </div>

      <div v-else-if="targetQuiz && !targetQuiz.registrationOpen" class="text-center py-10 animate-fade-in">
        <div class="text-6xl mb-4">🔒</div>
        <h2 class="text-2xl font-bold text-red-400 mb-6">عذراً، التسجيل مغلق!</h2>
        <p class="text-gray-300 mb-8">لقد تم إغلاق التسجيل لهذه المسابقة من قبل المشرفين.</p>
        <router-link to="/" class="bg-slate-700 text-white px-8 py-3 rounded-xl font-bold">العودة للرئيسية</router-link>
      </div>

      <form v-else @submit.prevent="handleRegister" class="space-y-6">
        <!-- Show team selection only if NOT registering for a specific quiz -->
        <div v-if="!quizId">
          <label class="block text-sm text-gray-400 mb-2 text-right">اختر الفريق</label>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div v-for="t in teams" :key="t._id" 
                 @click="form.teamId = t._id"
                 :class="['p-4 border rounded-xl cursor-pointer transition-all text-center', form.teamId === t._id ? 'border-ramadan-gold bg-ramadan-gold/10' : 'border-slate-700 bg-slate-800/50 hover:border-slate-500']">
              <div class="font-bold">{{ t.name }}</div>
              <div class="text-xs text-gray-500">{{ t.description || '' }}</div>
            </div>
          </div>
        </div>

        <div>
          <label class="block text-sm text-gray-400 mb-2 text-right">الاسم الكامل</label>
          <input v-model="form.name" type="text" required placeholder="مثلاً: أحمد محمد" class="w-full bg-slate-800 border border-slate-700 p-4 rounded-xl focus:outline-none focus:border-ramadan-gold text-right" />
        </div>

        <div>
          <label class="block text-sm text-gray-400 mb-2 text-right">العمر</label>
          <input v-model="form.age" type="number" required placeholder="مثلاً: 15" class="w-full bg-slate-800 border border-slate-700 p-4 rounded-xl focus:outline-none focus:border-ramadan-gold text-right" />
        </div>

        <button type="submit" :disabled="loading" class="w-full bg-ramadan-gold text-ramadan-blue font-bold py-4 rounded-xl mt-6 gold-glow disabled:opacity-50 text-xl">
          {{ loading ? 'جاري التسجيل...' : 'تأكيد التسجيل' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const quizId = computed(() => route.params.quizId)

const teams = ref([])
const targetQuiz = ref(null)
const loading = ref(false)
const success = ref(false)
const form = ref({
  name: '',
  age: null,
  teamId: null
})

const fetchTeams = async () => {
  try {
    const res = await axios.get('/api/teams')
    teams.value = res.data
  } catch (e) {
    console.error(e)
  }
}

const fetchQuizInfo = async () => {
  if (!quizId.value) return
  try {
    const res = await axios.get(`/api/quizzes/${quizId.value}`)
    targetQuiz.value = res.data
  } catch (e) {
    console.error('Quiz not found')
  }
}

const handleRegister = async () => {
  if (!quizId.value && !form.value.teamId) {
    alert('الرجاء اختيار الفريق')
    return
  }
  loading.value = true
  try {
    await axios.post('/api/contestants/register', {
        ...form.value,
        quizId: quizId.value
    })
    success.value = true
  } catch (e) {
    if (e.response?.data?.message) {
      alert(e.response.data.message)
    } else {
      alert('فشل التسجيل. يرجى المحاولة لاحقاً.')
    }
  } finally {
    loading.value = false
  }
}
const resetForm = () => {
  success.value = false
  form.value = {
    name: '',
    age: null,
    teamId: null
  }
}
onMounted(() => {
  fetchTeams()
  fetchQuizInfo()
})
</script>
