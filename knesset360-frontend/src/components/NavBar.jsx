import { NavLink } from 'react-router-dom'
import './NavBar.css'

import homeIcon from '../assets/house.svg'
import timelineIcon from '../assets/timeline.svg'
import infoIcon from '../assets/info.svg'
import parliamentIcon from '../assets/landmark-icon.svg'
import statsIcon from '../assets/chart.svg'
import chat from '../assets/message.svg'

export default function NavBar() {
  return (
    <nav className="top-nav">
      <NavLink to="/" className="nav-button">
        <img src={homeIcon} alt="Home" className="nav-icon" />
        <span className="nav-text">Home</span>
      </NavLink>

      <NavLink to="/timeline" className="nav-button">
        <img src={timelineIcon} alt="Timeline" className="nav-icon" />
        <span className="nav-text">Timeline</span>
      </NavLink>

      <NavLink to="/factions" className="nav-button">
        <img src={parliamentIcon} alt="Factions" className="nav-icon" />
        <span className="nav-text">Factions</span>
      </NavLink>

      <NavLink to="/statistics" className="nav-button">
        <img src={statsIcon} alt="Statistics" className="nav-icon" />
        <span className="nav-text">Statistics</span>
      </NavLink>

      <NavLink to="/dashboard" className="nav-button">
        <img src={statsIcon} alt="Dashboard" className="nav-icon" />
        <span className="nav-text">Dashboard</span>
      </NavLink>

      <NavLink to="/about" className="nav-button">
        <img src={infoIcon} alt="About" className="nav-icon" />
        <span className="nav-text">About</span>
      </NavLink>
    </nav>
  )
}