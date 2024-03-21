import {UserInfoDTO} from "./UserInfoDTO";
import {ApiProperty} from "@nestjs/swagger";

export class GameInfoDTO {
    @ApiProperty({
        description: "The id of the game you are referencing",
        example: 1048
    })
    public gameId: number

    @ApiProperty({
        description: "Information about user",
        example: {
            "id": 2,
            "username": "max",
            "mmr": 1008,
            "isAdmin": false
        }
    })
    public player1: UserInfoDTO

    @ApiProperty({
        description: "Information about user",
        example: {
            "id": 2,
            "username": "max",
            "mmr": 1008,
            "isAdmin": false
        }
    })
    public player2: UserInfoDTO
}