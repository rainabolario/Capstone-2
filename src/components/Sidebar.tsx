import React from "react"
import { Link, useLocation } from "react-router-dom"
import "../css/Sidebar.css"

const menuItems = [
  { id: "dashboard", label: "Dashboard", path: "/dashboard", section: "main" },
  { id: "sales-overview", label: "Sales Overview", path: "/sales-overview", section: "main" },
  { id: "sales-forecast", label: "Sales Forecast", path: "/sales-forecast", section: "main" },
  { id: "performance-market-basket", label: "Performance & Market Basket", path: "/marketbasket", section: "main" },
  { id: "customer-behavior", label: "Customer Behavior & Trends", path: "/customer-behavior", section: "main" },
  { id: "what-if-analysis", label: "What-if Analysis", path: "/whatifanalysis", section: "main" },
  { id: "sales-data", label: "Sales Data", path: "/salesdata", section: "orders" },
  { id: "account", label: "Account", path: "/account", section: "other" },
  { id: "help", label: "Help", path: "/help", section: "other" },
  { id: "logout", label: "Logout", path: "/login", section: "other" }, // Redirect logout to login
]

const Sidebar: React.FC = () => {
  const location = useLocation()

  const renderSection = (sectionName: string, title?: string) => (
    <div className="sidebar-section" key={sectionName}>
      {title && <h3 className="sidebar-title">{title}</h3>}
      {menuItems
        .filter((item) => item.section === sectionName)
        .map((item) => {
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.id}
              to={item.path}
              className={`sidebar-button ${isActive ? "active" : ""}`}
            >
              {item.label}
            </Link>
          )
        })}
    </div>
  )

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <img src="/Kc's logo.png" alt="KC's Kitchen Logo" className="sidebar-logo-img" />
      </div>

      <div className="sidebar-content">
        {renderSection("main")}
        {renderSection("orders", "Orders")}
        {renderSection("other", "Other")}
      </div>
    </div>
  )
}

export default Sidebar
