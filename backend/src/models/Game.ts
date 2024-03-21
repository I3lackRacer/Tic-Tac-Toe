import {WSConnection} from "./WSConnection";
import {FieldStatus} from "./FieldStatus";

export class Game {

    private field: FieldStatus[][] = [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0]
    ]
    private isPlayer1Turn: boolean

    constructor(
        public player1: WSConnection,
        public player2: WSConnection
    ) {
        this.isPlayer1Turn = Math.random() % 1 == 0
    }

    makeMove(x: number, y: number, user: WSConnection) {
        if (this.player1 == user && !this.isPlayer1Turn || this.player2 == user && this.isPlayer1Turn) {
            return false
        }

        if (x < 0 || x >= this.field.length || y < 0 || y >= this.field.length) {
            return false
        }

        if (this.field[x][y] != FieldStatus.Empty) {
            return false
        }

        this.field[x][y] = user.user.id === this.player1.user.id ? FieldStatus.P1 : FieldStatus.P2
        this.isPlayer1Turn = !this.isPlayer1Turn;
        return true;
    }

    getField() {
        return this.field
    }

    // Check for full board
    checkForWin(): WSConnection | null {
        // Check rows
        for (let row = 0; row < 3; row++) {
            if (this.field[row][0] !== FieldStatus.Empty && this.field[row][0] === this.field[row][1] && this.field[row][1] === this.field[row][2]) {
                return this.field[row][0] === FieldStatus.P1 ? this.player1 : this.player2;
            }
        }

        // Check columns
        for (let col = 0; col < 3; col++) {
            if (this.field[0][col] !== FieldStatus.Empty && this.field[0][col] === this.field[1][col] && this.field[1][col] === this.field[2][col]) {
                return this.field[0][col] === FieldStatus.P1 ? this.player1 : this.player2;
            }
        }

        // Check diagonals
        if (this.field[0][0] !== FieldStatus.Empty && this.field[0][0] === this.field[1][1] && this.field[1][1] === this.field[2][2]) {
            return this.field[0][0] === FieldStatus.P1 ? this.player1 : this.player2;
        }
        if (this.field[0][2] !== FieldStatus.Empty && this.field[0][2] === this.field[1][1] && this.field[1][1] === this.field[2][0]) {
            return this.field[0][2] === FieldStatus.P1 ? this.player1 : this.player2;
        }

        // No win found
        return null;
    }

    getActivePlayerName() {
        return this.isPlayer1Turn ? this.player1.user.username : this.player2.user.username;
    }

    isUserInGame(connection: WSConnection) {
        return this.player1.client == connection.client || this.player2.client == connection.client;
    }

    isFieldFull() {
        for (const row of this.field) {
            for (const cell of row) {
                if (cell == FieldStatus.Empty)
                    return false
            }
        }

        return true
    }
}