import {
  InputLabel,
  TextField,
  Divider,
  MenuItem,
  FormControl,
  Select,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import dayjs, { Dayjs } from "dayjs";
import "../../css/CustomerDetails.css";

interface Customer {
  name: string;
  unit: string;
  street: string;
  barangay: string;
  city: string;
  date: Dayjs | null;
  time: Dayjs | null;
  orderMode: string;
  paymentMode: string;
}

interface Props {
  data: Customer;
  onChange: (customer: Customer) => void;
}

export default function CustomerDetails({ data, onChange }: Props) {
  const updateField = (field: keyof Customer, value: any) =>
    onChange({ ...data, [field]: value });

  return (
    <div className="customer-details-container">
      <h3>Customer Order Details</h3>
      <Divider />

      <div className="customer-details-field">
        <TextField
          label="Customer Name"
          placeholder="eg. Juan Dela Cruz"
          variant="outlined"
          fullWidth
          InputLabelProps={{ shrink: true }}
          value={data.name}
          onChange={(e) => updateField("name", e.target.value)}
        />

        <div className="customer-address-field">
          <TextField
            label="Unit No."
            placeholder="eg. 123"
            variant="outlined"
            InputLabelProps={{ shrink: true }}
            style={{ width: "50%" }}
            value={data.unit}
            onChange={(e) => updateField("unit", e.target.value)}
          />
          <TextField
            label="Street"
            placeholder="eg. Main St."
            variant="outlined"
            InputLabelProps={{ shrink: true }}
            style={{ width: "100%" }}
            value={data.street}
            onChange={(e) => updateField("street", e.target.value)}
          />
          <TextField
            label="Barangay"
            placeholder="eg. Barangay 1"
            variant="outlined"
            InputLabelProps={{ shrink: true }}
            style={{ width: "100%" }}
            value={data.barangay}
            onChange={(e) => updateField("barangay", e.target.value)}
          />
          <TextField
            label="City"
            placeholder="eg. Manila"
            variant="outlined"
            InputLabelProps={{ shrink: true }}
            style={{ width: "100%" }}
            value={data.city}
            onChange={(e) => updateField("city", e.target.value)}
          />
        </div>

        <div className="datetime-container">
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Date of Order"
              value={data.date || dayjs()}
              onChange={(newDate) => updateField("date", newDate)}
              slotProps={{ textField: { fullWidth: true } }}
            />
            <TimePicker
              label="Time of Order"
              value={data.time || dayjs()}
              onChange={(newTime) => updateField("time", newTime)}
              slotProps={{ textField: { fullWidth: true } }}
            />
          </LocalizationProvider>
        </div>

        <FormControl fullWidth>
          <InputLabel id="order-mode-label" shrink>
            Mode of Order
          </InputLabel>
          <Select
            labelId="order-mode-label"
            value={data.orderMode}
            onChange={(e: SelectChangeEvent) =>
              updateField("orderMode", e.target.value)
            }
            displayEmpty
            renderValue={(selected) =>
              selected ? selected : <span style={{ color: "#9e9e9e" }}>Select order mode</span>
            }
          >
            <MenuItem value="Instagram">Instagram</MenuItem>
            <MenuItem value="Facebook">Facebook</MenuItem>
            <MenuItem value="Viber">Viber</MenuItem>
            <MenuItem value="Hazel's Phone">Hazel's Phone</MenuItem>
            <MenuItem value="Enzo's Phone">Enzo's Phone</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel id="payment-mode-label" shrink>
            Mode of Payment
          </InputLabel>
          <Select
            labelId="payment-mode-label"
            value={data.paymentMode}
            onChange={(e: SelectChangeEvent) =>
              updateField("paymentMode", e.target.value)
            }
            displayEmpty
            renderValue={(selected) =>
              selected ? selected : <span style={{ color: "#9e9e9e" }}>Select payment mode</span>
            }
          >
            <MenuItem value="Cash">Cash</MenuItem>
            <MenuItem value="GCash">GCash</MenuItem>
            <MenuItem value="Credit Card">Credit Card</MenuItem>
            <MenuItem value="PayPal">PayPal</MenuItem>
            <MenuItem value="Other">Other</MenuItem>
          </Select>
        </FormControl>
      </div>
    </div>
  );
}
