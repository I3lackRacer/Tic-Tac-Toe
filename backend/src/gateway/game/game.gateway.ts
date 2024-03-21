import {
    SubscribeMessage,
    WebSocketGateway,
    OnGatewayConnection,
    OnGatewayDisconnect,
    WebSocketServer, OnGatewayInit
} from '@nestjs/websockets';
import {Server, Socket} from 'socket.io';
import {UserService} from 'src/services/user/user.service';
import {GameService} from "../../services/game/game.service";
import {MakeMoveDTO} from "../../models/DTO/MakeMoveDTO";
import {InGameMassageDTO} from "../../models/DTO/InGameMassageDTO";

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
    @WebSocketServer()
    server: Server;

    constructor(
        private userService: UserService,
        private gameService: GameService
    ) { }

    afterInit(server: any) {
        this.gameService.setServer(server)
    }

    async handleConnection(client: Socket, ...args: any[]) {
        await this.gameService.getUserId(client).then(async userId => {
            const user = await this.userService.getUser(userId);
            if (!user) {
                client.disconnect()
                console.log(`Client ${client.id} disconnected because no user was found`)
                return
            }
            this.gameService.addNewConnection(user, client, args)
            console.log(`Client connected: ${client.id} + ${args} User: ${user.username}`);
        })
    }

    handleDisconnect(client: Socket) {
        const connection = this.gameService.getConnectionByClient(client);
        this.gameService.removeConnection(client)
        console.log(`Client disconnected: ${client.id} - User ${connection.user.username}`);
    }

    @SubscribeMessage('game.message')
    handleInGameMessage(client: Socket, payload: InGameMassageDTO): void {
        this.gameService.sendInGameMessage(client, payload)
    }

    @SubscribeMessage('search')
    handleSearch(client: Socket) {
        this.gameService.addToSearch(client)
        return null
    }

    @SubscribeMessage('game.move')
    handleMakeMove(client: Socket, payload: MakeMoveDTO): void {
        this.gameService.makeMove(client, payload);
    }
}
