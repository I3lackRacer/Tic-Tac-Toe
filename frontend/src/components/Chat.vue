<script
  setup
  lang="ts"
>
import type { Socket } from 'socket.io-client'
import { onMounted, ref, watchEffect, type Ref } from 'vue'

export interface Message {
  username: string
  message: string
  time: Date
}

// add emits
const emit = defineEmits<{
  (e: 'messageSend', username: string, messageText: string): void
}>()

const props = defineProps<{
  socket: Socket
  username: string
  opponent: string
}>()


const message = ref('')
const output = ref<Message[]>([])


onMounted(() => {
  props.socket.on('game.message', (data) => {
    if (data.username !== props.username) {
      output.value.push({
        username: data.username,
        message: data.message,
        time: new Date()
      })
    }

  })
  props.socket.on('game.end', (data) => {
    console.log("Game ended.: ", data)
    output.value.push({
      username: "server",
      message: `${data.winner != "It's a draw." ? "Winner: " + data.winner : data.winner}`,
      time: new Date()
    })
  })
  props.socket.on('game.end.disconnected', (data) => {
    output.value.push({
      username: "server",
      message: "Game ended due to disconnect.",
      time: new Date()
    })
  })
})

const sendMessage = async () => {
  if (!message.value || message.value === "") return
  // append message to the output
  output.value.push({
    username: props.username,
    message: message.value,
    time: new Date()
    // emit to parent
  })
  emit('messageSend', props.username, message.value)

  // clear the input
  message.value = ''
}
</script>

<template>
  <div class="chat-container">
    <div id="chat">
      <h2>Chat {{ opponent ? "mit " + opponent : "" }}</h2>
      <div id="chat-window">
        <div id="output">
          <div
            v-for="(msg, index) in output"
            :key="index"
            :class="{ 'message': true, 'message-own': msg.username === username, 'message-other': msg.username !== username, 'font-black text-rose-600': msg.username === 'server' }"
          >
            <p>{{ msg.message }}</p>
            <span class="timestamp">{{ new Date(msg.time).toLocaleTimeString([], {
        hour:
          '2-digit', minute: '2-digit', hour12: false
      }) }}</span>
          </div>
        </div>
      </div>
      <div class="message-input-container">
        <div class="input-wrapper">
          <input
            id="message"
            type="text"
            placeholder="Message"
            v-model="message"
            @keyup.enter="sendMessage"
          />
        </div>
        <button
          id="send"
          @click="sendMessage"
        >
          <!-- SVG content remains the same -->
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M2 21L23 12L2 3V10L17 12L2 14V21Z"
              fill="#ffffff"
            />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>



<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  border-radius: 10px;
  overflow: hidden;
  background-color: #ca1313;
}

h2 {
  font-size: 28px;
  font-weight: 600;
  color: #333;
  padding: 20px 30px;
  margin: 0;
  background-color: #fff;
  border-bottom: 1px solid #ddd;
}

h3 {
  font-size: 28px;
  font-weight: 600;
  color: #333;
  padding: 20px 30px;
  margin: 0;
  background-color: #fff;
  text-align: center;
  border-bottom: 1px solid #ddd;
}


.message-input-container {
  display: flex;
  align-items: center;
  position: relative;
  background: #ffffff;
  padding-right: 50px;
}

input#message {
  flex-grow: 1;
  border: 2px solid #e0e0e0;
  border-radius: 22px;
  padding: 10px 20px;
  margin: 10px;
  outline: none;
  background: #fff;
  color: #333;
}

button#send {
  background: #30bfbf;
  border: none;
  padding: 0;
  border-radius: 50%;
  cursor: pointer;
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

button#send svg {
  width: 24px;
  height: 24px;
}

button#send:hover {
  background: #28a6a6;
}

button#send:active {
  background: #1a7a7a;
}

input {
  background: #fff;
  border-bottom: 2px solid #ddd;
  outline: none;
}

input:focus {
  border-bottom-color: #a1e0e9;
}

button {
  cursor: pointer;
}


#chat {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  max-width: 100%;
  position: relative;
}

#chat-window {
  flex-grow: 1;
  overflow-y: auto;
  background: #ffffff;
  padding: 10px;
  height: 0;
  min-height: 0;

}

#output .message {
  display: flex;
  flex-direction: column;
  padding: 10px;
}

.message-other {
  align-items: flex-start;
}

.message-own {
  align-items: flex-end;
}

.message p {
  background: #d5f2f7;
  padding: 10px 12px;
  border-radius: 7.5px;
  max-width: 60%;
  box-shadow: 0 1px 0.5px rgba(0, 0, 0, 0.13);
  margin: 0 0 2px 0;
}

.timestamp {
  font-size: 0.75rem;
  color: #999;
  margin-top: 2px;
}

#output {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.input-wrapper {
  position: relative;
  flex-grow: 1;
  margin: 10px;
  margin-right: 30px;

}

input#message {
  width: 100%;
  /* Add this to make the input take the full width of the .input-wrapper */
  border: 2px solid #e0e0e0;
  border-radius: 22px;
  padding: 10px 20px;
  margin: 10px;
  outline: none;
  background: #fff;
  color: #333;
}
</style>
