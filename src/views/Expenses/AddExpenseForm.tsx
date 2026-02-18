import React, { useState } from "react";
import { Box, Stack, Typography, TextField, Button, Paper, useTheme, useMediaQuery } from "@mui/material";
import theme from "../../theme";
import { createExpense } from "../../api/Expenses/expensesApi";
import { useQueryClient } from "@tanstack/react-query";
import useCurrentUser from "../../hooks/useCurrentUser";
import AddedConfirmationModal from "../../components/AddedConfirmationModal";
import ErrorModal from "../../components/ErrorModal";
import { useNavigate } from "react-router";

interface FormState {
  title: string;
  amount: string;
  expense_date: string;
  description: string;
}

export default function AddExpenseForm() {
  const [open, setOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [form, setForm] = useState<FormState>({ title: "", amount: "", expense_date: "", description: "" });
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const queryClient = useQueryClient();
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const currentUser = useCurrentUser();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const validate = () => {
    const newErr: Partial<FormState> = {};
    if (!form.title) newErr.title = "Title is required";
    if (!form.amount || isNaN(Number(form.amount))) newErr.amount = "Amount is required and must be a number";
    if (!form.expense_date) newErr.expense_date = "Date is required";
    if (!currentUser.user) setErrorMessage("You must be logged in to add an expense");
    setErrors(newErr);
    return Object.keys(newErr).length === 0 && !!currentUser.user;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      const payload = {
        title: form.title,
        amount: Number(form.amount),
        expense_date: form.expense_date,
        description: form.description || undefined,
        created_by: Number(currentUser.user!.id),
      };

      const res = await createExpense(payload as any);
      const created = res?.data ?? res;
      const normalized = {
        ...(created || {}),
        amount: Number(created?.amount ?? payload.amount),
        expense_date: created?.expense_date ?? payload.expense_date,
        created_by: created?.created_by ?? payload.created_by,
      };

      queryClient.setQueryData(["expenses"], (old: any[] | undefined) => {
        if (Array.isArray(old)) return [...old, normalized];
        return [normalized];
      });
      queryClient.invalidateQueries({ queryKey: ["expenses"] });

      setOpen(true);
      setErrors({});
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
        setErrorMessage("Failed to add expense. Please try again.");
        setErrorOpen(true);
      }
    }
  };

  return (
    <Stack alignItems="center" sx={{ mt: 4, px: isMobile ? 2 : 0 }}>
      <Paper sx={{ p: theme.spacing(3), maxWidth: "600px", width: "100%", boxShadow: 2, borderRadius: 2 }}>
        <Typography variant="h6" sx={{ mb: 3, textAlign: isMobile ? "center" : "left" }}>Add Expense</Typography>
        <Stack spacing={2}>
          <TextField id="title" label="Title" name="title" size="small" fullWidth value={form.title} onChange={handleChange} error={!!errors.title} helperText={errors.title} />
          <TextField id="amount" label="Amount" name="amount" type="number" inputProps={{ step: "0.01" }} size="small" fullWidth value={form.amount} onChange={handleChange} error={!!errors.amount} helperText={errors.amount} />
          <TextField id="expense_date" label="Expense Date" name="expense_date" type="date" size="small" fullWidth value={form.expense_date} onChange={handleChange} InputLabelProps={{ shrink: true }} error={!!errors.expense_date} helperText={errors.expense_date} />
          <TextField id="description" label="Description" name="description" size="small" fullWidth multiline minRows={3} value={form.description} onChange={handleChange} />
        </Stack>

        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3, flexDirection: isMobile ? "column" : "row", gap: isMobile ? 2 : 0 }}>
          <Button onClick={() => window.history.back()}>Back</Button>
          <Button variant="contained" fullWidth={isMobile} sx={{ backgroundColor: "var(--pallet-blue)" }} onClick={handleSubmit}>Add Expense</Button>
        </Box>
      </Paper>

      <AddedConfirmationModal open={open} title="Success" content="Expense has been added successfully!" addFunc={async () => {}} handleClose={() => setOpen(false)} onSuccess={() => window.history.back()} />
      <ErrorModal open={errorOpen} onClose={() => setErrorOpen(false)} message={errorMessage} />
    </Stack>
  );
}
