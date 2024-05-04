import { WebSocket } from "ws";
import { CHAT, GAME_OVER, INIT_GAME, MOVE } from "./message";
import { Game } from "./Game";


export class GameManager{
    private games:Game[] = [];
    private isPending:WebSocket | null;
    private users:WebSocket[] = [];
    private player1Name:string;
    private player2Name:string;

     constructor(){
        this.games = [];
        this.isPending = null
        this.users = []
        this.player1Name = ''
        this.player2Name = ''
    }

     addUser(socket:WebSocket){
        this.users.push(socket)
        this.gameHandler(socket)
    }

     removeUser(socket:WebSocket){
        this.users.filter((users)=>users !== socket)
    }

    private gameHandler(socket:WebSocket){
        socket.on("message",(data)=>{
        const message = JSON.parse(data.toString())
            console.log(message,"message in backend")

        if(message.type === INIT_GAME){
            console.log("init game from backend")
            if(this.isPending){
                // Initialises the game
                this.player2Name = message.name
                const game = new Game(this.isPending,socket, this.player1Name, this.player2Name)
                this.games.push(game)
                this.isPending = null

            } else {
                this.player1Name = message.name
                this.isPending = socket 
            }
        }

        if(message.type === MOVE){
            const game = this.games.find((game)=>game.player1 === socket || game.player2 ===socket)
            if(game){
                game.makeAMove(socket,message.payload.move,message.payload.color)
            } 
        }

        if(message.type === GAME_OVER){
            const game = this.games.find((game)=>game.player1 === socket || game.player2 ===socket)
            if(game){
                game.endGame()
            }
        }

        if(message.type === CHAT){
            const game = this.games.find((game)=>game.player1 === socket || game.player2 ===socket)
            if(game){
                game.sendChat(message.payload.chat, message.payload.color)
            }
        }
       })

}
}