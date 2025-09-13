import React from "react";
import Sidebar from "../components/Sidebar";
import "../css/MarketBasket.css";

interface MarketBasketProps {
  currentUser?: string;
  onLogout: () => void;
}

const MarketBasket: React.FC<MarketBasketProps> = ({}) => {
  return (
    <div className="market-basket-container">
      <Sidebar />
      <div className="market-basket-content">
        <div className="market-basket-header">
          <h1>PRODUCT PERFORMANCE AND MARKET BASKET</h1>
        </div>

        <div className="market-basket-grid">
          {/* Product Category Dropdown */}
          <div className="market-basket-div1">
            <div className="market-basket-content1">Product Category</div>
            <select defaultValue="food-trays">
              <option value="food-trays">Food Trays</option>
              <option value="beverages">Beverages</option>
              <option value="desserts">Desserts</option>
            </select>
          </div>

          {/* Food Trays Chart */}
          <div className="market-basket-div2">
            <div className="market-basket-content2">Food Trays</div>
            <div className="placeholder">Chart Placeholder (Food Trays)</div>
          </div>

          {/* Often Bought With Dropdown */}
          <div className="market-basket-div3">
            <div className="market-basket-content3">Often Bought With</div>
            <select defaultValue="sampleplot">
              <option>Sampleplot</option>
              <option>Option 2</option>
            </select>
          </div>

          {/* Product Recommendations Chart */}
          <div className="market-basket-div4">
            <div className="market-basket-content4">Product Recommendations</div>
            <div className="placeholder">Chart Placeholder</div>
          </div>

          {/* Revenue vs Products */}
          <div className="market-basket-div5">
            <div className="market-basket-content3">Revenue Vs Products</div>
            <div className="placeholder">Chart Placeholder</div>
          </div>

          {/* Top 10 Most Sold */}
          <div className="market-basket-div6">
            <div className="market-basket-content4">Top 10 Most Sold</div>
            <div className="placeholder">Chart Placeholder</div>
          </div>

          {/* Top 10 Least Sold */}
          <div className="market-basket-div7">
            <div className="market-basket-content5">Top 10 Least Sold</div>
            <div className="placeholder">Chart Placeholder</div>
          </div>

          {/* Top 10 Combinations by Lift */}
          <div className="market-basket-div8">
            <div className="market-basket-content8">Top 10 Combinations by Lift</div>
            <div className="placeholder">Chart Placeholder</div>
          </div>

          {/* Top 10 Combinations by Support */}
          <div className="market-basket-div9">
            <div className="market-basket-content9">Top 10 Combinations by Support</div>
            <div className="placeholder">Chart Placeholder</div>
          </div>

          {/* How to Interpret */}
          <div className="market-basket-div10">
            <div className="market-basket-content10">How to Interpret</div>
            <div className="placeholder">Chart Placeholder</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketBasket;
