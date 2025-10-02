import Sidebar from '../components/Sidebar';
import {
  Stepper,
  Step,
  StepLabel,
  Button
} from '@mui/material';
import "../css/AddRecord.css";
import CustomerDetails from '../components/forms/CustomerDetails';
import OrderItems from '../components/forms/OrderItems';
import ReviewSubmit from '../components/forms/ReviewSubmit';
import { useState } from 'react';
import { Dayjs } from 'dayjs';
import { supabase } from "../supabaseClient";

interface Customer {
  name: string;
  unit: string;
  street: string;
  barangay: string;
  city: string;
  date: Dayjs | null;
  time: Dayjs | null;
  paymentMode: string;
  orderMode: string;
}

interface OrderItem {
  category: string;
  name: string;
  size: string;
  qty: number;
  price: number;
}

interface FormData {
  customer: Customer;
  items: OrderItem[];
}

const steps = ['Customer Order Details', 'Order Items', 'Review & Submit'];

interface AddRecordProps {
  onLogout?: () => void;
}

export default function AddRecord({ onLogout }: AddRecordProps) {
  const [activeStep, setActiveStep] = useState(0);

  const [formData, setFormData] = useState<FormData>({
    customer: {
      name: "",
      unit: "",
      street: "",
      barangay: "",
      city: "",
      date: null,
      time: null,
      paymentMode: "",
      orderMode: "",
    },
    items: [],
  });

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleSubmit = async () => {
    try {
      console.log("Submitting", formData);

      // 1. Insert customer
      const { data: customer, error: customerError } = await supabase
        .from("customers")
        .insert([
          {
            name: formData.customer.name,
            unit: formData.customer.unit,
            street: formData.customer.street,
            barangay: formData.customer.barangay,
            city: formData.customer.city,

            // ✅ FIX: Use Dayjs local formatting instead of toISOString()
            order_date: formData.customer.date
              ? formData.customer.date.format("YYYY-MM-DD")
              : null,

            // ✅ FIX: Store in AM/PM format
            order_time: formData.customer.time
              ? formData.customer.time.format("hh:mm A")
              : null,

            order_mode: formData.customer.orderMode,
            payment_mode: formData.customer.paymentMode,
          },
        ])
        .select()
        .single();

      if (customerError) throw customerError;

      // 2. Insert order (total_amount starts as 0)
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert([
          {
            customer_id: customer.id,
            total_amount: 0,
          },
        ])
        .select()
        .single();

      if (orderError) throw orderError;

      // 3. Prepare order items with subtotals
      const itemsPayload = formData.items.map((item) => ({
        order_id: order.id,
        category: item.category,
        name: item.name,
        size: item.size,
        qty: item.qty,
        price: item.price,
        total: item.price * item.qty,
      }));

      const totalAmount = itemsPayload.reduce(
        (sum, i) => sum + (i.total ?? 0),
        0
      );

      // 4. Insert order items
      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(itemsPayload);

      if (itemsError) throw itemsError;

      // 5. Update order with computed total
      const { error: updateError } = await supabase
        .from("orders")
        .update({ total_amount: totalAmount })
        .eq("id", order.id);

      if (updateError) throw updateError;

      alert("✅ Order successfully saved!");

      // reset form
      setActiveStep(0);
      setFormData({
        customer: {
          name: "",
          unit: "",
          street: "",
          barangay: "",
          city: "",
          date: null,
          time: null,
          paymentMode: "",
          orderMode: "",
        },
        items: [],
      });
    } catch (err: any) {
      console.error("Save failed", err);
      alert("❌ Error saving order. See console.");
    }
  };

  return (
    <div className='add-record-container'>
      <Sidebar onLogout={onLogout} />
      <div className='add-form-container'>
        <h2>ORDER RECORD</h2>
        <div className="step-container">
          <Stepper
            activeStep={activeStep}
            alternativeLabel
            sx={{
              "& .MuiStepIcon-root": { color: "#5f5f5fff" },
              "& .MuiStepIcon-root.Mui-active": { color: "#EC7A1C" },
              "& .MuiStepIcon-root.Mui-completed": { color: "#EC7A1C" }
            }}
          >
            {steps.map((label) => (
              <Step key={label}><StepLabel>{label}</StepLabel></Step>
            ))}
          </Stepper>
        </div>

        <div className='add-form-content'>
          {activeStep === 0 && (
            <CustomerDetails
              data={formData.customer}
              onChange={(customer) => setFormData({ ...formData, customer })}
            />
          )}
          {activeStep === 1 && (
            <OrderItems
              data={formData.items}
              onChange={(items) => setFormData({ ...formData, items })}
            />
          )}
          {activeStep === 2 && <ReviewSubmit data={formData} />}
        </div>

        <div className='add-button-form-container'>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            className='back-button'
          >
            Back
          </Button>
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleSubmit}
              className='submit-button'
              sx={{ width: '150px' }}
            >
              Submit
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
              className='next-button'
            >
              Next
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
