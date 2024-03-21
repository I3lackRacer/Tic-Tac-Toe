import {Module} from "@nestjs/common";
import {UserController} from "./controller/user/user.controller";
import {TypeOrmModule} from "@nestjs/typeorm";
import {User} from "./models/db-models/User";
import {EncryptService} from "./services/encrypt/encrypt.service";
import {ConfigModule} from "@nestjs/config";
import {UserService} from "./services/user/user.service";
import {AuthService} from "./services/auth/auth.service";
import {AuthModule} from "./services/auth/auth.module";
import {GameService} from "./services/game/game.service";
import {GameGateway} from "./gateway/game/game.gateway";
import {GameResult} from "./models/db-models/GameResult";
import {GameResultService} from "./services/game-result/game-result.service";
import {HistoryController} from "./controller/history/history.controller";
import {GameController} from "./controller/games/game.controller";
import {FrontendController} from "./controller/frontend/frontend.controller";
import {ServeStaticModule} from "@nestjs/serve-static";
import {join} from "path";
import {SeederService} from "./services/seeder/seeder.service";

@Module({
    imports: [
        ServeStaticModule.forRoot({
            rootPath: join(__dirname, '..', '..', 'frontend', 'dist'),
        }),
        ConfigModule.forRoot({
            envFilePath: ".env"
        }),
        AuthModule,
        TypeOrmModule.forRoot({
            type: "sqlite",
            database: "./db.sqlite",
            entities: [User, GameResult],
            synchronize: true
        }),
    ],
    providers: [
        SeederService,
        EncryptService,
        UserService,
        AuthService,
        GameService,
        GameGateway,
        GameResultService,
        Map,
        Set,
        Array
    ],

    controllers: [UserController, HistoryController, GameController, FrontendController]
})
export class AppModule {
    constructor() {
        console.log(join(__dirname, '..', '..', 'frontend', 'dist'))
    }
}
