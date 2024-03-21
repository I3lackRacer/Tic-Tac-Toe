import {CanActivate, ExecutionContext, Injectable, UnauthorizedException} from '@nestjs/common';
import {Observable} from 'rxjs';
import {UserService} from "../../services/user/user.service";
import {AuthService} from "../../services/auth/auth.service";

@Injectable()
export class IsLoggedInGuard implements CanActivate {

    constructor(
        private userService: UserService,
        private authService: AuthService
    ) {
    }

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest();
        const authorization: string = request.headers.authorization;

        if (!authorization) {
            throw new UnauthorizedException('Authorization is required');
        }

        const token = authorization.replace("Bearer ", "");
        if (!token) {
            throw new UnauthorizedException('Authorization failed');
        }

        const userId = this.authService.getUserId(token)

        if (!userId) {
            throw new UnauthorizedException('Access denied');
        }

        return this.userService.userExists(userId).then(async userExists => {
            if (!userExists) {
                throw new UnauthorizedException('Access denied');
            }

            request.headers['user-id'] = userId
            return true;
        });
    }

}

