import React from "react";
import Sidebar from "../components/Sidebar";
import "../css/WhatIfAnalysis.css";
import { Divider, Typography } from "@mui/material";

interface WhatIfAnalysisProps {
  currentUser?: string;
  onLogout: () => void;
}

const WhatIfAnalysis: React.FC<WhatIfAnalysisProps> = ({ currentUser, onLogout }) => {
  return (
    <div className="whatif-container">
      <Sidebar onLogout={onLogout} />
      <div className="whatif-content">
        <div className="whatif-header">
          <h1>WHAT-IF ANALYSIS</h1>
        </div>

        <div className="helper-text">
          <Typography variant="caption" sx={{ color: 'gray', fontSize: '14px', mb:1, mt: 1 }}>
              This dashboard provides an overview of all sales activity. Use the tools below to filter, the presented data, and visualize sales trends over time.
          </Typography>
          <Divider />
        </div>

        <div className="whatif-sales-header">
          <h2>Sales Projections</h2>
        </div>


        <div className="whatif-grid">
          {/* Price Increase */}
          <div className="whatif-div1">
            <div className="whatif-content1">Price Increase</div>
            <div className="placeholder">Placeholder (Sales Projection)</div>
          </div>

          {/* Product Demand */}
          <div className="whatif-div2">
            <div className="whatif-content2">Product Demand</div>
            <div className="placeholder">Placeholder (Sales Projection)</div>
          </div>

          {/* What-If Parameter */}
          <div className="whatif-div3">
            <div className="whatif-content3">What-If Parameter</div>
            <div className="placeholder">Placeholder (Sliders)</div>
          </div>

          {/* Recommendation */}
          <div className="whatif-div4">
            <div className="whatif-content4">Recommendation</div>
            <div className="placeholder">Placeholder (Text)</div>
          </div>

          {/* Sales Impact Chart */}
          <div className="whatif-div5">
            <div className="whatif-content5">Sales Impact of Parameter Change</div>
            <div className="placeholder">Chart Placeholder</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatIfAnalysis;
