import type React from "react"
import "../css/Sidebar.css"

interface SidebarProps {
  activeItem?: string
  onItemClick?: (item: string) => void
}

const Sidebar: React.FC<SidebarProps> = ({ activeItem = "Performance & Market Basket", onItemClick }) => {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", section: "main" },
    { id: "sales-overview", label: "Sales Overview", section: "main" },
    { id: "sales-forecast", label: "Sales Forecast", section: "main" },
    { id: "performance-market-basket", label: "Performance & Market Basket", section: "main" },
    { id: "customer-behavior", label: "Customer Behavior & Trends", section: "main" },
    { id: "what-if-analysis", label: "What-if Analysis", section: "main" },
    { id: "sales-data", label: "Sales Data", section: "orders" },
    { id: "account", label: "Account", section: "other" },
    { id: "help", label: "Help", section: "other" },
    { id: "logout", label: "Logout", section: "other" },
  ]

  const handleItemClick = (itemId: string) => {
    if (onItemClick) {
      onItemClick(itemId)
    }
  }

  const renderSection = (sectionName: string, title?: string) => (
    <div className="sidebar-section">
      {title && <h3 className="sidebar-title">{title}</h3>}
      {menuItems
        .filter((item) => item.section === sectionName)
        .map((item) => (
          <button
            key={item.id}
            onClick={() => handleItemClick(item.label)}
            className={`sidebar-button ${activeItem === item.label ? "active" : ""}`}
          >
            {item.label}
          </button>
        ))}
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
