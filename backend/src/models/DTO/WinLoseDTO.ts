import {ApiProperty} from "@nestjs/swagger";

export class WinLoseDTO {

    @ApiProperty({
        description: "The wins of the user",
        example: 100
    })
    wins: number


    @ApiProperty({
        description: "The losses of the user",
        example: 100
    })    losses: number


    @ApiProperty({
        description: "The Wins/Lose Rate of the user",
        example: 50.00
    })
    winLoseRate: number

    @ApiProperty({
        description: "The sum of all played games of the user",
        example: 250
    })
    total: number

    @ApiProperty({
        description: "The total number of games that ended in a tie",
        example: 50
    })
    draws: number;
}