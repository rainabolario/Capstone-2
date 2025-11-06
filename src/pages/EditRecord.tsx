import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { TextField, Button, Divider, MenuItem } from "@mui/material"
import Sidebar from "../components/Sidebar"
import "../css/EditRecord.css"
import { supabase } from "../supabaseClient"

interface EditRecordProps {
  onLogout: () => void
}

// ==============================
// 🔹 Type Definitions
// ==============================
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
  price: number
  category: string
}

interface MediumOption {
  id: number
  name: string
}

interface MOPOption {
  id: number
  name: string
}

interface VariantData {
  id: number
  price: number
  menu_items: { name: string; category_id: number }
  category_sizes: { size: string }
}

const NO_SIZE_CATEGORIES = ["STREET FOOD", "PACKED MEAL", "CATERING"]

const EditRecord: React.FC<EditRecordProps> = ({ onLogout }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [record, setRecord] = useState<SalesRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [variants, setVariants] = useState<VariantOption[]>([])
  const [filteredItems, setFilteredItems] = useState<string[]>([])
  const [filteredSizes, setFilteredSizes] = useState<string[]>([])
  const [mediums, setMediums] = useState<MediumOption[]>([])
  const [mops, setMops] = useState<MOPOption[]>([])
  const [orderTypes, setOrderTypes] = useState<string[]>([])
  const [unitPrice, setUnitPrice] = useState<number>(0)
  const [hideSize, setHideSize] = useState(false)

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
        const res = await supabase
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
                price,
                menu_items ( name, category_id ),
                category_sizes ( size )
              )
            )
          `)
          .eq("id", orderId)
          .single()

        const data = res.data
        if (!data) throw res.error || new Error("No order found")

        const orderItem = data.order_items?.find((oi: any) => oi.id === orderItemId)
        if (!orderItem) throw new Error("Order item not found")

        const price = orderItem.variant_id?.price ?? 0
        setUnitPrice(price)

        const normalizedRecord: SalesRecord = {
          id: `${data.id}-${orderItem.id}`,
          name: data.customers?.name ?? "",
          time: data.order_time ?? "",
          date: data.order_date ?? "",
          day: data.order_date
            ? new Date(data.order_date).toLocaleDateString("en-US", { weekday: "long" })
            : "",
          item: orderItem.variant_id?.menu_items?.name ?? "",
          item_size: orderItem.variant_id?.category_sizes?.size ?? "",
          variant_id: orderItem.variant_id?.id ?? null,
          order_type: data.order_mode ?? "",
          quantity: orderItem.quantity ?? 0,
          total_amount: orderItem.subtotal ?? data.total_amount ?? 0,
          medium: data.medium?.name ?? "N/A",
          medium_id: data.medium?.id ?? null,
          mop: data.mop?.name ?? "N/A",
          mop_id: data.mop?.id ?? null,
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
        const variantsRes = await supabase
          .from("menu_item_variants")
          .select(`
            id,
            price,
            menu_items ( name, category_id ),
            category_sizes ( size )
          `)

        const variantData = variantsRes.data ?? []

        const categoryRes = await supabase.from("category").select("id, name")
        const categoryMap: Record<number, string> = {}
        categoryRes.data?.forEach((c) => (categoryMap[c.id] = c.name))

        const formatted = variantData.map((v: VariantData) => ({
          id: v.id,
          name: v.menu_items?.name ?? "",
          size: v.category_sizes?.size ?? "",
          price: v.price ?? 0,
          category: categoryMap[v.menu_items?.category_id] ?? "",
        }))

        setVariants(formatted)
        setOrderTypes([...new Set(Object.values(categoryMap))])

        const mediumRes = await supabase.from("medium").select("id, name")
        if (mediumRes.data) setMediums(mediumRes.data)

        const mopRes = await supabase.from("mop").select("id, name")
        if (mopRes.data) setMops(mopRes.data)
      } catch (err) {
        console.error("Error fetching dropdowns:", err)
      }
    }

    fetchDropdowns()
  }, [])

  // ==============================
  // 🟠 Handle dropdown dependencies
  // ==============================
  useEffect(() => {
    if (!record) return

    const selectedType = record.order_type?.toUpperCase()
    const filtered = variants.filter(
      (v) => v.category.toUpperCase() === selectedType
    )
    setFilteredItems([...new Set(filtered.map((v) => v.name))])

    // Hide size field for no-size categories
    setHideSize(NO_SIZE_CATEGORIES.includes(selectedType))
  }, [record?.order_type, variants])

  useEffect(() => {
    if (!record) return
    if (hideSize) {
      setFilteredSizes([])
      return
    }

    const sizes = variants
      .filter((v) => v.name === record.item && v.category === record.order_type)
      .map((v) => v.size)
    setFilteredSizes([...new Set(sizes)])
  }, [record?.item, record?.order_type, hideSize, variants])

  // ==============================
  // 🟠 Handle field changes
  // ==============================
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    setRecord((prev) => {
      if (!prev) return prev
      const updated: SalesRecord = { ...prev }

      if (name === "order_type") {
        updated.order_type = value
        updated.item = ""
        updated.item_size = ""
        updated.variant_id = null
        setUnitPrice(0)
        updated.total_amount = 0
      } else if (name === "item") {
        updated.item = value
        updated.item_size = ""
        const firstVariant = variants.find(
          (v) => v.name === value && v.category === prev.order_type
        )
        if (firstVariant) {
          setUnitPrice(firstVariant.price)
          updated.variant_id = firstVariant.id
          updated.total_amount = firstVariant.price * prev.quantity
        }
      } else if (name === "item_size") {
        updated.item_size = value
        const variant = variants.find(
          (v) =>
            v.name === prev.item &&
            v.size === value &&
            v.category === prev.order_type
        )
        if (variant) {
          updated.variant_id = variant.id
          setUnitPrice(variant.price)
          updated.total_amount = variant.price * prev.quantity
        }
      } else if (name === "quantity") {
        updated.quantity = Number(value)
        updated.total_amount = unitPrice * Number(value)
      } else {
        (updated as any)[name] = value
      }

      if (name === "date") {
        updated.day = new Date(value).toLocaleDateString("en-US", { weekday: "long" })
      }

      return updated
    })
  }

  // ==============================
  // 🟠 Handle save
  // ==============================
  const handleSave = async () => {
    if (!record) return

    try {
      const orderId = Number(record.id.split("-")[0])
      const orderItemId = Number(record.id.split("-")[1])

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

      await supabase
        .from("order_items")
        .update({
          quantity: record.quantity,
          subtotal: record.total_amount,
          variant_id: record.variant_id,
        })
        .eq("id", orderItemId)

      await supabase
        .from("orders")
        .update({
          order_mode: record.order_type,
          medium_id: record.medium_id,
          mop_id: record.mop_id,
          total_amount: record.total_amount,
        })
        .eq("id", orderId)

      alert("✅ Record and total updated successfully!")
      navigate(-1)
    } catch (err) {
      console.error("❌ Error updating record:", err)
      alert("❌ Failed to update record. Check console for details.")
    }
  }

  const handleCancel = () => navigate(-1)

  if (loading) return <p>Loading record...</p>
  if (!record) return <p>No record found.</p>

  const menuProps = { PaperProps: { style: { maxHeight: 250, width: 300 } } }

  return (
    <div className="edit-record-container">
      <Sidebar onLogout={onLogout} />
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
              <TextField
                select
                label="Order Type"
                name="order_type"
                value={record.order_type}
                onChange={handleChange}
                className="form-field"
                SelectProps={{ MenuProps: menuProps }}
              >
                {orderTypes.map((type) => (
                  <MenuItem key={type} value={type}>{type}</MenuItem>
                ))}
              </TextField>

              <TextField
                select
                label="Item"
                name="item"
                value={record.item}
                onChange={handleChange}
                className="form-field"
                SelectProps={{ MenuProps: menuProps }}
              >
                {filteredItems.map((i) => (
                  <MenuItem key={i} value={i}>{i}</MenuItem>
                ))}
              </TextField>
            </div>

            {!hideSize && (
              <div className="form-row">
                <TextField
                  select
                  label="Item Size"
                  name="item_size"
                  value={record.item_size}
                  onChange={handleChange}
                  className="form-field"
                  SelectProps={{ MenuProps: menuProps }}
                >
                  {filteredSizes.map((s) => (
                    <MenuItem key={s} value={s}>{s}</MenuItem>
                  ))}
                </TextField>
              </div>
            )}

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
              <TextField label="Quantity" name="quantity" type="number" value={record.quantity} onChange={handleChange} className="form-field" />
              <TextField label="Total Amount" name="total_amount" type="number" value={record.total_amount} onChange={handleChange} className="form-field" />
            </div>
          </div>
        </div>

        <div className="button-form-container">
          <Button variant="outlined" onClick={handleCancel}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Update Changes</Button>
        </div>
      </div>
    </div>
  )
}

export default EditRecord
