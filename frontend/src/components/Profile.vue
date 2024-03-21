<script
  lang="ts"
  setup
>
import { fetchAllUsers, fetchUser, type User, type UserInfo, type GameInfo, putImage } from '@/helpers/user'
import Cookies from 'js-cookie'
import { onMounted, ref, type Ref } from 'vue'
import { io, type Socket } from 'socket.io-client'
import type { DefaultEventsMap } from '@socket.io/component-emitter'


let socket: Socket<DefaultEventsMap, DefaultEventsMap>
const currentUser: Ref<User> = ref({
  id: 1,
  username: 'No User Found',
  mmr: 0,
  isAdmin: true,
  wins: 10,
  losses: 5,
  profilePicture: null,
})
interface WinLoseRate {
  wins: number
  losses: number
  winLoseRate: number
  total: number
  draws: number
}
interface Games {
  id: number
  player1: number
  player1mmr: number
  player1Name: string
  player2: number
  player2mmr: number
  player2Name: string
  result: string
}
const allUsers: Ref<User[]> = ref([])
const selectedFile: Ref<File | null> = ref(null)
const profilePictureError: Ref<string> = ref('')
const gameQueue: Ref<UserInfo[]> = ref([])
const currentGames: Ref<GameInfo[]> = ref([])
const showPasswordModal = ref(false)
const newPassword = ref('')
const confirmPassword = ref('')
const passwordChangeError = ref('')
const adminView = ref(false)
const showProfilePictureModal = ref(false)

onMounted(async () => {
  let user = await fetchUser()
  if (user) {
    currentUser.value = user
  }
  if (currentUser.value.isAdmin) {
    let users = await fetchAllUsers()
    if (users) {
      allUsers.value = users
    }
  }

  await fetchGameHistory()
  await fetchGameQueue()
  await fetchWinLoseRate()

  if (currentUser.value.isAdmin) {
    adminView.value = false
    startSocket()
  }
})

// Start socket connection
function startSocket () {
  const jwtToken = Cookies.get('jwtToken')
  socket = io('', {
    auth: {
      jwtToken: jwtToken
    }
  })
  socket.on("connect", () => {
    console.log(`Connected to the server with Socket ID: ${socket.id}`)
  })
  socket.on("disconnect", () => {
    console.log(`Disconnected from the server with Socket ID: ${socket.id}`)
  })
  socket.on("search.list", (data: UserInfo[]) => {
    gameQueue.value = data
  })

  socket.on("game.list.info", (data: GameInfo[]) => {
    console.log(data)
    currentGames.value = data
  })
}

// Fetch game queue
async function fetchGameQueue () {
  if (!currentUser.value.isAdmin) return
  try {
    const jwtToken = Cookies.get('jwtToken')
    if (!jwtToken) {
      throw new Error('Authentication token not found. Please login first.')
    }
    const response = await fetch('/api/v1/game/queue', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${jwtToken}`,
        'Content-Type': 'application/json',
      },
    })
    if (!response.ok) {
      throw new Error('Failed to fetch game queue. Please check your authentication token.')
    }
    let users = await response.json()
    gameQueue.value = users

  } catch (error: any) {
    console.error('Error:', error.message)
  }
}

// Fetch win-lose rate
const winLoseRate = ref({} as WinLoseRate)
async function fetchWinLoseRate () {
  try {
    const jwtToken = Cookies.get('jwtToken')
    if (!jwtToken) {
      throw new Error('Authentication token not found. Please login first.')
    }
    const response = await fetch('/api/v1/history/win-lose-rate', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${jwtToken}`,
        'Content-Type': 'application/json',
      },
    })
    if (!response.ok) {
      throw new Error('Failed to fetch win-lose rate.')
    }
    winLoseRate.value = await response.json()
  } catch (error: any) {
    console.error('Error:', error)
  }
}

// Fetch game history
const games = ref([] as Games[])
async function fetchGameHistory () {
  try {
    const jwtToken = Cookies.get('jwtToken')
    if (!jwtToken) {
      throw new Error('Authentication token not found. Please login first.')
    }
    const response = await fetch('/api/v1/history/all', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${jwtToken}`,
        'Content-Type': 'application/json',
      },
    })
    if (!response.ok) {
      throw new Error('Failed to fetch game history.')
    }
    games.value = await response.json()
  } catch (error: any) {
    console.error('Error:', error)
  }
}

//Ändern des Passworts
const changePassword = async (e: Event) => {
  e.preventDefault()
  if (newPassword.value.trim() === '' || confirmPassword.value.trim() === '') {
    passwordChangeError.value = 'Felder dürfen nicht leer sein.'
    return
  }
  if (newPassword.value !== confirmPassword.value) {
    passwordChangeError.value = 'Passwörter stimmen nicht überein.'
    return
  }
  try {
    const jwtToken = Cookies.get('jwtToken')
    const response = await fetch('/api/v1/user/update-password', {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${jwtToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        password: newPassword.value.trim(),
      }),
    })
    if (response.status === 400) {
      throw new Error('Das Passwort muss zwischen 8 und 72 Zeichen lang sein.')
    } else if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`)
    } passwordChangeError.value = 'Passwort erfolgreich geändert.'
  } catch (error: any) {
    console.error('Error:', error)
    passwordChangeError.value = error.message || 'Passwortänderung fehlgeschlagen.'
  } finally {
    newPassword.value = ''
    confirmPassword.value = ''
  }
}

//Upload Profile Picture
const submitUpload = async () => {
  console.log(selectedFile.value)
  if (selectedFile.value) putImage(selectedFile.value, currentUser.value.id)
}

function handleFileSelect (event: Event) {
  // Access the file from the input element
  const input = event.target as HTMLInputElement

  // Now, TypeScript knows that input has a 'files' property
  if (input.files && input.files.length > 0) {
    const file = input.files[0]
    selectedFile.value = file
    submitUpload()
  }
}

</script>

<template>
  <div
    v-if="showProfilePictureModal"
    class="modal-mask"
  >
    <div class="modal-wrapper">
      <div class="modal-container">
        <div class="flex justify-between items-center"> <h2 class="modal-title">Profilbild hochladen</h2>
          <div
              class="bg-gray-300 hover:bg-gray-500 cursor-pointer hover:text-gray-300 font-sans text-gray-500 w-6 h-6 rounded-md flex items-center justify-center"
              @click="showProfilePictureModal = false; profilePictureError = ''"
          >
            &times;
          </div>
        </div>
        <div class="modal-body">
          <form class="p-9">
            <label
              for="profilePictureUpload"
              class="block mb-4"
            >
              <span class="text-sm font-semibold">Bild auswählen:</span>
              <input
                type="file"
                id="profilePictureUpload"
                ref="profilePictureInput"
                @change="handleFileSelect"
                class="block w-full rounded-md border-0 p-1.5 mb-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              >
            </label>
            <div
              v-if="profilePictureError"
              class="alert alert-danger"
            >{{ profilePictureError }}</div>
            <div class="modal-actions">
              <button
                type="button"
                @click="showProfilePictureModal = false; profilePictureError = ''"
                class="flex w-full justify-center rounded-md bg-gray-300 px-3 py-1.5 text-sm font-semibold leading-6 text-black shadow-sm hover:bg-gray-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
              >Abbrechen</button>
              <button
                type="submit"
                class="flex w-full justify-center rounded-md bg-indigo-700 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >Hochladen</button>
            </div>
          </form>
        </div>
        <button
          @click="showProfilePictureModal = false"
          class="btn-close absolute top-5 right-5"
        >
          <svg>
          </svg>
        </button>
      </div>
    </div>
  </div>
  <div
    v-if="showPasswordModal"
    class="modal-mask"
  >
    <div class="modal-wrapper">
      <div class="modal-container">
        <div class="flex justify-between items-center"> <h2 class="modal-title">Passwort ändern</h2>
          <div
              class="bg-gray-300 hover:bg-gray-500 cursor-pointer hover:text-gray-300 font-sans text-gray-500 w-6 h-6 rounded-md flex items-center justify-center"
              @click="showPasswordModal = false; passwordChangeError = ''"
          >
            &times;
          </div>
        </div>
        <div class="modal-body">
          <form
            @submit.prevent="changePassword"
            class="p-9"
          >
            <label for="newPassword">Neues Passwort:</label>
            <input
              type="password"
              id="newPassword"
              v-model="newPassword"
              class="block w-full rounded-md border-0 p-1.5 mb-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            >
            <label for="confirmPassword">Neues Passwort bestätigen:</label>
            <input
              type="password"
              id="confirmPassword"
              v-model="confirmPassword"
              class="block w-full rounded-md border-0 p-1.5 mb-6 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            >
            <div
              v-if="passwordChangeError"
              class="alert alert-danger"
            >{{ passwordChangeError }}</div>
            <div class="modal-actions">
              <button
                type="button"
                @click="showPasswordModal = false; newPassword = ''; confirmPassword = ''; passwordChangeError = ''"
                class="flex w-full justify-center rounded-md bg-gray-300 px-3 py-1.5 text-sm font-semibold leading-6 text-black shadow-sm hover:bg-gray-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
              >Abbrechen</button>
              <button
                type="submit"
                class="flex w-full justify-center rounded-md bg-indigo-700 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >Ändern</button>
            </div>
          </form>
        </div>
        <button
          @click="showPasswordModal = false"
          class="btn-close absolute top-5 right-5"
        >
          <svg>
          </svg>
        </button>
      </div>
    </div>
  </div>
  <div class="container mx-auto flex items-center justify-center p-2">
    <div class="container mt-8">
      <div class="rounded-xl flex flex-col px-16 py-8 pl-0 pt-0 pb-0 w-full h-full">
        <div class="flex justify-between items-center">
          <h2 class="text-2xl font-bold mb-4">Mein Profil</h2>
          <div
            v-if="currentUser.isAdmin"
            class="ml-auto h-full flex items-center"
          >
            <label
              for="isAdminSwitch"
              class="flex items-center space-x-2 relative"
            >
              <span class="text-sm font-semibold">Admin-Ansicht</span>
              <input
                type="checkbox"
                id="isAdminSwitch"
                class="form-checkbox h-5 w-5 text-indigo-600 rounded-2xl hover:border-indigo-600"
                v-model="adminView"
              > </label>
          </div>
        </div>
        <div class=" rounded-xl bg-white shadow-md p-8">
          <div class="flex justify-between flex-collumn mb-4">
            <div>
              <h2 class="text-xl font-bold p-0">{{ currentUser.username }}</h2>
              <p>Elo-Zahl: {{ currentUser.mmr }}</p>
            </div>
            <div class="text-sm flex flex-col items-center">
              <img
                v-if="currentUser.profilePicture"
                :src="currentUser.profilePicture"
                alt="Profilbild"
                class="shadow-md w-24 h-24 rounded-full mb-4 mt-0"
              >
              <svg
                v-else
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                id="profile"
                class="w-24 h-24 rounded-full mb-4 border-2 border-black p-2"
              >
                <g
                  fill="
                  none"
                  fill-rule="evenodd"
                  stroke="#200E32"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.5"
                  transform="translate(4 2.5)"
                >
                  <circle
                    cx="7.579"
                    cy="4.778"
                    r="4.778"
                  ></circle>
                  <path
                    d="M5.32907052e-15,16.2013731 C-0.00126760558,15.8654831 0.0738531734,15.5336997 0.219695816,15.2311214 C0.677361723,14.3157895 1.96797958,13.8306637 3.0389178,13.610984 C3.81127745,13.4461621 4.59430539,13.3360488 5.38216724,13.2814646 C6.84083861,13.1533327 8.30793524,13.1533327 9.76660662,13.2814646 C10.5544024,13.3366774 11.3373865,13.4467845 12.1098561,13.610984 C13.1807943,13.8306637 14.4714121,14.270023 14.929078,15.2311214 C15.2223724,15.8479159 15.2223724,16.5639836 14.929078,17.1807781 C14.4714121,18.1418765 13.1807943,18.5812358 12.1098561,18.7917621 C11.3383994,18.9634099 10.5550941,19.0766219 9.76660662,19.1304349 C8.57936754,19.2310812 7.38658584,19.2494317 6.19681255,19.1853548 C5.92221301,19.1853548 5.65676678,19.1853548 5.38216724,19.1304349 C4.59663136,19.077285 3.8163184,18.9640631 3.04807112,18.7917621 C1.96797958,18.5812358 0.686515041,18.1418765 0.219695816,17.1807781 C0.0745982583,16.8746908 -0.000447947969,16.5401098 5.32907052e-15,16.2013731 Z"
                  >
                  </path>
                </g>
              </svg>
              <a
                class="text-sm font-semibold text-indigo-600 hover:text-indigo-500"
                @click="showProfilePictureModal = true"
              >
                Profilbild ändern
              </a>
            </div>
          </div>
          <div class="text-sm pt-4">
            <a
              class="text-sm font-semibold text-indigo-600 hover:text-indigo-500"
              @click="showPasswordModal = true"
            >
              Passwort ändern
            </a>
          </div>
        </div>
      </div>
    </div>
    <div
      v-if="adminView"
      class="container mt-8 "
    >
      <h2 class="text-2xl font-bold">Matchmaking-Queue</h2>
      <div
        id="container"
        class="rounded-xl bg-white shadow-md p-8 mt-4 mb-4"
        style="max-height: 180px; overflow-y: auto;"
      >
        <div
          v-if="gameQueue.length > 0"
          v-for="user in gameQueue"
          :key="user.id"
          class="flex justify-between p-1"
        >
          <p class="font-bold text-indigo-700">{{ user.username }}</p>
          <p class="text-rose-400">Wartet...</p>
        </div>
        <div
          v-else
          class="flex justify-between p-1"
        >
          <p>Keine Benutzer in der Queue</p>
          <p></p>
        </div>
      </div>
      <h2 class="text-2xl font-bold">Alle laufenden Spiele</h2>
      <div
        id="container"
        class="rounded-xl bg-white shadow-md p-8 mt-4 mb-4"
        style="max-height: 180px; overflow-y: auto;"
      >
        <div
          v-if="currentGames.length > 0"
          v-for="game in currentGames.filter(game => game.player1)"
          :key="game.gameId"
          class="flex justify-between p-1"
        >
          <p class="font-bold text-indigo-700">{{ game.player1.username }}</p>
          <p>vs.</p>
          <p class="font-bold text-indigo-700">{{ game.player2.username }}</p>
        </div>
        <div
          v-else
          class="flex justify-between p-1"
        >
          <p>Keine laufenden Spiele</p>
          <p></p>
        </div>
      </div>
      <h2 class="text-2xl font-bold">Alle Spieler</h2>
      <div
        id="container"
        class="rounded-xl bg-white shadow-md p-8 mt-4 mb-4"
        style="max-height: 180px; overflow-y: auto;"
      >
        <div
          v-for="user in allUsers"
          :key="user.id"
          class="flex justify-between p-1"
        >
          <p class="font-bold text-indigo-700">{{ user.username }}</p>
          <p>{{ user.mmr }}</p>
        </div>
      </div>
    </div>
    <div
      v-else
      class="container mt-8 "
    >
      <h2 class="text-2xl font-bold mb-4">Stats</h2>
      <div class=" rounded-xl bg-white shadow-md p-8 mt-4 mb-4 w-full justify-between">
        <p class="p-2 font-bold">Spiele gespielt: {{ winLoseRate.total }}</p>
        <p class="p-2 font-bold ">Gewonnene Spiele: {{ winLoseRate.wins }}</p>
        <p class="p-2 font-bold">Verlorene Spiele: {{ winLoseRate.losses }}</p>
        <p class="p-2 font-bold">Winrate: {{ Math.round(winLoseRate.winLoseRate * 100) / 100 }}%</p>
      </div>
      <h2 class="text-2xl font-bold">Spiele</h2>
      <div
        id="container"
        class="rounded-xl bg-white shadow-md p-8 mt-4 mb-4"
        style="max-height: 300px; overflow-y: auto;"
      >
        <div
          v-for="game in games"
          :key="game.id"
          class="flex justify-between p-1"
        >
          <p class="font-bold text-indigo-700">{{ game.player1Name }} vs. {{ game.player2Name }}</p>
          <p
            v-if="game.result === 'P1_WON' && currentUser.id === game.player1"
            class="text-green-600"
          >Gewonnen</p>
          <p
            v-else-if="game.result === 'P2_WON' && currentUser.id === game.player2"
            class="text-green-600"
          >Gewonnen</p>
          <p
            v-else-if="game.result === 'P1_WON' && currentUser.id === game.player2"
            class="text-red-600"
          >Verloren</p>
          <p
            v-else-if="game.result === 'P2_WON' && currentUser.id === game.player1"
            class="text-red-600"
          >Verloren</p>
          <p
            v-else-if="game.result === 'DRAW'"
            class="text-gray-600"
          >Unentschieden</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  width: 85vw;
  height: 80vh;
}

.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-wrapper {
  background-color: #fff;
  padding: 20px;
  border-radius: 5px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.modal-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.modal-title {
  font-size: 18px;
  font-weight: bold;
}

.modal-actions {
  display: flex;
  gap: 10px;
}

.btn-close {
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px;
}
</style>