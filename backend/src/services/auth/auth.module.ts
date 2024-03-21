import { Module } from '@nestjs/common';
import {JwtModule} from "@nestjs/jwt";
import {UserController} from "../../controller/user/user.controller";
import { AuthService } from './auth.service';
import {UserService} from "../user/user.service";
import {EncryptService} from "../encrypt/encrypt.service";
import {jwtConstants} from "./constant";

@Module({
    controllers: [UserController],
    providers: [AuthService, UserService, EncryptService],
    imports: [
        JwtModule.register({
            secret: jwtConstants.secret,
            global: true,
            signOptions: {expiresIn: '7d'}
        })
    ]
})
export class AuthModule {}
