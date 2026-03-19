import Countdown from 'react-countdown';
import buildingLogo from '../assets/building.svg'
import innerRingLogo from '../assets/inner-ring.svg';
import outerRingLogo from '../assets/outer-ring.svg';

import './Home.css'


// Helper to format election countdown display
const renderer = ({ days, hours, minutes, seconds, completed }) => {
  if (completed) {
    // What to show when the election starts!
    return <span className="election-started">Elections are live! 🗳️</span>;
  } else {
    // The actual countdown display
    return (
      <div className="countdown-display">
        <div className="time-block"><span>{days}</span><small>Days</small></div>
        <div className="time-block"><span>{hours}</span><small>Hrs</small></div>
        <div className="time-block"><span>{minutes}</span><small>Min</small></div>
        <div className="time-block"><span>{seconds}</span><small>Sec</small></div>
      </div>
    );
  }
};

export default function Home() {
    const electionDate = new Date('2026-10-27T00:00:00');
    return (
        <div className="content-container">
            <div className="logo-container">
                <img src={buildingLogo} className="logo-layer static " alt="Logo Center" />
                <img src={innerRingLogo} className="logo-layer spin-counter" alt="Inner Ring" />
                <img src={outerRingLogo} className="logo-layer spin-clock" alt="Outer Ring" />
            </div>
            <h1>KNESSET360°</h1>
            <h2>Next Elections in...</h2>
            <Countdown date={electionDate} renderer={renderer} /> 
        </div>
    )
}