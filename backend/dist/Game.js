"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
const chess_js_1 = require("chess.js");
const message_1 = require("./message");
class Game {
    constructor(player1, player2, player1name, player2name) {
        this.player1 = player1;
        this.player2 = player2;
        this.board = new chess_js_1.Chess();
        this.moves = [];
        this.StartTime = new Date();
        this.moveCount = 0;
        this.Timer = 10 * 60 * 1000;
        this.player1.send(JSON.stringify({
            type: message_1.INIT_GAME,
            payload: "w",
            white: player1name,
            black: player2name
        }));
        this.player2.send(JSON.stringify({
            type: message_1.INIT_GAME,
            payload: "b",
            black: player2name,
            white: player1name
        }));
    }
    makeAMove(socket, move, color) {
        // 2 checks here
        // is this the users move?
        if (this.moveCount % 2 === 0 && this.player1 !== socket) {
            return;
        }
        if (this.moveCount % 2 === 1 && this.player2 !== socket) {
            return;
        }
        try {
            // update the board
            this.board.move(move);
        }
        catch (error) {
            return;
        }
        // checks if game is over or not
        if (this.board.isGameOver()) {
            this.player1.send(JSON.stringify({
                type: message_1.GAME_OVER,
                payload: {
                    winner: this.board.turn() === "w" ? "BLACK WON" : "WHITE WON"
                }
            }));
            this.player2.send(JSON.stringify({
                type: message_1.GAME_OVER,
                payload: {
                    winner: this.board.turn() === "w" ? "BLACK WON" : "WHITE WON"
                }
            }));
            return;
        }
        // push the move
        // moves valid or not
        try {
            if (this.moveCount % 2 === 0) {
                if (this.player2)
                    this.player2.send(JSON.stringify({
                        type: message_1.MOVE,
                        payload: move,
                        color
                    }));
            }
            else {
                if (this.player1)
                    this.player1.send(JSON.stringify({
                        type: message_1.MOVE,
                        payload: move,
                        color
                    }));
            }
        }
        catch (error) {
            console.log(error);
            return error;
        }
        this.moveCount++;
    }
    endGame() {
        this.player1.send(JSON.stringify({
            type: message_1.GAME_OVER,
            payload: {
                winner: this.board.turn() === "w" ? "BLACK WON" : "WHITE WON",
                color: this.board.turn() === "w" ? "b" : "w"
            }
        }));
        this.player2.send(JSON.stringify({
            type: message_1.GAME_OVER,
            payload: {
                winner: this.board.turn() === "w" ? "BLACK WON" : "WHITE WON",
                color: this.board.turn() === "w" ? "b" : "w"
            }
        }));
        return;
    }
}
exports.Game = Game;
