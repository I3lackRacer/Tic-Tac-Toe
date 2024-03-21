import {ApiProperty} from "@nestjs/swagger";

export class JWTTokenDTO {

    @ApiProperty({
        example:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImVzZmV3ZndzZndlc2YiLCJzdWIiOjcsImlhdCI6MTcxMDYzMzc3NCwiZXhwIjoxNzExMjM4NTc0fQ.O7wVsbnxuQNQFKEODM4kjKoHfJX7KGqQzeSi8a32MiY",
        type: JWTTokenDTO,
        description: "The JWT-Token to identify the user"
    })
    public jwtToken: string;
    constructor(
        jwtToken: string
    ) {
        this.jwtToken = jwtToken;
    }
}