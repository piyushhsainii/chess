import { useNavigate } from "react-router-dom"

const Landing = () => {
const navigate = useNavigate()
  return (
     <div className="flex justify-evenly  border border-black border-opacity-15">
            <div className=" w-[500px] py-5" >
              <img src="/landingLogo.png" className="w-[500px] cursor-pointer "  alt="" />
            </div>
            <div className="flex items-center" >
                <button
                 className="bg-gray-800 text-white font-semibold px-6 py-3 rounded-md
                  hover:bg-gray-700 hover:scale-110 transition-all duration-200"
                 onClick={()=>navigate('/chess')} >
                    PLAY CHESS
                </button>
            </div>
      </div>  
  )
}

export default Landing