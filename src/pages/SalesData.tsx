import type React from "react"
import { useState, useEffect } from "react"
import Sidebar from "../components/Sidebar"
import { useNavigate } from "react-router-dom"
import "../css/SalesData.css"
import { AddOutlined, Inventory2Outlined, EditOutlined } from "@mui/icons-material"
import { supabase } from "../supabaseClient"
import { Checkbox, Typography, Divider, Button } from "@mui/material"
import SearchIcon from "@mui/icons-material/Search"

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
  medium: string
  mop: string
  total: number
  archived?: boolean
}

const SalesData: React.FC = () => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState("")
  const [salesData, setSalesData] = useState<SalesRecord[]>([])
  const [selectedRecords, setSelectedRecords] = useState<Set<string>>(new Set())
  const userRole = localStorage.getItem("userRole")

  const fetchData = async () => {
    const { data, error } = await supabase
  .from("orders")
  .select(`
    id,
    order_date,
    order_time,
    order_mode,
    total_amount,
    is_active,
    customers ( name ),
    medium:medium_id ( name ),
    mop:mop_id ( name ),
    order_items (
      id,
      quantity,
      subtotal,
      variant_id (
        id,
        menu_items ( name ),
        category_sizes ( size )
      )
    )
  `)
  .eq("is_active", true)
  .gte("order_date", "2022-01-01")
  .lte("order_date", "2025-12-31")
  .order("order_date", { ascending: false })

    if (error) {
      console.error(" Fetch error:", error)
      return
    }

    const formatted: SalesRecord[] = (data || []).flatMap((order: any) =>
      (order.order_items || []).map((item: any) => ({
        id: `${order.id}-${item.id}`,
        name: order.customers?.name || "N/A",
        time: order.order_time || "",
        date: order.order_date || "",
        day: order.order_date ? new Date(order.order_date).toLocaleDateString("en-US", { weekday: "long" }) : "",
        item: item.variant_id?.menu_items?.name || "N/A",
        itemSize: item.variant_id?.category_sizes?.size || "N/A",
        orderType: order.order_mode || "N/A",
        quantity: item.quantity || 0,
        medium: order.medium?.name || "N/A",
        mop: order.mop?.name || "N/A",
        total: item.subtotal || order.total_amount || 0,
        archived: order.is_active === false,
      })),
    )

    setSalesData(formatted)
  }

  useEffect(() => {
    fetchData()
    const channel = supabase
      .channel("orders-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "orders" }, fetchData)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "orders" }, fetchData)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "order_items" }, fetchData)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "order_items" }, fetchData)
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  const toggleRecordSelection = (id: string) => {
    setSelectedRecords((prev) => {
      const updated = new Set(prev)
      if (updated.has(id)) updated.delete(id)
      else updated.add(id)
      return updated
    })
  }

  const handleAddRecord = () => {
    if (userRole === "Admin") navigate("/addrecord")
  }

  const handleEditRecord = () => {
    if (userRole !== "Admin") {
      alert("Only Admins can edit records.")
      return
    }
    if (selectedRecords.size === 1) {
      const editId = Array.from(selectedRecords)[0]
      const recordToEdit = salesData.find((r) => r.id === editId)
      if (recordToEdit) navigate(`/editrecord/${editId}`, { state: { record: recordToEdit } })
    } else {
      alert("Please select exactly one record to edit.")
    }
  }

  const handleArchiveRecord = async () => {
    if (userRole !== "Admin") {
      alert("Only Admins can archive records.")
      return
    }
    if (selectedRecords.size === 0) {
      alert("Please select at least one record to archive.")
      return
    }

    const idsToArchive = Array.from(selectedRecords).map((id) => Number(id.split("-")[0]))
    const { error } = await supabase.from("orders").update({ is_active: false }).in("id", idsToArchive)

    if (error) {
      console.error("Error archiving records:", error)
      alert("Failed to archive records.")
    } else {
      alert("Selected records archived successfully!")
      setSelectedRecords(new Set())
      fetchData()
    }
  }

  const filteredData = salesData.filter((r) =>
    Object.values(r).some((v) => String(v).toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const numSelected = selectedRecords.size
  const rowCount = filteredData.length

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelecteds = new Set(filteredData.map((r) => r.id))
      setSelectedRecords(newSelecteds)
      return
    }
    setSelectedRecords(new Set())
  }

  const [page, setPage] = useState(0)
  const pageSize = 50
  const from = page * pageSize
  const to = from + pageSize - 1

  const paginatedData = filteredData.slice(from, to + 1)
  const totalPages = Math.ceil(filteredData.length / pageSize)

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <div className="sales-data-container">
        <div className="header-section">
          <div className="header-left">
            <h1 className="page-title">SALES DATA</h1>
          </div>
        </div>

        <Typography variant="caption" sx={{ color: "gray", fontSize: "14px", mb: 1, mt: 1 }}>
          This table shows all transactions from 2022–2025 with item-level details.
          {userRole === "Admin" && " Admins can add, edit, or archive records."}
        </Typography>

        <Divider />

        <div className="action-bar">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <button className="sales-search-button">
              <SearchIcon className="search-icon" />
            </button>
          </div>

          {userRole === "Admin" && (
            <div className="action-buttons">
              <Button variant="outlined" sx={{ color: "black", border: "none", "&:hover": { backgroundColor: "#EC7A1C", color: "white" }, padding: "8px 25px" }} onClick={handleAddRecord} startIcon={<AddOutlined style={{ fontSize: 20 }} />}>
                Add Record
              </Button>
              <Button variant="outlined" sx={{ color: "black", border: "none", "&:hover": { backgroundColor: "#EC7A1C", color: "white" }, padding: "8px 25px" }} onClick={handleArchiveRecord} startIcon={<Inventory2Outlined style={{ fontSize: 20 }} />} disabled={selectedRecords.size === 0}>
                Archive Record
              </Button>
              <Button variant="outlined" sx={{ color: "black", border: "none", "&:hover": { backgroundColor: "#EC7A1C", color: "white" }, padding: "8px 25px" }} onClick={handleEditRecord} startIcon={<EditOutlined style={{ fontSize: 20 }} />} disabled={selectedRecords.size !== 1}>
                Edit Record
              </Button>
            </div>
          )}
        </div>

        <div className="table-container">
          <table className="sales-table">
            <thead>
              <tr>
                {userRole === "Admin" && (
                  <th>
                    <Checkbox
                      sx={{
                        color: "#9ca3af",
                        "&.Mui-checked": { color: "#EC7A1C" },
                        "&.MuiCheckbox-indeterminate": { color: "#EC7A1C" },
                      }}
                      indeterminate={numSelected > 0 && numSelected < rowCount}
                      checked={rowCount > 0 && numSelected === rowCount}
                      onChange={handleSelectAllClick}
                    />
                  </th>
                )}
                <th>Name</th>
                <th>Order Time</th>
                <th>Order Date</th>
                <th>Order Day</th>
                <th>Item</th>
                <th>Item Size</th>
                <th>Order Type</th>
                <th>Quantity</th>
                <th>Medium</th>
                <th>MOP</th>
                <th>Total</th>
              </tr>
            </thead>

            <tbody>
              {filteredData.length > 0 ? (
                paginatedData.map((record) => (
                  <tr key={record.id}>
                    {userRole === "Admin" && (
                      <td>
                        <Checkbox
                          sx={{ color: "#9ca3af", "&.Mui-checked": { color: "#EC7A1C" } }}
                          checked={selectedRecords.has(record.id)}
                          onChange={() => toggleRecordSelection(record.id)}
                        />
                      </td>
                    )}
                    <td>{record.name}</td>
                    <td>{record.time}</td>
                    <td>{record.date}</td>
                    <td>{record.day}</td>
                    <td>{record.item}</td>
                    <td>{record.itemSize}</td>
                    <td>{record.orderType}</td>
                    <td>{record.quantity}</td>
                    <td>{record.medium}</td>
                    <td>{record.mop}</td>
                    <td>₱ {record.total.toFixed(2)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={12} style={{ textAlign: "center", padding: "20px" }}>
                    No records found
                  </td>
                </tr>
              )}
            </tbody>

            {/* ✅ Table footer pagination */}
            <tfoot>
              <tr>
                <td colSpan={12}>
                  <div className="pagination-container">
                    <span className="pagination-info">
                      Page {page + 1} of {totalPages}
                    </span>

                    <input
                      type="number"
                      className="pagination-input"
                      value={page + 1}
                      min={1}
                      max={totalPages}
                      onChange={(e) => {
                        const inputPage = Number(e.target.value)
                        if (!isNaN(inputPage) && inputPage >= 1 && inputPage <= totalPages) {
                          setPage(inputPage - 1)
                        }
                      }}
                    />

                    <button className="pagination-button" disabled={page === 0} onClick={() => setPage(0)}>⏮</button>
                    <button className="pagination-button" disabled={page === 0} onClick={() => setPage((p) => Math.max(p - 1, 0))}>←</button>
                    <button className="pagination-button" disabled={page + 1 >= totalPages} onClick={() => setPage((p) => Math.min(p + 1, totalPages - 1))}>→</button>
                    <button className="pagination-button" disabled={page + 1 >= totalPages} onClick={() => setPage(totalPages - 1)}>⏭</button>

                    <span className="pagination-summary">
                      {rowCount > 0
                        ? `Showing ${from + 1}-${Math.min(to + 1, rowCount)} of ${rowCount}`
                        : "No records"}
                    </span>
                  </div>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  )
}

export default SalesData;
