import {GameResult} from "../db-models/GameResult";
import {ApiProperty} from "@nestjs/swagger";
import {UserInfoDTO} from "./UserInfoDTO";

export class GameResultDTO {
    @ApiProperty({
        description: "The unique identifier for the game result",
        example: 1
    })
    id: number;

    @ApiProperty({
        description: "The unique identifier of the player",
        example: 1
    })
    player1: number;

    @ApiProperty({
        description: "The username of the player",
        example: "Tom"
    })
    player1Name: string;

    @ApiProperty({
        description: "The elo rating of the player",
        example: 1000
    })
    player1mmr: number;

    @ApiProperty({
        description: "The unique identifier of the player",
        example: 1
    })
    player2: number;

    @ApiProperty({
        description: "The username of the player",
        example: "Tom"
    })
    player2Name: string;

    @ApiProperty({
        description: "The elo rating of the player",
        example: 1000
    })
    player2mmr: number;

    @ApiProperty({
        description: "The result of this game",
        example: "P1_WON"
    })
    result: string;

    static ofGameResult(gameResult: GameResult, allUsers: UserInfoDTO[]) {
        const gameResultDTO = new GameResultDTO();

        gameResultDTO.player1Name = allUsers.find(user => user.id === gameResult.player1)?.username || '';
        gameResultDTO.player2Name = allUsers.find(user => user.id === gameResult.player2)?.username || '';

        gameResultDTO.id = gameResult.id
        gameResultDTO.player1 = gameResult.player1
        gameResultDTO.player2 = gameResult.player2
        gameResultDTO.player1mmr = gameResult.player1mmr
        gameResultDTO.player2mmr = gameResult.player2mmr
        gameResultDTO.result = gameResult.result
        return gameResultDTO;
    }
}