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
  total_amount: number
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

  // =============================
  // FETCH SELECTED RECORD DETAILS
  // =============================
  useEffect(() => {
    const loadRecord = async () => {
      if (location.state?.record) {
        const orderId = Number(location.state.record.id.split("-")[0])
        const orderItemId = Number(location.state.record.id.split("-")[1])

        try {
          // 🟠 Fetch order details (including joined customer + order_items)
          const { data, error } = await supabase
            .from("orders")
            .select(`
              id,
              order_date,
              order_time,
              order_mode,
              medium_y,
              payment_mode,
              total_amount,
              customers ( id, name ),
              order_items (
                id,
                quantity,
                variant_id (
                  menu_items ( name ),
                  category_sizes ( size )
                )
              )
            `)
            .eq("id", orderId)
            .single()

          if (error) throw error

          const orderItem = data.order_items?.[0]

          const normalizedRecord: SalesRecord = {
            id: data.id,
            name: data.customers?.name || "",
            time: data.order_time || "",
            date: data.order_date || "",
            day: data.order_date
              ? new Date(data.order_date).toLocaleDateString("en-US", { weekday: "long" })
              : "",
            item: orderItem?.variant_id?.menu_items?.name?.toUpperCase() || "",
            item_size: orderItem?.variant_id?.category_sizes?.size?.toUpperCase() || "",
            order_type: data.order_mode?.toUpperCase() || "",
            quantity: orderItem?.quantity || 0,
            address: "",
            medium_y: data.medium_y?.toUpperCase() || "",
            mop_y: data.payment_mode?.toUpperCase() || "",
            total_amount: data.total_amount || 0,
          }

          setRecord(normalizedRecord)
        } catch (err) {
          console.error("❌ Error fetching record:", err)
        }
      }
      setLoading(false)
    }

    loadRecord()
  }, [location.state])

  // =============================
  // FETCH DROPDOWN DATA
  // =============================
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: itemsData } = await supabase.from("menu_items").select("name, category_id")
        if (itemsData) {
          const normalizedItems = itemsData.map((item) => ({
            item_name: (item.name || "").toString().toUpperCase().trim(),
            category: item.category_id,
          }))
          setItems(normalizedItems)
        }

        const { data: sizesData } = await supabase.from("category_sizes").select("size")
        if (sizesData) {
          const uniqueSizes = Array.from(
            new Set(sizesData.map((s) => (s.size || "").toString().toUpperCase().trim()))
          ).filter((s) => s !== "")
          setItemSizes(uniqueSizes)
        }

        const { data: categoriesData } = await supabase.from("category").select("name")
        if (categoriesData) {
          const uniqueTypes = Array.from(
            new Set(categoriesData.map((c) => (c.name || "").toString().toUpperCase().trim()))
          ).filter((t) => t !== "")
          setOrderTypes(uniqueTypes)
        }

        const { data: mediumsData } = await supabase.from("orders").select("medium_y")
        if (mediumsData) {
          const uniqueMediums = Array.from(
            new Set(mediumsData.map((m) => (m.medium_y || "").toString().toUpperCase().trim()))
          ).filter((m) => m !== "")
          setMediums(uniqueMediums)
        }

        const { data: modesData } = await supabase.from("orders").select("payment_mode")
        if (modesData) {
          const uniqueModes = Array.from(
            new Set(modesData.map((m) => (m.payment_mode || "").toString().toUpperCase().trim()))
          ).filter((m) => m !== "")
          setPaymentModes(uniqueModes)
        }
      } catch (err) {
        console.error("Error fetching dropdown data:", err)
      }
    }

    fetchData()
  }, [])

  // =============================
  // HANDLE FIELD CHANGES
  // =============================
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    if (record) {
      const newValue =
        name === "quantity" || name === "total_amount"
          ? Number(value) || 0
          : value.toUpperCase().trim()
      setRecord({ ...record, [name]: newValue })
    }
  }

  // =============================
  // SAVE / UPDATE RECORD
  // =============================
  const handleSave = async () => {
    if (!record) return

    try {
      const orderId = Number(location.state.record.id.split("-")[0])
      const orderItemId = Number(location.state.record.id.split("-")[1])

      // 1️⃣ Update customer name
      const { data: orderData, error: orderFetchError } = await supabase
        .from("orders")
        .select("customer_id")
        .eq("id", orderId)
        .single()

      if (!orderFetchError && orderData?.customer_id) {
        await supabase
          .from("customers")
          .update({ name: record.name })
          .eq("id", orderData.customer_id)
      }

      // 2️⃣ Update orders table
      const { error: orderError } = await supabase
        .from("orders")
        .update({
          order_mode: record.order_type,
          medium_y: record.medium_y,
          payment_mode: record.mop_y,
          total_amount: record.total_amount,
        })
        .eq("id", orderId)

      if (orderError) throw orderError

      // 3️⃣ Update order_items table
      const { error: itemError } = await supabase
        .from("order_items")
        .update({
          quantity: record.quantity,
          subtotal: record.total_amount,
        })
        .eq("id", orderItemId)

      if (itemError) throw itemError

      alert("✅ Record updated successfully!")
      navigate(-1)
    } catch (err: any) {
      console.error("❌ Error updating record:", err)
      alert("❌ Failed to update record. Check console for details.")
    }
  }

  const handleCancel = () => navigate(-1)

  if (loading) return <p>Loading record...</p>
  if (!record) return <p>No record found. Please go back and try again.</p>

  const menuProps = { PaperProps: { style: { maxHeight: 250, width: 300 } } }

  // =============================
  // UI RENDER
  // =============================
  return (
    <div className="edit-record-container">
      <Sidebar />
      <div className="edit-form-container">
        <h2>ORDER RECORD</h2>
        <div className="edit-form">
          <h3>Edit Order Record</h3>
          <Divider />

          <div className="edit-form-wrapper">
            {/* Existing Fields — No UI change */}
            <div className="form-row">
              <TextField
                className="form-field"
                label="Customer Name"
                name="name"
                value={record.name || ""}
                onChange={handleChange}
              />
            </div>

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
                disabled
              />
            </div>

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

            {/* ✅ Total Amount Field */}
            <div className="form-row">
              <TextField
                className="form-field"
                label="Total Amount"
                name="total_amount"
                type="number"
                value={record.total_amount ?? 0}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="button-form-container">
          <Button
            variant="outlined"
            sx={{
              color: "gray",
              borderColor: "gray",
              "&:hover": {
                backgroundColor: "#EC7A1C",
                color: "white",
                border: "1px solid #EC7A1C",
              },
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
