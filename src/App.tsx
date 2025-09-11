import { useState } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import Login from "./pages/login"
import MarketBasket from "./pages/MarketBasket"
// import WhatIfAnalysis from "./pages/WhatIfAnalysis"

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentUser, setCurrentUser] = useState("")

  const handleLogin = (email: string) => {
    setIsAuthenticated(true)
    setCurrentUser(email)
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setCurrentUser("")
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/marketbasket" replace /> : <Login onLogin={handleLogin} />}
        />
        <Route
          path="/marketbasket"
          element={
            isAuthenticated ? (
              <MarketBasket currentUser={currentUser} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route path="/" element={<Navigate to={isAuthenticated ? "/marketbasket" : "/login"} replace />} />
      </Routes>
    </Router>
  )
}

export default App
