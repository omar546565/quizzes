<template>
  <div class="min-h-screen p-4 flex flex-col items-center justify-start bg-slate-950 text-white relative">
    
    <!-- Top Bar: Scores -->
    <div class="w-full max-w-6xl flex justify-between items-center mb-8 gap-4">
      <div class="flex-1 glass-panel p-4 text-center border-l-4 border-l-blue-500">
        <div class="text-sm text-blue-400">{{ quiz?.participations?.teamA?.teamId?.name || 'الفريق أ' }}</div>
        <div class="text-4xl font-bold font-amiri">{{ quiz?.participations?.teamA?.score || 0 }}</div>
      </div>
      <div class="flex flex-col items-center">
        <div class="text-ramadan-gold text-2xl font-bold mb-1">VS</div>
        <div class="text-xs text-gray-500">{{ quiz?.name }}</div>
      </div>
      <div class="flex-1 glass-panel p-4 text-center border-r-4 border-r-green-500">
        <div class="text-sm text-green-400">{{ quiz?.participations?.teamB?.teamId?.name || 'الفريق ب' }}</div>
        <div class="text-4xl font-bold font-amiri">{{ quiz?.participations?.teamB?.score || 0 }}</div>
      </div>
    </div>

    <!-- Main Game Area -->
    <div class="w-full max-w-4xl flex-1 flex flex-col items-center justify-center gap-8">
      
      <!-- Current Status: Waiting for Teams, or Question Active -->
      <div v-if="!teamsReady" class="text-center p-12 glass-panel gold-glow">
        <div class="text-6xl mb-4 animate-spin">⏳</div>
        <h2 class="text-2xl gold-text">بانتظار اختيار المتسابقين (10 لكل فريق)</h2>
        <p class="text-gray-400 mt-2">يجب على المسئول اختيار 10 متسابقين مشاركين لكل فريق من لوحة التحكم...</p>
        <div class="mt-4 flex justify-center gap-8">
          <div :class="quiz?.participations?.teamA?.activeContestants?.length === 10 ? 'text-green-400' : 'text-red-400'">
            الفريق أ: {{ quiz?.participations?.teamA?.activeContestants?.length || 0 }} / 10
          </div>
          <div :class="quiz?.participations?.teamB?.activeContestants?.length === 10 ? 'text-green-400' : 'text-red-400'">
            الفريق ب: {{ quiz?.participations?.teamB?.activeContestants?.length || 0 }} / 10
          </div>
        </div>
      </div>

      <template v-else-if="currentQuestion">
        <!-- Question Panel -->
        <div id="question-card" class="w-full glass-panel p-10 relative overflow-hidden">
          
          <!-- Timer -->
          <div class="absolute top-0 right-0 h-1 bg-ramadan-gold transition-all duration-1000" :style="{ width: (timeLeft / 180 * 100) + '%' }"></div>

          <div class="flex justify-between items-start mb-6">
            <div class="px-4 py-1 bg-ramadan-gold/10 text-ramadan-gold rounded-full text-sm border border-ramadan-gold/20">
              سؤال رقم {{ questionIndex + 1 }}
            </div>
            <div class="text-2xl font-bold" :class="timeLeft < 30 ? 'text-red-500 animate-pulse' : 'text-gray-300'">
              {{ formatTime(timeLeft) }}
            </div>
          </div>

          <h1 class="text-3xl md:text-4xl font-amiri text-center mb-10 leading-relaxed">
            {{ currentQuestion.text }}
          </h1>

          <!-- Randomized Contestant -->
          <div v-if="selectedContestant" id="contestant-tag" class="flex flex-col items-center mb-8">
            <div class="text-gray-400 mb-2">المتسابق المختار من فريق ({{ currentTeamName }})</div>
            <div class="text-3xl font-bold gold-text p-4 border-2 border-ramadan-gold rounded-2xl gold-glow bg-ramadan-gold/5 text-center px-8">
              {{ selectedContestant.name }}
            </div>
          </div>

          <!-- Options -->
          <div v-if="showingOptions || waitingForNext" class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 animate-fade-in">
            <button 
              v-for="(opt, idx) in currentQuestion.options" 
              :key="idx"
              @click="!waitingForNext && checkAnswer(opt)"
              :disabled="waitingForNext"
              :class="[
                'p-4 border rounded-xl transition-all text-right relative overflow-hidden',
                waitingForNext && opt === currentQuestion.correctAnswer ? 'bg-green-600/30 border-green-500 gold-glow' : 
                waitingForNext && selectedAnswer === opt && opt !== currentQuestion.correctAnswer ? 'bg-red-600/30 border-red-500' :
                'bg-slate-800 hover:bg-slate-700 border-slate-700'
              ]"
            >
              <span class="text-ramadan-gold ml-2">({{ String.fromCharCode(65 + idx) }})</span> {{ opt }}
              <div v-if="waitingForNext && opt === currentQuestion.correctAnswer" class="absolute left-4 top-1/2 -translate-y-1/2 text-green-400">✔️</div>
            </button>
          </div>

          <!-- Next Button -->
          <div v-if="waitingForNext" class="flex justify-center mt-10 animate-fade-in">
            <button @click="nextRound" class="bg-ramadan-gold text-ramadan-blue px-12 py-4 rounded-2xl font-bold text-xl gold-glow transform hover:scale-105 transition-all flex items-center gap-3">
               السؤال التالي
               <span class="text-2xl">←</span>
            </button>
          </div>

          <!-- Logic Controls -->
          <div v-if="!showingOptions && !waitingForNext" class="flex justify-center gap-4 mt-8">
            <button @click="answerCorrect(true)" class="bg-green-600 hover:bg-green-500 px-8 py-3 rounded-xl font-bold transform hover:scale-105 transition-all">إجابة صحيحة (10 نقاط)</button>
            <button @click="showOptions" class="bg-red-600 hover:bg-red-500 px-8 py-3 rounded-xl font-bold transform hover:scale-105 transition-all">إجابة خاطئة (6 خيارات)</button>
          </div>
        </div>
      </template>

      <!-- Results Screen -->
      <div v-else-if="finished" class="text-center glass-panel p-12 gold-glow max-w-xl">
        <div class="text-7xl mb-6">🏆</div>
        <h2 class="text-4xl gold-text mb-4">انتهت المسابقة!</h2>
        <div class="text-2xl font-bold mb-8">
          الفائز: 
          <span :class="winner === 'teamA' ? 'text-blue-400' : 'text-green-400'">
            {{ winner === 'teamA' ? quiz?.participations?.teamA?.teamId?.name : quiz?.participations?.teamB?.teamId?.name }}
          </span>
        </div>
        <div class="flex justify-around mb-8">
          <div>
            <div class="text-gray-400">{{ quiz?.participations?.teamA?.teamId?.name }}</div>
            <div class="text-3xl">{{ quiz?.participations?.teamA?.score }}</div>
          </div>
          <div>
            <div class="text-gray-400">{{ quiz?.participations?.teamB?.teamId?.name }}</div>
            <div class="text-3xl">{{ quiz?.participations?.teamB?.score }}</div>
          </div>
        </div>
        <button @click="$router.push('/')" class="bg-ramadan-gold text-ramadan-blue px-8 py-3 rounded-xl font-bold">العودة للرئيسية</button>
      </div>

    </div>

    <!-- Overlay Effects -->
    <div v-if="showCorrectOverlay" class="fixed inset-0 flex items-center justify-center bg-green-500/20 backdrop-blur-sm z-50 pointer-events-none">
      <div class="text-9xl text-green-500 animate-bounce">✅</div>
    </div>
    <div v-if="showWrongOverlay" class="fixed inset-0 flex items-center justify-center bg-red-500/20 backdrop-blur-sm z-50 pointer-events-none">
      <div class="text-9xl text-red-500 animate-shake">❌</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import gsap from 'gsap'
import confetti from 'canvas-confetti'

const route = useRoute()
const quiz = ref(null)
const teamsReady = ref(false)
const finished = ref(false)

const questionIndex = ref(0)
const timeLeft = ref(180)
const timer = ref(null)
const selectedContestant = ref(null)
const currentTeamType = ref('teamA') // 'teamA' or 'teamB'
const showingOptions = ref(false)
const waitingForNext = ref(false)
const selectedAnswer = ref(null)

const showCorrectOverlay = ref(false)
const showWrongOverlay = ref(false)

const currentQuestion = computed(() => {
  if (!quiz.value) return null
  return quiz.value.questions[questionIndex.value]
})

const currentTeamName = computed(() => {
    if (!quiz.value) return ''
    return quiz.value.participations[currentTeamType.value]?.teamId?.name
})

const winner = computed(() => {
  if (!quiz.value) return ''
  const p = quiz.value.participations
  return p.teamA.score >= p.teamB.score ? 'teamA' : 'teamB'
})

const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

const fetchData = async () => {
  try {
    const quizId = route.params.quizId
    const res = await axios.get(`/api/quizzes/${quizId}`)
    quiz.value = res.data
    
    // Resume progress
    questionIndex.value = quiz.value.currentQuestionIndex || 0
    currentTeamType.value = quiz.value.currentTeamType || 'teamA'

    const p = quiz.value.participations
    if (p.teamA.activeContestants.length === 10 && p.teamB.activeContestants.length === 10) {
      if (!teamsReady.value) {
        teamsReady.value = true
        startRound()
      }
    } else {
      setTimeout(fetchData, 3000)
    }
  } catch (e) { console.error(e) }
}

const startRound = () => {
  if (questionIndex.value >= quiz.value.questions.length) {
    finished.value = true
    triggerConfetti()
    return
  }

  // Pick random contestant from active pool of current team
  const pool = quiz.value.participations[currentTeamType.value].activeContestants
  selectedContestant.value = pool[Math.floor(Math.random() * pool.length)]

  gsap.from('#contestant-tag', { scale: 0, opacity: 0, duration: 1, ease: 'back.out' })
  gsap.from('#question-card', { y: 50, opacity: 0, duration: 0.8 })

  timeLeft.value = 180
  showingOptions.value = false
  if (timer.value) clearInterval(timer.value)
  timer.value = setInterval(() => {
    if (timeLeft.value > 0) timeLeft.value--
    else clearInterval(timer.value)
  }, 1000)
}

const answerCorrect = async (direct) => {
  const points = direct ? 10 : 5
  clearInterval(timer.value)
  
  showCorrectOverlay.value = true
  confetti()
  setTimeout(() => showCorrectOverlay.value = false, 2000)

  const nextIndex = questionIndex.value + 1
  const nextTeam = currentTeamType.value === 'teamA' ? 'teamB' : 'teamA'

  try {
    const res = await axios.post('/api/quizzes/score', { 
        quizId: quiz.value._id, 
        teamType: currentTeamType.value, 
        points,
        currentQuestionIndex: nextIndex,
        currentTeamType: nextTeam
    })
    quiz.value = res.data
  } catch (e) { console.error(e) }

  waitingForNext.value = true
}

const showOptions = () => showingOptions.value = true

const checkAnswer = (answer) => {
  selectedAnswer.value = answer
  if (answer === currentQuestion.value.correctAnswer) answerCorrect(false)
  else answerWrong()
}

const answerWrong = async () => {
  clearInterval(timer.value)
  showWrongOverlay.value = true
  setTimeout(() => showWrongOverlay.value = false, 2000)
  
  const nextIndex = questionIndex.value + 1
  const nextTeam = currentTeamType.value === 'teamA' ? 'teamB' : 'teamA'

  try {
    const res = await axios.post('/api/quizzes/score', { 
        quizId: quiz.value._id, 
        currentQuestionIndex: nextIndex,
        currentTeamType: nextTeam
    })
    quiz.value = res.data
  } catch (e) { console.error(e) }

  waitingForNext.value = true
}

const nextRound = () => {
  questionIndex.value = quiz.value.currentQuestionIndex
  currentTeamType.value = quiz.value.currentTeamType
  waitingForNext.value = false
  selectedAnswer.value = null
  
  startRound()
}

const triggerConfetti = () => {
  confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } })
}

onMounted(fetchData)
onUnmounted(() => clearInterval(timer.value))
</script>

<style scoped>
.animate-fade-in { animation: fadeIn 0.5s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  75% { transform: translateX(10px); }
}
.animate-shake { animation: shake 0.2s ease-in-out infinite; }
</style>
