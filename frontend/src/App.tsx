import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './screens/Landing'
import Chess from './screens/Chess'
function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route element={ <Landing />} path='/' />
          <Route element={ <Chess />} path='/chess'  />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
