import {FieldStatus} from "../FieldStatus";
import {ApiProperty} from "@nestjs/swagger";

export class GameStatusDTO {

    @ApiProperty({
        description: "The id of the game you are referencing",
        example: 1048
    })
    gameId: number

    @ApiProperty({
        description: "The username of the player",
        example: "Tom"
    })
    player1Username: string

    @ApiProperty({
        description: "The username of the player",
        example: "Tom"
    })
    player2Username: string

    @ApiProperty({
        description: "The elo rating of the player",
        example: 1000
    })
    player1mmr: number

    @ApiProperty({
        description: "The elo rating of the player",
        example: 1000
    })
    player2mmr: number

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
    field: FieldStatus[][]

    @ApiProperty({
        description: "The username of the currently active player",
        example: "Tom"
    })
    currentUsername: string;

    @ApiProperty({
        description: "The id of the user",
        example: 1
    })
    player1Id: number;


    @ApiProperty({
        description: "The id of the user",
        example: 2
    })
    player2Id: number;
}