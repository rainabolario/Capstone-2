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
  variant_id?: number
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
  const [isSubmitting, setIsSubmitting] = useState(false)

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
      if (!formData.customer.name.trim()) return alert("Please enter a customer name.")
      if (!formData.customer.date) return alert("Please select a date.")
      if (!formData.customer.time) return alert("Please select a time.")
      if (!formData.customer.orderMode) return alert("Please select a mode of order.")
      if (!formData.customer.paymentMode) return alert("Please select a mode of payment.")
    }

    if (activeStep === 1 && formData.items.length === 0) {
      return alert("Please add at least one item before proceeding.")
    }

    setActiveStep((prev) => prev + 1)
  }

  const handleBack = () => setActiveStep((prev) => prev - 1)

  const handleSubmit = async () => {
  if (isSubmitting) return;
  setIsSubmitting(true);

  try {
    console.log("Submitting", formData);

    const { customer, items } = formData;
    if (!customer.name || items.length === 0) {
      alert("Please provide at least one item and a customer name.");
      return;
    }

    const orderDate = customer.date?.format("YYYY-MM-DD") ?? null;
    const orderTime = customer.time?.format("HH:mm:ss") ?? null;

    // ✅ Get or create customer
    const { data: existingCustomer } = await supabase
      .from("customers")
      .select("id")
      .eq("name", customer.name)
      .maybeSingle();

    let customerId = existingCustomer?.id;

    if (!customerId) {
      const { data: newCustomer, error: newCustomerError } = await supabase
        .from("customers")
        .insert([{ name: customer.name }])
        .select("id")
        .maybeSingle();

      if (newCustomerError) throw newCustomerError;
      customerId = newCustomer!.id;
    }

    // ✅ Lookup order medium
    const { data: medium } = await supabase
      .from("medium")
      .select("id")
      .eq("name", customer.orderMode)
      .maybeSingle();

    // --- Handle MOP (combo or single) ---
    let mopId: number | null = null;

    if (customer.paymentMode.includes("+")) {
      // Combo MOP
      const parts = customer.paymentMode.split("+").map(p => p.trim()).filter(Boolean);

      // Create combo MOP row if not exists
      let { data: existingCombo } = await supabase
        .from("mop")
        .select("*")
        .eq("name", customer.paymentMode)
        .maybeSingle();

      if (!existingCombo) {
        const { data: newCombo } = await supabase
          .from("mop")
          .insert([{ name: customer.paymentMode, is_combo: true }])
          .select("*")
          .maybeSingle();
        existingCombo = newCombo;
        console.log("Created combo MOP:", existingCombo);
      }

      mopId = existingCombo.id;

      // Explode into mop_items
      for (const partName of parts) {
        // Find the individual MOP
        const { data: singleMop } = await supabase
          .from("mop")
          .select("*")
          .eq("name", partName)
          .maybeSingle();

        if (!singleMop) {
          console.warn(`MOP part not found: ${partName}`);
          continue;
        }

        // Upsert into mop_items
        const { error: linkError } = await supabase
          .from("mop_items")
          .upsert({
            mop_id: existingCombo.id,
            item_id: singleMop.id,
          }, { onConflict: "mop_id,item_id" });

        if (linkError) console.error("Failed to insert mop_items:", linkError);
        else console.log(`Linked combo ${existingCombo.name} -> ${singleMop.name}`);
      }

    } else {
      // Single MOP
      const { data: singleMop } = await supabase
        .from("mop")
        .select("id")
        .eq("name", customer.paymentMode)
        .maybeSingle();
      mopId = singleMop?.id || null;
    }

    // ✅ Compute total
    const totalAmount = items.reduce((sum, item) => sum + item.price * item.qty, 0);

    // ✅ Insert main order
    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .insert([{
        customer_id: customerId,
        order_date: orderDate,
        order_time: orderTime,
        order_mode: items[0]?.category,
        mop_id: mopId,
        medium_id: medium?.id || null,
        total_amount: totalAmount,
      }])
      .select("id")
      .single();

    if (orderError) throw orderError;
    const orderId = orderData.id;

    // ✅ Insert receipt_totals
    await supabase.from("receipt_totals").insert([{
      order_id: orderId,
      receipt_date: orderDate,
      receipt_total: totalAmount,
    }]);

    // ✅ PACKED MEAL INSERTION
    for (const item of items) {
      if (item.category?.toLowerCase().includes("packed")) {
        console.log("🟡 PACKED MEAL detected →", item.name);

        const { data: newMeal, error: mealError } = await supabase
          .from("packed_meals")
          .insert([{ name: item.name }])
          .select("id")
          .single();

        if (mealError || !newMeal) {
          console.error("❌ packed_meals insert failed:", mealError);
          continue;
        }

        const packedMealId = newMeal.id;

        const parts = item.name.split(/[\+,]/).map(p => p.trim()).filter(Boolean);

        for (const part of parts) {
          const { data: menuItem } = await supabase
            .from("menu_items")
            .select("id")
            .eq("name", part)
            .maybeSingle();

          const menuItemId = menuItem?.id ?? null;

          const { error: linkError } = await supabase
            .from("packed_meal_items")
            .insert([{ packed_meal_id: packedMealId, menu_item_id: menuItemId }]);

          if (linkError) console.error("❌ packed_meal_items insert failed:", linkError);
          else console.log("✅ packed_meal_items inserted:", { packed_meal_id: packedMealId, menu_item_id: menuItemId });
        }
      }
    }

    // ✅ Insert order_items
    const orderItems = items.map((item) => ({
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
      customer: { name: "", date: null, time: null, paymentMode: "", orderMode: "" },
      items: [],
    });

  } catch (err: any) {
    console.error("❌ Error saving order:", err);
    alert("❌ Error saving order. Check console.");
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
              <Step key={label}><StepLabel>{label}</StepLabel></Step>
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
