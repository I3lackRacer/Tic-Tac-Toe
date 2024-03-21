import * as process from "process";
import * as crypto from "crypto";
export const jwtConstants = {
    secret: process.env.jwtToken || crypto.randomBytes(512).toString('hex')
}