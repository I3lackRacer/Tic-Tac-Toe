import {Injectable, CanActivate, ExecutionContext, UnauthorizedException} from '@nestjs/common';
import {Observable} from 'rxjs';
import {UserService} from "../../services/user/user.service";
import {AuthService} from "../../services/auth/auth.service";

@Injectable()
export class IsAdminGuard implements CanActivate {
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

        return this.userService.isUserAdmin(userId).then(async isUserAdmin => {
            if (!isUserAdmin) {
                throw new UnauthorizedException('Access denied');
            }

            request.headers['user-id'] = userId
            return true;
        })
    }
}
