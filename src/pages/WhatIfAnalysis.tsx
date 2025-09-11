import React from "react"
import Sidebar from "../components/Sidebar"
import "../css/WhatIfAnalysis.css"

interface WhatIfAnalysisProps {
  currentUser?: string
  onLogout: () => void
}

const WhatIfAnalysis: React.FC<WhatIfAnalysisProps> = ({ }) => {
  return (
    <div className="whatif-dashboard">
      <Sidebar />

      <div className="whatif-dashboard-content">
        <div className="whatif-dashboard-header">
          <h1>WHAT-IF ANALYSIS</h1>
        </div>

        <div className="whatif-dashboard-main">
          {/* Row 1 */}
          <div className="whatif-grid whatif-grid-4">
            <div className="whatif-card">
              <div className="whatif-card-header">
                <h3>Price Increase</h3>
              </div>
              <div className="whatif-card-body">Placeholder</div>
            </div>

            <div className="whatif-card">
              <div className="whatif-card-header">
                <h3>Product Demand</h3>
              </div>
              <div className="whatif-card-body">Placeholder</div>
            </div>

            <div className="whatif-card">
              <div className="whatif-card-header">
                <h3>What If Parameter</h3>
              </div>
              <div className="whatif-card-body">Placeholder (Sliders)</div>
            </div>

            <div className="whatif-card">
              <div className="whatif-card-header">
                <h3>Recommendation</h3>
              </div>
              <div className="whatif-card-body">Placeholder</div>
            </div>
          </div>

          {/* Row 2 */}
          <div className="whatif-grid whatif-grid-1">
            <div className="whatif-card">
              <div className="whatif-card-header">
                <h3>Sales Impact of Parameter Change</h3>
              </div>
              <div className="whatif-card-body whatif-large-placeholder">
                Placeholder (Chart)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WhatIfAnalysis
