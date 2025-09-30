import React from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import {
    PanelsTopLeft as OverviewIcon,
    ChartSpline as ForecastIcon,
    ChartNoAxesCombined as PerformanceIcon,
    ChartColumnStacked as BehaviorTrendsIcon,
    ChartNetwork as WhatIfIcon,
    Sheet as SalesDataIcon,
    Archive as ArchiveIcon,
    User as AccountIcon,
    BadgeInfo as HelpIcon,
    LogOut as LogoutIcon
} from "lucide-react"
import "../css/Sidebar.css"

interface SidebarProps {
  onLogout?: () => void
}

const Sidebar: React.FC<SidebarProps> = ({ onLogout }) => {
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    if (onLogout) {
      onLogout()
    }
    navigate("/login")
  }

  const menuItems = [
    { id: "sales-overview", icon: <OverviewIcon /> , label: "Sales Overview", path: "/salesoverview", section: "main" },
    { id: "sales-forecast", icon: <ForecastIcon /> , label: "Sales Forecast", path: "/salesforecast", section: "main" },
    { id: "performance-market-basket", icon: <PerformanceIcon /> , label: "Performance & Market Basket", path: "/marketbasket", section: "main" },
    { id: "customer-behavior", icon: <BehaviorTrendsIcon /> , label: "Customer Behavior & Trends", path: "/customerbehavior", section: "main" },
    { id: "what-if-analysis", icon: <WhatIfIcon /> , label: "What-if Analysis", path: "/whatifanalysis", section: "main" },
    { id: "sales-data", icon: <SalesDataIcon /> , label: "Sales Data", path: "/salesdata", section: "orders" },
    { id: "archive-data", icon: <ArchiveIcon /> , label: "Archive Data", path: "/archive-data", section: "orders" },
    { id: "user-management", icon: <AccountIcon /> , label: "User Management", path: "/user-management", section: "other" },
    { id: "account", icon: <AccountIcon /> , label: "Account", path: "/account", section: "other" },
    { id: "help", icon: <HelpIcon /> , label: "Help", path: "/help", section: "other" },
    { id: "logout", icon: <LogoutIcon /> , label: "Logout", path: "/login", section: "other", isLogout: true },
  ]

  const renderSection = (sectionName: string, title?: string) => (
    <div className="sidebar-section" key={sectionName}>
      {title && <h3 className="sidebar-title">{title}</h3>}
      {menuItems
        .filter((item) => item.section === sectionName)
        .map((item) => {
          const isActive = location.pathname === item.path
          
          // Handle logout specially
          if (item.isLogout) {
            return (
              <div
                key={item.id}
                onClick={handleLogout}
                className="sidebar-button"
                style={{ cursor: 'pointer' }}
              >
                {item.icon}
                {item.label}
              </div>
            )
          }
          
          return (
            <Link
              key={item.id}
              to={item.path}
              className={`sidebar-button ${isActive ? "active" : ""}`}
            >
              {item.icon}
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
        {renderSection("main", "Dashboard")}
        {renderSection("orders", "Orders")}
        {renderSection("other", "Other")}
      </div>
    </div>
  )
}

export default Sidebar
