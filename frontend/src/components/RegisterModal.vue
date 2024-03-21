<script
  setup
  lang="ts"
>
import { ref, watchEffect } from 'vue'
import Cookies from 'js-cookie'
import { useRouter } from 'vue-router'
const router = useRouter()

const username = ref('')
const password = ref('')
const repeatedPassword = ref('')
const formIsValid = ref(false)
const errorMessage = ref('')

const checkForm = () => {
  formIsValid.value = username.value.trim() !== '' && password.value.trim() !== '' && password.value === repeatedPassword.value
  // If password not equal set error message
  if (password.value !== repeatedPassword.value) {
    errorMessage.value = 'Passwörter stimmen nicht überein.'
  }
}

const submitForm = async (e: Event) => {
  checkForm()
  e.preventDefault()
  if (formIsValid.value) {
    try {
      const response = await fetch('/api/v1/user/register', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username.value,
          password: password.value,
        }),
      })
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      const data = await response.json()
      Cookies.set('jwtToken', data.jwtToken, { expires: 1 }) // Expires in 1 day
      setTimeout(() => {
        router.push('/play')
      }, 200)
    } catch (error: any) {
      console.error('Error:', error)
      errorMessage.value = "Benutzer oder Passwort ist ungültig"
    }
  } else {
    errorMessage.value = 'Bitte füllen sie alle Felder aus.'
  }
}
</script>

<template>
  <div class="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-sm">
      <h2 class="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">Registrieren auf
        TicTacToe.io
      </h2>
    </div>

    <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
      <form
        class="space-y-6"
        @submit.prevent="submitForm"
      >
        <div>
          <label
            for="username"
            class="block text-sm font-medium leading-6 text-gray-900"
          >Benutzername</label>
          <div class="mt-2">
            <input
              v-model="username"
              id="username"
              name="username"
              type="username"
              autocomplete="username"
              class="block w-full rounded-md border-0 p-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            />
          </div>
        </div>

        <div>
          <div class="flex items-center justify-between">
            <label
              for="password"
              class="block text-sm font-medium leading-6 text-gray-900"
            >Passwort</label>
          </div>
          <div class="mt-2">
            <input
              v-model="password"
              id="password"
              name="password"
              type="password"
              autocomplete="current-password"
              class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            />
          </div>
        </div>

        <div>
          <div class="flex items-center justify-between">
            <label
              for="repeatedPassword"
              class="block text-sm font-medium leading-6 text-gray-900"
            >
              Passwort wiederholen
            </label>
          </div>
          <div class="mt-2">
            <input
              v-model="repeatedPassword"
              id="repeatedPassword"
              name="repeatedPassword"
              type="password"
              autocomplete="current-password"
              class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            class="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Registrieren
          </button>
        </div>
        <!-- Error Message -->
        <div
          v-if="errorMessage"
          class="mt-2 text-center text-sm text-red-500"
        >
          {{ errorMessage }}
        </div>
      </form>

      <p class="mt-10 text-center text-sm text-gray-700">
        Bereits Mitglied?
        {{ ' ' }}
        <RouterLink
          to="/login"
          class="ml-1 font-bold leading-6 text-indigo-600 hover:text-indigo-500"
        >Einloggen</RouterLink>
      </p>
    </div>
  </div>
</template>


<style scoped></style>
