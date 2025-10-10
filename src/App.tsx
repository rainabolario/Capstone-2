import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import SalesOverview from "./pages/SalesOverview";
import SalesForecast from "./pages/SalesForecast";
import CustomerBehavior from "./pages/CustomerBehavior";
import MarketBasket from "./pages/MarketBasket";
import WhatIfAnalysis from "./pages/WhatIfAnalysis";
import SalesData from "./pages/SalesData";
import AddRecord from "./pages/AddRecord";
import EditRecord from "./pages/EditRecord";
import ArchiveData from "./pages/ArchiveData";
import UserManagement from "./pages/UserManage";
import Account from "./pages/Account";
import Help from "./pages/Help";
import NeedHelp from "./pages/NeedHelp";
import ForgotPassword from "./pages/ForgotPassword";
import UpdatePassword from "./pages/UpdatePassword";

// Protected route component
const ProtectedRoute = ({ allowedRoles, children }: any) => {
  const isAuthenticated = localStorage.getItem("auth") === "true";
  const userRole = localStorage.getItem("userRole");

  // Not logged in → redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Unauthorized role → redirect to login
  if (!userRole || (allowedRoles && !allowedRoles.includes(userRole))) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  const [currentUser, setCurrentUser] = useState(() => localStorage.getItem("user") || "");

  // Login function
  const handleLogin = (email: string, role: string) => {
    localStorage.setItem("auth", "true");
    localStorage.setItem("user", email);
    localStorage.setItem("userRole", role);
    setCurrentUser(email);
    window.location.href = "/salesoverview"; // Redirect after login
  };

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem("auth");
    localStorage.removeItem("user");
    localStorage.removeItem("userRole");
    setCurrentUser("");
    window.location.href = "/login"; // Force redirect to login
  };

  return (
    <Router>
      <Routes>
        {/* --- Public Routes --- */}
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/need-help" element={<NeedHelp />} />
        <Route path="/update-password" element={<UpdatePassword />} />

        {/* Root route */}
        <Route
          path="/"
          element={
            localStorage.getItem("auth") === "true" ? (
              <Navigate to="/salesoverview" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* --- Shared Access (Admin + Staff) --- */}
        <Route
          path="/salesoverview"
          element={
            <ProtectedRoute allowedRoles={["Admin", "Staff"]}>
              <SalesOverview currentUser={currentUser} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/marketbasket"
          element={
            <ProtectedRoute allowedRoles={["Admin", "Staff"]}>
              <MarketBasket currentUser={currentUser} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/salesforecast"
          element={
            <ProtectedRoute allowedRoles={["Admin", "Staff"]}>
              <SalesForecast currentUser={currentUser} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customerbehavior"
          element={
            <ProtectedRoute allowedRoles={["Admin", "Staff"]}>
              <CustomerBehavior currentUser={currentUser} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/whatifanalysis"
          element={
            <ProtectedRoute allowedRoles={["Admin", "Staff"]}>
              <WhatIfAnalysis currentUser={currentUser} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/salesdata"
          element={
            <ProtectedRoute allowedRoles={["Admin", "Staff"]}>
              <SalesData onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/archive-data"
          element={
            <ProtectedRoute allowedRoles={["Admin", "Staff"]}>
              <ArchiveData onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/help"
          element={
            <ProtectedRoute allowedRoles={["Admin", "Staff"]}>
              <Help onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/account"
          element={
            <ProtectedRoute allowedRoles={["Admin", "Staff"]}>
              <Account onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />

        {/* --- Admin Only --- */}
        <Route
          path="/addrecord"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <AddRecord onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/editrecord/:id"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <EditRecord onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user-management"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <UserManagement onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
