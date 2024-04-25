import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './screens/Landing'
import Chess from './screens/Chess'
import Navbar from './components/Navbar'
function App() {

  return (
    <>
      <BrowserRouter>
       <Navbar />
        <Routes>
          <Route element={ <Landing />} path='/' />
          <Route element={ <Chess />} path='/chess'  />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
