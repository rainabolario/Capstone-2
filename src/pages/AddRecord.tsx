import Sidebar from "../components/Sidebar"
import { Stepper, Step, StepLabel, Button } from "@mui/material"
import "../css/AddRecord.css"
import CustomerDetails from "../components/forms/CustomerDetails"
import OrderItems from "../components/forms/OrderItems"
import ReviewSubmit from "../components/forms/ReviewSubmit"
import { useState } from "react"
import type { Dayjs } from "dayjs"
import { supabase } from "../supabaseClient"
import dayjs from "dayjs"
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
  variant_id?: number; // ✅ optional, if you’ll populate it later
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
      date: dayjs(),
      time: dayjs(),
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
  const [isSubmitting, setIsSubmitting] = useState(false);

const handleSubmit = async () => {
  if (isSubmitting) return;
  setIsSubmitting(true);

  try {
    console.log("Submitting", formData);
    if (!formData.customer.name || formData.items.length === 0) {
      alert("Please provide at least one item and a customer name.");
      return;
    }

    const orderDate = formData.customer.date
      ? formData.customer.date.format("YYYY-MM-DD")
      : null;
    const orderTime = formData.customer.time
      ? formData.customer.time.format("HH:mm:ss")
      : null;

    // 1️⃣ Get or create customer ID
const { data: existingCustomer } = await supabase
  .from("customers")
  .select("id")
  .eq("name", formData.customer.name)
  .maybeSingle();

let customerId = existingCustomer?.id;

if (!customerId) {
  const { data: newCustomer, error: newCustomerError } = await supabase
    .from("customers")
    .insert([{ name: formData.customer.name }])
    .select("id")
    .single();

  if (newCustomerError) throw newCustomerError;
  if (!newCustomer) throw new Error("Customer insert failed.");

  customerId = newCustomer.id;
}

// 2️⃣ Look up foreign key IDs for mop and medium
const { data: medium } = await supabase
  .from("medium")
  .select("id")
  .eq("name", formData.customer.orderMode)
  .single();

const { data: mop } = await supabase
  .from("mop")
  .select("id")
  .eq("name", formData.customer.paymentMode)
  .single();

// 3️⃣ Compute total manually
const totalAmount = formData.items.reduce(
  (sum, item) => sum + item.price * item.qty,
  0
);

// 4️⃣ Insert order with real IDs and computed total
const { data: orderData, error: orderError } = await supabase
  .from("orders")
  .insert([
    {
      customer_id: customerId,
      order_date: orderDate,
      order_time: orderTime,
      order_mode: formData.items[0]?.category, // <--- add this
      mop_id: mop?.id || null,
      medium_id: medium?.id || null,
      total_amount: totalAmount,
    },
  ])
  .select("id")
  .single();

    if (orderError) throw orderError;
    const orderId = orderData.id;

    // After inserting into orders and getting orderId
    const receiptDate = formData.customer.date
      ? formData.customer.date.format("YYYY-MM-DD")
      : new Date().toISOString().split("T")[0]; // fallback to today

    const { error: receiptError } = await supabase
      .from("receipt_totals")
      .insert([
        {
          order_id: orderId,
          receipt_date: receiptDate,
          receipt_total: totalAmount,
        },
      ]);

    if (receiptError) throw receiptError;

    const orderItems = formData.items.map((item) => ({
      order_id: orderId,
      variant_id: item.variant_id,
      quantity: item.qty,
      subtotal: item.price * item.qty,
    }));

    const { error } = await supabase.from("order_items").insert(orderItems);
    if (error) throw error;

    alert("✅ Order and items inserted successfully!");
    setActiveStep(0);
    setFormData({
      customer: {
        name: "",
        date: null,
        time: null,
        paymentMode: "",
        orderMode: "",
      },
      items: [],
    });
  } catch (err: any) {
    console.error("❌ Error saving order", err?.message || err);
    alert("❌ Error saving order. Check console for details.");
  } finally {
    setIsSubmitting(false);
  }
};

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