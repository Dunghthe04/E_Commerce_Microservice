import { useState, useEffect } from 'react'
import Login from './components/Login'
import WeatherDashboard from './components/WeatherDashboard'
import './App.css'

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'))

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
  }

  return (
    <div className="app-container">
      {!token ? (
        <Login onLoginSuccess={(t) => setToken(t)} />
      ) : (
        <WeatherDashboard onLogout={handleLogout} />
      )}
      
      <div className="architecture-info">
        <p>Current Flow: <strong>Frontend</strong> (React) &rarr; <strong>Gateway</strong> (Node.js) &rarr; <strong>IdentityService</strong> (.NET 9)</p>
      </div>
    </div>
  )
}

export default App
