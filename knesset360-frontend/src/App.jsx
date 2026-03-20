// import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import NavBar from './components/NavBar' // <-- Import your new component!
import Home from './pages/Home' // <-- Import your new Home page!
import Timeline from './pages/Timeline'
import './App.css'


function App() {
  return (
    <>
    <BrowserRouter>
      <div className="app-container">
        <NavBar />
        <Routes>
            <Route path="/" element= {<Home />} />
            <Route path="/timeline" element= {<Timeline />} />
        </Routes>
      </div>
    </BrowserRouter>
    </>
  )
}

export default App
