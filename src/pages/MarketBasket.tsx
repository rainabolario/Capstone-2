import React from "react";
import Sidebar from "../components/Sidebar";
import "../css/MarketBasket.css";
import '../css/SalesOverview.css';
import { Divider, Typography } from "@mui/material";

interface MarketBasketProps {
  currentUser?: string;
  onLogout: () => void;
}

const MarketBasket: React.FC<MarketBasketProps> = ({ onLogout }) => {
  return (
    <div className="market-basket-container">
      <Sidebar onLogout={onLogout} />
      <div className="market-basket-content">
        <div className="market-basket-header">
          <h1>PRODUCT PERFORMANCE AND MARKET BASKET</h1>
        </div>
        <div className="helper-text">
          <Typography variant="caption" sx={{ color: 'gray', fontSize: '14px', mb:1, mt: 1 }}>
              This dashboard provides an overview of all sales activity. Use the tools below to filter, the presented data, and visualize sales trends over time.
          </Typography>
          <Divider />
        </div>

        <div className="tableau-responsive-wrapper">
            <iframe
                src="https://prod-apsoutheast-b.online.tableau.com/t/kcsanalyticssystem-bca8df11cc/views/051125_PDS/PRODUCT?:embed=y&:toolbar=no"
                className="tableau-iframe"
                frameBorder="0"
            ></iframe>
        </div>
      </div>
    </div>
  );
};

export default MarketBasket;
