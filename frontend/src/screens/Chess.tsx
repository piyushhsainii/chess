import { useEffect, useState } from "react"
import { useSocket } from "../hooks/useSocket"
import { Chess, Square } from 'chess.js'
import { GAME_OVER, INIT_GAME, MOVE } from "../messages/message"

const ChessBoard = () => {

  const socket = useSocket()
  const [chess, setChess] = useState(new Chess())
  const [board, setBoard] = useState(chess.board())
  const [from, setFrom] = useState<Square | null>(null)

  const initGame = () => {
    // Initialises the game
    socket?.send(JSON.stringify({
      type: INIT_GAME
    }))
  }

  useEffect(() => {

    if (!socket) {
      return;
    }

  socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log(message,"in message event")

      switch (message.type) {
        case INIT_GAME:
          console.log("init")
          setBoard(chess.board())
          break;
        case MOVE:
          console.log(message)
          chess.move(message.payload)
          setBoard(chess.board())
          break;
        case GAME_OVER:
          console.log("Game Over")
          break;
      }
    }
  }, [socket])


  return (

    <div className="flex justify-center gap-16 ">
      <div className=" m-3 text-black" >
        {
          board.map((row, i) => {
            return <div key={i} className="flex ">
              {
                row.map((square, j) => {
                  const squareRepresentation = String.fromCharCode(97 + (j % 8)) + "" + (8 - i) as Square

                  return <div
                    key={j}
                    onClick={() => {
                      if (!from) {
                        setFrom(squareRepresentation)
                      } else {
                        setFrom(null)
                        socket?.send(JSON.stringify({
                          type: MOVE,
                          payload:{
                            move: {
                              from,
                              to: squareRepresentation
                            }
                          }

                        }))
                        chess.move({
                          from: from,
                          to: squareRepresentation
                        })
                        setBoard(chess.board())
                      }
                    }
                    }
                    className={`w-16 h-16 ${(i + j) % 2 == 0 ? 'bg-green-600' : 'bg-white'}  `}>
                    {square?.type}
                  </div>
                }

                )}  </div>
          })
        }
      </div>
      <div className=""  >
        <div onClick={initGame} className="bg-green-600 m-5 py-2 px-4 rounded-md font-semibold hover:bg-green-800 duration-200 transition-all cursor-pointer " >
          Start Game
        </div>
      </div>
    </div>

  )

}

export default ChessBoard