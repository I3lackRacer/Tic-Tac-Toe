import { ApiProperty } from "@nestjs/swagger";

export class LoginDTO {

  @ApiProperty({
    description: "The username of the user",
    maxLength: 64,
    minLength: 2,
    example: "Tom"
  })
  username: string;

  @ApiProperty({
    description: "The password of the user",
    minLength: 8,
    maxLength: 72,
    example: "StrongPassw0rd!"
  })
  password: string;
}