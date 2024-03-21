import {ApiProperty} from "@nestjs/swagger";

export class GameEndDTO {

    @ApiProperty({
        description: "The id of the game you are referencing",
        example: 1048
    })
    gameId: number


    @ApiProperty({
        description: "The Username of the winner of the game. Or 'Draw' in case of a tie",
        example: "Tom"
    })
    winner: string
}