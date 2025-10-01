import { useState } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import Login from "./pages/login"
import SalesOverview from "./pages/SalesOverview"
import SalesForecast from "./pages/SalesForecast"
import CustomerBehavior from "./pages/CustomerBehavior"
import MarketBasket from "./pages/MarketBasket"
import WhatIfAnalysis from "./pages/WhatIfAnalysis"
import SalesData from "./pages/SalesData"
import AddRecord from "./pages/AddRecord"
import EditRecord from "./pages/EditRecord"
import ArchiveData from "./pages/ArchiveData"
import UserManagement from "./pages/UserManage"
import Account from "./pages/Account"
import Help from "./pages/Help"
import NeedHelp from "./pages/NeedHelp"

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem("auth") === "true"
  })

  const [currentUser, setCurrentUser] = useState(() => {
    return localStorage.getItem("user") || ""
  })

  const handleLogin = (email: string) => {
    setIsAuthenticated(true)
    setCurrentUser(email)
    localStorage.setItem("auth", "true")
    localStorage.setItem("user", email)
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setCurrentUser("")
    localStorage.removeItem("auth")
    localStorage.removeItem("user")
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/salesoverview" replace /> : <Login onLogin={handleLogin} />}
        />
         <Route path="/need-help" element={<NeedHelp />} />
        <Route
          path="/salesoverview"
          element={
            isAuthenticated ? (
              <SalesOverview currentUser={currentUser} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/salesforecast"
          element={
            isAuthenticated ? (
              <SalesForecast currentUser={currentUser} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
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
        <Route
          path="/customerbehavior"
          element={
            isAuthenticated ? (
              <CustomerBehavior currentUser={currentUser} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/whatifanalysis"
          element={
            isAuthenticated ? (
              <WhatIfAnalysis currentUser={currentUser} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/salesdata"
          element={
            isAuthenticated ? (
              <SalesData onLogout={handleLogout} /> 
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
            path="/archive-data"
            element={
              isAuthenticated ? (
                <ArchiveData onLogout={handleLogout}/>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
        <Route
          path="/addrecord"
          element={
            isAuthenticated ? (
              <AddRecord onLogout={handleLogout} /> 
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/editrecord/:id"
          element={
            isAuthenticated ? (
              <EditRecord onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route path="/" element={<Navigate to={isAuthenticated ? "/marketbasket" : "/login"} replace />} />

        <Route
          path="/user-management"
          element={
            isAuthenticated ? (
              <UserManagement onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/account"
          element={
            isAuthenticated ? (
              <Account onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/help"
          element={
            isAuthenticated ? (
              <Help onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />        
      </Routes>
    </Router>
  )
}

export default App
