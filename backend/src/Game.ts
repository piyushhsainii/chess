import { Chess } from "chess.js";
import { WebSocket } from "ws"
import { CHAT, GAME_OVER, INIT_GAME, MOVE } from "./message";

export class Game {
    public player1:WebSocket;
    public player2:WebSocket;
    private board: Chess;
    private moves:string[];
    private StartTime : Date; 
    private moveCount : number
    private Timer : number

    constructor (player1:WebSocket,player2:WebSocket,player1name:string,player2name:string){
        this.player1 = player1;
        this.player2 = player2;
        this.board = new Chess();
        this.moves = []
        this.StartTime = new Date()
        this.moveCount = 0
        this.Timer = 10 * 60 * 1000
        this.player1.send(JSON.stringify({
            type:INIT_GAME,
            payload:"w",
            white:player1name,
            black:player2name
        }))

        this.player2.send(JSON.stringify({
            type:INIT_GAME,
            payload:"b",
            black:player2name,
            white:player1name
        }))
       }

    makeAMove(socket:WebSocket, move:{
            from:string,
            to:string
        },
        color:"b" | "w"
        ){

        // 2 checks here
        // is this the users move?
        if(this.moveCount % 2 === 0 && this.player1 !== socket){
            return;
        }
        if(this.moveCount % 2 === 1 && this.player2 !== socket){
            return;
        }
        try {
        // update the board
            this.board.move(move)
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
        // moves valid or not
      try {
        if(this.moveCount % 2 === 0){
            if (this.player2)
                this.player2.send(JSON.stringify({
                    type: MOVE,
                    payload: move,
                    color
                }))
        } else {
            if (this.player1)
                this.player1.send(JSON.stringify({
                    type: MOVE,
                    payload: move,
                    color
                }))
        }
    } catch (error) {
        console.log(error)
        return error
    }
    this.moveCount++
    }
    endGame(){
    this.player1.send(JSON.stringify({
        type:GAME_OVER,
        payload:{
            winner: this.board.turn() === "w" ? "BLACK WON" : "WHITE WON",
            color:this.board.turn() === "w" ? "b" : "w"
        }
    }))   
    this.player2.send(JSON.stringify({
        type:GAME_OVER,
        payload:{
            winner: this.board.turn() === "w" ? "BLACK WON" : "WHITE WON",
            color:this.board.turn() === "w" ? "b" : "w"
        }
    }))   
    return ;
    }
    sendChat(chat:string,color:{piece:"w"| "b"}){
                this.player2.send(JSON.stringify({
                    type: CHAT,
                    payload: {
                        chat:chat,
                        color
                    }
                }))
                this.player1.send(JSON.stringify({
                    type: CHAT,
                    payload: {
                        chat:chat,
                        color:color
                    }
                }))
    }

}