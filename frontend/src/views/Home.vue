<template>
  <div class="flex flex-col items-center justify-center min-h-screen p-4 text-center">
    <!-- Lantern Icon/Image -->
    <div class="mb-8 animate-bounce transition-all duration-1000">
      <div class="w-32 h-32 bg-ramadan-gold rounded-full flex items-center justify-center gold-glow">
        <span class="text-6xl">🌙</span>
      </div>
    </div>

    <h1 class="text-5xl md:text-7xl font-amiri gold-text mb-4">مسابقات رمضان التفاعلية</h1>
    <p class="text-xl text-gray-300 max-w-2xl mb-12 leading-relaxed">
      أهلاً بكم في نظام المسابقات الرمضانية. شارك في المسابقات، نافس أصدقائك، واربح النقاط!
    </p>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl px-4">
      <router-link to="/info" class="glass-panel p-8 hover:bg-ramadan-gold/20 transition-all group border-ramadan-gold/30">
        <div class="text-3xl mb-2 group-hover:scale-110 transition-transform">📚</div>
        <h2 class="text-2xl font-bold mb-2">بنك المعلومات</h2>
        <p class="text-sm text-gray-400">تصفح أقسام السيرة النبوية، التفسير، والمزيد من العلوم الإسلامية</p>
      </router-link>

      <router-link to="/admin" class="glass-panel p-8 hover:bg-ramadan-gold/20 transition-all group border-ramadan-gold/30">
        <div class="text-3xl mb-2 group-hover:scale-110 transition-transform">⚙️</div>
        <h2 class="text-2xl font-bold mb-2">إدارة المسابقات</h2>
        <p class="text-sm text-gray-400">إضافة مسابقات جديدة، إدارة الفرق، ومتابعة النتائج</p>
      </router-link>
    </div>

    <div class="mt-16 text-ramadan-gold/50 text-sm">
      رمضان كريم 🌙 1447هـ
    </div>
  </div>
</template>

<script setup>
// Home logic
</script>
