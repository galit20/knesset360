import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import buildingLogo from './assets/building.svg'
import innerRingLogo from './assets/inner-ring.svg';
import outerRingLogo from './assets/outer-ring.svg';
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <div className="logo-container">
          <img src={buildingLogo} className="logo-layer static" alt="Logo Center" />
          <img src={innerRingLogo} className="logo-layer spin-counter" alt="Inner Ring" />
          <img src={outerRingLogo} className="logo-layer spin-clock" alt="Outer Ring" />
        </div>
      </div>
      <h1>KNESSET360°</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
