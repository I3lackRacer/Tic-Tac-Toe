import {
    Controller,
    Get,
    HttpStatus, Param, Req, UseGuards
} from "@nestjs/common";
import {ApiFoundResponse, ApiHeader, ApiProperty, ApiResponse, ApiSecurity, ApiTags} from "@nestjs/swagger";
import {UserService} from "../../services/user/user.service";
import {IsLoggedInGuard} from "../../middleware/is-logged-in-guard/is-logged-in-guard.service";
import {GameResultService} from "../../services/game-result/game-result.service";
import {GameResultDTO} from "../../models/DTO/GameResultDTO";
import {User} from "../../models/db-models/User";
import {WinLoseDTO} from "../../models/DTO/WinLoseDTO";
import {IsAdminGuard} from "../../middleware/is-admin/is-admin-guard.service";
import {UserInfoDTO} from "../../models/DTO/UserInfoDTO";

@Controller("/api/v1/history")
@ApiTags('history')
export class HistoryController {

    constructor(
        private userService: UserService,
        private resultService: GameResultService,
    ) {
    }

    @Get("/all/:id")
    @ApiSecurity("Bearer")
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Returns game history of specific player',
        type: GameResultDTO,
        isArray: true
    })
    @ApiFoundResponse({description: "User not found"})
    @UseGuards(IsAdminGuard)
    async getGameHistoryOfSpecificPlayer(@Req() req: Request, @Param('id') id: number): Promise<GameResultDTO[]> {
        await this.userService.getUsersById(id)
        const allUsers: UserInfoDTO[] = await this.userService.getAllUsers()
        const result: GameResultDTO[] = []
        for (const gameResult of await this.resultService.getUserMatchesOfUser(id)) {
            result.push(GameResultDTO.ofGameResult(gameResult, allUsers))
        }
        return result
    }

    @Get("/all")
    @ApiSecurity("Bearer")
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Returns history of own game results',
        type: GameResultDTO,
        isArray: true
    })
    @UseGuards(IsLoggedInGuard)
    async getGameHistory(@Req() req: Request): Promise<GameResultDTO[]> {
        const user: User = await this.userService.getUserByRequest(req)
        const allUsers: UserInfoDTO[] = await this.userService.getAllUsers()
        const result: GameResultDTO[] = []
        for (const gameResult of await this.resultService.getUserMatchesOfUser(user.id)) {
            result.push(GameResultDTO.ofGameResult(gameResult, allUsers))
        }
        return result
    }

    @Get("/win-lose-rate")
    @ApiResponse({status: HttpStatus.OK, description: 'Returns Win Lose Rate', type: WinLoseDTO})
    @UseGuards(IsLoggedInGuard)
    async getWinLoseRate(@Req() req: Request): Promise<WinLoseDTO> {
        const user: User = await this.userService.getUserByRequest(req)
        const winLoseDTO = new WinLoseDTO();
        winLoseDTO.losses = await this.resultService.getUserMatchesLossesOfUserCount(user.id);
        winLoseDTO.wins = await this.resultService.getUserMatchesWinsOfUserCount(user.id);
        winLoseDTO.total = await this.resultService.getUserMatchesTotalOfUserCount(user.id);
        winLoseDTO.draws = winLoseDTO.total - winLoseDTO.wins - winLoseDTO.losses;
        winLoseDTO.winLoseRate = ((winLoseDTO.wins + 0.5 * winLoseDTO.draws) / winLoseDTO.total) * 100
        return winLoseDTO
    }
}
