import { WebSocket } from "ws";
import { INIT_GAME } from "./message";
import { Game } from "./Game";


export class GameManager{
    // @ts-ignore
    private games:Game[] = [];
    private isPending:WebSocket;
    private users:WebSocket[] = [];


     constructor(){
        this.games = [];
    }

     addUser(socket:WebSocket){
        this.users.push(socket)
    }

     removeUser(socket:WebSocket){
        this.users.filter((users)=>users !== socket)
    }

    private handleMessage(socket:WebSocket){
       socket.on("message",(data)=>{
        const message = JSON.parse(data.toString())

        if(message.type === INIT_GAME){
            if(this.isPending){
                
                const game = new Game(this.isPending,socket)

            } else {
                this.isPending = socket
            }
        }
       })

}
}