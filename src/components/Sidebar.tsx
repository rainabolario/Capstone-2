import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  PanelsTopLeft as OverviewIcon,
  ChartSpline as ForecastIcon,
  ChartNoAxesCombined as PerformanceIcon,
  ChartColumnStacked as BehaviorTrendsIcon,
  ChartNetwork as WhatIfIcon,
  Sheet as SalesDataIcon,
  Archive as ArchiveIcon,
  UserRoundCog as AccountIcon,
  BadgeInfo as HelpIcon,
  LogOut as LogoutIcon,
  ChevronRight,
  ChevronLeft,
  UsersRound as UserIcon
} from "lucide-react";
import "../css/Sidebar.css";
import Tooltip from '@mui/material/Tooltip';

interface SidebarProps {
  onLogout?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const userRole = localStorage.getItem("userRole");
  const [isExpanded, setIsExpanded] = useState(() => {
    const savedState = localStorage.getItem("sidebarExpanded");
    return savedState ? JSON.parse(savedState) : true;
  });

  React.useEffect(() => {
    localStorage.setItem("sidebarExpanded", JSON.stringify(isExpanded));
  }, [isExpanded]);

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("userId");
    localStorage.removeItem("userEmail");

    if (onLogout) onLogout();

    navigate("/login");
  };

  const menuItems = [
    { id: "sales-overview", icon: <OverviewIcon />, label: "Sales Overview & Historical Data", path: "/salesoverview", section: "main" },
    { id: "sales-forecast", icon: <ForecastIcon />, label: "Sales Forecast", path: "/salesforecast", section: "main" },
    { id: "performance-market-basket", icon: <PerformanceIcon />, label: "Product Performance & Market Basket", path: "/marketbasket", section: "main" },
    { id: "customer-behavior", icon: <BehaviorTrendsIcon />, label: "Customer Behavior & Trends", path: "/customerbehavior", section: "main" },
    { id: "what-if-analysis", icon: <WhatIfIcon />, label: "What-if Analysis", path: "/whatifanalysis", section: "main" },
    { id: "sales-data", icon: <SalesDataIcon />, label: "Sales Data", path: "/salesdata", section: "orders" },
    { id: "archive-data", icon: <ArchiveIcon />, label: "Archive Data", path: "/archive-data", section: "orders" },
    { id: "user-management", icon: <UserIcon />, label: "Users Management", path: "/user-management", section: "other", adminOnly: true },
    { id: "account", icon: <AccountIcon />, label: "Account Settings", path: "/account", section: "other" },
    { id: "help", icon: <HelpIcon />, label: "Help Center", path: "/help", section: "other" },
    { id: "logout", icon: <LogoutIcon />, label: "Logout", path: "/login", section: "other", isLogout: true },
  ];

  const renderSection = (sectionName: string, title?: string) => (
    <div className="sidebar-section" key={sectionName}>
      {title && <h3 className="sidebar-title">{title}</h3>}
      {menuItems
        .filter((item) => item.section === sectionName)
        .filter((item) => !(item.adminOnly && userRole !== "Admin"))
        .map((item) => {
          const isActive = location.pathname === item.path;

          if (item.isLogout) {
            return (
              <Tooltip
                title= {item.label}
                placement="right"
                arrow
                disableHoverListener={isExpanded}
                key={item.id}
                slotProps={{
                  tooltip: {
                    sx: {
                      backgroundColor: '#EC7A1C',
                      color: "white",
                      '& .MuiTooltip-arrow': { 
                        color: '#EC7A1C',
                      },
                      fontSize: "14px",
                      borderRadius: "5px"
                    }
                  }
                }}
              >
              <div key={item.id} onClick={handleLogout} className="sidebar-button" style={{ cursor: "pointer" }}>
                {item.icon}
                {isExpanded && <span className="sidebar-label">{item.label}</span>}
              </div>
              </Tooltip>
            );
          }

          return (
            <Tooltip
              title={item.label}
              placement="right"
              arrow
              disableHoverListener={isExpanded}
              key={item.id}
              slotProps={{
                  tooltip: {
                    sx: {
                      backgroundColor: '#EC7A1C',
                      color: "white",
                      '& .MuiTooltip-arrow': { 
                        color: '#EC7A1C',
                      },
                      fontSize: "14px",
                      borderRadius: "5px"
                    }
                  }
                }}
            >
              <Link key={item.id} to={item.path} className={`sidebar-button ${isActive ? "active" : ""}`}>
                {item.icon}
                {isExpanded && <span className="sidebar-label">{item.label}</span>}
              </Link>
            </Tooltip>
          );
        })}
    </div>
  );

  return (
    <div className={`sidebar ${isExpanded ? "expanded" : "collapsed"}`}>
      <div className="sidebar-header">
        <img 
          src= {isExpanded ? "/Kc's logo.png" : "kc-logo-mini.png"} 
          alt="KC's Kitchen Logo" 
          className={`sidebar-logo-img ${!isExpanded ? 'small' : ''}`} 
        />
        <Tooltip 
          title={isExpanded ? "Collapse" : "Expand"}
          placement="right"
          arrow
          slotProps={{
            tooltip: {
              sx: {
                backgroundColor: '#EC7A1C',
                color: "white",
                '& .MuiTooltip-arrow': { 
                  color: '#EC7A1C',
                },
                fontSize: "14px",
                borderRadius: "5px"
              }
            }
          }}
        >
        <button 
          className="sidebar-toggle-btn" 
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
        </button>
        </Tooltip>
      </div>

      <div className="sidebar-content">
        {renderSection("main", "Dashboard")}
        {renderSection("orders", "Orders")}
        {renderSection("other", "Other")}
      </div>
    </div>
  );
};

export default Sidebar;
