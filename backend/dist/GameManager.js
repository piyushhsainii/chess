"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameManager = void 0;
const message_1 = require("./message");
const Game_1 = require("./Game");
class GameManager {
    constructor() {
        this.games = [];
        this.users = [];
        this.games = [];
        this.isPending = null;
        this.users = [];
        this.player1Name = '';
        this.player2Name = '';
    }
    addUser(socket) {
        this.users.push(socket);
        this.gameHandler(socket);
    }
    removeUser(socket) {
        this.users.filter((users) => users !== socket);
    }
    gameHandler(socket) {
        socket.on("message", (data) => {
            const message = JSON.parse(data.toString());
            if (message.type === message_1.INIT_GAME) {
                if (this.isPending) {
                    // Initialises the game
                    this.player2Name = message.name;
                    const game = new Game_1.Game(this.isPending, socket, this.player1Name, this.player2Name);
                    this.games.push(game);
                    this.isPending = null;
                }
                else {
                    this.player1Name = message.name;
                    this.isPending = socket;
                }
            }
            if (message.type === message_1.MOVE) {
                const game = this.games.find((game) => game.player1 === socket || game.player2 === socket);
                if (game) {
                    game.makeAMove(socket, message.payload.move, message.payload.color);
                }
            }
            if (message.type === message_1.GAME_OVER) {
                const game = this.games.find((game) => game.player1 === socket || game.player2 === socket);
                if (game) {
                    game.endGame();
                }
            }
        });
    }
}
exports.GameManager = GameManager;
