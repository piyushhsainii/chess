import { useEffect, useState } from "react"
import { useSocket } from "../hooks/useSocket"
import { Chess, Square } from 'chess.js'
import { GAME_OVER, INIT_GAME, MOVE } from "../messages/message"
import { algebraicToIndices } from "../utils/SquareNotationCalculator"
import Confetti from 'react-confetti'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"


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
  const [isGameOver, setisGameOver] = useState(false)
  const [playerWon, setPlayerWon] = useState("")
  const [playerWonColor, setPlayerWonColor] = useState("")
  const [Timer1, setTimer1] = useState(10 * 60 * 1000)
  const [Timer2, setTimer2] = useState(10 * 60 * 1000)
  const [stopTimer1, setstopTimer1] = useState<Boolean>(true)
  const [stopTimer2, setstopTimer2] = useState<Boolean>(true)

  const [PlayerName, setPlayer1Name] = useState('')

  const [WhitePlayer, setWhitePlayer] = useState('')
  const [BlackPlayer, setBlackPlayer] = useState('')

  const initGame = () => {
    // Initialises the game
    socket?.send(JSON.stringify({
      type: INIT_GAME,
      name: PlayerName,
    }))
    setisStarted("waiting")
  }
  const player1seconds = Math.floor(Timer1/1000)
  const player2seconds = Math.floor(Timer2/1000)

  const player1minutes = Math.floor(player1seconds/60)
  const player2minutes = Math.floor(player2seconds/60)

  const player1RemainingSeconds = player1seconds%60
  const player2RemainingSeconds = player2seconds%60

  
  
  useEffect(() => {
    if (!socket) {
      return;
    }
    let remainingTime1 = Timer1;
    let remainingTime2 = Timer2;

 const interval:any = setInterval(() => {
        // Update Timer1 if it's not stopped
        if (!stopTimer1) {
            if(Timer1 === 0){
              socket?.send(JSON.stringify({
                type:GAME_OVER,
                payload:{
                    winner: chess.turn() === "w" ? "BLACK WON" : "WHITE WON"
                }
             }))  
              return clearInterval(interval)
            }
            remainingTime1 -= 1000;
            setTimer1(remainingTime1);
        }

        // Update Timer2 if it's not stopped
        if (!stopTimer2) {
            if(Timer2 === 0){
              console.log("game end?")
              socket.send(JSON.stringify({
                type:GAME_OVER,
                payload:{
                    winner: chess.turn() === "w" ? "BLACK WON" : "WHITE WON"
                }
             }))  
              return clearInterval(interval)
            }
            remainingTime2 -= 1000;
            setTimer2(remainingTime2);
        }

    }, 1000);
  socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log(message,"in message event")

      switch (message.type) {

        case INIT_GAME:
          console.log(message)
          setBoard(chess.board())
          setisStarted(true)
          setPieceColor(message.payload)
          setisMyTurn(message.payload)
          setisGameOver(false)
          setTimer1(10 * 60 * 1000)
          setTimer2(10 * 60 * 1000)
          setWhitePlayer(message.white)
          setBlackPlayer(message.black)
          if(chess.turn() ===  "w" ){
            setstopTimer1(false) 
          } 
          const gameStart = new Audio('/GameStartAudio.mp4')
          gameStart.play()
          break;

        case MOVE:
          const move = message.payload
          chess.move(message.payload)
          setBoard(chess.board())
          setMoves((prevMoves)=>[...prevMoves,{move} ])
          const gameMove = new Audio('/Move.mp4')
          gameMove.play()
          console.log(message)
          if (message.color === "w") {
            console.log("control is here for white player");
            setstopTimer1(false); // Start player 1's timer
            setstopTimer2(true);  // Stop player 2's timer
          } 
          if(message.color === "b") {
            console.log("control is here for black player");
            setstopTimer1(true); // Stop player 1's timer
            setstopTimer2(false); // Start player 2's timer
          }
          break;

        case GAME_OVER:
          const gameStatus = message.payload
          setisStarted(false)
          setisGameOver(true)
          setPlayerWon(gameStatus.winner)
          setPlayerWonColor(gameStatus.color)
          setChess(new Chess())
          const checkMate = new Audio()
          checkMate.play()
          setstopTimer1(true)
          setstopTimer2(true)
          break;
      }
    }
  return () => clearInterval(interval);

  }, [socket,stopTimer1, stopTimer2 ,Timer1, Timer2])


  return (
    
    <div className="flex justify-center gap-16 ">
      {
        playerWonColor === PieceColor ? 
        <Confetti
      />
        : null
      }
      <div className={`m-3 text-black border-black border ${isMyTurn === "b" ? "transform rotate-180" : ""} `} >
        {/* black timer */}

        <div className={`text-black flex justify-between font-semibold text-lg mx-2 ${isMyTurn === "b" ? "transform rotate-180" : ""}`}  >
          <div>
            {BlackPlayer}
          </div>
          <div>
             TIME LEFT:  {player2minutes} {":"} {String(player2RemainingSeconds).padStart(2,'0')}
          </div>
       </div>

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
                        if(chess.isCheck()===true){
                          const check = new Audio("/Check.mp4")
                          check.play()
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
                              },
                              color:chess.turn()
                            }
                          }))
                          if(chess.turn()==="b"){       //when white moves
                            setstopTimer2(false)        //starts black timer
                            setstopTimer1(true)         //starts white timer
                          } else {
                            setstopTimer1(false)        
                            setstopTimer2(true)
                          }
                          const gameMove = new Audio('/Move.mp4')
                          gameMove.play()
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
                        items-center bg-white  p-2 w-2 mt-14 h-2 absolute   rounded-xl"></div>
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
        <div className={`text-black flex justify-between font-semibold text-lg mx-2 ${isMyTurn === "b" ? "transform rotate-180" : ""}`}  >
          <div>
            {WhitePlayer}
          </div>
          <div>
             TIME LEFT:  {player1minutes} {":"} {String(player1RemainingSeconds).padStart(2,'0')}
          </div>
       </div>
      </div>
      <div className=""  >
      {
                  
                  isGameOver !== false && isStarted === false ? 
                  <div className="text-black m-6 font-semibold text-lg">{playerWon} </div> 
                  : null
                  
                }
          {
            isStarted === false ?
            <Dialog>
              <DialogTrigger>
              <div 
                className="bg-gray-800 m-5 w-[150px] text-center text-white font-semibold px-6 py-3 rounded-[4px] cursor-pointer
                hover:bg-gray-700 " >
                    Start Game
                  </div> 
              </DialogTrigger>
              <DialogContent className="bg-white">
                <DialogHeader>
                  <div className="flex items-center justify-center">
                    <DialogTitle className="text-black"> PLAY AS </DialogTitle>
                    <div>
                        <input type="text" onChange={(e)=>setPlayer1Name(e.target.value)} className="bg-white border mx-4 px-2 py-1 my-2 text-black
                         border-slate-600 border-opacity-40 rounded-md focus  " />
                    </div>
                  </div>
                  <DialogDescription>
                  <div onClick={initGame}
                    className="bg-gray-800 my-5 w-[150px] text-center text-white font-semibold px-6 py-3  cursor-pointer
                    hover:bg-gray-700 flex justify-center rounded-xl m-auto  " >
                    FIND GAME
                  </div> 
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
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
               <div className="text-black font-semibold w-[300px] max-h-[500px]  border-black 
                  border py-2 px-5 border-opacity-40 rounded-md flex flex-col ">
                    
                  Moves Table 
                  <div>
                  {
                    Moves.map((moves,i)=>(
                      <div key={moves.move.from} className={`flex border p-2   justify-start gap-10 mt-3 ${i % 2=== 0 ? "" :"bg-black text-white"} `}>
                          <div> {moves.move.from} </div>
                          <div> {moves.move.to} </div>
                      </div>
                    ))
                  }
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