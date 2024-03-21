import {User} from "./db-models/User";
import {Socket} from "socket.io";

export class WSConnection {
    user: User
    client: Socket
    args: any


    constructor(user: User, client: Socket, args: any) {
        this.user = user;
        this.client = client;
        this.args = args;
    }
}