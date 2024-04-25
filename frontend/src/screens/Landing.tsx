import { useNavigate } from "react-router-dom"

const Landing = () => {
const navigate = useNavigate()
  return (
    <div>
            Landing page
            <div>
                <button onClick={()=>navigate('/chess')}>
                    PLAY CHESS
                </button>
            </div>
    </div>
  )
}

export default Landing