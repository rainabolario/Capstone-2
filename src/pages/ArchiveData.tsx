import React, { useState } from "react"
import Sidebar from "../components/Sidebar"
//import { useNavigate } from "react-router-dom"
import "../css/ArchivedData.css"
//import { Inventory2Outlined } from "@mui/icons-material"

interface SalesRecord {
  id: string
  name: string
  time: string
  date: string
  day: string
  item: string
  itemSize: string
  orderType: string
  quantity: number
  address: string
  medium: string
  mop: string
  total: number
}

const ArchivedData: React.FC = () => {
  //const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState("")
  const [salesData] = useState<SalesRecord[]>([
    {
      id: "1",
      name: "Archived Example",
      time: "",
      date: "",
      day: "",
      item: "",
      itemSize: "",
      orderType: "",
      quantity: 0,
      address: "",
      medium: "",
      mop: "",
      total: 0,
    },
  ])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <div className="archived-data-container">
        {/* Header Section */}
        <div className="archived-header-section">
          <div className="header-left">
            <h1 className="archived-page-title">ARCHIVED DATA</h1>
          </div>
        </div>

        {/* Action Bar */}
        <div className="archived-action-bar">
          <div className="archived-search-container">
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={handleSearch}
              className="archived-search-input"
            />
            <button className="archived-search-button">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="archived-table-container">
          <table className="archived-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Time</th>
                <th>Date</th>
                <th>Day</th>
                <th>Item</th>
                <th>Item Size</th>
                <th>Order Type</th>
                <th>Quantity</th>
                <th>Address</th>
                <th>Medium</th>
                <th>MOP</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {salesData.map((record) => (
                <tr key={record.id}>
                  <td>{record.name}</td>
                  <td>{record.time}</td>
                  <td>{record.date}</td>
                  <td>{record.day}</td>
                  <td>{record.item}</td>
                  <td>{record.itemSize}</td>
                  <td>{record.orderType}</td>
                  <td>{record.quantity || ""}</td>
                  <td>{record.address}</td>
                  <td>{record.medium}</td>
                  <td>{record.mop}</td>
                  <td>{record.total || ""}</td>
                </tr>
              ))}
              {Array.from({ length: 15 }, (_, index) => (
                <tr key={`empty-${index}`}>
                  {Array.from({ length: 12 }, (_, i) => (
                    <td key={i}></td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default ArchivedData
