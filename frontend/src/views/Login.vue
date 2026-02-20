<template>
  <div class="min-h-screen flex items-center justify-center p-4">
    <div class="glass-panel p-10 max-w-md w-full gold-glow">
      <div class="text-center mb-8">
        <div class="text-4xl mb-4">🌙</div>
        <h1 class="text-3xl font-amiri gold-text">تسجيل دخول الإدارة</h1>
      </div>

      <div v-if="error" class="bg-red-500/20 text-red-400 p-3 rounded-lg mb-6 text-sm text-center border border-red-500/30">
        {{ error }}
      </div>

      <div class="space-y-4">
        <div>
          <label class="block text-sm text-gray-400 mb-1 text-right">اسم المستخدم</label>
          <input v-model="form.username" type="text" class="w-full bg-slate-800 border border-slate-700 p-3 rounded-lg focus:outline-none focus:border-ramadan-gold text-right" />
        </div>
        <div>
          <label class="block text-sm text-gray-400 mb-1 text-right">كلمة المرور</label>
          <input v-model="form.password" type="password" @keyup.enter="handleLogin" class="w-full bg-slate-800 border border-slate-700 p-3 rounded-lg focus:outline-none focus:border-ramadan-gold text-right" />
        </div>

        <button @click="handleLogin" :disabled="loading" class="w-full bg-ramadan-gold text-ramadan-blue font-bold py-4 rounded-xl mt-6 gold-glow disabled:opacity-50">
          {{ loading ? 'جاري التحقق...' : 'دخول' }}
        </button>
      </div>

      <div class="mt-8 text-center text-xs text-gray-500">
        الإدارة فقط 🔒
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const loading = ref(false)
const error = ref('')
const form = ref({
  username: '',
  password: ''
})

const handleLogin = async () => {
  if (!form.value.username || !form.value.password) {
    error.value = 'الرجاء إدخال البيانات'
    return
  }
  loading.value = true
  error.value = ''
  try {
    const res = await axios.post('/api/auth/login', form.value)
    localStorage.setItem('adminToken', res.data.token)
    // Setup global axios header
    axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`
    router.push('/admin')
  } catch (e) {
    error.value = e.response?.data?.message || 'فشل تسجيل الدخول'
  } finally {
    loading.value = false
  }
}
</script>
