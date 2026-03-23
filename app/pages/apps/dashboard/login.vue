<script setup lang="ts">

useHead({
  title: "Login",
  meta: [{ name: "description", content: "Login to your account." }],
})

const email = ref('')
const password = ref('')

const handleLogin = () => {
  console.log('Logging in with:', email.value, password.value)
  navigateTo('/apps/dashboard')
}
</script>

<template>
  <div class="bg-[#0f172a] text-gray-100 min-h-screen font-sans flex items-center justify-center selection:bg-emerald-500/30 px-4">
    
    <div class="bg-gray-800/40 backdrop-blur-md border border-gray-700/50 p-6 rounded-2xl w-full max-w-sm shadow-2xl shadow-emerald-900/10">
      
      <h1 class="text-2xl font-bold text-center gradient-text mb-6">Login</h1>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <div class="space-y-1">
          <input 
            v-model="email"
            type="email" 
            placeholder="Email"
            class="w-full p-3 rounded-xl border border-gray-700 bg-gray-900/40 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all" 
            required
          />
        </div>

        <div class="space-y-1">
          <input 
            v-model="password"
            type="password" 
            placeholder="Password"
            class="w-full p-3 rounded-xl border border-gray-700 bg-gray-900/40 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all" 
            required
          />
        </div>

        <button 
          type="submit" 
          class="w-full py-3 mt-2 rounded-xl font-semibold bg-emerald-500 hover:bg-emerald-400 text-gray-900 transition-all active:scale-95 shadow-lg shadow-emerald-500/20"
        >
          Login
        </button>
      </form>

      <div class="mt-6 text-center">
        <p class="text-gray-400 text-xs">
          Don't have an account? 
          <NuxtLink to="/register" class="text-emerald-400 hover:underline">Sign up</NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.gradient-text {
  background: linear-gradient(to right, #34d399, #3b82f6, #a855f7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
</style>