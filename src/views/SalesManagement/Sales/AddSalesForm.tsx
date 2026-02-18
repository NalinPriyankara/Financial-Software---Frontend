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
  MenuItem,
} from "@mui/material";
import theme from "../../../theme";
import { createSale } from "../../../api/Sales/salesApi";
import { getCustomers } from "../../../api/Customers/customersApi";
import { useQuery } from "@tanstack/react-query";
import useCurrentUser from "../../../hooks/useCurrentUser";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import AddedConfirmationModal from "../../../components/AddedConfirmationModal";
import ErrorModal from "../../../components/ErrorModal";

interface FormDataState {
  invoice_no: string;
  customer: string;
  total_amount: string;
  paid_amount: string;
  balance: string;
  sale_date: string;
}

export default function AddSalesForm() {
  const [open, setOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [formData, setFormData] = useState<FormDataState>({
    invoice_no: "",
    customer: "",
    total_amount: "",
    paid_amount: "",
    balance: "",
    sale_date: "",
  });

  const [errors, setErrors] = useState<Partial<FormDataState>>({});
  const navigate = useNavigate();
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));
  const queryClient = useQueryClient();
  const { data: customers = [] } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const res = await getCustomers();
      return res;
    },
  });

  const currentUser = useCurrentUser();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErr: Partial<FormDataState> = {};
    if (!formData.invoice_no) newErr.invoice_no = "Invoice no is required";
    if (!formData.customer) newErr.customer = "Customer is required";
    if (!formData.total_amount || isNaN(Number(formData.total_amount))) newErr.total_amount = "Total amount is required and must be a number";
    if (!formData.paid_amount || isNaN(Number(formData.paid_amount))) newErr.paid_amount = "Paid amount is required and must be a number";
    if (!formData.sale_date) newErr.sale_date = "Sale date is required";
    if (!currentUser.user) newErr.sale_date = "You must be logged in to create a sale";

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

      if (!currentUser.user) {
        setErrorMessage("You must be logged in to create a sale.");
        setErrorOpen(true);
        return;
      }

      const payload = {
        invoice_no: formData.invoice_no,
        customer_id: Number(formData.customer),
        total_amount: total,
        paid_amount: paid,
        balance,
        sale_date: formData.sale_date,
        created_by: Number(currentUser.user.id),
      };

      const res = await createSale(payload);

      // Insert created sale into cache immediately so list shows without reload
      const createdRaw = res?.data ?? res;
      const created = {
        ...createdRaw,
        total_amount: Number(createdRaw?.total_amount ?? payload.total_amount),
        paid_amount: Number(createdRaw?.paid_amount ?? payload.paid_amount),
        balance: Number(
          createdRaw?.balance ?? (Number(payload.total_amount) - Number(payload.paid_amount))
        ),
        customer_name: createdRaw?.customer_name ?? ((customers || []).find((c: any) => Number(c.id) === Number(payload.customer_id))?.name),
        created_by: currentUser.user.id,
      };

      queryClient.setQueryData(["sales"], (old: any[] | undefined) => {
        if (Array.isArray(old)) return [...old, created]; // append to end
        return [created];
      });

      // Ensure any listeners refetch if needed
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
          <TextField id="customer" select label="Customer" name="customer" size="small" fullWidth value={formData.customer} onChange={handleChange} error={!!errors.customer} helperText={errors.customer}>
            <MenuItem value="">Select customer</MenuItem>
            {(customers || []).map((c: any) => (
              <MenuItem key={c.id} value={String(c.id)}>{c.name} — {c.email}</MenuItem>
            ))}
          </TextField>
          <TextField label="Total Amount" name="total_amount" type="number" size="small" fullWidth value={formData.total_amount} onChange={handleChange} error={!!errors.total_amount} helperText={errors.total_amount} />
          <TextField label="Paid Amount" name="paid_amount" type="number" size="small" fullWidth value={formData.paid_amount} onChange={handleChange} error={!!errors.paid_amount} helperText={errors.paid_amount} />
          <TextField label="Sale Date" name="sale_date" type="date" size="small" fullWidth value={formData.sale_date} onChange={handleChange} InputLabelProps={{ shrink: true }} error={!!errors.sale_date} helperText={errors.sale_date} />
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
