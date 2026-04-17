<script setup lang="ts">
definePageMeta({
  layout: "dashboard"
})

useHead({
  title: "Search Articles",
  meta: [{ name: "description", content: "Search and manage articles" }],
})

type APIResponse = {
  current_page: number
  data: Article[]
  last_page: number
  per_page: number
  total: number
}

type Article = {
  id: number
  title: string
  date: string
  excerpt: string
  publication?: string
  category_id: number
}

const { errorMsg, successMsg } = useMessage()
const router = useRouter()
const loading = ref(false)
const articles = ref<Article[]>([])
const search = ref("")

const filteredArticles = computed(() => {
  if (!search.value) return articles.value

  const query = search.value.toLowerCase()
  return articles.value.filter((x) =>
    x.title.toLowerCase().includes(query) ||
    x.excerpt.toLowerCase().includes(query)
  )
})

const fetchArticles = async () => {
  loading.value = true
  errorMsg.value = null

  try {
    const res = await $fetch<APIResponse>(
      "http://localhost:3000/api/v-portfolio/admin-articles"
    )
    articles.value = res.data
  } catch (err: any) {
    errorMsg.value = err?.statusMessage || "Failed to fetch articles"
    articles.value = []
  } finally {
    loading.value = false
  }
}

onMounted(fetchArticles)

const editArticle = (article: Article) => {
  // Fixed: path matches your 'pages/apps/dashboard/article/[id].vue' structure
  router.push(`/apps/dashboard/article/${article.id}`)
}

const deleteArticle = async (article: Article) => {
  if (!confirm(`Are you sure you want to delete "${article.title}"?`)) return

  try {
    await $fetch(`http://localhost:3000/api/v-portfolio/admin-articles/${article.id}`, {
      method: "DELETE",
    })

    articles.value = articles.value.filter(a => a.id !== article.id)
    successMsg.value = `Deleted "${article.title}"`
  } catch (err: any) {
    errorMsg.value = err?.statusMessage || "Failed to delete article"
  }
}
</script>

<template>
  <div class="p-4 min-h-screen bg-[#0f172a] text-gray-100">
    <div class="bg-gray-800/40 backdrop-blur-md border border-gray-700/50 rounded-2xl p-6 shadow-lg shadow-emerald-900/20">
      
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-xl font-bold bg-gradient-to-r from-emerald-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
          Articles Table
        </h1>
      </div>

      <div class="flex gap-2 mb-6">
        <input
          v-model="search"
          type="text"
          placeholder="Search articles..."
          class="flex-1 p-2.5 rounded-lg border border-gray-700 bg-gray-900/60 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      <div v-if="loading" class="text-center py-6 text-gray-400 italic">
        Loading articles...
      </div>

      <div v-if="errorMsg" class="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg mb-4">
        {{ errorMsg }}
      </div>

      <div v-if="!loading && filteredArticles.length" class="overflow-x-auto">
        <table class="w-full border border-gray-700 rounded-xl overflow-hidden">
          <thead class="bg-gray-900/80 text-gray-300">
            <tr>
              <th class="p-3 text-left">#</th>
              <th class="p-3 text-left">Title</th>
              <th class="p-3 text-left">Date</th>
              <th class="p-3 text-left">Excerpt</th>
              <th class="p-3 text-left">Publication</th>
              <th class="p-3 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="(item, index) in filteredArticles"
              :key="item.id"
              class="border-t border-gray-700 hover:bg-gray-800/60 transition"
            >
              <td class="p-3 text-gray-500">{{ index + 1 }}</td>
              <td class="p-3 font-semibold text-emerald-400">{{ item.title }}</td>
              <td class="p-3 text-gray-400 whitespace-nowrap">{{ item.date }}</td>
              <td class="p-3 text-gray-300 max-w-xs truncate">{{ item.excerpt }}</td>
              <td class="p-3 text-gray-400">{{ item.publication || '-' }}</td>
              <td class="p-3">
                <div class="flex justify-center gap-2">
                  <button
                    @click="editArticle(item)"
                    class="px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded text-sm transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    @click="deleteArticle(item)"
                    class="px-3 py-1 bg-red-600 hover:bg-red-500 rounded text-sm transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="!loading && filteredArticles.length === 0" class="text-center py-12 text-gray-500">
        <p class="text-lg">No articles found matching your search.</p>
      </div>

    </div>
  </div>
</template>