<template>
  <div class="p-6 max-w-5xl mx-auto">
    <div class="flex justify-between items-center mb-6">
      <div class="flex gap-4 items-center">
        <router-link to="/" class="text-ramadan-gold hover:underline">← الرئيسية</router-link>
        <router-link to="/teams" class="bg-indigo-600/20 text-indigo-400 px-4 py-2 rounded-lg border border-indigo-500/30 font-bold">📂 إدارة الفرق</router-link>
        <button @click="handleLogout" class="text-red-400 hover:text-red-300 transition-colors mr-2">تسجيل الخروج 🚪</button>
      </div>
      <h1 class="text-3xl font-amiri gold-text">إدارة النظام</h1>
    </div>

    <!-- Admin Tabs -->
    <div class="flex gap-4 mb-8 border-b border-slate-700">
      <button 
        @click="activeTab = 'quizzes'" 
        :class="['pb-4 px-6 font-bold transition-all', activeTab === 'quizzes' ? 'border-b-2 border-ramadan-gold text-ramadan-gold' : 'text-gray-500 hover:text-gray-300']"
      >
        المسابقات النشطة
      </button>
      <button 
        @click="activeTab = 'info_bank'" 
        :class="['pb-4 px-6 font-bold transition-all', activeTab === 'info_bank' ? 'border-b-2 border-ramadan-gold text-ramadan-gold' : 'text-gray-500 hover:text-gray-300']"
      >
        بنك المعلومات
      </button>
      <button 
        @click="activeTab = 'backup'" 
        :class="['pb-4 px-6 font-bold transition-all', activeTab === 'backup' ? 'border-b-2 border-ramadan-gold text-ramadan-gold' : 'text-gray-500 hover:text-gray-300']"
      >
        النسخ الاحتياطي
      </button>
    </div>

    <div v-if="activeTab === 'quizzes'">
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
            <h3 class="font-bold mb-4 flex justify-between items-center text-sm md:text-base">
              الأسئلة ({{ newQuiz.questions.length }}/20)
              <div class="flex gap-2">
                <button @click="showInfoBankPicker = true" class="bg-indigo-600 text-white px-4 py-1 rounded-full text-xs md:text-sm font-bold">جلب من بنك المعلومات</button>
                <button @click="addQuestion" class="bg-ramadan-gold text-ramadan-blue px-4 py-1 rounded-full text-xs md:text-sm font-bold">إضافة سؤال يدوي</button>
              </div>
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
            <button @click="resetResults(quiz._id)" class="bg-red-900/40 text-red-300 px-4 py-1 rounded-full text-sm border border-red-500/20">تصفير النتائج 🔄</button>
            <button @click="editQuiz(quiz)" class="bg-orange-600/20 text-orange-400 px-4 py-1 rounded-full text-sm">تعديل</button>
            <button @click="deleteQuiz(quiz._id)" class="bg-red-600/20 text-red-400 px-4 py-1 rounded-full text-sm">حذف</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Info Bank Tab -->
    <div v-else-if="activeTab === 'info_bank'">
      <!-- Categories Management -->
      <div v-if="!selectedAdminCategory" class="glass-panel p-8 mb-8">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-bold">إدارة الأقسام (بنك المعلومات)</h2>
          <button @click="showAddCategory = true" class="bg-ramadan-gold text-black px-4 py-1 rounded-full text-sm font-bold">إضافة قسم</button>
        </div>
        
        <div v-if="showAddCategory" class="bg-slate-800 p-4 rounded-lg mb-6 border border-ramadan-gold/30">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <input v-model="categoryForm.name" type="text" placeholder="اسم القسم" class="w-full bg-slate-900 p-2 rounded text-sm outline-none" />
            <input v-model="categoryForm.icon" type="text" placeholder="أيقونة (Emoji)" class="w-full bg-slate-900 p-2 rounded text-sm outline-none" />
            <input v-model="categoryForm.color" type="color" class="w-full bg-slate-900 p-1 rounded h-10 outline-none" />
          </div>
          <div class="flex gap-2">
            <button @click="saveCategory" class="bg-green-600 text-white px-4 py-1 rounded text-sm">حفظ</button>
            <button @click="showAddCategory = false; resetCategoryForm()" class="bg-slate-700 text-white px-4 py-1 rounded text-sm">إلغاء</button>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div v-for="cat in infoCategories" :key="cat._id" class="p-4 bg-slate-800/50 rounded-lg flex items-center justify-between border border-white/5">
            <div @click="selectAdminCategory(cat)" class="flex items-center gap-4 cursor-pointer hover:text-ramadan-gold transition-colors">
              <span class="text-2xl">{{ cat.icon }}</span>
              <span class="font-bold">{{ cat.name }}</span>
            </div>
            <div class="flex gap-2">
              <button @click="editCategory(cat)" class="text-orange-400 text-xs">تعديل</button>
              <button @click="deleteCategory(cat._id)" class="text-red-400 text-xs">حذف</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Models Management -->
      <div v-else-if="selectedAdminCategory && !selectedAdminModel" class="glass-panel p-8 mb-8">
        <div class="flex justify-between items-center mb-6">
          <div class="flex items-center gap-4">
            <button @click="selectedAdminCategory = null" class="text-gray-400 hover:text-white">← عودة</button>
            <h2 class="text-xl font-bold">نماذج: {{ selectedAdminCategory.name }}</h2>
          </div>
          <button @click="showAddModel = true" class="bg-ramadan-gold text-black px-4 py-1 rounded-full text-sm font-bold">إضافة نموذج</button>
        </div>

        <div v-if="showAddModel" class="bg-slate-800 p-4 rounded-lg mb-6 border border-ramadan-gold/30">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input v-model="modelForm.name" type="text" placeholder="اسم النموذج (مثلاً: النموذج الأول)" class="w-full bg-slate-900 p-2 rounded text-sm outline-none" />
            <input v-model="modelForm.order" type="number" placeholder="الترتيب" class="w-full bg-slate-900 p-2 rounded text-sm outline-none" />
          </div>
          <div class="flex gap-2">
            <button @click="saveModel" class="bg-green-600 text-white px-4 py-1 rounded text-sm">حفظ</button>
            <button @click="showAddModel = false; resetModelForm()" class="bg-slate-700 text-white px-4 py-1 rounded text-sm">إلغاء</button>
          </div>
        </div>

        <div class="space-y-2">
          <div v-for="model in infoModels" :key="model._id" class="p-4 bg-slate-800/50 rounded-lg flex items-center justify-between border border-white/5">
            <div @click="selectAdminModel(model)" class="flex items-center gap-4 cursor-pointer hover:text-ramadan-gold transition-colors">
              <span class="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center font-bold text-xs">{{ model.order }}</span>
              <span class="font-bold">{{ model.name }}</span>
            </div>
            <div class="flex gap-2">
              <button @click="editModel(model)" class="text-orange-400 text-xs">تعديل</button>
              <button @click="deleteModel(model._id)" class="text-red-400 text-xs">حذف</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Questions Management -->
      <div v-else-if="selectedAdminModel" class="glass-panel p-8 mb-8">
        <div class="flex justify-between items-center mb-6">
          <div class="flex items-center gap-4">
            <button @click="selectedAdminModel = null" class="text-gray-400 hover:text-white">← عودة</button>
            <h2 class="text-xl font-bold">أسئلة: {{ selectedAdminModel.name }}</h2>
          </div>
          <button @click="showAddQuestion = true" class="bg-ramadan-gold text-black px-4 py-1 rounded-full text-sm font-bold">إضافة سؤال</button>
        </div>

        <div v-if="showAddQuestion" class="bg-slate-800 p-4 rounded-lg mb-8 border border-ramadan-gold/30">
          <div class="space-y-4">
            <input v-model="questionForm.text" type="text" placeholder="نص السؤال" class="w-full bg-slate-900 p-3 rounded-lg text-sm outline-none" />
            <div class="grid grid-cols-2 gap-4">
              <input v-for="(_, i) in 4" :key="i" v-model="questionForm.options[i]" type="text" :placeholder="'خیار ' + (i+1)" class="w-full bg-slate-900 p-2 rounded text-sm outline-none" />
            </div>
            <input v-model="questionForm.correctAnswer" type="text" placeholder="الإجابة الصحيحة (يجب أن تطابق أحد الخيارات)" class="w-full bg-ramadan-gold/10 p-2 rounded text-sm outline-none border border-ramadan-gold/20" />
            <textarea v-model="questionForm.explanation" placeholder="شرح بسيط للإجابة" class="w-full bg-slate-900 p-3 rounded-lg text-sm outline-none h-20"></textarea>
            <div class="flex gap-2">
              <button @click="saveQuestion" class="bg-green-600 text-white px-6 py-2 rounded-lg text-sm font-bold font-bold">حفظ السؤال</button>
              <button @click="showAddQuestion = false; resetQuestionForm()" class="bg-slate-700 text-white px-6 py-2 rounded-lg text-sm font-bold">إلغاء</button>
            </div>
          </div>
        </div>

        <div class="space-y-4">
          <div v-for="(q, idx) in infoQuestions" :key="q._id" class="p-4 bg-slate-800/50 rounded-lg border border-white/5">
            <div class="flex justify-between items-start mb-4">
              <div class="font-bold leading-relaxed">{{ idx + 1 }}. {{ q.text }}</div>
              <div class="flex gap-3">
                <button @click="editQuestion(q)" class="text-orange-400 text-xs">تعديل</button>
                <button @click="deleteQuestion(q._id)" class="text-red-400 text-xs">حذف</button>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-2 mb-2">
              <div v-for="opt in q.options" :key="opt" :class="['p-2 rounded text-xs', opt === q.correctAnswer ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-slate-900 text-gray-400']">
                {{ opt }}
              </div>
            </div>
            <div v-if="q.explanation" class="text-xs text-gray-500 italic mt-2">شرح: {{ q.explanation }}</div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Backup Tab -->
    <div v-else-if="activeTab === 'backup'">
      <div class="glass-panel p-8 text-center">
        <div class="text-6xl mb-6">💾</div>
        <h2 class="text-2xl font-bold mb-4">إدارة النسخ الاحتياطي</h2>
        <p class="text-gray-400 mb-8 max-w-lg mx-auto">
          يمكنك تحميل نسخة كاملة من جميع بيانات النظام (الفرق، المتسابقين، المسابقات، وبنك المعلومات) واستعادتها في أي وقت.
        </p>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <!-- Export -->
          <div class="p-8 bg-slate-800/50 rounded-2xl border border-ramadan-gold/20 flex flex-col items-center">
            <h3 class="font-bold mb-4">تصدير البيانات</h3>
            <button 
              @click="downloadBackup" 
              :disabled="loading"
              class="w-full bg-ramadan-gold text-ramadan-blue font-bold py-3 rounded-xl hover:scale-105 transition-transform gold-glow disabled:opacity-50"
            >
              {{ loading ? 'جاري التحميل...' : 'تحميل نسخة احتياطية (JSON) 📥' }}
            </button>
          </div>

          <!-- Import -->
          <div class="p-8 bg-slate-800/50 rounded-2xl border border-red-500/20 flex flex-col items-center">
            <h3 class="font-bold mb-4 text-red-400">استعادة البيانات</h3>
            <input 
              type="file" 
              ref="backupFileInput" 
              class="hidden" 
              @change="handleRestore" 
              accept=".json"
            />
            <button 
              @click="$refs.backupFileInput.click()" 
              :disabled="loading"
              class="w-full bg-red-600/20 text-red-500 border border-red-600/30 font-bold py-3 rounded-xl hover:bg-red-600/30 transition-colors disabled:opacity-50"
            >
              {{ loading ? 'جاري الاستعادة...' : 'رفع واستعادة نسخة سابقة 📂' }}
            </button>
            <p class="text-[10px] text-red-400/50 mt-4">⚠️ تنبيه: سيتم مسح البيانات الحالية واستبدالها بالنسخة المرفوعة.</p>
          </div>
        </div>
      </div>
    </div>



    <!-- Info Bank Question Picker Modal -->
    <div v-if="showInfoBankPicker" class="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div class="bg-slate-900 w-full max-w-3xl max-h-[80vh] overflow-y-auto rounded-2xl border border-ramadan-gold/30 p-8">
        <div class="flex justify-between items-center mb-8">
          <h2 class="text-2xl font-amiri gold-text">جلب أسئلة من بنك المعلومات</h2>
          <button @click="showInfoBankPicker = false" class="text-gray-400 hover:text-white">❌</button>
        </div>

        <p class="text-sm text-gray-400 mb-6">اختر النماذج التي تريد سحب الأسئلة منها (سيتم جلب 20 سؤال بالتساوي):</p>

        <div class="space-y-6">
          <div v-for="cat in infoCategories" :key="cat._id">
            <h3 class="font-bold text-ramadan-gold mb-3 flex items-center gap-2">
              <span>{{ cat.icon }}</span> {{ cat.name }}
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
              <label 
                v-for="model in allInfoModels.filter(m => m.categoryId === cat._id)" 
                :key="model._id"
                class="flex items-center gap-3 p-3 bg-slate-800 rounded-lg hover:bg-slate-700 cursor-pointer transition-colors"
                :class="{ 'border border-ramadan-gold/50 bg-ramadan-gold/10': selectedPickerModels.includes(model._id) }"
              >
                <input type="checkbox" :value="model._id" v-model="selectedPickerModels" class="w-5 h-5 accent-ramadan-gold" />
                <span>{{ model.name }}</span>
              </label>
            </div>
          </div>
        </div>

        <div class="mt-8 flex justify-center">
          <button 
            @click="generateQuestionsFromBank"
            :disabled="selectedPickerModels.length === 0 || loading"
            class="bg-ramadan-gold text-ramadan-blue font-bold px-10 py-4 rounded-xl gold-glow disabled:opacity-50"
          >
            جلب 20 سؤال عشوائي
          </button>
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

const activeTab = ref('quizzes')

// --- Knowledge Bank State ---
const infoCategories = ref([])
const infoModels = ref([])
const infoQuestions = ref([])
const allInfoModels = ref([])

const selectedAdminCategory = ref(null)
const selectedAdminModel = ref(null)

const showAddCategory = ref(false)
const showAddModel = ref(false)
const showAddQuestion = ref(false)
const showInfoBankPicker = ref(false)
const selectedPickerModels = ref([])

const categoryForm = ref({ name: '', icon: '📚', color: '#D4AF37' })
const modelForm = ref({ name: '', order: 0, categoryId: null })
const questionForm = ref({ text: '', options: ['', '', '', ''], correctAnswer: '', explanation: '', modelId: null })

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

const fetchInfoCategories = async () => {
  try {
    const res = await axios.get('/api/info/categories')
    infoCategories.value = res.data
  } catch (e) { console.error(e) }
}

const fetchAllInfoModels = async () => {
  try {
    const res = await Promise.all(infoCategories.value.map(c => axios.get(`/api/info/models/${c._id}`)))
    allInfoModels.value = res.flatMap(r => r.data)
  } catch (e) { console.error(e) }
}

const selectAdminCategory = async (cat) => {
  selectedAdminCategory.value = cat
  try {
    const res = await axios.get(`/api/info/models/${cat._id}`)
    infoModels.value = res.data
  } catch (e) { console.error(e) }
}

const selectAdminModel = async (model) => {
  selectedAdminModel.value = model
  try {
    const res = await axios.get(`/api/info/questions/${model._id}`)
    infoQuestions.value = res.data
  } catch (e) { console.error(e) }
}

// Quiz Methods
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
    if (newQuiz.value.participations) {
      if (newQuiz.value.participations.teamA.teamId?._id) newQuiz.value.participations.teamA.teamId = newQuiz.value.participations.teamA.teamId._id
      if (newQuiz.value.participations.teamB.teamId?._id) newQuiz.value.participations.teamB.teamId = newQuiz.value.participations.teamB.teamId._id
      newQuiz.value.participations.teamA.activeContestants = newQuiz.value.participations.teamA.activeContestants.map(c => c._id || c)
      newQuiz.value.participations.teamB.activeContestants = newQuiz.value.participations.teamB.activeContestants.map(c => c._id || c)
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

const resetResults = async (id) => {
  if (!confirm('هل أنت متأكد من تصفير نتائج هذه المسابقة؟')) return
  try {
    await axios.post(`/api/quizzes/${id}/reset`)
    alert('تم تصفير النتائج بنجاح')
    fetchQuizzes()
  } catch (e) { alert('فشل تصفير النتائج') }
}

const toggleRegistration = async (quiz) => {
  try {
    await axios.put(`/api/quizzes/${quiz._id}`, { registrationOpen: !quiz.registrationOpen })
    fetchQuizzes()
  } catch (e) { alert('فشل تحديث حالة التسجيل') }
}

const copyRegLink = (quizId) => {
  const url = `${window.location.origin}/register/${quizId}`
  navigator.clipboard.writeText(url)
  alert('تم نسخ الرابط!')
}

const manageParticipants = async (quiz) => {
  try {
    const res = await axios.get(`/api/quizzes/${quiz._id}`)
    selectedQuiz.value = res.data
    const [resA, resB] = await Promise.all([
      axios.get(`/api/contestants/team/${selectedQuiz.value.participations.teamA.teamId._id}`),
      axios.get(`/api/contestants/team/${selectedQuiz.value.participations.teamB.teamId._id}`)
    ])
    teamAMembers.value = resA.data
    teamBMembers.value = resB.data
    selectedQuiz.value.participations.teamA.activeContestants = selectedQuiz.value.participations.teamA.activeContestants.map(c => c._id || c)
    selectedQuiz.value.participations.teamB.activeContestants = selectedQuiz.value.participations.teamB.activeContestants.map(c => c._id || c)
    showingParticipants.value = true
  } catch (e) { alert('خطأ في جلب البيانات') }
}

const saveParticipatingActive = async () => {
  loading.value = true
  try {
    await axios.put(`/api/quizzes/${selectedQuiz.value._id}`, { participations: selectedQuiz.value.participations })
    alert('تم الحفظ!')
    showingParticipants.value = false
    fetchQuizzes()
  } catch (e) { alert('فشل الحفظ') }
  finally { loading.value = false }
}

// Category CRUD
const saveCategory = async () => {
  try {
    if (categoryForm.value._id) await axios.put(`/api/info/categories/${categoryForm.value._id}`, categoryForm.value)
    else await axios.post('/api/info/categories', categoryForm.value)
    fetchInfoCategories()
    resetCategoryForm()
    showAddCategory.value = false
  } catch (e) { alert('فشل الحفظ') }
}

const editCategory = (cat) => {
  categoryForm.value = { ...cat }
  showAddCategory.value = true
}

const deleteCategory = async (id) => {
  if (confirm('حذف؟')) {
    await axios.delete(`/api/info/categories/${id}`)
    fetchInfoCategories()
  }
}

const resetCategoryForm = () => categoryForm.value = { name: '', icon: '📚', color: '#D4AF37' }

// Model CRUD
const saveModel = async () => {
  modelForm.value.categoryId = selectedAdminCategory.value._id
  try {
    if (modelForm.value._id) await axios.put(`/api/info/models/${modelForm.value._id}`, modelForm.value)
    else await axios.post('/api/info/models', modelForm.value)
    selectAdminCategory(selectedAdminCategory.value)
    resetModelForm()
    showAddModel.value = false
  } catch (e) { alert('فشل الحفظ') }
}

const editModel = (model) => {
  modelForm.value = { ...model }
  showAddModel.value = true
}

const deleteModel = async (id) => {
  if (confirm('حذف؟')) {
    await axios.delete(`/api/info/models/${id}`)
    selectAdminCategory(selectedAdminCategory.value)
  }
}

const resetModelForm = () => modelForm.value = { name: '', order: 0, categoryId: null }

// Question CRUD
const saveQuestion = async () => {
  questionForm.value.modelId = selectedAdminModel.value._id
  try {
    if (questionForm.value._id) await axios.put(`/api/info/questions/${questionForm.value._id}`, questionForm.value)
    else await axios.post('/api/info/questions', questionForm.value)
    selectAdminModel(selectedAdminModel.value)
    resetQuestionForm()
    showAddQuestion.value = false
  } catch (e) { alert('فشل الحفظ') }
}

const editQuestion = (q) => {
  questionForm.value = { ...q }
  showAddQuestion.value = true
}

const deleteQuestion = async (id) => {
  if (confirm('حذف؟')) {
    await axios.delete(`/api/info/questions/${id}`)
    selectAdminModel(selectedAdminModel.value)
  }
}

const resetQuestionForm = () => questionForm.value = { text: '', options: ['', '', '', ''], correctAnswer: '', explanation: '', modelId: null }

const generateQuestionsFromBank = async () => {
  loading.value = true
  try {
    const res = await axios.post('/api/info/generate-competition', { modelIds: selectedPickerModels.value })
    newQuiz.value.questions = res.data.map(q => ({ text: q.text, options: q.options, correctAnswer: q.correctAnswer }))
    showInfoBankPicker.value = false
    alert('تم الجلب!')
  } catch (e) { alert('فشل الجلب') }
  finally { loading.value = false }
}

const handleLogout = () => {
  localStorage.removeItem('adminToken')
  delete axios.defaults.headers.common['Authorization']
  router.push('/login')
}

// Backup & Restore
const downloadBackup = async () => {
  loading.value = true
  try {
    const res = await axios.get('/api/system/backup')
    const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `ramadan_backup_${new Date().toISOString().split('T')[0]}.json`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    alert('تم تحميل النسخة الاحتياطية بنجاح!')
  } catch (e) {
    alert('فشل في تصدير البيانات')
  } finally {
    loading.value = false
  }
}

const handleRestore = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  if (!confirm('سيتم حذف جميع البيانات الحالية واستبدالها بمحتوى الملف. هل أنت متأكد؟')) {
    event.target.value = ''
    return
  }

  const reader = new FileReader()
  reader.onload = async (e) => {
    try {
      const backupData = JSON.parse(e.target.result)
      loading.value = true
      await axios.post('/api/system/restore', { backupData })
      alert('تمت استعادة البيانات بنجاح!')
      window.location.reload() // Reload to refresh all data
    } catch (err) {
      alert('فشل في استعادة البيانات: تأكد من صحة الملف')
      console.error(err)
    } finally {
      loading.value = false
    }
  }
  reader.readAsText(file)
}

onMounted(() => {
  fetchQuizzes()
  fetchAllTeams()
  fetchInfoCategories().then(fetchAllInfoModels)
})
</script>
