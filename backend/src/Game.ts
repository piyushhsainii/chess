import { Chess } from "chess.js";
import { WebSocket } from "ws"
import { GAME_OVER, INIT_GAME, MOVE } from "./message";

export class Game {
    public player1:WebSocket;
    public player2:WebSocket;
    private board: Chess;
    private moves:string[];
    private StartTime : Date;
    private moveCount : number


    constructor (player1:WebSocket,player2:WebSocket){
        this.player1 = player1;
        this.player2 = player2;
        this.board = new Chess();
        this.moves = []
        this.StartTime = new Date()
        this.moveCount = 0
        this.player1.send(JSON.stringify({
            type:INIT_GAME,
            payload:"WHITE"
        }))

        this.player2.send(JSON.stringify({
            type:INIT_GAME,
            payload:"BLACK"
        }))
       }

    makeAMove(socket:WebSocket, move:{
        from:string,
        to:string
    }){

        // 2 checks here
        // is this the users move?
        if(this.moveCount % 2 === 0 && this.player1 !== socket){
            return;
        }
        if(this.moveCount % 2 === 1 && this.player2 !== socket){
            return;
        }
        // moves valid or not
        try {
            this.board.move(move)
            this.moveCount++
         } catch (error) {
            return
        }
        // checks if game is over or not
        if(this.board.isGameOver()){
         this.player1.send(JSON.stringify({
            type:GAME_OVER,
            payload:{
                winner: this.board.turn() === "w" ? "BLACK WON" : "WHITE WON"
            }
         }))   
         this.player2.send(JSON.stringify({
            type:GAME_OVER,
            payload:{
                winner: this.board.turn() === "w" ? "BLACK WON" : "WHITE WON"
            }
         }))   
         return ;
        }

        // push the move
        // update the board
        if(this.moveCount % 2 === 0){
            this.player1.send(JSON.stringify({
                type:MOVE,
                payload:move
            }))
        } else {
            this.player2.send(JSON.stringify({
                type:MOVE,
                payload:move
            }))
        }
    }

}