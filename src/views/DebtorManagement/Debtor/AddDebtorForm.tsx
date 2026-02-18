import React, { useEffect, useState } from "react";
import { Box, Stack, Typography, TextField, Button, Paper, useTheme, useMediaQuery, MenuItem } from "@mui/material";
import theme from "../../../theme";
import { createDebtor } from "../../../api/Debtors/debtorsApi";
import { getCustomers } from "../../../api/Customers/customersApi";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import AddedConfirmationModal from "../../../components/AddedConfirmationModal";
import ErrorModal from "../../../components/ErrorModal";
import { useNavigate } from "react-router";

interface FormState {
  customer_id: string;
  amount: string;
}

export default function AddDebtorForm() {
  const [open, setOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [form, setForm] = useState<FormState>({ customer_id: "", amount: "" });
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: customers = [] } = useQuery({ queryKey: ["customers"], queryFn: getCustomers });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const validate = () => {
    const newErr: Partial<FormState> = {};
    if (!form.customer_id) newErr.customer_id = "Customer is required";
    if (!form.amount || isNaN(Number(form.amount))) newErr.amount = "Amount is required and must be a number";
    else if (Number(form.amount) <= 0) newErr.amount = "Amount must be greater than 0";
    setErrors(newErr);
    return Object.keys(newErr).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      const payload = {
        customer_id: Number(form.customer_id),
        amount: Number(parseFloat(form.amount).toFixed(2)),
      };

      const res = await createDebtor(payload);
      const createdRaw = res?.data ?? res;

      // try to resolve customer name from cache if API didn't include it
      const customersCache: any[] | undefined = queryClient.getQueryData(["customers"]);
      const customerFromCache = customersCache?.find((x) => Number(x.id) === Number(payload.customer_id));

      const created = {
        ...createdRaw,
        id: createdRaw.id ?? createdRaw.ID ?? createdRaw.debtor_id,
        customer_name:
          createdRaw.customer_name ?? createdRaw.customer?.name ?? customerFromCache?.name ?? undefined,
        amount: Number(createdRaw.amount ?? payload.amount),
      };

      queryClient.setQueryData(["debtors"], (old: any[] | undefined) => {
        if (Array.isArray(old)) return [...old, created];
        return [created];
      });
      // ensure server-side list is refreshed as well
      queryClient.invalidateQueries({ queryKey: ["debtors"] });

      setOpen(true);
      setErrors({});
    } catch (err: any) {
      console.error(err);
      const server = err?.response || err;
      const data = server?.data || err;
      if (data?.message && !data?.errors) {
        setErrorMessage(String(data.message));
        setErrorOpen(true);
      } else if (!data?.errors && !data?.message) {
        setErrorMessage("Failed to add debtor. Please try again.");
        setErrorOpen(true);
      }
    }
  };

  return (
    <Stack alignItems="center" sx={{ mt: 4, px: isMobile ? 2 : 0 }}>
      <Paper sx={{ p: theme.spacing(3), maxWidth: "600px", width: "100%", boxShadow: 2, borderRadius: 2 }}>
        <Typography variant="h6" sx={{ mb: 3, textAlign: isMobile ? "center" : "left" }}>Add Debtor</Typography>

        <Stack spacing={2}>
          <TextField id="customer_id" select label="Customer" name="customer_id" size="small" fullWidth value={form.customer_id} onChange={handleChange} error={!!errors.customer_id} helperText={errors.customer_id}>
            <MenuItem value="">Select customer</MenuItem>
            {(customers || []).map((c: any) => (
              <MenuItem key={c.id} value={String(c.id)}>{c.name} — {c.email}</MenuItem>
            ))}
          </TextField>

          <TextField id="amount" label="Amount" name="amount" type="number" inputProps={{ step: "0.01" }} size="small" fullWidth value={form.amount} onChange={handleChange} error={!!errors.amount} helperText={errors.amount} />

          {/* transaction_date and notes removed - only customer and amount required */}
        </Stack>

        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3, flexDirection: isMobile ? "column" : "row", gap: isMobile ? 2 : 0 }}>
          <Button onClick={() => window.history.back()}>Back</Button>
          <Button variant="contained" fullWidth={isMobile} sx={{ backgroundColor: "var(--pallet-blue)" }} onClick={handleSubmit}>Add Debtor</Button>
        </Box>
      </Paper>

      <AddedConfirmationModal open={open} title="Success" content="Debtor has been added successfully!" addFunc={async () => {}} handleClose={() => setOpen(false)} onSuccess={() => window.history.back()} />

      <ErrorModal open={errorOpen} onClose={() => setErrorOpen(false)} message={errorMessage} />
    </Stack>
  );
}
