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

interface Customer {
  name: string;
  unit: string;
  street: string;
  barangay: string;
  city: string;
  date: Dayjs | null;
  time: Dayjs | null;
  paymentMode: string;
}

interface OrderItem {
  category: string;
  name: string;
  size: string;
  qty: number;
}

interface FormData {
  customer: Customer;
  items: OrderItem[];
}


const steps = ['Customer Order Details', 'Order Items', 'Review & Submit'];

export default function AddRecord() {
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
  },
  items: [],
  });

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleSubmit = () => {
    console.log('Submitting', formData);
  };

  return (
    <div className='add-record-container'>
      <Sidebar />
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

        <div className='button-form-container'>
          <Button disabled={activeStep === 0} onClick={handleBack} className='back-button'>
            Back
          </Button>
          {activeStep === steps.length - 1 ? (
            <Button variant="contained" onClick={handleSubmit} className='submit-button'>
              Submit
            </Button>
          ) : (
            <Button variant="contained" onClick={handleNext} className='next-button'>
              Next
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
