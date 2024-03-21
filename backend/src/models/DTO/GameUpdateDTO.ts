import {FieldStatus} from "../FieldStatus";
import {Game} from "../Game";
import {ApiProperty} from "@nestjs/swagger";

export class GameUpdateDTO {


    @ApiProperty({
        description: "The current status of the game field",
        example: [
            [
                [0,0,1]
            ],
            [
                [2,0,0]
            ],
            [
                [0,0,1]
            ]
        ],
    })
    public field: FieldStatus[][]

    @ApiProperty({
        description: "The username if the currently active player",
        example: 1000
    })
    public activePlayerName: string

    static fromGame(game: Game) {
        const gameUpdateDTO = new GameUpdateDTO(

        );
        gameUpdateDTO.field = game.getField()
        gameUpdateDTO.activePlayerName = game.getActivePlayerName()
        return gameUpdateDTO
    }
}