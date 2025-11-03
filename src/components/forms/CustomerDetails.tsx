import {
  InputLabel,
  TextField,
  Divider,
  MenuItem,
  FormControl,
  Select,
  Button,
  IconButton,
  Box,
} from "@mui/material";
import AddCardIcon from "@mui/icons-material/AddCard";
import DeleteIcon from "@mui/icons-material/Delete";
import type { SelectChangeEvent } from "@mui/material/Select";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { Dayjs } from "dayjs";
import "../../css/CustomerDetails.css";
import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient"; // ✅ adjust path if needed

export interface Customer {
  name: string;
  date: Dayjs | null;
  time: Dayjs | null;
  paymentMode: string;
  orderMode: string;
}

interface Props {
  data: Customer;
  onChange: (customer: Customer) => void;
}

export default function CustomerDetails({ data, onChange }: Props) {
  const [paymentModes, setPaymentModes] = useState<string[]>(() =>
    data.paymentMode ? data.paymentMode.split(" + ") : [""]
  );

  const [orderModeOptions, setOrderModeOptions] = useState<string[]>([]);
  const [paymentModeOptions, setPaymentModeOptions] = useState<string[]>([]);

  useEffect(() => {
    if (data.paymentMode === "") {
      setPaymentModes([""]);
    }
  }, [data.paymentMode]);

  // ✅ Fetch data from 'medium' (order modes) and 'mop' (modes of payment)
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        // Fetch from 'medium' table
        const { data: mediumData, error: mediumError } = await supabase
          .from("medium")
          .select("name");

        // Fetch from 'mop' table
        const { data: mopData, error: mopError } = await supabase
          .from("mop")
          .select("name");

        if (mediumError) console.error("Error fetching from 'medium':", mediumError);
        if (mopError) console.error("Error fetching from 'mop':", mopError);

        if (mediumData) setOrderModeOptions(mediumData.map((row) => row.name));
        if (mopData) setPaymentModeOptions(mopData.map((row) => row.name));
      } catch (err) {
        console.error("Unexpected fetch error:", err);
      }
    };

    fetchDropdownData();
  }, []);

  const updateField = (field: keyof Customer, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const capitalizedValue = e.target.value.toUpperCase();
    updateField("name", capitalizedValue);
  };

  const handlePaymentModeChange = (index: number, newValue: string) => {
    const newModes = [...paymentModes];
    newModes[index] = newValue;
    setPaymentModes(newModes);

    const joinedModes = newModes.filter((mode) => mode).join(" + ");
    updateField("paymentMode", joinedModes);
  };

  const handleAddPaymentMode = () => {
    setPaymentModes([...paymentModes, ""]);
  };

  const handleRemovePaymentMode = (indexToRemove: number) => {
    const newModes = paymentModes.filter((_, index) => index !== indexToRemove);
    setPaymentModes(newModes);

    const joinedModes = newModes.filter((mode) => mode).join(" + ");
    updateField("paymentMode", joinedModes);
  };

  return (
    <div className="customer-details-container">
      <h3>Customer Order Details</h3>
      <Divider />

      <div className="customer-details-field">
        {/* Customer Name */}
        <TextField
          label="Customer Name"
          placeholder="eg. Juan Dela Cruz"
          variant="outlined"
          fullWidth
          InputLabelProps={{ shrink: true }}
          value={data.name}
          onChange={handleNameChange}
        />

        {/* Date & Time */}
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <div className="datetime-row" style={{ display: "flex", gap: "16px" }}>
            <DatePicker
              label="Date of Order"
              value={data.date}
              onChange={(newDate) => updateField("date", newDate)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  placeholder: "Select Date",
                  InputLabelProps: { shrink: true },
                },
              }}
              sx={{ flex: 1 }}
            />
            <TimePicker
              label="Time of Order"
              value={data.time}
              onChange={(newTime) => updateField("time", newTime)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  placeholder: "Select Time",
                  InputLabelProps: { shrink: true },
                },
              }}
              sx={{ flex: 1 }}
            />
          </div>
        </LocalizationProvider>

        {/* Mode of Order */}
        <FormControl fullWidth>
          <InputLabel id="order-mode-label" shrink>
            Mode of Order
          </InputLabel>
          <Select
            labelId="order-mode-label"
            value={data.orderMode}
            onChange={(e: SelectChangeEvent) => updateField("orderMode", e.target.value)}
            displayEmpty
            renderValue={(selected) =>
              selected ? selected : <span style={{ color: "#9e9e9e" }}>Select order mode</span>
            }
          >
            {orderModeOptions.length > 0 ? (
              orderModeOptions.map((mode) => (
                <MenuItem key={mode} value={mode}>
                  {mode}
                </MenuItem>
              ))
            ) : (
              <MenuItem disabled>Loading...</MenuItem>
            )}
          </Select>
        </FormControl>

        {/* Mode of Payment */}
        <Box>
          {paymentModes.map((mode, index) => (
            <Box
              key={index}
              sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
            >
              <FormControl fullWidth>
                <InputLabel id={`payment-mode-label-${index}`} shrink>
                  {index === 0 ? "Mode of Payment" : "Additional Mode of Payment"}
                </InputLabel>
                <Select
                  labelId={`payment-mode-label-${index}`}
                  value={mode}
                  onChange={(e: SelectChangeEvent) =>
                    handlePaymentModeChange(index, e.target.value)
                  }
                  displayEmpty
                  renderValue={(selected) =>
                    selected ? (
                      selected
                    ) : (
                      <span style={{ color: "#9e9e9e" }}>Select payment mode</span>
                    )
                  }
                >
                  {paymentModeOptions.length > 0 ? (
                    paymentModeOptions.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>Loading...</MenuItem>
                  )}
                </Select>
              </FormControl>
              {paymentModes.length > 1 && (
                <IconButton onClick={() => handleRemovePaymentMode(index)}>
                  <DeleteIcon />
                </IconButton>
              )}
            </Box>
          ))}

          <Button
            startIcon={<AddCardIcon />}
            onClick={handleAddPaymentMode}
            sx={{
              alignSelf: "flex-start",
              color: "#ec7a1c",
              borderColor: "#ec7a1c",
              padding: "6px 16px",
              "&:hover": {
                backgroundColor: "#ec7a1c",
                color: "white",
                borderColor: "#ec7a1c",
              },
            }}
          >
            Add Another Mode
          </Button>
        </Box>
      </div>
    </div>
  );
}
