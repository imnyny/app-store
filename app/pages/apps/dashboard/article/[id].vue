<script setup lang="ts">
/**
 * បំណង៖ ទំព័រសម្រាប់កែប្រែអត្ថបទ (Update Article)
 * ប្រើប្រាស់៖ Nuxt 3, Vee-Validate, Zod, Tailwind CSS v4
 */

definePageMeta({ layout: "dashboard", requiresAuth: true })

import { ref, onMounted } from "vue"
import { z } from "zod"
import { useForm, useField } from "vee-validate"
import { toTypedSchema } from "@vee-validate/zod"
import { useMessage } from "~/composables/useMessage"
import { useRoute } from "vue-router"

// ១. ការរៀបចំសារជូនដំណឹង (Messages)
const { successMsg, errorMsg } = useMessage();
successMsg.value = null
errorMsg.value = null

interface Category {
  id: number;
  name: string;
}

// ២. កំណត់លក្ខខណ្ឌ Validation ជាមួយ Zod
const schema = toTypedSchema(
  z.object({
    title: z.string().min(1, "សូមបញ្ចូលចំណងជើង"),
    date: z.string().min(10, "ថ្ងៃខែត្រូវតែមានទម្រង់ DD-MM-YYYY"),
    excerpt: z.string().min(1, "សូមបញ្ចូលខ្លឹមសារសង្ខេប"),
    publication: z.string().optional(),
    category_id: z.number().int().positive("សូមជ្រើសរើសប្រភេទអត្ថបទ")
  })
)

// ៣. ការ setup Form ជាមួយ Vee-validate
const { handleSubmit, errors, isSubmitting, setValues } = useForm({
  validationSchema: schema,
  initialValues: {
    title: "",
    date: "",
    excerpt: "",
    publication: "",
    category_id: -1
  }
})

// បង្កើត Reactive Variables សម្រាប់ Bind ជាមួយ Input
const { value: title } = useField<string>("title")
const { value: date } = useField<string>("date")
const { value: excerpt } = useField<string>("excerpt")
const { value: publication } = useField<string>("publication")
const { value: category_id } = useField<number>("category_id")

const categories = ref<Category[]>([]);
const route = useRoute()
const id = Number(route.params.id)

// ៤. មុខងារទាញយកទិន្នន័យពី API
const fetchCategories = async () => {
  try {
    categories.value = await $fetch<Category[]>("/api/v-portfolio/admin-categories")
  } catch (err: any) {
    errorMsg.value = "មិនអាចទាញយកបញ្ជីប្រភេទបានទេ"
  }
}

const fetchArticle = async () => {
  try {
    const res = await $fetch<any>(`/api/v-portfolio/admin-articles/${id}`)
    
    // បន្ថែមបន្ទាត់នេះដើម្បីឆែកមើលទិន្នន័យ
    console.log("Data from API:", res) 
    
    setValues(res)
  } catch (err: any) {
    console.error("Error fetching data:", err)
  }
}

// ទាញទិន្នន័យនៅពេល Component ចាប់ផ្តើមដំណើរការ
onMounted(async () => {
  await Promise.all([
    fetchCategories(),
    fetchArticle()
  ])
})

// ៥. មុខងារផ្ញើទិន្នន័យទៅកាន់ Server (Submit)
const onSubmit = handleSubmit(async (values) => {
  try {
    errorMsg.value = null
    await $fetch(`/api/v-portfolio/admin-articles/${id}`, {
      method: "PUT",
      body: values,
    })
    successMsg.value = "បានធ្វើបច្ចុប្បន្នភាពអត្ថបទដោយជោគជ័យ!"
  } catch (err: any) {
    errorMsg.value = err.statusMessage || "ការធ្វើបច្ចុប្បន្នភាពបានបរាជ័យ"
  }
})
</script>

<template>
  <div class="p-6 max-w-lg">
    <h1 class="text-xl font-bold text-white mb-6">Update Article</h1>

    <div v-if="errorMsg" class="mb-4 p-3 rounded bg-red-500/10 border border-red-500/50 text-red-400 text-sm">
      {{ errorMsg }}
    </div>

    <div v-if="successMsg" class="mb-4 p-3 rounded bg-emerald-500/10 border border-emerald-500/50 text-emerald-400 text-sm">
      {{ successMsg }}
    </div>

    <form @submit.prevent="onSubmit" class="space-y-4">
      <div>
        <input v-model="title" type="text" placeholder="Title" class="input" />
        <p v-if="errors.title" class="text-red-500 text-xs mt-1">{{ errors.title }}</p>
      </div>

      <div>
        <input v-model="date" type="text" placeholder="DD-MM-YYYY" class="input" />
        <p v-if="errors.date" class="text-red-500 text-xs mt-1">{{ errors.date }}</p>
      </div>

      <div>
        <input v-model="excerpt" type="text" placeholder="Excerpt" class="input" />
        <p v-if="errors.excerpt" class="text-red-500 text-xs mt-1">{{ errors.excerpt }}</p>
      </div>

      <div>
        <input v-model="publication" type="text" placeholder="Publication" class="input" />
      </div>

      <div>
        <select v-model.number="category_id" class="input">
          <option value="-1" disabled>Select Category</option>
          <option v-for="c in categories" :key="c.id" :value="c.id">
            {{ c.name }}
          </option>
        </select>
        <p v-if="errors.category_id" class="text-red-500 text-xs mt-1">{{ errors.category_id }}</p>
      </div>

      <button 
        type="submit" 
        :disabled="isSubmitting" 
        class="button"
      >
        <span v-if="isSubmitting">កំពុងរក្សាទុក...</span>
        <span v-else>Submit</span>
      </button>
    </form>
  </div>
</template>

<style scoped>
/* ប្រើ @ / ដើម្បីចង្អុលទៅ assets ទោះ file ស្ថិតនៅកន្លែងណាក៏ដោយ */
@reference "@/assets/css/main.css";

.input {
  @apply w-full p-3 rounded-lg border border-gray-700 bg-[#0f172a] text-gray-100 placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-all;
}

.button {
  @apply w-full py-3 rounded-lg font-semibold bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white transition-all active:scale-[0.98];
}
</style>