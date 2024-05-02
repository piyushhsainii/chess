import { useNavigate } from "react-router-dom"

const Navbar = () => {

    const navigate = useNavigate()

  return (
    <>
        <div className="flex justify-between border-b border-black border-opacity-15" >
            <div onClick={()=>navigate('/')} > <img src="./logo.png" className="w-16 h-w-16 m-4 cursor-pointer" alt="" /> </div>
            <div></div>
        </div>
    </>
  )
}

export default Navbar