import Sidebar from "../components/Sidebar"
import { Stepper, Step, StepLabel, Button } from "@mui/material"
import "../css/AddRecord.css"
import CustomerDetails from "../components/forms/CustomerDetails"
import OrderItems from "../components/forms/OrderItems"
import ReviewSubmit from "../components/forms/ReviewSubmit"
import { useState } from "react"
import type { Dayjs } from "dayjs"
import { supabase } from "../supabaseClient"
interface Customer {
  name: string
  date: Dayjs | null
  time: Dayjs | null
  paymentMode: string
  orderMode: string
}

interface OrderItem {
  category: string
  name: string
  size: string
  qty: number
  price: number
}

interface FormData {
  customer: Customer
  items: OrderItem[]
}

const steps = ["Customer Order Details", "Order Items", "Review & Submit"]

interface AddRecordProps {
  onLogout?: () => void
}

export default function AddRecord({ onLogout }: AddRecordProps) {
  const [activeStep, setActiveStep] = useState(0)

  const [formData, setFormData] = useState<FormData>({
    customer: {
      name: "",
      date: null,
      time: null,
      paymentMode: "",
      orderMode: "",
    },
    items: [],
  })

  const handleNext = () => {
    if (activeStep === 0) {
      // Validate customer details before moving to next step
      if (!formData.customer.name.trim()) {
        alert("Please enter a customer name.")
        return
      }
      if (!formData.customer.date) {
        alert("Please select a date.")
        return
      }
      if (!formData.customer.time) {
        alert("Please select a time.")
        return
      }
      if (!formData.customer.orderMode) {
        alert("Please select a mode of order.")
        return
      }
      if (!formData.customer.paymentMode) {
        alert("Please select a mode of payment.")
        return
      }
    }
    if (activeStep === 1) {
      if (formData.items.length === 0) {
        alert("Please add at least one item before proceeding.")
        return
      }
    }
    setActiveStep((prev) => prev + 1)
  }
  const handleBack = () => setActiveStep((prev) => prev - 1)

  // Updated: submit now inserts into raw_orders (one per item) and relies on backend triggers
  const handleSubmit = async () => {
    try {
      console.log("Submitting", formData)

      // Validate essential fields quickly
      if (!formData.customer.name || formData.items.length === 0) {
        alert("Please provide at least one item and a customer name.")
        return
      }

      // Determine date/time formatting if provided
      const orderDate = formData.customer.date ? formData.customer.date.format("YYYY-MM-DD") : null

      const orderTime = formData.customer.time ? formData.customer.time.format("HH:mm:ss") : null

      // For each item, insert a separate raw_order row
      for (const item of formData.items) {
        const rawOrder = {
          name: formData.customer.name,
          time: orderTime,
          date: orderDate,
          day: formData.customer.date ? formData.customer.date.format("dddd") : null,
          item: item.name,
          item_size: item.size,
          order_type: item.category,
          quantity: item.qty,
          medium_y: formData.customer.orderMode,
          mop_y: formData.customer.paymentMode,
        }

        const { error } = await supabase.from("raw_orders").insert([rawOrder])
        if (error) throw error
      }

      alert("✅ Raw orders inserted. Backend will normalize and populate other tables via triggers.")
      setActiveStep(0)
      setFormData({
        customer: {
          name: "",
          date: null,
          time: null,
          paymentMode: "",
          orderMode: "",
        },
        items: [],
      })
    } catch (err: any) {
      console.error("❌ Error saving raw orders", err?.message || err)
      alert("❌ Error saving raw orders. Check the console for details.")
    }
  }

  return (
    <div className="add-record-container">
      <Sidebar onLogout={onLogout} />
      <div className="add-form-container">
        <h2>ORDER RECORD</h2>
        <div className="step-container">
          <Stepper
            activeStep={activeStep}
            alternativeLabel
            sx={{
              "& .MuiStepIcon-root": { color: "#5f5f5fff" },
              "& .MuiStepIcon-root.Mui-active": { color: "#EC7A1C" },
              "& .MuiStepIcon-root.Mui-completed": { color: "#EC7A1C" },
            }}
          >
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </div>

        <div className="add-form-content">
          {activeStep === 0 && (
            <CustomerDetails data={formData.customer} onChange={(customer) => setFormData({ ...formData, customer })} />
          )}
          {activeStep === 1 && (
            <OrderItems data={formData.items} onChange={(items) => setFormData({ ...formData, items })} />
          )}
          {activeStep === 2 && <ReviewSubmit data={formData} />}
        </div>

        <div className="add-button-form-container">
          <Button disabled={activeStep === 0} onClick={handleBack} className="back-button">
            Back
          </Button>
          {activeStep === steps.length - 1 ? (
            <Button variant="contained" onClick={handleSubmit} className="submit-button" sx={{ width: "150px" }}>
              Submit
            </Button>
          ) : (
            <Button variant="contained" onClick={handleNext} className="next-button">
              Next
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}