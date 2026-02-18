import React, { useEffect, useState } from "react";
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
import { getSale, updateSale } from "../../../api/Sales/salesApi";
import { getCustomers } from "../../../api/Customers/customersApi";
import { useQuery } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import UpdateConfirmationModal from "../../../components/UpdateConfirmationModal";
import ErrorModal from "../../../components/ErrorModal";

interface FormDataState {
  invoice_no: string;
  customer: string;
  total_amount: string;
  paid_amount: string;
  balance: string;
  sale_date: string;
  created_by: string;
}

export default function UpdateSalesForm() {
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
    created_by: "",
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
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const s: any = await getSale(Number(id));
        setFormData({
          invoice_no: s.invoice_no || "",
          customer: String(s.customer_id ?? ""),
          total_amount: String(s.total_amount ?? ""),
          paid_amount: String(s.paid_amount ?? ""),
          balance: String(s.balance ?? ""),
          sale_date: s.sale_date ? String(s.sale_date).split("T")[0] : "",
          created_by: String(s.created_by ?? ""),
        });
      } catch (err: any) {
        setErrorMessage(err?.response?.data?.message || "Failed to load sale.");
        setErrorOpen(true);
      }
    })();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated: any = { ...prev, [name]: value };
      if (name === "total_amount" || name === "paid_amount") {
        const total = Number(name === "total_amount" ? value : updated.total_amount);
        const paid = Number(name === "paid_amount" ? value : updated.paid_amount);
        updated.balance = Number.isNaN(total) || Number.isNaN(paid) ? "" : String(total - paid);
      }
      return updated;
    });
  };

  const validate = () => {
    const newErr: Partial<FormDataState> = {};
    if (!formData.invoice_no) newErr.invoice_no = "Invoice no is required";
    if (!formData.customer) newErr.customer = "Customer is required";
    if (!formData.total_amount || isNaN(Number(formData.total_amount))) newErr.total_amount = "Total amount is required and must be a number";
    if (!formData.paid_amount || isNaN(Number(formData.paid_amount))) newErr.paid_amount = "Paid amount is required and must be a number";
    if (!formData.sale_date) newErr.sale_date = "Sale date is required";
    if (!formData.created_by) newErr.created_by = "Created by is required";

    setErrors(newErr);
    return Object.keys(newErr).length === 0;
  };

  const handleSubmit = async () => {
    if (!id) return;
    if (!validate()) return;

    try {
      // client-side uniqueness check against cached sales to avoid server 422
      const cached: any[] | undefined = queryClient.getQueryData(["sales"]);
      if (cached && cached.some((s) => String(s.invoice_no) === String(formData.invoice_no) && Number(s.id) !== Number(id))) {
        setErrors((prev) => ({ ...prev, invoice_no: "Invoice no already exists" }));
        return;
      }
      const total = Number(formData.total_amount);
      const paid = Number(formData.paid_amount);
      const balance = total - paid;

      const payload = {
        invoice_no: formData.invoice_no,
        customer_id: Number(formData.customer),
        total_amount: total,
        paid_amount: paid,
        balance,
        sale_date: formData.sale_date,
        created_by: Number(formData.created_by),
      };

      const res = await updateSale(Number(id), payload);

      const updatedRaw = res?.data ?? res;
      const updated = {
        ...updatedRaw,
        id: Number(id),
        invoice_no: updatedRaw.invoice_no ?? payload.invoice_no,
        customer_id: Number(updatedRaw.customer_id ?? payload.customer_id),
        total_amount: Number(updatedRaw.total_amount ?? payload.total_amount),
        paid_amount: Number(updatedRaw.paid_amount ?? payload.paid_amount),
        balance: Number(updatedRaw.balance ?? payload.balance),
        sale_date: updatedRaw.sale_date ?? payload.sale_date,
        created_by: Number(updatedRaw.created_by ?? payload.created_by),
      };

      queryClient.setQueryData(["sales"], (old: any[] | undefined) => {
        if (Array.isArray(old)) return old.map((s) => (Number(s.id) === Number(id) ? updated : s));
        return [updated];
      });

      queryClient.invalidateQueries({ queryKey: ["sales"] });
      setOpen(true);
    } catch (err: any) {
      console.error("Update sale error", err);
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
        setErrorMessage("Failed to update sale. Please try again.");
        setErrorOpen(true);
      }
    }
  };

  return (
    <Stack alignItems="center" sx={{ mt: 4, px: isMobile ? 2 : 0 }}>
      <Paper sx={{ p: theme.spacing(3), maxWidth: "600px", width: "100%", boxShadow: 2, borderRadius: 2 }}>
        <Typography variant="h6" sx={{ mb: 3, textAlign: isMobile ? "center" : "left" }}>Update Sale</Typography>

        <Stack spacing={2}>
          <TextField label="Invoice No" name="invoice_no" size="small" fullWidth value={formData.invoice_no} onChange={handleChange} error={!!errors.invoice_no} helperText={errors.invoice_no} disabled />
          <TextField id="customer" select label="Customer" name="customer" size="small" fullWidth value={formData.customer} onChange={handleChange} error={!!errors.customer} helperText={errors.customer}>
            <MenuItem value="">Select customer</MenuItem>
            {(customers || []).map((c: any) => (
              <MenuItem key={c.id} value={String(c.id)}>{c.name} — {c.email}</MenuItem>
            ))}
          </TextField>
          <TextField label="Total Amount" name="total_amount" type="number" size="small" fullWidth value={formData.total_amount} onChange={handleChange} error={!!errors.total_amount} helperText={errors.total_amount} />
          <TextField label="Paid Amount" name="paid_amount" type="number" size="small" fullWidth value={formData.paid_amount} onChange={handleChange} error={!!errors.paid_amount} helperText={errors.paid_amount} />
          <TextField label="Sale Date" name="sale_date" type="date" size="small" fullWidth value={formData.sale_date} onChange={handleChange} InputLabelProps={{ shrink: true }} error={!!errors.sale_date} helperText={errors.sale_date} />
          <TextField label="Created By (User ID)" name="created_by" size="small" fullWidth value={formData.created_by} onChange={handleChange} error={!!errors.created_by} helperText={errors.created_by} disabled />
        </Stack>

        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3, flexDirection: isMobile ? "column" : "row", gap: isMobile ? 2 : 0 }}>
          <Button onClick={() => window.history.back()}>Back</Button>
          <Button variant="contained" fullWidth={isMobile} sx={{ backgroundColor: "var(--pallet-blue)" }} onClick={handleSubmit}>Update Sale</Button>
        </Box>
      </Paper>

      <UpdateConfirmationModal open={open} title="Success" content="Sale has been updated successfully!" handleClose={() => setOpen(false)} onSuccess={() => window.history.back()} />

      <ErrorModal open={errorOpen} onClose={() => setErrorOpen(false)} message={errorMessage} />
    </Stack>
  );
}
