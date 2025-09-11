import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import "../css/MarketBasket.css";

interface MarketBasketProps {
  currentUser?: string;
  onLogout: () => void;
}

const MarketBasket: React.FC<MarketBasketProps> = ({ onLogout }) => {
  const [activeItem, setActiveItem] = useState("Performance & Market Basket")

  const handleSidebarClick = (item: string) => {
    if (item === "Logout") {
      onLogout()
    } else {
      setActiveItem(item)
    }
  }

  return (
    <div className="market-basket-dashboard">
      <Sidebar activeItem={activeItem} onItemClick={handleSidebarClick} />

      <div className="market-basket-dashboard-content">
        <div className="market-basket-dashboard-header">
          <h1>PRODUCT PERFORMANCE AND MARKET BASKET</h1>
        </div>

        <div className="market-basket-dashboard-main">
          {/* Row 1 */}
          <div className="market-basket-grid market-basket-grid-4">
            <div className="market-basket-chart-container">
              <div className="market-basket-chart-header">
                <h3>Product Category</h3>
                <select defaultValue="Food Trays">
                  <option>Food Trays</option>
                  <option>Beverages</option>
                  <option>Desserts</option>
                  <option>Appetizers</option>
                </select>
              </div>
              <div className="market-basket-chart-body">Chart placeholder</div>
            </div>

            <div className="market-basket-chart-container">
              <div className="market-basket-chart-header">
                <h3>Revenue Vs Products</h3>
              </div>
              <div className="market-basket-chart-body">Chart placeholder</div>
            </div>

            <div className="market-basket-chart-container">
              <div className="market-basket-chart-header">
                <h3>Top 10 Most Sold</h3>
              </div>
              <div className="market-basket-chart-body">Chart placeholder</div>
            </div>

            <div className="market-basket-chart-container">
              <div className="market-basket-chart-header">
                <h3>Top 10 Least Sold</h3>
              </div>
              <div className="market-basket-chart-body">Chart placeholder</div>
            </div>
          </div>

          {/* Row 2 */}
          <div className="market-basket-grid market-basket-grid-5">
            <div className="market-basket-chart-container">
              <div className="market-basket-chart-header">
                <h3>Often Bought With</h3>
                <select defaultValue="Sampleplot">
                  <option>Sampleplot</option>
                  <option>Option 2</option>
                  <option>Option 3</option>
                </select>
              </div>
              <div className="market-basket-chart-body">Chart placeholder</div>
            </div>

            <div className="market-basket-chart-container">
              <div className="market-basket-chart-header">
                <h3>Product Recommendations</h3>
              </div>
              <div className="market-basket-chart-body">Chart placeholder</div>
            </div>

            <div className="market-basket-chart-container">
              <div className="market-basket-chart-header">
                <h3>Top 10 Combinations by Lift</h3>
              </div>
              <div className="market-basket-chart-body">Chart placeholder</div>
            </div>

            <div className="market-basket-chart-container">
              <div className="market-basket-chart-header">
                <h3>Top 10 Combinations by Support</h3>
              </div>
              <div className="market-basket-chart-body">Chart placeholder</div>
            </div>

            <div className="market-basket-chart-container">
              <div className="market-basket-chart-header">
                <h3>How to Interpret:</h3>
              </div>
              <div className="market-basket-chart-body">Chart placeholder</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MarketBasket