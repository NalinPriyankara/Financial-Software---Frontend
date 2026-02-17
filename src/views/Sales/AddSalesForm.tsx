import React, { useState } from "react";
import {
  Box,
  Stack,
  Typography,
  TextField,
  Button,
  Paper,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import theme from "../../theme";
import { createSale } from "../../api/Sales/salesApi";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import AddedConfirmationModal from "../../components/AddedConfirmationModal";
import ErrorModal from "../../components/ErrorModal";

interface FormDataState {
  invoice_no: string;
  customer_id: string;
  total_amount: string;
  paid_amount: string;
  balance: string;
  sale_date: string;
  created_by: string;
}

export default function AddSalesForm() {
  const [open, setOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [formData, setFormData] = useState<FormDataState>({
    invoice_no: "",
    customer_id: "",
    total_amount: "",
    paid_amount: "",
    balance: "",
    sale_date: "",
    created_by: "",
  });

  const [errors, setErrors] = useState<Partial<FormDataState>>({});
  const navigate = useNavigate();
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));
  const queryClient = useQueryClient();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErr: Partial<FormDataState> = {};
    if (!formData.invoice_no) newErr.invoice_no = "Invoice no is required";
    if (!formData.customer_id) newErr.customer_id = "Customer is required";
    if (!formData.total_amount || isNaN(Number(formData.total_amount))) newErr.total_amount = "Total amount is required and must be a number";
    if (!formData.paid_amount || isNaN(Number(formData.paid_amount))) newErr.paid_amount = "Paid amount is required and must be a number";
    if (!formData.sale_date) newErr.sale_date = "Sale date is required";
    if (!formData.created_by) newErr.created_by = "Created by is required";

    setErrors(newErr);
    return Object.keys(newErr).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      // quick client-side uniqueness check using cached sales
      const cached: any[] | undefined = queryClient.getQueryData(["sales"]);
      if (cached && cached.some((s) => String(s.invoice_no) === String(formData.invoice_no))) {
        setErrors((prev) => ({ ...prev, invoice_no: "Invoice no already exists" }));
        return;
      }
      const total = Number(formData.total_amount);
      const paid = Number(formData.paid_amount);
      const balance = total - paid;

      const payload = {
        invoice_no: formData.invoice_no,
        customer_id: Number(formData.customer_id),
        total_amount: total,
        paid_amount: paid,
        balance,
        sale_date: formData.sale_date,
        created_by: Number(formData.created_by),
      };

      await createSale(payload);

      // Update cache
      queryClient.invalidateQueries({ queryKey: ["sales"] });

      setOpen(true);
      setErrors({});
    } catch (err: any) {
      console.error("Create sale error", err);
      const server = err?.response || err;
      const data = server?.data || err;
      if (data?.errors) {
        const fieldErrors: Partial<FormDataState> = {};
        Object.entries(data.errors).forEach(([k, v]) => {
          const key = k as keyof FormDataState;
          try {
            fieldErrors[key] = Array.isArray(v) ? v.join(" ") : String(v);
          } catch (_e) {
            // ignore
          }
        });
        setErrors((prev) => ({ ...prev, ...fieldErrors }));
      }
      if (data?.message && !data?.errors) {
        setErrorMessage(String(data.message));
        setErrorOpen(true);
      }
      if (!data?.errors && !data?.message) {
        setErrorMessage("Failed to add sale. Please try again.");
        setErrorOpen(true);
      }
    }
  };

  return (
    <Stack alignItems="center" sx={{ mt: 4, px: isMobile ? 2 : 0 }}>
      <Paper sx={{ p: theme.spacing(3), maxWidth: "600px", width: "100%", boxShadow: 2, borderRadius: 2 }}>
        <Typography variant="h6" sx={{ mb: 3, textAlign: isMobile ? "center" : "left" }}>Add Sale</Typography>

        <Stack spacing={2}>
          <TextField label="Invoice No" name="invoice_no" size="small" fullWidth value={formData.invoice_no} onChange={handleChange} error={!!errors.invoice_no} helperText={errors.invoice_no} />
          <TextField label="Customer ID" name="customer_id" size="small" fullWidth value={formData.customer_id} onChange={handleChange} error={!!errors.customer_id} helperText={errors.customer_id} />
          <TextField label="Total Amount" name="total_amount" type="number" size="small" fullWidth value={formData.total_amount} onChange={handleChange} error={!!errors.total_amount} helperText={errors.total_amount} />
          <TextField label="Paid Amount" name="paid_amount" type="number" size="small" fullWidth value={formData.paid_amount} onChange={handleChange} error={!!errors.paid_amount} helperText={errors.paid_amount} />
          <TextField label="Sale Date" name="sale_date" type="date" size="small" fullWidth value={formData.sale_date} onChange={handleChange} InputLabelProps={{ shrink: true }} error={!!errors.sale_date} helperText={errors.sale_date} />
          <TextField label="Created By (User ID)" name="created_by" size="small" fullWidth value={formData.created_by} onChange={handleChange} error={!!errors.created_by} helperText={errors.created_by} />
        </Stack>

        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3, flexDirection: isMobile ? "column" : "row", gap: isMobile ? 2 : 0 }}>
          <Button onClick={() => window.history.back()}>Back</Button>
          <Button variant="contained" fullWidth={isMobile} sx={{ backgroundColor: "var(--pallet-blue)" }} onClick={handleSubmit}>Add Sale</Button>
        </Box>
      </Paper>

      <AddedConfirmationModal open={open} title="Success" content="Sale has been added successfully!" addFunc={async () => {}} handleClose={() => setOpen(false)} onSuccess={() => window.history.back()} />

      <ErrorModal open={errorOpen} onClose={() => setErrorOpen(false)} message={errorMessage} />
    </Stack>
  );
}
