import Cookies from "js-cookie"
import { ref } from "vue"

export interface Game {
  gameId: number
  player1Username: string
  player2Username: string
  player1mmr: number
  player2mmr: number
  player1Id: number
  player2Id: number
  field: FieldStatus[][]
  currentUsername: string
}

export enum FieldStatus {
  Empty = 0,
  P1 = 1,
  P2 = 2,
}

export function makeMoveOnBoard (row: number, col: number, move: FieldStatus, board: FieldStatus[][]): FieldStatus[][] {
  if (board[row][col] !== 0) {
    return board
  }

  board[row][col] = move
  return board
}

export async function fetchQueueCount (): Promise<number> {
  try {
    const jwtToken = Cookies.get('jwtToken') // Assuming you're using js-cookie or a similar library

    if (!jwtToken) {
      throw new Error('Authentication token not found. Please login first.')
    }

    // Make a GET request to the user endpoint
    const response = await fetch('/api/v1/game/queue/count', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${jwtToken}`, // Use the JWT token for authorization
        'Content-Type': 'application/json',
      },
    })
    // Check if the response was successful
    if (!response.ok) {
      throw new Error('Failed to fetch user data. Please check your authentication token.')
    }
    const count = await response.json()
    return count

  } catch (error: any) {
    console.error('Error:', error.message)
    return 0
  }
  return 0
}