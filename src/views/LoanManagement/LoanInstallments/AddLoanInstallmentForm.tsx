import React, { useState } from "react";
import { Box, Stack, Typography, TextField, Button, Paper, MenuItem, useTheme, useMediaQuery } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import theme from "../../../theme";
import UpdateConfirmationModal from "../../../components/UpdateConfirmationModal";
import ErrorModal from "../../../components/ErrorModal";
import { createLoanInstallment } from "../../../api/LoanInstallments/loanInstallmentsApi";
import { getLoans, getLoanById, updateLoan } from "../../../api/Loans/loansApi";

interface FormState {
  loan_id: string;
  amount: string;
  payment_date: string;
}

export default function AddLoanInstallmentForm() {
  const [open, setOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [form, setForm] = useState<FormState>({ loan_id: "", amount: "", payment_date: "" });
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const { data: loans = [] } = useQuery<any>({ queryKey: ["loans"], queryFn: getLoans });
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
    if (!form.loan_id) newErr.loan_id = "Loan is required";
    if (!form.amount || isNaN(Number(form.amount))) newErr.amount = "Amount is required and must be a number";
    if (!form.payment_date) newErr.payment_date = "Payment date is required";
    setErrors(newErr);
    return Object.keys(newErr).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      const payload = { loan_id: Number(form.loan_id), amount: Number(form.amount), payment_date: form.payment_date };

      // Validate against loan remaining balance
      try {
        const loanId = Number(payload.loan_id);
        const cachedLoans: any[] | undefined = queryClient.getQueryData(["loans"]);
        let loanObj: any | undefined;
        if (Array.isArray(cachedLoans)) loanObj = cachedLoans.find((l) => Number(l.id) === loanId);
        if (!loanObj) {
          try {
            loanObj = await getLoanById(loanId);
          } catch (_e) {
            loanObj = undefined;
          }
        }

        if (loanObj) {
          const total = Number(loanObj.total_amount ?? 0);
          const paid = Number(loanObj.paid_amount ?? 0);
          const remaining = total - paid;
          if (Number(payload.amount) > remaining) {
            setErrors((p) => ({ ...p, amount: `Amount exceeds remaining balance (${remaining.toFixed(2)})` }));
            return;
          }
        }
      } catch (_e) {
        // ignore validation failure and proceed to let server handle it
      }

      const res = await createLoanInstallment(payload as any);
      const createdRaw = res?.data ?? res;
      const created = createdRaw?.data ?? createdRaw; // normalize nested data responses

      // Update the corresponding loan's paid_amount and balance
      try {
        const loanId = Number(payload.loan_id);
        // Try to find loan in cache
        const cachedLoans: any[] | undefined = queryClient.getQueryData(["loans"]);
        let existingLoan: any | undefined;
        if (Array.isArray(cachedLoans)) existingLoan = cachedLoans.find((l) => Number(l.id) === loanId);
        if (!existingLoan) {
          // fallback to API
          try {
            existingLoan = (await getLoanById(loanId)) as any;
          } catch (_e) {
            existingLoan = undefined;
          }
        }

        if (existingLoan) {
          const prevPaid = Number(existingLoan.paid_amount ?? 0);
          const add = Number(created.amount ?? payload.amount ?? 0);
          const newPaid = prevPaid + add;
          const total = Number(existingLoan.total_amount ?? 0);
          const newBalance = total - newPaid;

          const loanPayload: any = {
            loan_name: existingLoan.loan_name ?? existingLoan.name ?? "",
            total_amount: total,
            paid_amount: newPaid,
            balance: newBalance,
            interest_rate: existingLoan.interest_rate ?? null,
            start_date: existingLoan.start_date ? String(existingLoan.start_date).split("T")[0] : (existingLoan.start_date ?? ""),
            end_date: existingLoan.end_date ?? null,
          };

          try {
            await updateLoan(loanId, loanPayload);
            // Update loans cache optimistically
            queryClient.setQueryData(["loans"], (old: any) => {
              if (!old) return [ { ...existingLoan, ...loanPayload, id: loanId } ];
              if (Array.isArray(old)) return old.map((l) => (Number(l.id) === loanId ? { ...l, ...loanPayload, id: loanId } : l));
              if (old?.data && Array.isArray(old.data)) return { ...old, data: old.data.map((l: any) => (Number(l.id) === loanId ? { ...l, ...loanPayload, id: loanId } : l)) };
              return old;
            });
          } catch (_e) {
            // ignore update failure here; server may reject partial updates
          }
        }
      } catch (_e) {
        // swallow errors to avoid blocking installment creation
      }

      queryClient.setQueryData(["loan-installments"], (old: any) => {
        if (!old) return [created];
        if (Array.isArray(old)) return [...old, created];
        if (old?.data && Array.isArray(old.data)) return { ...old, data: [...old.data, created] };
        return [created];
      });

      // Ensure server-authoritative data is shown (covers axios-response vs raw-array shapes)
      try {
        await queryClient.invalidateQueries({ queryKey: ["loan-installments"] });
      } catch (_e) {
        // ignore
      }

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
        setErrorMessage("Failed to create installment. Please try again.");
        setErrorOpen(true);
      }
    }
  };

  const list = Array.isArray(loans) ? loans : (loans as any)?.data ?? [];

  return (
    <Stack alignItems="center" sx={{ mt: 4, px: isMobile ? 2 : 0 }}>
      <Paper sx={{ p: theme.spacing(3), maxWidth: "600px", width: "100%", boxShadow: 2, borderRadius: 2 }}>
        <Typography variant="h6" sx={{ mb: 3, textAlign: isMobile ? "center" : "left" }}>Add Loan Installment</Typography>

        <Stack spacing={2}>
          <TextField id="loan_id" label="Loan" name="loan_id" size="small" select fullWidth value={form.loan_id} onChange={handleChange} error={!!errors.loan_id} helperText={errors.loan_id}>
            {list.map((l: any) => (<MenuItem key={l.id} value={String(l.id)}>{l.loan_name}</MenuItem>))}
          </TextField>

          <TextField id="amount" label="Amount" name="amount" type="number" inputProps={{ step: "0.01" }} size="small" fullWidth value={form.amount} onChange={handleChange} error={!!errors.amount} helperText={errors.amount} />

          <TextField id="payment_date" label="Payment Date" name="payment_date" type="date" size="small" fullWidth value={form.payment_date} onChange={handleChange} InputLabelProps={{ shrink: true }} error={!!errors.payment_date} helperText={errors.payment_date} />
        </Stack>

        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3, gap: isMobile ? 2 : 0, flexDirection: isMobile ? "column" : "row" }}>
          <Button onClick={() => navigate(-1)} sx={{ minWidth: 120 }}>Back</Button>
          <Button
            variant="contained"
            size="medium"
            onClick={handleSubmit}
            sx={{ backgroundColor: "var(--pallet-blue)", width: isMobile ? "100%" : 160 }}
          >
            Add Installment
          </Button>
        </Box>
      </Paper>

      <UpdateConfirmationModal open={open} title="Success" content="Installment created successfully!" handleClose={() => setOpen(false)} onSuccess={() => navigate(-1)} />
      <ErrorModal open={errorOpen} onClose={() => setErrorOpen(false)} message={errorMessage} />
    </Stack>
  );
}
