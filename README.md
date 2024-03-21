## Websocket
### Sendable emits
- `search` To signal the server that you are searching for a game
```
<<empty>>
```
- `game.move` To send a move for a game to the server
```
MakeMoveDTO {
    gameId: number
    xPos: number
    yPos: number
}
```
- `game.message` Notifies you about a message that has been send in the game
```
InGameMassageDTO {
    gameId: number
    username: string
    message: string
}
```

### Receivable emits

- `search.count` Gives you the number of player in the queue
```
{
    count: this.inSearchQueue.sizeoo
}
```
- `search.list` ADMINS ONLY: Gives you information about who is searching for a game
```
[
    UserInfoDTO {
      id: number;
      username: string;
      mmr: number;
      isAdmin: boolean;
    }
]
```
- `game.list.info` ADMINS ONLY: Notifies you about the current games
```
[
    GameInfoDTO {
      gameId: number,
      player1: UserInfoDTO,
      player2: UserInfoDTO
    }
]

UserInfoDTO {
  id: number;
  username: string;
  mmr: number;
  isAdmin: boolean;
}
```
- `error` Notifies you about errors that occurred
```
{
    error: errorMsg
}
```
- `game.new` Notifies you about a new game that has been created for you and a partner that has been found
```
GameStatusDTO {
    gameId: number
    player1Username: string
    player2Username: string
    player1Id: number
    player2Id: number
    player1mmr: number
    player2mmr: number
    field: FieldStatus[][]
    currentUsername: string
}

FieldStatus {
    Empty = 0,
    P1 = 1,
    P2 = 2,
}
```
- `game.end` Notifies you that the game has ended
```
GameEndDTO {
    gameId: number
    winner: string
}
```
- `game.end.disconnected` Notifies you that the opponent has disconnected and the game has ended automatically
```
{
    gameId: gameId,
}
```
- `game.message` Notifies you about a message that has been send in the game
```
InGameMassageDTO {
    gameId: number
    username: string
    message: string
}
```
- `game.update` Notifies you about an update of your current game state
```
GameStatusDTO {
    gameId: number
    player1Username: string
    player2Username: string
    player1mmr: number
    player2mmr: number
    field: FieldStatus[][]
    currentUsername: string
}

FieldStatus {
    Empty = 0,
    P1 = 1,
    P2 = 2,
}
```

## API-Routes
### Frontend-Controller
The Frontend-Controller is responsible to make the Frontend available using `NestJS`

### Game-Controller
- `/api/v1/game` The Route used to reach calls related to the Game.


The Game-Controller sends data about the current Queues and how many people are currently searching for a match.

### User-Controller
- `/api/v1/user` The Route sends data about the User itself.

The User-Controller holds the routes for a User to successfully register, login and also edit his password as well as have his own profile picture. 
It also allows, should a User already be an Admin, to make someone else an Admin as well.
An Admin-User can also get information about every User that has created an account on the website.

### History-Controller
- `/api/v1/history` The Route gives the specific User, data about its previous matches.

The History-Controller allows the User to look into his previous matches.
It gives the User a list of all previously played matches. 
The User can also get his current win-loose rating.

## Structure

Our Structure separates the `Controller`, `Services`, `Models`,`Middleware` & `Gateway` into dedicates folders.
Each folder contains a dedicated file of a component.

### Controller
The Controller directory holds the following folders for their respective component:
- frontend
- games
- history
- user

The Controllers contain all routes and implements the needed Services for the logic.

### Services
The Services directory holds the following folders for their respective component:

- auth
- encrypt
- game
- game-result
- seeder
- user

The Services implement the Logic which the Controllers will use.
They also implement the connection to the database and send out queries to get the needed data.

### Middleware
The Middleware directory holds the following folders: 

- is-Admin
- is-logged-in-guard

The Middleware is used in the Controller to make sure that Unauthorized access is forbidden.
It also makes sure that some routes can only be called, if the User is an Admin.

### Gateway
The Gateway directory holds the following folder:

- game

The Gateway contains our Websocket. It's responsible for handling incoming signals and also sending out signals. 

### Models
The Models File contains the following files and folders:

- db-models
- DTO
- FieldStatus.ts
- Game.ts
- WSConnection.ts

The Models contain all needed DTOs that are returned as a response or used in requests.
It also contains the Database structures.
At last, it also contains the simple game Logic which is accessed by our services to check if certain game conditions have been met.

- The `DTO` & `db-models` folder contain, like their names suggest, the models needed. 
  - The `DTO` folder contains the structures of the request- and response-bodies for the Controllers and Gateway.
  - The `db-models` folder holds the Database Models which represents the `entities` of our SQLite database.