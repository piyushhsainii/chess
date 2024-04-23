import { WebSocket } from "ws"

export class Game {
    private player1:WebSocket;
    private player2:WebSocket;
    private board:string;
    private moves:string[];
    private StartTime : Date


    constructor (player1:WebSocket,player2:WebSocket){
        this.player1 = player1
        this.player2 = player2
       }

    makeAMove(socket:WebSocket, move:string){
        // 2 checks here
        // is this the users move?
        // moves valid or not

        // checks if game is over or not
        // push the move
        // update the board
    }

}