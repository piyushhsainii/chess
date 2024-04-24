"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
const chess_js_1 = require("chess.js");
const message_1 = require("./message");
class Game {
    constructor(player1, player2) {
        this.player1 = player1;
        this.player2 = player2;
        this.board = new chess_js_1.Chess();
        this.moves = [];
        this.StartTime = new Date();
        this.moveCount = 0;
        this.player1.send(JSON.stringify({
            type: message_1.INIT_GAME,
            payload: "WHITE"
        }));
        this.player2.send(JSON.stringify({
            type: message_1.INIT_GAME,
            payload: "BLACK"
        }));
    }
    makeAMove(socket, move) {
        // 2 checks here
        // is this the users move?
        if (this.moveCount % 2 === 0 && this.player1 !== socket) {
            return;
        }
        if (this.moveCount % 2 === 1 && this.player2 !== socket) {
            return;
        }
        // moves valid or not
        try {
            this.board.move(move);
            this.moveCount++;
        }
        catch (error) {
            return;
        }
        // checks if game is over or not
        if (this.board.isGameOver()) {
            this.player1.send(JSON.stringify({
                type: message_1.GAME_OVER,
                payload: {
                    winnder: this.board.turn() === "w" ? "BLACK WON" : "WHITE WON"
                }
            }));
            this.player2.send(JSON.stringify({
                type: message_1.GAME_OVER,
                payload: {
                    winnder: this.board.turn() === "w" ? "BLACK WON" : "WHITE WON"
                }
            }));
            return;
        }
        // push the move
        // update the board
        if (this.moveCount % 2 === 0) {
            this.player1.send(JSON.stringify({
                type: message_1.MOVE,
                payload: move
            }));
        }
        else {
            this.player2.send(JSON.stringify({
                type: message_1.MOVE,
                payload: move
            }));
        }
    }
}
exports.Game = Game;
