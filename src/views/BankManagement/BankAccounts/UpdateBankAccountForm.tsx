import React, { useEffect, useState } from "react";
import { Box, Stack, Typography, TextField, Button, Paper, useTheme, useMediaQuery } from "@mui/material";
import theme from "../../../theme";
import { getBankAccount, updateBankAccount } from "../../../api/BankAccounts/bankAccountsApi";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import UpdateConfirmationModal from "../../../components/UpdateConfirmationModal";
import ErrorModal from "../../../components/ErrorModal";

interface FormState {
  bank_name: string;
  account_name: string;
  account_number: string;
  balance: string;
}

export default function UpdateBankAccountForm() {
  const [open, setOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [form, setForm] = useState<FormState>({ bank_name: "", account_name: "", account_number: "", balance: "0" });
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const queryClient = useQueryClient();
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res: any = await getBankAccount(Number(id));
        const acc = res?.data ?? res;
        setForm({ bank_name: acc.bank_name ?? "", account_name: acc.account_name ?? "", account_number: acc.account_number ?? "", balance: acc.balance ? String(acc.balance) : "0" });
      } catch (err: any) {
        console.error(err);
        setErrorMessage(err?.response?.data?.message || "Failed to load bank account");
        setErrorOpen(true);
      }
    })();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const validate = () => {
    const newErr: Partial<FormState> = {};
    if (!form.bank_name) newErr.bank_name = "Bank name is required";
    if (!form.account_name) newErr.account_name = "Account name is required";
    if (!form.account_number) newErr.account_number = "Account number is required";
    if (form.balance === "" || isNaN(Number(form.balance))) newErr.balance = "Balance must be a number";
    setErrors(newErr);
    return Object.keys(newErr).length === 0;
  };

  const handleSubmit = async () => {
    if (!id) return;
    if (!validate()) return;
    try {
      const payload = { bank_name: form.bank_name, account_name: form.account_name, account_number: form.account_number, balance: Number(form.balance) };
      const res = await updateBankAccount(Number(id), payload as any);
      const updated = res?.data ?? res;

      const normalized = { ...(updated || {}), id: Number(id), bank_name: updated?.bank_name ?? payload.bank_name, account_name: updated?.account_name ?? payload.account_name, account_number: updated?.account_number ?? payload.account_number, balance: updated?.balance ?? payload.balance };

      queryClient.setQueryData(["bank-accounts"], (old: any) => {
        if (!old) return [normalized];
        if (Array.isArray(old)) return old.map((x: any) => (Number(x.id) === Number(id) ? normalized : x));
        if (old?.data && Array.isArray(old.data)) return { ...old, data: old.data.map((x: any) => (Number(x.id) === Number(id) ? normalized : x)) };
        return [normalized];
      });

      queryClient.invalidateQueries({ queryKey: ["bank-accounts"] });
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
        setErrorMessage("Failed to update bank account. Please try again.");
        setErrorOpen(true);
      }
    }
  };

  return (
    <Stack alignItems="center" sx={{ mt: 4, px: isMobile ? 2 : 0 }}>
      <Paper sx={{ p: theme.spacing(3), maxWidth: "600px", width: "100%", boxShadow: 2, borderRadius: 2 }}>
        <Typography variant="h6" sx={{ mb: 3, textAlign: isMobile ? "center" : "left" }}>Update Bank Account</Typography>

        <Stack spacing={2}>
          <TextField id="bank_name" label="Bank Name" name="bank_name" size="small" fullWidth value={form.bank_name} onChange={handleChange} error={!!errors.bank_name} helperText={errors.bank_name} />
          <TextField id="account_name" label="Account Name" name="account_name" size="small" fullWidth value={form.account_name} onChange={handleChange} error={!!errors.account_name} helperText={errors.account_name} />
          <TextField id="account_number" label="Account Number" name="account_number" size="small" fullWidth value={form.account_number} onChange={handleChange} error={!!errors.account_number} helperText={errors.account_number} />
          <TextField id="balance" label="Balance" name="balance" type="number" inputProps={{ step: "0.01" }} size="small" fullWidth value={form.balance} onChange={handleChange} error={!!errors.balance} helperText={errors.balance} />
        </Stack>

        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3, flexDirection: isMobile ? "column" : "row", gap: isMobile ? 2 : 0 }}>
          <Button onClick={() => window.history.back()}>Back</Button>
          <Button variant="contained" fullWidth={isMobile} sx={{ backgroundColor: "var(--pallet-blue)" }} onClick={handleSubmit}>Update Account</Button>
        </Box>
      </Paper>

      <UpdateConfirmationModal open={open} title="Success" content="Bank account has been updated successfully!" handleClose={() => setOpen(false)} onSuccess={() => window.history.back()} />
      <ErrorModal open={errorOpen} onClose={() => setErrorOpen(false)} message={errorMessage} />
    </Stack>
  );
}
