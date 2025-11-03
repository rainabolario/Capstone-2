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
  quantity: number
  total_amount: number
  variant_id: number | null
  medium_id: number | null
  mop_id: number | null
  item: string
  item_size: string
  medium: string
  mop: string
  order_type: string
}

interface VariantOption {
  id: number
  name: string
  size: string
}

interface MediumOption {
  id: number
  name: string
}

interface MOPOption {
  id: number
  name: string
}

const EditRecord: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [record, setRecord] = useState<SalesRecord | null>(null)
  const [loading, setLoading] = useState(true)

  const [variants, setVariants] = useState<VariantOption[]>([])
  const [mediums, setMediums] = useState<MediumOption[]>([])
  const [mops, setMops] = useState<MOPOption[]>([])
  const [orderTypes, setOrderTypes] = useState<string[]>([]) // order type dropdown

  // ==============================
  // 🟠 Load record data
  // ==============================
  useEffect(() => {
    const loadRecord = async () => {
      if (!location.state?.record) {
        setLoading(false)
        return
      }

      const orderId = Number(location.state.record.id.split("-")[0])
      const orderItemId = Number(location.state.record.id.split("-")[1])

      try {
        const { data, error } = await supabase
          .from("orders")
          .select(`
            id,
            order_date,
            order_time,
            order_mode,
            total_amount,
            medium:medium_id ( id, name ),
            mop:mop_id ( id, name ),
            customers ( name ),
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
          .eq("id", orderId)
          .single()

        if (error) throw error

        const orderItem = data.order_items.find((oi: any) => oi.id === orderItemId)
        if (!orderItem) throw new Error("Order item not found")

        const normalizedRecord: SalesRecord = {
          id: `${data.id}-${orderItem.id}`,
          name: data.customers?.name || "",
          time: data.order_time || "",
          date: data.order_date || "",
          day: data.order_date
            ? new Date(data.order_date).toLocaleDateString("en-US", { weekday: "long" })
            : "",
          item: orderItem.variant_id?.menu_items?.name || "",
          item_size: orderItem.variant_id?.category_sizes?.size || "",
          variant_id: orderItem.variant_id?.id || null,
          order_type: data.order_mode || "",
          quantity: orderItem.quantity || 0,
          total_amount: orderItem.subtotal || data.total_amount || 0,
          medium: data.medium?.name || "N/A",
          medium_id: data.medium?.id || null,
          mop: data.mop?.name || "N/A",
          mop_id: data.mop?.id || null,
        }

        setRecord(normalizedRecord)
      } catch (err) {
        console.error("❌ Error fetching record:", err)
      } finally {
        setLoading(false)
      }
    }

    loadRecord()
  }, [location.state])

  // ==============================
  // 🟠 Load dropdowns
  // ==============================
  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const { data: variantData } = await supabase
          .from("menu_item_variants")
          .select(`
            id,
            menu_items ( name ),
            category_sizes ( size )
          `)

        if (variantData) {
          setVariants(
            variantData.map((v: any) => ({
              id: v.id,
              name: v.menu_items?.name || "",
              size: v.category_sizes?.size || "",
            }))
          )
        }

        const { data: mediumData } = await supabase.from("medium").select("id, name")
        if (mediumData) setMediums(mediumData)

        const { data: mopData } = await supabase.from("mop").select("id, name")
        if (mopData) setMops(mopData)

        const { data: categoryData } = await supabase.from("category").select("name")
        if (categoryData) setOrderTypes(categoryData.map((c: any) => c.name))
      } catch (err) {
        console.error("Error fetching dropdowns:", err)
      }
    }

    fetchDropdowns()
  }, [])

  // ==============================
  // 🟠 Handle field changes
  // ==============================
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    if (!record) return

    if (name === "date") {
      const newDay = new Date(value).toLocaleDateString("en-US", { weekday: "long" })
      setRecord({ ...record, date: value, day: newDay })
      return
    }

    if (name === "item" || name === "item_size") {
      const newItem = name === "item" ? value : record.item
      const newSize = name === "item_size" ? value : record.item_size
      const variant = variants.find((v) => v.name === newItem && v.size === newSize)

      setRecord({
        ...record,
        item: newItem,
        item_size: newSize,
        variant_id: variant?.id || null,
      })
      return
    }

    if (name === "medium") {
      const medium = mediums.find((m) => m.name === value)
      setRecord({
        ...record,
        medium: medium?.name || record.medium,
        medium_id: medium?.id || null,
      })
      return
    }

    if (name === "mop") {
      const mop = mops.find((m) => m.name === value)
      setRecord({
        ...record,
        mop: mop?.name || record.mop,
        mop_id: mop?.id || null,
      })
      return
    }

    setRecord({
      ...record,
      [name]: name === "quantity" || name === "total_amount" ? Number(value) : value,
    })
  }

  // ==============================
  // 🟠 Handle save / update (includes receipt_totals)
  // ==============================
  const handleSave = async () => {
    if (!record) return

    try {
      const orderId = Number(record.id.split("-")[0])
      const orderItemId = Number(record.id.split("-")[1])

      // 1️⃣ Update customer name
      const { data: orderData } = await supabase
        .from("orders")
        .select("customer_id")
        .eq("id", orderId)
        .single()

      if (orderData?.customer_id) {
        await supabase
          .from("customers")
          .update({ name: record.name })
          .eq("id", orderData.customer_id)
      }

      if (!record.variant_id) throw new Error("Item not found")

      // 2️⃣ Update order_items
      const { error: itemError } = await supabase
        .from("order_items")
        .update({
          quantity: Number(record.quantity),
          subtotal: Number(record.total_amount),
          variant_id: record.variant_id,
        })
        .eq("id", orderItemId)
      if (itemError) throw itemError

      // 3️⃣ Update orders
      const { error: orderError } = await supabase
        .from("orders")
        .update({
          order_mode: record.order_type,
          medium_id: record.medium_id,
          mop_id: record.mop_id,
          total_amount: Number(record.total_amount),
        })
        .eq("id", orderId)
      if (orderError) throw orderError

      // 4️⃣ Update raw_orders
      const { error: rawError } = await supabase
        .from("raw_orders")
        .update({
          name: record.name,
          date: record.date,
          time: record.time,
          day: record.day,
          item: record.item,
          item_size: record.item_size,
          order_type: record.order_type,
          quantity: record.quantity,
          medium: record.medium,
          mop: record.mop,
        })
        .eq("raw_order_id", orderId)
      if (rawError) throw rawError

      // 5️⃣ Update or insert into receipt_totals
      const { data: existingReceipt, error: receiptFetchError } = await supabase
        .from("receipt_totals")
        .select("id")
        .eq("order_id", orderId)
        .single()

      if (receiptFetchError && receiptFetchError.code !== "PGRST116") {
        throw receiptFetchError
      }

      if (existingReceipt) {
        const { error: receiptUpdateError } = await supabase
          .from("receipt_totals")
          .update({
            receipt_total: Number(record.total_amount),
          })
          .eq("order_id", orderId)
        if (receiptUpdateError) throw receiptUpdateError
      } else {
        const today = new Date().toISOString().split("T")[0]
        const { error: receiptInsertError } = await supabase
          .from("receipt_totals")
          .insert([
            {
              order_id: orderId,
              receipt_date: today,
              receipt_total: Number(record.total_amount),
            },
          ])
        if (receiptInsertError) throw receiptInsertError
      }

      alert("✅ Record and total receipt updated successfully!")
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

  return (
    <div className="edit-record-container">
      <Sidebar />
      <div className="edit-form-container">
        <h2>ORDER RECORD</h2>
        <div className="edit-form">
          <h3>Edit Order Record</h3>
          <Divider />
          <div className="edit-form-wrapper">
            <div className="form-row">
              <TextField label="Customer Name" name="name" value={record.name} onChange={handleChange} className="form-field" />
            </div>

            <div className="form-row">
              <TextField label="Date" name="date" value={record.date} onChange={handleChange} className="form-field" />
              <TextField label="Time" name="time" value={record.time} onChange={handleChange} className="form-field" />
              <TextField label="Day" name="day" value={record.day} disabled className="form-field" />
            </div>

            <div className="form-row">
              <TextField select label="Item" name="item" value={record.item} onChange={handleChange} className="form-field" SelectProps={{ MenuProps: menuProps }}>
                {variants.map((v) => (
                  <MenuItem key={`${v.id}-name`} value={v.name}>{v.name}</MenuItem>
                ))}
              </TextField>

              <TextField select label="Item Size" name="item_size" value={record.item_size} onChange={handleChange} className="form-field" SelectProps={{ MenuProps: menuProps }}>
                {variants.map((v) => (
                  <MenuItem key={`${v.id}-size`} value={v.size}>{v.size}</MenuItem>
                ))}
              </TextField>
            </div>

            <div className="form-row">
              <TextField select label="Medium" name="medium" value={record.medium} onChange={handleChange} className="form-field" SelectProps={{ MenuProps: menuProps }}>
                {mediums.map((m) => (
                  <MenuItem key={m.id} value={m.name}>{m.name}</MenuItem>
                ))}
              </TextField>

              <TextField select label="Mode of Payment" name="mop" value={record.mop} onChange={handleChange} className="form-field" SelectProps={{ MenuProps: menuProps }}>
                {mops.map((m) => (
                  <MenuItem key={m.id} value={m.name}>{m.name}</MenuItem>
                ))}
              </TextField>
            </div>

            <div className="form-row">
              <TextField select label="Order Type" name="order_type" value={record.order_type} onChange={handleChange} className="form-field" SelectProps={{ MenuProps: menuProps }}>
                {orderTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </TextField>

              <TextField label="Quantity" name="quantity" type="number" value={record.quantity} onChange={handleChange} className="form-field" />
            </div>

            <div className="form-row">
              <TextField label="Total Amount" name="total_amount" type="number" value={record.total_amount} onChange={handleChange} className="form-field" />
            </div>
          </div>
        </div>

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
