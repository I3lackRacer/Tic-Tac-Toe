import { Controller, Get, HttpStatus, UseGuards } from "@nestjs/common";
import { GameService } from "../../services/game/game.service";
import { IsAdminGuard } from "../../middleware/is-admin/is-admin-guard.service";
import { UserInfoDTO } from "../../models/DTO/UserInfoDTO";
import {ApiResponse, ApiTags} from "@nestjs/swagger";

@Controller('/api/v1/game')
@ApiTags('game')
export class GameController {


  constructor(private gameService: GameService) {
  }

  @Get("/queue")
  @UseGuards(IsAdminGuard)
  @ApiResponse({status: HttpStatus.OK, description: 'Returns all users in the game queue', type: UserInfoDTO, isArray: true})
  async getAllUsersInGameQueue() :Promise<UserInfoDTO[]>{
    return this.gameService.getUserInQueue()
  }

  @Get("/queue/count")
  @ApiResponse({status: HttpStatus.OK,description: 'Returns a number of all Users currently in game',type: Number})
  async getAllUsersInQueueCount(): Promise<number> {
    return this.gameService.getUserInQueueCount()
  }
}
