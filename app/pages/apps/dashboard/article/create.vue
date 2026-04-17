<script setup lang="ts">
definePageMeta({ layout: "dashboard", requiresAuth: true })
useHead({
  title: "Create Articles",
  meta: [{ name: "description", content: "Create and manage articles" }],
})

import { Icon } from "@iconify/vue"
import { ref, onMounted } from "vue"
import { z } from "zod"
import { useForm, useField } from "vee-validate"
import { toTypedSchema } from "@vee-validate/zod"
import { useMessage } from "~/composables/useMessage"

const { successMsg, errorMsg } = useMessage();

successMsg.value = null
errorMsg.value = null


interface Category {
  id: number;
  name: string;
}

/* Zod validation schema */
const schema = toTypedSchema(
  z.object({
    title: z.string().min(1, "Required"),
    date: z.string().min(10, "Required"),
    excerpt: z.string().min(1, "Required"),
    publication: z.string().optional(),
    category_id: z.number().int().positive("Required")
  })
)

/* Vee-validate form setup */
const { handleSubmit, errors, isSubmitting, resetForm } = useForm({
  validationSchema: schema,
  initialValues: {
    date: "",
    excerpt: "",
    publication: "",
    category_id: -1
  }
})

const { value: title } = useField<string>("title")
const { value: date } = useField<string>("date")
const { value: excerpt } = useField<string>("excerpt")
const { value: publication } = useField<string>("publication")
const { value: category_id } = useField<number>("category_id")

const categories = ref<Category[]>([]);

// Fetch categories function
const fetchCategories = async () => {
  try {
    categories.value = await $fetch<Category[]>("/api/v-portfolio/admin-categories")
  } catch (err: any) {
    errorMsg.value = err.statusMessage || "Failed to load categories"
  }
}

onMounted(fetchCategories)

// Submit handler
const onSubmit = handleSubmit(async (values) => {
  try {
    const res = await $fetch<{ id: number }>("/api/v-portfolio/admin-articles", {
      method: "POST",
      body: values,
    })
    successMsg.value = "Article created successfully!"
    resetForm()
  } catch (err: any) {
    errorMsg.value = err.statusMessage || "Failed to create article"
  }
})
</script>

<template>
  <div class="p-4 max-w-lg">
    <h1 class="text-xl font-bold gradient-text mb-4">Create Product</h1>

    <!-- Messages -->
        <div v-if="errorMsg" class="mb-3 p-2 rounded bg-red-500/20 text-red-300 text-sm">
            {{ errorMsg }}
        </div>
        <div v-if="successMsg" class="mb-3 p-2 rounded bg-emerald-500/20 text-emerald-300 text-sm">
            {{ successMsg }}
        </div>

    <form @submit.prevent="onSubmit" class="space-y-3">
      <div>
        <input 
          v-model="title"
          type="text" 
          placeholder="Enter title" 
          class="input" 
        />
        <p v-if="errors.title" class="text-red-500 text-sm mt-1">{{ errors.title }}</p>
      </div>

      <div>
        <input 
          v-model="date"
          type="text" 
          placeholder="Enter date (DD-MM-YYYY)" 
          class="input" 
        />
        <p v-if="errors.date" class="text-red-500 text-sm mt-1">{{ errors.date }}</p>
      </div>

      <div>
        <input 
          v-model="excerpt"
          type="text" 
          class="input" 
          placeholder="Enter excerpt"
        />
        <p v-if="errors.excerpt" class="text-red-500 text-sm mt-1">{{ errors.excerpt }}</p>
      </div>

      <div>
        <input 
          v-model="publication"
          type="text" 
          placeholder="Enter Publication" 
          class="input" 
        />
      </div>

      <div>
        <select v-model.number="category_id" class="input">
          <option value="-1" disabled>Choose ...</option>
          <option v-for="c in categories" :key="c.id" :value="c.id">
            {{ c.name }}
          </option>
        </select>
        <p v-if="errors.category_id" class="text-red-500 text-sm mt-1">{{ errors.category_id }}</p>
      </div>

      <button 
        type="submit" 
        :disabled="isSubmitting"
        class="button"
      >
        {{ isSubmitting ? "Submitting..." : "Submit" }}
      </button>
    </form>
  </div>
</template>

<style scoped>
@reference "@/assets/css/main.css";

.input {
  @apply w-full p-2 rounded-lg border border-gray-700 bg-gray-900/50 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition;
}

.button {
  @apply w-full py-2 rounded-lg font-medium bg-emerald-600 hover:bg-emerald-700 transition-transform hover:scale-105 shadow-lg shadow-emerald-900/20 disabled:opacity-50 text-white;
}

.gradient-text {
  @apply bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-blue-500 to-purple-500;
}
</style>