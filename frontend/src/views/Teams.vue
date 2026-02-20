<template>
  <div class="p-6 max-w-5xl mx-auto">
    <div class="flex justify-between items-center mb-10">
      <div class="flex gap-4 items-center">
        <router-link to="/admin" class="text-ramadan-gold hover:underline">← الإدارة</router-link>
        <button @click="handleLogout" class="text-red-400 text-sm hover:text-red-300 transition-colors">تسجيل الخروج 🚪</button>
      </div>
      <h1 class="text-3xl font-amiri gold-text">إدارة الفرق والأعضاء</h1>
    </div>

    <!-- Team Form -->
    <div class="glass-panel p-8 mb-10">
      <h2 class="text-xl font-bold mb-6 flex items-center gap-2">
        <span class="text-ramadan-gold">{{ editingTeam ? '📝' : '➕' }}</span> 
        {{ editingTeam ? 'تعديل فريق' : 'إضافة فريق جديد' }}
      </h2>
      <div class="flex gap-4">
        <input v-model="teamForm.name" type="text" placeholder="اسم الفريق" class="flex-2 bg-slate-800 border border-slate-700 p-3 rounded-lg outline-none focus:border-ramadan-gold w-full" />
        <button @click="saveTeam" :disabled="loading" class="bg-ramadan-gold text-ramadan-blue font-bold px-8 rounded-lg gold-glow disabled:opacity-50">
          {{ loading ? '...' : (editingTeam ? 'تحديث' : 'إضافة') }}
        </button>
        <button v-if="editingTeam" @click="cancelEditTeam" class="bg-slate-700 px-4 rounded-lg">إلغاء</button>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <!-- Teams List -->
      <div class="md:col-span-1">
        <div class="glass-panel p-6">
          <h3 class="font-bold mb-4 border-b border-slate-700 pb-2">الفرق</h3>
          <div v-for="team in teams" :key="team._id" 
               @click="selectTeam(team)"
               :class="['p-4 rounded-xl mb-4 cursor-pointer transition-all border block', selectedTeam?._id === team._id ? 'bg-ramadan-gold/10 border-ramadan-gold/50 shadow-lg shadow-ramadan-gold/5' : 'bg-slate-800/40 border-slate-700 hover:border-slate-500']">
            <div class="flex justify-between items-center mb-2">
              <span class="font-bold text-lg">{{ team.name }}</span>
              <div class="flex gap-2">
                <button @click.stop="editTeam(team)" class="text-xs bg-slate-700 p-1.5 rounded hover:bg-slate-600">✏️</button>
                <button @click.stop="deleteTeam(team._id)" class="text-xs bg-slate-700 p-1.5 rounded hover:bg-slate-600">🗑️</button>
              </div>
            </div>
            <!-- Member Names Preview / Count -->
            <div class="text-xs text-gray-400 flex items-center gap-2">
              <span class="bg-slate-700/50 px-2 py-0.5 rounded-full text-ramadan-gold">{{ team.memberCount || 0 }} عضو</span>
              <span class="truncate opacity-60" v-if="team.membersNames">{{ team.membersNames }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Members List -->
      <div class="md:col-span-2">
        <div v-if="selectedTeam" class="glass-panel p-6">
          <div class="flex justify-between items-center mb-6">
            <h3 class="font-bold">أعضاء فريق: <span class="gold-text">{{ selectedTeam.name }}</span></h3>
            <div class="flex gap-2">
              <button @click="showAddMember = true" class="bg-ramadan-gold text-ramadan-blue text-xs font-bold px-3 py-1 rounded-full">إضافة عضو</button>
            </div>
          </div>

          <!-- Add Member Form -->
          <div v-if="showAddMember" class="bg-slate-800/50 p-4 rounded-xl mb-6 border border-slate-700">
            <div class="grid grid-cols-2 gap-4 mb-4">
              <input v-model="memberForm.name" type="text" placeholder="الاسم" class="bg-slate-900 border border-slate-700 p-2 rounded outline-none" />
              <input v-model="memberForm.age" type="number" placeholder="العمر" class="bg-slate-900 border border-slate-700 p-2 rounded outline-none" />
            </div>
            <div class="flex gap-2">
              <button @click="saveMember" class="bg-ramadan-gold text-ramadan-blue text-sm font-bold px-4 py-2 rounded-lg">حفظ</button>
              <button @click="showAddMember = false" class="text-sm">إلغاء</button>
            </div>
          </div>

          <div v-if="members.length === 0" class="text-center py-10 text-gray-500">لا يوجد أعضاء في هذا الفريق بعد.</div>
          <table v-else class="w-full text-right">
            <thead>
              <tr class="text-gray-500 text-sm border-b border-slate-800">
                <th class="pb-2">الاسم</th>
                <th class="pb-2">العمر</th>
                <th class="pb-2 text-left">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="m in members" :key="m._id" class="border-b border-slate-800/30 hover:bg-slate-800/20">
                <td class="py-3">{{ m.name }}</td>
                <td class="py-3">{{ m.age }}</td>
                <td class="py-3 text-left">
                  <button @click="deleteMember(m._id)" class="text-red-400 text-xs">حذف</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="glass-panel p-10 text-center text-gray-500 flex flex-col items-center justify-center h-full">
          <div class="text-4xl mb-4">👈</div>
          اختر فريقاً لعرض وإدارة أعضائه
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const teams = ref([])
const selectedTeam = ref(null)
const members = ref([])
const loading = ref(false)
const editingTeam = ref(null)
const showAddMember = ref(false)

const teamForm = ref({ name: '' })
const memberForm = ref({ name: '', age: null })

const fetchTeams = async () => {
  try {
    const res = await axios.get('/api/teams')
    // For each team, fetch members to show count and names in preview
    const teamsWithMembers = await Promise.all(res.data.map(async (team) => {
      const mRes = await axios.get(`/api/contestants/team/${team._id}`)
      return {
        ...team,
        memberCount: mRes.data.length,
        membersNames: mRes.data.map(m => m.name).slice(0, 3).join(', ') + (mRes.data.length > 3 ? '...' : '')
      }
    }))
    teams.value = teamsWithMembers
  } catch (e) { console.error(e) }
}

const selectTeam = async (team) => {
  selectedTeam.value = team
  showAddMember.value = false
  fetchMembers(team._id)
}

const fetchMembers = async (teamId) => {
  try {
    const res = await axios.get(`/api/contestants/team/${teamId}`)
    members.value = res.data
  } catch (e) { console.error(e) }
}

const saveTeam = async () => {
  if (!teamForm.value.name) return
  loading.value = true
  try {
    if (editingTeam.value) {
      await axios.put(`/api/teams/${editingTeam.value._id}`, teamForm.value)
    } else {
      await axios.post('/api/teams', teamForm.value)
    }
    teamForm.value.name = ''
    editingTeam.value = null
    fetchTeams()
  } catch (e) {
    alert('حدث خطأ أثناء حفظ الفريق')
  } finally {
    loading.value = false
  }
}

const editTeam = (team) => {
  editingTeam.value = team
  teamForm.value.name = team.name
}

const cancelEditTeam = () => {
  editingTeam.value = null
  teamForm.value.name = ''
}

const deleteTeam = async (id) => {
  if (!confirm('هل أنت متأكد من حذف الفريق بالكامل؟ سيؤدي ذلك أيضاً لحذف أعضائه.')) return
  try {
    await axios.delete(`/api/teams/${id}`)
    if (selectedTeam.value?._id === id) selectedTeam.value = null
    fetchTeams()
  } catch (e) { alert('فشل حذف الفريق') }
}

const saveMember = async () => {
  if (!memberForm.value.name || !memberForm.value.age) return
  try {
    await axios.post('/api/contestants/register', {
      ...memberForm.value,
      teamId: selectedTeam.value._id
    })
    memberForm.value = { name: '', age: null }
    showAddMember.value = false
    fetchMembers(selectedTeam.value._id)
  } catch (e) {
    alert('فشل إضافة العضو')
  }
}

const deleteMember = async (id) => {
  if (!confirm('حذف هذا العضو؟')) return
  try {
    await axios.delete(`/api/contestants/${id}`)
    fetchMembers(selectedTeam.value._id)
  } catch (e) { alert('فشل الحذف') }
}

const handleLogout = () => {
  localStorage.removeItem('adminToken')
  delete axios.defaults.headers.common['Authorization']
  window.location.href = '/login'
}

onMounted(fetchTeams)
</script>
