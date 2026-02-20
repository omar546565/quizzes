<template>
  <div class="p-6 max-w-5xl mx-auto">
    <div class="flex justify-between items-center mb-10">
      <div class="flex gap-4 items-center">
        <router-link to="/" class="text-ramadan-gold hover:underline">← الرئيسية</router-link>
        <router-link to="/teams" class="bg-indigo-600/20 text-indigo-400 px-4 py-2 rounded-lg border border-indigo-500/30 font-bold">📂 إدارة الفرق</router-link>
        <button @click="handleLogout" class="text-red-400 hover:text-red-300 transition-colors mr-2">تسجيل الخروج 🚪</button>
      </div>
      <h1 class="text-3xl font-amiri gold-text">إدارة المسابقات</h1>
    </div>

    <!-- Quiz Config Form -->
    <div class="glass-panel p-8 mb-10">
      <h2 class="text-xl font-bold mb-6 flex items-center gap-2">
        <span class="text-ramadan-gold">{{ isEditing ? '📝' : '➕' }}</span> 
        {{ isEditing ? 'تعديل المسابقة' : 'إضافة مسابقة جديدة' }}
      </h2>
      
      <div class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm text-gray-400 mb-1">اسم المسابقة</label>
            <input v-model="newQuiz.name" type="text" placeholder="مثلاً: مسابقة اليوم الأول" class="w-full bg-slate-800 border border-slate-700 p-3 rounded-lg focus:outline-none focus:border-ramadan-gold" />
          </div>
          <div>
            <label class="block text-sm text-gray-400 mb-1">اليوم</label>
            <input v-model="newQuiz.day" type="number" placeholder="1" class="w-full bg-slate-800 border border-slate-700 p-3 rounded-lg focus:outline-none focus:border-ramadan-gold" />
          </div>
        </div>

        <!-- Team Selection -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-700">
          <div>
            <label class="block text-sm text-blue-400 mb-1">الفريق أ (Team A)</label>
            <select v-model="newQuiz.participations.teamA.teamId" class="w-full bg-slate-800 border border-slate-700 p-3 rounded-lg outline-none focus:border-blue-500">
              <option :value="null">اختر فريقاً</option>
              <option v-for="t in allTeams" :key="t._id" :value="t._id">{{ t.name }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm text-green-400 mb-1">الفريق ب (Team B)</label>
            <select v-model="newQuiz.participations.teamB.teamId" class="w-full bg-slate-800 border border-slate-700 p-3 rounded-lg outline-none focus:border-green-500">
              <option :value="null">اختر فريقاً</option>
              <option v-for="t in allTeams" :key="t._id" :value="t._id">{{ t.name }}</option>
            </select>
          </div>
        </div>

        <div class="pt-6">
          <h3 class="font-bold mb-4 flex justify-between items-center">
            الأسئلة ({{ newQuiz.questions.length }}/20)
            <button @click="addQuestion" class="bg-ramadan-gold text-ramadan-blue px-4 py-1 rounded-full text-sm font-bold">إضافة سؤال</button>
          </h3>
          
          <div v-for="(q, idx) in newQuiz.questions" :key="idx" class="bg-slate-800/50 p-4 rounded-lg mb-4 border border-slate-700">
            <div class="flex justify-between items-center mb-2">
              <span class="text-xs text-gray-500">سؤال رقم {{ idx + 1 }}</span>
              <button @click="removeQuestion(idx)" class="text-red-400 text-xs">حذف</button>
            </div>
            <input v-model="q.text" type="text" placeholder="نص السؤال" class="w-full bg-slate-900 mb-2 p-2 rounded text-sm outline-none" />
            <div class="grid grid-cols-2 gap-2">
              <input v-for="(_, oIdx) in 4" :key="oIdx" v-model="q.options[oIdx]" type="text" :placeholder="'خیار ' + (oIdx + 1)" class="bg-slate-900 p-2 rounded text-sm outline-none" />
            </div>
            <input v-model="q.correctAnswer" type="text" placeholder="الإجابة الصحيحة (يجب أن تطابق أحد الخيارات)" class="w-full bg-ramadan-gold/10 mt-2 p-2 rounded text-sm outline-none border border-ramadan-gold/20" />
          </div>
        </div>

        <div class="flex gap-4">
          <button @click="saveQuiz" :disabled="loading" class="flex-1 bg-ramadan-gold text-ramadan-blue font-bold py-4 rounded-xl mt-6 gold-glow disabled:opacity-50">
            {{ loading ? 'جاري الحفظ...' : (isEditing ? 'تحديث المسابقة' : 'حفظ المسابقة ونشرها') }}
          </button>
          <button v-if="isEditing" @click="cancelEdit" class="bg-slate-700 text-white font-bold py-4 px-8 rounded-xl mt-6">إلغاء</button>
        </div>
      </div>
    </div>

    <!-- Active Quizzes List -->
    <div class="glass-panel p-8 mb-10">
      <h2 class="text-xl font-bold mb-6">المسابقات الحالية</h2>
      <div v-if="quizzes.length === 0" class="text-gray-500">لا يوجد مسابقات مضافة بعد.</div>
      <div v-for="quiz in quizzes" :key="quiz._id" class="flex flex-col md:flex-row justify-between md:items-center p-4 border-b border-slate-700 last:border-0 hover:bg-slate-800/20 transition-colors gap-4">
        <div>
          <div class="font-bold text-lg">{{ quiz.name }}</div>
          <div class="text-sm text-gray-400">يوم: {{ quiz.day }} | {{ new Date(quiz.createdAt).toLocaleDateString('ar-EG') }}</div>
        </div>
        <div class="flex gap-2 flex-wrap items-center">
          <div class="flex items-center gap-2 bg-slate-900/50 px-3 py-1 rounded-full border border-slate-700">
            <span class="text-xs text-gray-500">الرابط:</span>
            <button @click="copyRegLink(quiz._id)" class="text-ramadan-gold text-xs hover:underline">نسخ 🔗</button>
          </div>
          <button @click="toggleRegistration(quiz)" 
                  :class="['px-4 py-1 rounded-full text-sm transition-colors', quiz.registrationOpen ? 'bg-green-600/20 text-green-400 hover:bg-green-600/30' : 'bg-red-600/20 text-red-500 hover:bg-red-600/30']">
            {{ quiz.registrationOpen ? 'التسجيل مفتوح ✅' : 'التسجيل مغلق 🔒' }}
          </button>
          <router-link :to="'/quiz/' + quiz._id" class="bg-indigo-600/20 text-indigo-400 px-4 py-1 rounded-full text-sm">بدء</router-link>
          <button @click="manageParticipants(quiz)" class="bg-indigo-600/20 text-indigo-400 px-4 py-1 rounded-full text-sm">تحديد المشاركين</button>
          <button @click="resetQuiz(quiz._id)" class="bg-red-900/40 text-red-300 px-4 py-1 rounded-full text-sm border border-red-500/20">تصفير النتائج 🔄</button>
          <button @click="editQuiz(quiz)" class="bg-orange-600/20 text-orange-400 px-4 py-1 rounded-full text-sm">تعديل</button>
          <button @click="deleteQuiz(quiz._id)" class="bg-red-600/20 text-red-400 px-4 py-1 rounded-full text-sm">حذف</button>
        </div>
      </div>
    </div>

    <!-- Participants Selection Modal -->
    <div v-if="showingParticipants" class="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div class="bg-slate-900 w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl border border-ramadan-gold/30 p-8">
        <div class="flex justify-between items-center mb-8">
          <h2 class="text-2xl font-amiri gold-text">تحديد المشاركين: {{ selectedQuiz?.name }}</h2>
          <button @click="showingParticipants = false" class="text-gray-400 hover:text-white">❌ إغلاق</button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <!-- Team A Selection -->
          <div class="glass-panel p-6 border-blue-500/20">
            <h3 class="font-bold mb-4 text-blue-400 flex justify-between">
              {{ selectedQuiz?.participations.teamA.teamId?.name || 'فريق أ' }}
              <span>({{ selectedQuiz?.participations.teamA.activeContestants.length || 0 }} / 10)</span>
            </h3>
            <div class="space-y-2 max-h-60 overflow-y-auto pr-2">
              <label v-for="c in teamAMembers" :key="c._id" class="flex items-center gap-3 p-2 bg-slate-800/50 rounded hover:bg-slate-800 transition-colors cursor-pointer">
                <input type="checkbox" :value="c._id" v-model="selectedQuiz.participations.teamA.activeContestants" class="w-4 h-4 accent-blue-500" />
                <span class="flex-1">{{ c.name }}</span>
                <span class="text-xs text-gray-500">{{ c.age }} سنة</span>
              </label>
            </div>
          </div>

          <!-- Team B Selection -->
          <div class="glass-panel p-6 border-green-500/20">
            <h3 class="font-bold mb-4 text-green-400 flex justify-between">
              {{ selectedQuiz?.participations.teamB.teamId?.name || 'فريق ب' }}
              <span>({{ selectedQuiz?.participations.teamB.activeContestants.length || 0 }} / 10)</span>
            </h3>
            <div class="space-y-2 max-h-60 overflow-y-auto pr-2">
              <label v-for="c in teamBMembers" :key="c._id" class="flex items-center gap-3 p-2 bg-slate-800/50 rounded hover:bg-slate-800 transition-colors cursor-pointer">
                <input type="checkbox" :value="c._id" v-model="selectedQuiz.participations.teamB.activeContestants" class="w-4 h-4 accent-green-500" />
                <span class="flex-1">{{ c.name }}</span>
                <span class="text-xs text-gray-500">{{ c.age }} سنة</span>
              </label>
            </div>
          </div>
        </div>

        <div class="mt-8 flex justify-center">
          <button @click="saveParticipatingActive" :disabled="loading" class="bg-ramadan-gold text-ramadan-blue font-bold px-10 py-3 rounded-xl gold-glow">
            حفظ المتسابقين المشاركين
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const quizzes = ref([])
const allTeams = ref([])
const loading = ref(false)
const isEditing = ref(false)
const currentEditId = ref(null)

const showingParticipants = ref(false)
const selectedQuiz = ref(null)
const teamAMembers = ref([])
const teamBMembers = ref([])

const newQuiz = ref({
  name: '',
  day: 1,
  questions: [],
  participations: {
    teamA: { teamId: null, score: 0, activeContestants: [] },
    teamB: { teamId: null, score: 0, activeContestants: [] }
  }
})

const fetchQuizzes = async () => {
  try {
    const res = await axios.get('/api/quizzes')
    quizzes.value = res.data
  } catch (e) { console.error(e) }
}

const fetchAllTeams = async () => {
  try {
    const res = await axios.get('/api/teams')
    allTeams.value = res.data
  } catch (e) { console.error(e) }
}

const addQuestion = () => {
  if (newQuiz.value.questions.length < 20) {
    newQuiz.value.questions.push({ text: '', options: ['', '', '', ''], correctAnswer: '' })
  }
}

const removeQuestion = (idx) => newQuiz.value.questions.splice(idx, 1)

const saveQuiz = async () => {
  if (!newQuiz.value.name || !newQuiz.value.participations.teamA.teamId || !newQuiz.value.participations.teamB.teamId) {
    alert('يرجى اختيار اسم المسابقة والفريقين المتنافسين')
    return
  }
  loading.value = true
  try {
    if (isEditing.value) {
      await axios.put(`/api/quizzes/${currentEditId.value}`, newQuiz.value)
      alert('تم التحديث!')
    } else {
      await axios.post('/api/quizzes', newQuiz.value)
      alert('تم الحفظ ونشر المسابقة!')
    }
    cancelEdit()
    fetchQuizzes()
  } catch (e) {
    alert('فشل الحفظ')
  } finally {
    loading.value = false
  }
}

const editQuiz = async (quiz) => {
  loading.value = true
  try {
    const res = await axios.get(`/api/quizzes/${quiz._id}`)
    newQuiz.value = res.data
    
    // Convert populated objects to IDs for v-model compatibility
    if (newQuiz.value.participations) {
      if (newQuiz.value.participations.teamA.teamId?._id) {
        newQuiz.value.participations.teamA.teamId = newQuiz.value.participations.teamA.teamId._id
      }
      if (newQuiz.value.participations.teamB.teamId?._id) {
        newQuiz.value.participations.teamB.teamId = newQuiz.value.participations.teamB.teamId._id
      }
      newQuiz.value.participations.teamA.activeContestants = newQuiz.value.participations.teamA.activeContestants.map(c => c._id || c)
      newQuiz.value.participations.teamB.activeContestants = newQuiz.value.participations.teamB.activeContestants.map(c => c._id || c)
    } else {
      newQuiz.value.participations = {
        teamA: { teamId: null, score: 0, activeContestants: [] },
        teamB: { teamId: null, score: 0, activeContestants: [] }
      }
    }
    isEditing.value = true
    currentEditId.value = quiz._id
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } catch (e) { console.error(e) }
  finally { loading.value = false }
}

const cancelEdit = () => {
  isEditing.value = false
  currentEditId.value = null
  newQuiz.value = {
    name: '', day: 1, questions: [],
    participations: {
      teamA: { teamId: null, score: 0, activeContestants: [] },
      teamB: { teamId: null, score: 0, activeContestants: [] }
    }
  }
}

const deleteQuiz = async (id) => {
  if (!confirm('حذف المسابقة؟')) return
  await axios.delete(`/api/quizzes/${id}`)
  fetchQuizzes()
}

const resetQuiz = async (id) => {
  if (!confirm('هل أنت متأكد من تصفير نتائج هذه المسابقة؟ لا يمكن التراجع عن هذا الإجراء.')) return
  try {
    await axios.post(`/api/quizzes/${id}/reset`)
    alert('تم تصفير النتائج وإعادة ضبط التقدم بنجاح')
    fetchQuizzes()
  } catch (e) {
    alert('فشل تصفير النتائج')
  }
}

const toggleRegistration = async (quiz) => {
  try {
    await axios.put(`/api/quizzes/${quiz._id}`, {
      registrationOpen: !quiz.registrationOpen
    })
    fetchQuizzes()
  } catch (e) {
    alert('فشل تحديث حالة التسجيل')
  }
}

const copyRegLink = (quizId) => {
  const url = `${window.location.origin}/register/${quizId}`
  navigator.clipboard.writeText(url)
  alert('تم نسخ رابط التسجيل لهذه المسابقة بنجاح!')
}

const manageParticipants = async (quiz) => {
  try {
    const res = await axios.get(`/api/quizzes/${quiz._id}`)
    selectedQuiz.value = res.data
    
    // Fetch members for both selected teams
    const [resA, resB] = await Promise.all([
      axios.get(`/api/contestants/team/${selectedQuiz.value.participations.teamA.teamId._id}`),
      axios.get(`/api/contestants/team/${selectedQuiz.value.participations.teamB.teamId._id}`)
    ])
    teamAMembers.value = resA.data
    teamBMembers.value = resB.data
    
    // Map IDs of current active contestants
    selectedQuiz.value.participations.teamA.activeContestants = selectedQuiz.value.participations.teamA.activeContestants.map(c => c._id || c)
    selectedQuiz.value.participations.teamB.activeContestants = selectedQuiz.value.participations.teamB.activeContestants.map(c => c._id || c)

    showingParticipants.value = true
  } catch (e) {
    alert('يرجى التأكد من اختيار الفرق للمسابقة أولاً')
  }
}

const saveParticipatingActive = async () => {
  if (selectedQuiz.value.participations.teamA.activeContestants.length > 10 || 
      selectedQuiz.value.participations.teamB.activeContestants.length > 10) {
    alert('لا يمكن اختيار أكثر من 10 متسابقين لكل فريق')
    return
  }
  loading.value = true
  try {
    await axios.put(`/api/quizzes/${selectedQuiz.value._id}`, {
      participations: selectedQuiz.value.participations
    })
    alert('تم حفظ المشاركين بنجاح!')
    showingParticipants.value = false
    fetchQuizzes()
  } catch (e) {
    alert('فشل الحفظ')
  } finally {
    loading.value = false
  }
}

const handleLogout = () => {
  localStorage.removeItem('adminToken')
  delete axios.defaults.headers.common['Authorization']
  router.push('/login')
}

onMounted(() => {
  fetchQuizzes()
  fetchAllTeams()
})
</script>
