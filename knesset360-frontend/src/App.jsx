// import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import NavBar from './components/NavBar' // <-- Import your new component!
import Home from './pages/Home' // <-- Import your new Home page!
import Factions from './pages/Factions'
import './App.css'



function App() {
  return (
    <>
    <BrowserRouter>
      <div className="app-container">
        <NavBar />
        <Routes>
            <Route path="/" element= {<Home />} />
            <Route path="/factions" element={<Factions />} />
        </Routes>
      </div>
    </BrowserRouter>
    </>
  )
}

export default App

//added for faction page
