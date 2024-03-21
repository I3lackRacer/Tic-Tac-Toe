import { ApiProperty } from "@nestjs/swagger";

export class UpdatePasswordDTO {
  @ApiProperty({
    description: "The new password the user will be given",
    example: "AVeryMuchBetterPasswordThatWillNeverBeBroken1."
  })
  password: string;
}