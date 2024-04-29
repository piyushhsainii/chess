import { useEffect, useState } from "react"
import { useSocket } from "../hooks/useSocket"
import { Chess, Square } from 'chess.js'
import { GAME_OVER, INIT_GAME, MOVE } from "../messages/message"
import { algebraicToIndices } from "../utils/SquareNotationCalculator"

interface Moves {
  move:{
    from:string,
    to:string
  }
}

const ChessBoard = () => {

  const socket = useSocket()
  const [chess, setChess] = useState(new Chess())
  const [board, setBoard] = useState(chess.board())
  const [from, setFrom] = useState<Square | null>(null)
  const [PieceColor, setPieceColor] = useState(null)
  const [isMyTurn, setisMyTurn] = useState(null)
  const [isStarted, setisStarted] = useState<Boolean | "waiting">(false)
  const [Moves, setMoves] = useState<Moves[]>([])
  const [validMovesArray, setValidMovesArray] = useState<[number, number][]>([])

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
    console.log(validMovesArray, "MOVES LEGAL")

  socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log(message,"in message event")

      switch (message.type) {
        case INIT_GAME:
          setBoard(chess.board())
          setisStarted(true)
          setPieceColor(message.payload)
          setisMyTurn(message.payload)
          break;
        case MOVE:
          const move = message.payload
          chess.move(message.payload)
          setBoard(chess.board())
          setMoves((prevMoves)=>[...prevMoves,{move} ])
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
      <div className={`m-3 text-black border-black border-2 ${isMyTurn === "b" ? "transform rotate-180" : ""} `} >
        {
          board.map((row, i) => {
            return <div key={i} className="flex ">
              {
                row.map((square, j) => {
                  const squareRepresentation = String.fromCharCode(97 + (j % 8)) + "" + (8 - i) as Square
                  return <div
                    key={j}
                    onClick={() => {
                      if (!isStarted) {
                        return;
                      }
                       const validMoves = chess.moves({square:squareRepresentation})
                       const validSquares = validMoves.map((moves)=>algebraicToIndices(moves))
                       setValidMovesArray(validSquares)
                      if (isMyTurn !== chess.turn() ) return;
                      if (!from && square?.color !== chess.turn()) return;
                      if (from === squareRepresentation) {
                        setFrom(null);
                      }
                      if (!from) {
                        setFrom(squareRepresentation)

                      } else {
                        try {
                        // storing all the moves
                        // updating the board
                        if(validMovesArray.length === 0){
                          setFrom(null)
                          return
                        }
                         chess.move({
                            from: from,
                            to: squareRepresentation
                          })
                          socket?.send(JSON.stringify({
                            type: MOVE,
                            payload:{
                              move: {
                                from,
                                to: squareRepresentation
                              }
                            }
                          }))
                          setBoard(chess.board())
                          setFrom(null)
                          setMoves((prevMoves)=>[...prevMoves,{move:{from:from,to:squareRepresentation}}])
                        } catch (error) {
                          if( chess.get(squareRepresentation).color === isMyTurn ){
                            setFrom(squareRepresentation)
                          } else {
                            setFrom(null)
                          }
                          return error
                        }
                    
                      }
                    }
                    }
                    className={`w-16 h-16 ${(i + j) % 2 == 0 ? 'bg-gray-900' : 'bg-gray-500'} border  `}>

                <div className="flex items-center justify-center">
                 {validMovesArray.length > 0 &&
                      validMovesArray.some((move) => move[0] === i && move[1] === j) && (
                        <div className="flex justify-center text-white
                        items-center bg-white flex p-2 w-2 mt-14 h-2 absolute   rounded-xl"></div>
                      )}
                    {square && square.color === "w" ? (
                      <img className={`w-10 h-10 m-auto mt-[9px] ${isMyTurn === "b" ? "transform rotate-180" : ""} `} src={`/${square.type}white.png`} alt={square.square} />
                    ) : (
                      square && (
                        <img className={`w-10 h-10 m-auto mt-[9px] ${isMyTurn === "b" ? "transform rotate-180" : ""} `} src={`/${square.type}.png`} alt={square.square} />
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
            </div> 
            : 
            (
             isStarted === "waiting" ? 
             <div className="text-black font-semibold my-16"> Looking for an user... </div> :
            <>
              {
                isStarted === true && PieceColor !== null ? 
               <> 
                <div className="text-black mt-10 font-semibold mb-2" >
                  { isMyTurn === chess.turn() ? "YOUR TURN" : "OPPONENT'S TURN" }
                </div>
                <div className="text-black text-lg font-semibold  mb-5" >
                  YOU ARE {PieceColor === "w" ? "WHITE" : "BLACK"}
                </div>
               </> : null
              }
               <div className="text-black font-semibold w-[300px] border-black 
                  border py-2 px-5 border-opacity-40 rounded-md flex flex-col ">
                    
                  Moves Table 
                  {
                    Moves.map((moves,i)=>(
                      <div key={moves.move.from} className={`flex border p-2   justify-start gap-10 mt-3 ${i % 2=== 0 ? "" :"bg-black text-white"} `}>
                          <div> {moves.move.from} </div>
                          <div> {moves.move.to} </div>
                      </div>
                    ))
                  }
                </div>
              </>
            )
           }

      </div>
    </div>

  )

}

export default ChessBoard