import { WebSocket } from "ws";
import { INIT_GAME, MOVE } from "./message";
import { Game } from "./Game";


export class GameManager{
    private games:Game[] = [];
    private isPending:WebSocket | null;
    private users:WebSocket[] = [];


     constructor(){
        this.games = [];
        this.isPending = null
        this.users = []
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

        if(message.type === INIT_GAME){
            if(this.isPending){
                // Initialises the game
                const game = new Game(this.isPending,socket)

                this.games.push(game)
                this.isPending = null

            } else {
                this.isPending = socket 
            }
        }

        if(message.type === MOVE){
            const game = this.games.find((game)=>game.player1 === socket || game.player2 ===socket)
            if(game){
                game.makeAMove(socket,message.payload.move)
            }
        }

       })

}
}