import { ApiProperty } from "@nestjs/swagger";

export class MakeMoveDTO {


    @ApiProperty({
        description: "The id of the game you are referencing",
        example: 1048
    })
    gameId: number

    @ApiProperty({
        description: "The x position of the field that the player want to make a move on",
        minimum: 0,
        maximum: 2,
        example: 2
    })
    xPos: number


    @ApiProperty({
        description: "The y position of the field that the player want to make a move on",
        minimum: 0,
        maximum: 2,
        example: 1
    })
    yPos: number
}