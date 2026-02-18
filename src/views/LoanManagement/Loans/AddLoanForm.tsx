import React, { useState } from "react";
import { Box, Stack, Typography, TextField, Button, Paper, useTheme, useMediaQuery } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import theme from "../../../theme";
import UpdateConfirmationModal from "../../../components/UpdateConfirmationModal";
import ErrorModal from "../../../components/ErrorModal";
import { createLoan } from "../../../api/Loans/loansApi";
import type { LoanPayload, Loan } from "../../../api/Loans/loansApi";

interface FormState {
  loan_name: string;
  total_amount: string;
  paid_amount?: string;
  balance?: string;
  interest_rate?: string;
  start_date: string;
  end_date?: string | null;
}

export default function AddLoanForm() {
  const [open, setOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [form, setForm] = useState<FormState>({ loan_name: "", total_amount: "", paid_amount: "0", balance: "0", interest_rate: "", start_date: "", end_date: null });
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const queryClient = useQueryClient();
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const validate = () => {
    const newErr: Partial<FormState> = {};
    if (!form.loan_name) newErr.loan_name = "Loan name is required";
    if (!form.total_amount || isNaN(Number(form.total_amount))) newErr.total_amount = "Total amount is required and must be a number";
    if (!form.start_date) newErr.start_date = "Start date is required";
    setErrors(newErr);
    return Object.keys(newErr).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      const computedBalance = Number((Number(form.total_amount || 0) - Number(form.paid_amount || 0)).toFixed(2));
      const payload: LoanPayload = {
        loan_name: form.loan_name,
        total_amount: Number(form.total_amount),
        paid_amount: form.paid_amount ? Number(form.paid_amount) : 0,
        balance: computedBalance,
        interest_rate: form.interest_rate ? Number(form.interest_rate) : null,
        start_date: form.start_date,
        end_date: form.end_date || null,
      };

      const created = await createLoan(payload as LoanPayload);

      // Append to loans cache
      queryClient.setQueryData(["loans"], (old: any) => {
        if (!old) return [created];
        if (Array.isArray(old)) return [...old, created];
        if (old?.data && Array.isArray(old.data)) return { ...old, data: [...old.data, created] };
        return [created];
      });

      setOpen(true);
    } catch (err: any) {
      console.error(err);
      const server = err?.response || err;
      const data = server?.data || err;
      if (data?.errors) {
        const fieldErrors: Partial<FormState> = {};
        Object.entries(data.errors).forEach(([k, v]) => {
          (fieldErrors as any)[k] = Array.isArray(v) ? v.join(" ") : String(v);
        });
        setErrors((p) => ({ ...p, ...fieldErrors }));
      }
      if (data?.message && !data?.errors) {
        setErrorMessage(String(data.message));
        setErrorOpen(true);
      }
      if (!data?.errors && !data?.message) {
        setErrorMessage("Failed to create loan. Please try again.");
        setErrorOpen(true);
      }
    }
  };

  return (
    <Stack alignItems="center" sx={{ mt: 4, px: isMobile ? 2 : 0 }}>
      <Paper sx={{ p: theme.spacing(3), maxWidth: "700px", width: "100%", boxShadow: 2, borderRadius: 2 }}>
        <Typography variant="h6" sx={{ mb: 3, textAlign: isMobile ? "center" : "left" }}>Add Loan</Typography>

        <Stack spacing={2}>
          <TextField id="loan_name" label="Loan Name" name="loan_name" size="small" fullWidth value={form.loan_name} onChange={handleChange} error={!!errors.loan_name} helperText={errors.loan_name} />

          <TextField id="total_amount" label="Total Amount" name="total_amount" type="number" inputProps={{ step: "0.01" }} size="small" fullWidth value={form.total_amount} onChange={handleChange} error={!!errors.total_amount} helperText={errors.total_amount} />

          <TextField id="paid_amount" label="Paid Amount" name="paid_amount" type="number" inputProps={{ step: "0.01" }} size="small" fullWidth value={form.paid_amount} onChange={handleChange} />

          <TextField id="balance" label="Balance" name="balance" type="number" inputProps={{ step: "0.01" }} size="small" fullWidth value={((Number(form.total_amount || 0) - Number(form.paid_amount || 0))).toFixed(2)} disabled />

          <TextField id="interest_rate" label="Interest Rate (%)" name="interest_rate" type="number" inputProps={{ step: "0.01" }} size="small" fullWidth value={form.interest_rate} onChange={handleChange} />

          <TextField id="start_date" label="Start Date" name="start_date" type="date" size="small" fullWidth value={form.start_date} onChange={handleChange} InputLabelProps={{ shrink: true }} error={!!errors.start_date} helperText={errors.start_date} />

          <TextField id="end_date" label="End Date" name="end_date" type="date" size="small" fullWidth value={form.end_date || ""} onChange={handleChange} InputLabelProps={{ shrink: true }} />
        </Stack>

        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
          <Button onClick={() => navigate(-1)}>Back</Button>
          <Button variant="contained" onClick={handleSubmit} sx={{ backgroundColor: "var(--pallet-blue)" }}>Add Loan</Button>
        </Box>
      </Paper>

      <UpdateConfirmationModal open={open} title="Success" content="Loan created successfully!" handleClose={() => setOpen(false)} onSuccess={() => navigate(-1)} />
      <ErrorModal open={errorOpen} onClose={() => setErrorOpen(false)} message={errorMessage} />
    </Stack>
  );
}
