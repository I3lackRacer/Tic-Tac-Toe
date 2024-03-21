<script
  setup
  lang="ts"
>
import { makeMoveOnBoard, type Game, FieldStatus, fetchQueueCount } from "@/helpers/board"
import Chat, { type Message } from './Chat.vue'
import useAuth from '@/helpers/auth'
import { onMounted, ref, watch, watchEffect, type Ref, computed, onBeforeMount, onBeforeUnmount } from 'vue'
import { Socket, io } from "socket.io-client"
import { fetchUser, type User, fetchImage } from '@/helpers/user'
import { useRouter } from 'vue-router'
import Cookies from 'js-cookie'
import type { DefaultEventsMap } from '@socket.io/component-emitter'
import type { RefSymbol } from "@vue/reactivity"
const router = useRouter()
const { isLoggedIn, checkAuth } = useAuth()

let socket: Socket<DefaultEventsMap, DefaultEventsMap>


//
// Refs
//
// The board is only for representation of the game state. The game state is stored in the game ref
const board: Ref<FieldStatus[][]> = ref([
  [0, 0, 0],
  [0, 0, 0],
  [0, 0, 0]
])
const currentUser: Ref<User> = ref({
  id: 1,
  username: 'Not logged in',
  mmr: 1000,
  isAdmin: false,
  wins: 0,
  losses: 0,
  profilePicture: null,
})
const opponent: Ref<User | null> = ref(null)
const opponentUsername: Ref<string> = ref("Gegner")
const latestMessage = ref<Message | null>(null)
const game: Ref<Game | null> = ref(null)
const playersInQueue = ref(0)
const isInQueue = ref(false)
const isGameOver: Ref<boolean> = ref(false)

// computed properties
const isOpponentTurn = computed(() => (game.value && !isGameOver.value) ? game.value.currentUsername === opponentUsername.value : false)
const isMyTurn = computed(() => (game.value && !isGameOver.value) ? game.value.currentUsername === currentUser.value.username : false)

// watch effect which clears board when game is null
watchEffect(() => {
  if (!game.value) {
    board.value = [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0]
    ]
  }
})

// Gets called when the component is mounted
onMounted(async () => {
  checkAuth()
  if (!isLoggedIn.value) {
    router.push('/login')
  }
  let user = await fetchUser()
  if (user) {
    currentUser.value = user
    console.log("fetched user:", currentUser.value.username)
  }
  startSocket()
  playersInQueue.value = await fetchQueueCount()
})

// Starts the socket connection and listens to all messages
async function startSocket () {
  const jwtToken = Cookies.get('jwtToken')
  socket = io('', {
    auth: {
      jwtToken: jwtToken
    }
  })
  socket.on("connect", () => {
    console.log(`Connected to the server with Socket ID: ${socket.id}`)
  })
  socket.on('disconnect', (reason) => {
    console.log('WebSocket connection closed', reason)
    game.value = null
    opponent.value = null
  })
  socket.on('search.count', (data) => {
    playersInQueue.value = data.count
  })
  socket.on('game.new', (data) => {
    console.log(data)
    newGameStarted(data)
  })
  socket.on('game.update', (data: Game) => {
    console.log('Game update: ', data)
    board.value = data.field
    game.value = data
  })
  socket.on('game.move', (data) => {
  })
  socket.on('game.end', (data) => {
    isGameOver.value = true
  })
  socket.on('game.end.disconnected', (data) => {
    isGameOver.value = true
  })
  socket.on('search.list', (data) => {
  })
  socket.on('game.list.info', (data) => {
  })
  socket.on('error', (errorMsg) => {
    console.error('Error: ', errorMsg)
  })
}

function searchGame () {
  // if game reset refs
  game.value = null
  opponent.value = null
  opponentUsername.value = "Gegner"
  isGameOver.value = false

  if (socket) {
    console.log(); ('Starting search')
    socket.emit('search')
    isInQueue.value = true
  } else {
    console.error('Socket not connected')
  }
}

function cancelQueue () {
  if (socket) {
    // disconnect and reconnect to socket
    socket.disconnect()
    socket.connect()
    isInQueue.value = false
    if (playersInQueue.value > 0) {
      playersInQueue.value -= 1
    }
  } else {
    console.error('Socket not connected')
  }
}

async function newGameStarted (data: Game) {
  game.value = data
  // fill the opponent ref with the correct user. The user that is not the current user is the opponent
  if (currentUser.value.username === data.player1Username) {
    opponent.value = {
      id: data.player2Id,
      username: data.player2Username,
      mmr: Math.floor(data.player2mmr),
      isAdmin: false,
      wins: 0,
      losses: 0,
      profilePicture: null
    }
    opponentUsername.value = data.player2Username
  } else {
    opponent.value = {
      id: data.player1Id,
      username: data.player1Username,
      mmr: Math.floor(data.player1mmr),
      isAdmin: false,
      wins: 0,
      losses: 0,
      profilePicture: null
    }
    opponentUsername.value = data.player1Username
  }
  const opponentImage = await fetchImage(opponent.value.id)
  if (opponentImage) opponent.value.profilePicture = opponentImage?.size !== 0 ? URL.createObjectURL(opponentImage!) : null
  isGameOver.value = false
  isInQueue.value = false
  playersInQueue.value = 0
}

function clickTile (rowIndex: number, cellIndex: number) {
  if (game.value && socket && !isGameOver.value) {
    const move = makeMoveOnBoard(rowIndex, cellIndex, 1, game.value.field)
    if (move) {
      let moveJson = {
        gameId: game.value.gameId,
        xPos: rowIndex,
        yPos: cellIndex
      }
      socket.emit('game.move', moveJson)
    }
  }
}

const sendMessageOverSocket = async (username: string, messageText: string) => {
  console.log('Sending message:', messageText)
  let messageJSON = {
    gameId: game.value?.gameId,
    username: username,
    message: messageText
  }
  socket.emit('game.message', messageJSON)
}

onBeforeUnmount(() => {
  socket.disconnect()
})
</script>

<template>
  <div class="container">
    <div class="left rounded-xl px-16">
      <div class="py-8 font-black text-indigo-600">{{ isOpponentTurn ? "Der Gegner ist am Zug!" : "" }}</div>

      <div class="flex justify-start w-full items-end ml-2">
        <div class="text-sm flex flex-col items-center">
          <img
            v-if="opponent && opponent.profilePicture"
            :src="opponent.profilePicture"
            alt="Profilbild"
            class="shadow-md w-10 h-10 rounded-full mt-0"
          >
          <svg
            v-else-if="opponent !== null"
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            id="profile"
            class="w-8 h-8"
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
        </div>
        <div class="ml-2 font-bold">{{ opponent?.username }}</div>
        <div class="ml-1">{{ opponent ? "(" + opponent?.mmr + ")" : "" }}</div>
      </div>



      <div
        id="tic-tac-toe"
        class="my-8"
      >
        <div
          v-for="(row, rowIndex) in board"
          :key="rowIndex"
          class="row"
        >
          <div
            v-for="(cell, cellIndex) in row"
            :key="cellIndex"
            class="cell"
            @click="clickTile(rowIndex, cellIndex)"
          >
            {{ cell ? (cell === 1 ? 'X' : 'O') : '' }}
          </div>
        </div>
      </div>



      <div class="flex justify-start w-full items-end ml-2">

        <div class="text-sm flex flex-col items-center">
          <img
            v-if="currentUser.profilePicture"
            :src="currentUser.profilePicture"
            alt="Profilbild"
            class="shadow-md w-10 h-10 rounded-full mt-0"
          >
          <svg
            v-else
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            id="profile"
            class="w-8 h-8"
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
        </div>
        <div class="ml-2 font-bold">{{ currentUser.username }}</div>
        <div class="ml-1">({{ currentUser.mmr }})</div>


      </div>
      <div
        v-if="isGameOver"
        @click="searchGame"
        to="/play"
        class="bg-indigo-500 hover:bg-indigo-600 text-white text-center font-bold py-2 px-4 my-8 rounded-xl shadow-md"
      >
        Neues Spiel</div>
      <div
        v-else
        class="py-8 font-black text-rose-400"
      >{{ isMyTurn ? "Du bist am Zug!" : "" }}
      </div>

    </div>



    <div class="right rounded-xl">
      <Chat
        v-if="game"
        @message-send="sendMessageOverSocket"
        :socket="socket"
        :username="currentUser.username"
        :opponent="opponentUsername"
      />
      <div
        v-else
        class="flex flex-col justify-center items-center h-full w-full"
      >
        <div class="m-6 font-bold">
          Spieler in Warteschlange: {{ playersInQueue }}
        </div>
        <button
          v-if="!game && !isInQueue"
          @click="searchGame"
          to="/play"
          class="bg-indigo-500 hover:bg-indigo-600 text-white text-center font-bold py-2 px-4 rounded-xl shadow-md"
        >
          Warteschlange beitreten
        </button>
        <button
          v-else-if="isInQueue"
          @click="cancelQueue"
          class="bg-rose-500 hover:bg-rose-600 text-white text-center font-bold py-2 px-4 rounded-xl shadow-md"
        >Abbrechen</button>
      </div>
    </div>
  </div>
</template>


<style scoped>
.container {
  display: flex;
  flex-direction: row;
  width: 80vw;
  height: 75vh;
  overflow: hidden;
}

.left {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-around;
  border: 1px solid #e5e5e5;
  margin-right: 2rem;
  background-color: white;
}

.right {
  flex: 1;
  background-color: rgb(255, 255, 255);
  min-width: 15em;
  border: 1px solid #e5e5e5;
}

#tic-tac-toe {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  border-radius: 12px;
}

.cell {
  width: 7vw;
  height: 7vw;
  border-radius: 12px;
  margin: 5px;
  background-color: #cceef2;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.8em;
  font-weight: 600;
  color: #548ada;
  cursor: pointer;
  user-select: none;
  transition: background-color 0.3s;
}

.cell:hover {
  background-color: #a1e0e9;
}

.cell:not(:empty) {
  pointer-events: none;
}
</style>
