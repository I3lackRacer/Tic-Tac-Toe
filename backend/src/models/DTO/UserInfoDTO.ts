import { ApiProperty } from "@nestjs/swagger";
import { User } from "../db-models/User";

export class UserInfoDTO {

  @ApiProperty({
    description: "The id of the user",
    example: 1
  })
  id: number;

  @ApiProperty({
    description: "The username of the user",
    example: "Tom"
  })
  username: string;

  @ApiProperty({
    description: "The elo rating of the user",
    example: 1000
  })
  mmr: number;

  @ApiProperty({
    description: "Is set to true, if the user is an administrator",
    example: true
  })
  isAdmin: boolean;

  static fromUser(user: User): UserInfoDTO {
    const userInfoDTO = new UserInfoDTO();
    userInfoDTO.id = user.id;
    userInfoDTO.username = user.username;
    userInfoDTO.mmr = user.mmr;
    userInfoDTO.isAdmin = user.isAdmin;
    return userInfoDTO;
  }
}