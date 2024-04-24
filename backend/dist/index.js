"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const GameManager_1 = require("./GameManager");
const wss = new ws_1.WebSocketServer({ port: 8080 });
const gameManager = new GameManager_1.GameManager();
wss.on("connection", (ws) => {
    ws.on("error", (error) => {
        console.log(error);
    });
    // sending socket into gameManagerClass on connection
    gameManager.addUser(ws);
    ws.send("I am connected");
    ws.on("close", () => gameManager.removeUser(ws));
});
