
import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { TextField, Button, Divider, MenuItem } from "@mui/material"
import Sidebar from "../components/Sidebar"
import "../css/EditRecord.css"
import { supabase } from "../supabaseClient"

interface SalesRecord {
  id: string
  name: string
  time: string
  date: string
  day: string
  item: string
  item_size: string
  order_type: string
  quantity: number
  address: string
  medium_y: string
  mop_y: string
}

interface ItemOption {
  item_name: string
  category: string
}

const EditRecord: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [record, setRecord] = useState<SalesRecord | null>(null)
  const [loading, setLoading] = useState(true)

  const [items, setItems] = useState<ItemOption[]>([])
  const [itemSizes, setItemSizes] = useState<string[]>([])
  const [orderTypes, setOrderTypes] = useState<string[]>([])
  const [mediums, setMediums] = useState<string[]>([])
  const [paymentModes, setPaymentModes] = useState<string[]>([])

  useEffect(() => {
    const loadRecord = async () => {
      if (location.state?.record) {
        const recordId = location.state.record.raw_order_id || location.state.record.id
        console.log("[v0] Loading record with ID:", recordId)

        try {
          // Fetch the complete record from database
          const { data: fullRecord, error } = await supabase
            .from("raw_orders")
            .select("*")
            .eq("raw_order_id", recordId)
            .single()

          if (error) throw error

          if (fullRecord) {
            console.log("[v0] Full record from DB:", fullRecord)
            console.log("[v0] item_size value:", fullRecord.item_size)
            console.log("[v0] order_type value:", fullRecord.order_type)
            console.log("[v0] medium_y value:", fullRecord.medium_y)
            console.log("[v0] mop_y value:", fullRecord.mop_y)

            const normalizedRecord: SalesRecord = {
              id: fullRecord.raw_order_id,
              name: (fullRecord.name || "").toString().trim(),
              time: (fullRecord.time || "").toString().trim(),
              date: (fullRecord.date || "").toString().trim(),
              day: (fullRecord.day || "").toString().trim(),
              item: (fullRecord.item || "").toString().toUpperCase().trim(),
              item_size: (fullRecord.item_size || "").toString().toUpperCase().trim(),
              order_type: (fullRecord.order_type || "").toString().toUpperCase().trim(),
              quantity: fullRecord.quantity || 0,
              address: (fullRecord.address || "").toString().trim(),
              medium_y: (fullRecord.medium_y || "").toString().toUpperCase().trim(),
              mop_y: (fullRecord.mop_y || "").toString().toUpperCase().trim(),
            }

            console.log("[v0] Normalized record:", normalizedRecord)
            setRecord(normalizedRecord)
          }
        } catch (err) {
          console.error("[v0] Error fetching record:", err)
        }
      }
      setLoading(false)
    }

    loadRecord()
  }, [location.state])

  // Fetch menu items and dropdown options from database
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch menu items
        const { data: itemsData, error: itemsError } = await supabase.from("menu_items").select("name, category_id")
        if (!itemsError && itemsData) {
          const normalizedItems = itemsData.map((item) => ({
            item_name: (item.name || "").toString().toUpperCase().trim(),
            category: item.category_id,
          }))
          console.log("[v0] Fetched items:", normalizedItems)
          setItems(normalizedItems)
        }

        const { data: sizesData, error: sizesError } = await supabase.from("category_sizes").select("size")
        if (!sizesError && sizesData) {
          const uniqueSizes = Array.from(
            new Set(sizesData.map((s) => (s.size || "").toString().toUpperCase().trim())),
          ).filter((s) => s !== "")
          console.log("[v0] Fetched sizes:", uniqueSizes)
          setItemSizes(uniqueSizes)
        }

        const { data: categoriesData, error: categoriesError } = await supabase.from("category").select("name")
        if (!categoriesError && categoriesData) {
          const uniqueTypes = Array.from(
            new Set(categoriesData.map((c) => (c.name || "").toString().toUpperCase().trim())),
          ).filter((t) => t !== "")
          console.log("[v0] Fetched order types:", uniqueTypes)
          setOrderTypes(uniqueTypes)
        }

        const { data: ordersData, error: ordersError } = await supabase.from("raw_orders").select("medium_y")
        if (!ordersError && ordersData) {
          const uniqueMediums = Array.from(
            new Set(ordersData.map((o) => (o.medium_y || "").toString().toUpperCase().trim())),
          ).filter((m) => m !== "")
          console.log("[v0] Fetched mediums:", uniqueMediums)
          setMediums(uniqueMediums)
        }

        const { data: modesData, error: modesError } = await supabase.from("raw_orders").select("mop_y")
        if (!modesError && modesData) {
          const uniqueModes = Array.from(
            new Set(modesData.map((m) => (m.mop_y || "").toString().toUpperCase().trim())),
          ).filter((m) => m !== "")
          console.log("[v0] Fetched payment modes:", uniqueModes)
          setPaymentModes(uniqueModes)
        }
      } catch (err) {
        console.error("[v0] Error fetching data:", err)
      }
    }
    fetchData()
  }, [])

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    if (record) {
      const newValue = name === "quantity" ? Number.parseFloat(value) || 0 : value.toUpperCase().trim()
      console.log(`[v0] Changed ${name} to:`, newValue)
      setRecord({ ...record, [name]: newValue })
    }
  }

  const handleSave = async () => {
    if (!record) return
    try {
      const { error } = await supabase
        .from("raw_orders")
        .update({
          name: record.name,
          time: record.time,
          date: record.date,
          day: record.day,
          item: record.item,
          item_size: record.item_size,
          order_type: record.order_type,
          quantity: record.quantity,
          address: record.address,
          medium_y: record.medium_y,
          mop_y: record.mop_y,
        })
        .eq("raw_order_id", record.id)

      if (error) throw error
      alert("✅ Record updated successfully!")
      navigate(-1)
    } catch (err: any) {
      console.error("❌ Error updating record:", err.message)
      alert("❌ Failed to update record. Check console for details.")
    }
  }

  const handleCancel = () => navigate(-1)

  if (loading) return <p>Loading record...</p>
  if (!record) return <p>No record found. Please go back and try again.</p>

  const menuProps = {
    PaperProps: {
      style: { maxHeight: 250, width: 300 },
    },
  }

  return (
    <div className="edit-record-container">
      <Sidebar />
      <div className="edit-form-container">
        <h2>ORDER RECORD</h2>

        <div className="edit-form">
          <h3>Edit Order Record</h3>
          <Divider />

          <div className="edit-form-wrapper">
            {/* Customer Name */}
            <div className="form-row">
              <TextField
                className="form-field"
                label="Customer Name"
                name="name"
                value={record.name || ""}
                onChange={handleChange}
              />
            </div>

            {/* Date / Time / Day */}
            <div className="form-row">
              <TextField
                className="form-field"
                label="Date"
                name="date"
                value={record.date || ""}
                onChange={handleChange}
              />
              <TextField
                className="form-field"
                label="Time"
                name="time"
                value={record.time || ""}
                onChange={handleChange}
              />
              <TextField
                className="form-field"
                label="Day"
                name="day"
                value={record.day || ""}
                onChange={handleChange}
              />
            </div>

            {/* Item Info */}
            <div className="form-row">
              <TextField
                select
                className="form-field"
                label="Item"
                name="item"
                value={record.item || ""}
                onChange={handleChange}
                SelectProps={{ MenuProps: menuProps }}
              >
                {items.map((item) => (
                  <MenuItem key={item.item_name} value={item.item_name}>
                    {item.item_name}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                className="form-field"
                label="Item Size"
                name="item_size"
                value={record.item_size || ""}
                onChange={handleChange}
                SelectProps={{ MenuProps: menuProps }}
              >
                {itemSizes.map((size) => (
                  <MenuItem key={size} value={size}>
                    {size}
                  </MenuItem>
                ))}
              </TextField>
            </div>

            {/* Order Type / Quantity */}
            <div className="form-row">
              <TextField
                select
                className="form-field"
                label="Order Type"
                name="order_type"
                value={record.order_type || ""}
                onChange={handleChange}
                SelectProps={{ MenuProps: menuProps }}
              >
                {orderTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                className="form-field"
                label="Quantity"
                name="quantity"
                type="number"
                value={record.quantity || ""}
                onChange={handleChange}
              />
            </div>

            {/* Medium / Mode of Payment */}
            <div className="form-row">
              <TextField
                select
                className="form-field"
                label="Medium"
                name="medium_y"
                value={record.medium_y || ""}
                onChange={handleChange}
                SelectProps={{ MenuProps: menuProps }}
              >
                {mediums.map((med) => (
                  <MenuItem key={med} value={med}>
                    {med}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                className="form-field"
                label="Mode of Payment"
                name="mop_y"
                value={record.mop_y || ""}
                onChange={handleChange}
                SelectProps={{ MenuProps: menuProps }}
              >
                {paymentModes.map((mode) => (
                  <MenuItem key={mode} value={mode}>
                    {mode}
                  </MenuItem>
                ))}
              </TextField>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="button-form-container">
          <Button
            variant="outlined"
            sx={{
              color: "gray",
              borderColor: "gray",
              "&:hover": { backgroundColor: "#EC7A1C", color: "white", border: "1px solid #EC7A1C" },
              padding: "8px 25px",
            }}
            onClick={handleCancel}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            sx={{
              color: "white",
              backgroundColor: "#EC7A1C",
              "&:hover": { backgroundColor: "#EC7A1C", color: "white" },
              padding: "8px 25px",
            }}
            onClick={handleSave}
          >
            Update Changes
          </Button>
        </div>
      </div>
    </div>
  )
}

export default EditRecord
