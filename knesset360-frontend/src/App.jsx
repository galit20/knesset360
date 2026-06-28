// import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import NavBar from './components/NavBar' // Navigation bar
import Home from './pages/Home' // Home page
import Timeline from './pages/Timeline' // Timeline page with categories
import About from './pages/About' // About us page

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
            <Route path="/timeline/:subject" element={<Timeline />} />
            <Route path="/about" element={<About />} />
        </Routes>
      </div>
    </BrowserRouter>
    </>
  )
}

export default App
