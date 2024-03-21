import {Injectable} from '@nestjs/common';
import {UserService} from "../user/user.service";
import {GameService} from "../game/game.service";
import {GameResultService} from "../game-result/game-result.service";
import {CreateUserDTO} from "../../models/DTO/CreateUserDTO";
import {GameResult} from "../../models/db-models/GameResult";
import {EndResult} from "../../models/db-models/EndResult";
import * as process from "process";
import * as crypto from "crypto";

const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789~`!@#$%^&*()_-+={[}]|:;"\'<,>.?/';

@Injectable()
export class SeederService {


    constructor(
        private userService: UserService,
        private gameService: GameService,
        private gameResultService: GameResultService
    ) {
    }


    generateAdminPassword() {
        let password = '';
        for (let i = 0; i < 16; i++) {
            const randomIndex = Math.floor(Math.random() * charset.length);
            password += charset[randomIndex];
        }
        console.warn("No 'adminPW' env was provided to a new password has been generated: ", password)
        return password
    }

    async seedDemoUsers() {
        if ((await this.userService.getAllUsers()).length != 0) {
            console.log("Demo data already loaded. Skipping")
            return
        }
        const adminUser = new CreateUserDTO();
        adminUser.username = 'admin'

        adminUser.password = process.env.adminPW || this.generateAdminPassword()
        await this.userService.register(adminUser)
        console.log("Admin data finished loading")
    }
}
