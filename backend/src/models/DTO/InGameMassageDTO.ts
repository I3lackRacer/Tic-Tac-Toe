import { ApiProperty } from "@nestjs/swagger"

export class InGameMassageDTO {

    @ApiProperty({
        description: "The id of the game you are referencing",
        example: 1048
    })
    gameId: number


    @ApiProperty({
        description: "The username of the player",
        example: "Tom"
    })
    username: string

    @ApiProperty({
        description: "The massage name of the player",
        example: "Hello World!"
    })
    message: string
}