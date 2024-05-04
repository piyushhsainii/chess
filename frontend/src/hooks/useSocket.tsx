import { useEffect, useState } from "react"


export const useSocket = ()=>{
    const [socket, setSocket] = useState<WebSocket | null>(null)

useEffect(() => {
  const ws = new WebSocket( "ws://localhost:8080")
     setSocket(ws)

     ws.onclose = (()=>{
        setSocket(null)
     })

      return () => {
        ws.close()
      }
}, [])
    

    return socket
}

// wss://chess-1f07.onrender.com/8080