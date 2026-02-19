import React, { useState } from "react";
import { Box, Stack, Typography, TextField, Button, Paper, MenuItem, useTheme, useMediaQuery } from "@mui/material";
import theme from "../../../theme";
import { createBankTransaction } from "../../../api/BankTransactions/bankTransactionsApi";
import { getBankAccounts, updateBankAccount, getBankAccount } from "../../../api/BankAccounts/bankAccountsApi";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import UpdateConfirmationModal from "../../../components/UpdateConfirmationModal";
import ErrorModal from "../../../components/ErrorModal";
import { useNavigate } from "react-router-dom";

interface FormState {
  bank_account_id: string;
  type: string;
  amount: string;
  transaction_date: string;
  description: string;
}

const TYPE_OPTIONS = ["deposit", "withdraw"];

export default function AddBankTransactionForm() {
  const [open, setOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [form, setForm] = useState<FormState>({ bank_account_id: "", type: "deposit", amount: "", transaction_date: "", description: "" });
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const { data: accounts = [] } = useQuery<any>({
    queryKey: ["bank-accounts"],
    queryFn: async () => {
      const res = await getBankAccounts();
      return res;
    },
  });
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
    if (!form.bank_account_id) newErr.bank_account_id = "Bank account is required";
    if (!form.type) newErr.type = "Type is required";
    if (!form.amount || isNaN(Number(form.amount))) newErr.amount = "Amount is required and must be a number";
    if (!form.transaction_date) newErr.transaction_date = "Transaction date is required";
    setErrors(newErr);
    return Object.keys(newErr).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      const payload = { bank_account_id: Number(form.bank_account_id), type: form.type as any, amount: Number(form.amount), transaction_date: form.transaction_date, description: form.description || undefined };

      // If withdraw, ensure account has sufficient balance before creating transaction
      const txAmount = Number(payload.amount || 0);
      const accountId = Number(payload.bank_account_id);
      const accountsCached: any = queryClient.getQueryData(["bank-accounts"]);
      const cachedList = Array.isArray(accountsCached) ? accountsCached : (accountsCached as any)?.data ?? [];
      let account: any = cachedList.find((a: any) => Number(a.id) === accountId);
      if (!account) {
        try {
          const accRes = await getBankAccount(accountId);
          account = accRes?.data ?? accRes;
        } catch (fetchErr) {
          console.warn("Failed to fetch bank account for validation", fetchErr);
        }
      }

      const currentBal = Number(account?.balance ?? 0);
      if (payload.type === "withdraw" && currentBal < txAmount) {
        setErrors((p) => ({ ...p, amount: "Insufficient balance in selected account" }));
        return;
      }

      const res = await createBankTransaction(payload as any);
      const created = res?.data ?? res;

      // Update bank accounts: first compute new balance and call backend to persist.
      try {
        const txAmount = Number(payload.amount || 0);
        const accountId = Number(payload.bank_account_id);

        // find current account from cached query
        const accountsCached: any = queryClient.getQueryData(["bank-accounts"]);
        let account: any = null;
        if (Array.isArray(accountsCached)) account = accountsCached.find((a: any) => a.id === accountId);
        else if (accountsCached?.data && Array.isArray(accountsCached.data)) account = accountsCached.data.find((a: any) => a.id === accountId);

        const currentBal = Number(account?.balance ?? 0);
        const newBal = payload.type === "deposit" ? currentBal + txAmount : currentBal - txAmount;

        // attempt backend update of balance by sending full account payload (backend validations expect required fields)
        try {
          let accountPayload = account;
          if (!accountPayload) {
            // fetch full account from API if not present in cache
            try {
              const accRes = await getBankAccount(accountId);
              accountPayload = accRes?.data ?? accRes;
            } catch (fetchErr) {
              console.warn("Failed to fetch bank account for balance update", fetchErr);
            }
          }

          if (accountPayload) {
            const fullPayload = { ...accountPayload, balance: Number(newBal.toFixed(2)) };
            await updateBankAccount(accountId, fullPayload);
          } else {
            // As a last resort, try a PATCH if backend supports it (kept for legacy/backwards compatibility)
            try {
              await updateBankAccount(accountId, { ...accountPayload, balance: Number(newBal.toFixed(2)) });
            } catch (syncErr) {
              console.warn("Failed to persist bank account balance to backend", syncErr);
            }
          }
        } catch (syncErr) {
          console.warn("Failed to persist bank account balance to backend", syncErr);
        }

        // Update local cache optimistically (UI)
        queryClient.setQueryData(["bank-accounts"], (old: any) => {
          if (!old) return old;

          const updateAccount = (a: any) => {
            if (!a || a.id !== accountId) return a;
            return { ...a, balance: Number(newBal.toFixed(2)) };
          };

          if (Array.isArray(old)) return old.map((a: any) => updateAccount(a));
          if (old?.data && Array.isArray(old.data)) return { ...old, data: old.data.map((a: any) => updateAccount(a)) };
          if (old?.data && !Array.isArray(old.data) && old.data?.data && Array.isArray(old.data.data)) {
            return { ...old, data: { ...old.data, data: old.data.data.map((a: any) => updateAccount(a)) } };
          }
          return old;
        });
      } catch (e) {
        console.warn("Failed to update bank account balance", e);
      }

      // Append transaction to transactions cache
      queryClient.setQueryData(["bank-transactions"], (old: any) => {
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
        setErrorMessage("Failed to create transaction. Please try again.");
        setErrorOpen(true);
      }
    }
  };

  return (
    <Stack alignItems="center" sx={{ mt: 4, px: isMobile ? 2 : 0 }}>
      <Paper sx={{ p: theme.spacing(3), maxWidth: "600px", width: "100%", boxShadow: 2, borderRadius: 2 }}>
        <Typography variant="h6" sx={{ mb: 3, textAlign: isMobile ? "center" : "left" }}>Add Bank Transaction</Typography>

        <Stack spacing={2}>
          <TextField id="bank_account_id" label="Bank Account" name="bank_account_id" size="small" select fullWidth value={form.bank_account_id} onChange={handleChange} error={!!errors.bank_account_id} helperText={errors.bank_account_id}>
            {(Array.isArray(accounts) ? accounts : (accounts as any)?.data ?? []).map((a: any) => (
              <MenuItem key={a.id} value={String(a.id)}>{a.account_name ?? a.bank_name}</MenuItem>
            ))}
          </TextField>

          <TextField id="type" label="Type" name="type" size="small" select fullWidth value={form.type} onChange={handleChange} error={!!errors.type} helperText={errors.type}>
            {TYPE_OPTIONS.map((t) => (<MenuItem key={t} value={t}>{t}</MenuItem>))}
          </TextField>

          <TextField id="amount" label="Amount" name="amount" type="number" inputProps={{ step: "0.01" }} size="small" fullWidth value={form.amount} onChange={handleChange} error={!!errors.amount} helperText={errors.amount} />

          <TextField id="transaction_date" label="Transaction Date" name="transaction_date" type="date" size="small" fullWidth value={form.transaction_date} onChange={handleChange} InputLabelProps={{ shrink: true }} error={!!errors.transaction_date} helperText={errors.transaction_date} />

          <TextField id="description" label="Description" name="description" size="small" fullWidth multiline minRows={2} value={form.description} onChange={handleChange} />
        </Stack>

        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3, flexDirection: isMobile ? "column" : "row", gap: isMobile ? 2 : 0 }}>
          <Button onClick={() => navigate(-1)}>Back</Button>
          <Button variant="contained" fullWidth={isMobile} sx={{ backgroundColor: "var(--pallet-blue)" }} onClick={handleSubmit}>Add Transaction</Button>
        </Box>
      </Paper>

      <UpdateConfirmationModal open={open} title="Success" content="Transaction created successfully!" handleClose={() => setOpen(false)} onSuccess={() => navigate(-1)} />
      <ErrorModal open={errorOpen} onClose={() => setErrorOpen(false)} message={errorMessage} />
    </Stack>
  );
}
