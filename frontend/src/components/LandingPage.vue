<script
  setup
  lang="ts"
>
import useAuth from '@/helpers/auth'
import { onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()
const { isLoggedIn, checkAuth } = useAuth()

onMounted(() => {
  checkAuth()
  if (isLoggedIn.value) {
    router.push('/play')
  }
})

</script>
<template>
  <div class="overflow-hidden mx-auto max-w-2xl w-full">
    <div class="text-center">
      <h1 class="text-4xl font-black tracking-tight text-gray-900 sm:text-6xl">
        TicTacToe.io
      </h1>
      <p class="mt-6 text-lg leading-8 text-gray-800">
        Erobere das Spielfeld, Zug um Zug! <br>
        Tritt der <span class="font-bold">TicTacToe.io</span> Gemeinschaft bei für unvergessliche strategische
        Duelle!
      </p>
      <div class="mt-10 flex items-center justify-center gap-x-6">
        <RouterLink to ="/login"
          href="login"
          class="rounded-md bg-slate-800 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Los gehts!
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<style scoped></style>