import { useEffect, useState } from "react"
import { useSocket } from "../hooks/useSocket"
import { Chess, Square } from 'chess.js'
import { GAME_OVER, INIT_GAME, MOVE } from "../messages/message"

const ChessBoard = () => {

  const socket = useSocket()
  const [chess, setChess] = useState(new Chess())
  const [board, setBoard] = useState(chess.board())
  const [from, setFrom] = useState<Square | null>(null)
  const [PieceColor, setPieceColor] = useState(null)
  const [isStarted, setisStarted] = useState<Boolean | "waiting">(false)


  const initGame = () => {
    // Initialises the game
    socket?.send(JSON.stringify({
      type: INIT_GAME
    }))
    setisStarted("waiting")
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
          setBoard(chess.board())
          setisStarted(true)
          setPieceColor(message.payload)
          break;
        case MOVE:
          chess.move(message.payload)
          setBoard(chess.board())
          break;
        case GAME_OVER:
          console.log("Game Over")
          setisStarted(false)
          break;
      }
    }
  }, [socket])


  return (

    <div className="flex justify-center gap-16 ">
      <div className=" m-3 text-black border-black border-2" >
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
                    className={`w-16 h-16 ${(i + j) % 2 == 0 ? 'bg-gray-900' : 'bg-gray-500'} border  `}>

                <div className="flex items-center justify-center">
                    {square && square.color === "w" ? (
                      <img className="w-10 h-10 m-auto mt-[9px]" src={`/${square.type}white.png`} alt={square.square} />
                    ) : (
                      square && (
                        <img className="w-10 h-10 m-auto mt-[9px] " src={`/${square.type}.png`} alt={square.square} />
                      )
                    )}
                  </div>
                  </div>
                }

                )}  </div>
          })
        }
      </div>
      <div className=""  >
          {
            isStarted === false ?
          <div onClick={initGame}
            className="bg-gray-800 m-5 w-[150px] text-center text-white font-semibold px-6 py-3 rounded-md cursor-pointer
            hover:bg-gray-700 " >
              Start Game
            </div> : 
            (
             isStarted === "waiting" ? 
             <div className="text-black font-semibold my-16"> Looking for an user... </div> :
            <>
              {
                isStarted === true && PieceColor !== null ? 
                <div className="text-black text-lg font-semibold mt-12 mb-5" >
                  YOU ARE {PieceColor}
                </div> : null
              }
               <div className="text-black font-semibold w-[300px] border-black 
                  border py-2 px-5 border-opacity-40 rounded-md flex flex-col ">
                    
                  Moves Table 
        
                  <div className="flex justify-start gap-10 mt-3">
                    <div> e2 </div>
                    <div> e4 </div>
                  </div>
        
                  <div className="flex justify-start gap-10 mt-3">
                    <div> e2 </div>
                    <div> e4 </div>
                  </div>
                </div>
              </>
            )
           }

      </div>
    </div>

  )

}

export default ChessBoard