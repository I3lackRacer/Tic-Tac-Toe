import {Injectable} from '@nestjs/common';
import {JwtService} from '@nestjs/jwt'

@Injectable()
export class AuthService {

    constructor(
        private jwtService: JwtService
    ) {
    }

    async signIn(id: number, username: string) {
        return await this.jwtService.signAsync({username: username, sub: id})
    }

    getUserId(jwtToken: string) {
        try {
            const decoded = this.jwtService.verify(jwtToken);
            if (decoded.sub && !isNaN(Number(decoded.sub))) {
                return Number(decoded.sub);
            } else {
                throw new Error('UserId not found or invalid in the token');
            }
        } catch (e) {
            return null;
        }
    }
}
