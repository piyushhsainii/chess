import { WebSocketServer } from 'ws'
import { GameManager } from './GameManager'
import { config } from 'dotenv'

config()
const port = parseInt(process.env.PORT!)

const wss = new WebSocketServer({port: port || 8080})
const gameManager = new GameManager()
wss.on("connection",(ws)=>{
     
    ws.on("error",(error)=>{
        console.log(error)
    })
    // sending socket into gameManagerClass on connection
    gameManager.addUser(ws)

    ws.on("close",()=> gameManager.removeUser(ws) )
})
