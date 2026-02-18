import React, { useState } from "react";
import { Box, Stack, Typography, TextField, Button, Paper, useTheme, useMediaQuery } from "@mui/material";
import theme from "../../../theme";
import { createCreditor } from "../../../api/Creditors/creditorsApi";
import { getSuppliers } from "../../../api/Suppliers/suppliersApi";
import { MenuItem } from "@mui/material";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import AddedConfirmationModal from "../../../components/AddedConfirmationModal";
import ErrorModal from "../../../components/ErrorModal";
import { useNavigate } from "react-router";

interface FormState {
  supplier_id: string;
  amount: string;
}

export default function AddCreditorForm() {
  const [open, setOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [form, setForm] = useState<FormState>({ supplier_id: "", amount: "" });
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const queryClient = useQueryClient();
  const { data: suppliers = [] } = useQuery({
    queryKey: ["suppliers"],
    queryFn: async () => {
      const res = await getSuppliers();
      return res;
    },
  });
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const validate = () => {
    const newErr: Partial<FormState> = {};
    if (!form.supplier_id) newErr.supplier_id = "Supplier is required";
    if (!form.amount) newErr.amount = "Amount is required";
    else if (isNaN(Number(form.amount))) newErr.amount = "Amount must be a number";
    setErrors(newErr);
    return Object.keys(newErr).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      const payload = { supplier_id: Number(form.supplier_id), amount: Number(form.amount) };
      const created = await createCreditor(payload);
      const createdRes = created?.data ?? created;
      const createdData = createdRes?.data ?? createdRes;

      const suppliersMap: Record<string, any> = {};
      (suppliers || []).forEach((s: any) => { suppliersMap[String(s.id)] = s; });
      const normalized = {
        ...(createdData || {}),
        supplier_name: (createdData && (createdData.supplier_name || (createdData.supplier && createdData.supplier.name))) || (suppliersMap[String(createdData?.supplier_id)] && suppliersMap[String(createdData?.supplier_id)].name) || String(createdData?.supplier_id ?? ""),
      };

      queryClient.setQueryData(["creditors"], (old: any[] | undefined) => {
        if (Array.isArray(old)) return [...old, normalized];
        return [normalized];
      });
      queryClient.invalidateQueries({ queryKey: ["creditors"] });

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
        setErrorMessage("Failed to add creditor. Please try again.");
        setErrorOpen(true);
      }
    }
  };

  return (
    <Stack alignItems="center" sx={{ mt: 4, px: isMobile ? 2 : 0 }}>
      <Paper sx={{ p: theme.spacing(3), maxWidth: "600px", width: "100%", boxShadow: 2, borderRadius: 2 }}>
        <Typography variant="h6" sx={{ mb: 3, textAlign: isMobile ? "center" : "left" }}>Add Creditor</Typography>
        <Stack spacing={2}>
          <TextField id="supplier_id" select label="Supplier" name="supplier_id" size="small" fullWidth value={form.supplier_id} onChange={handleChange} error={!!errors.supplier_id} helperText={errors.supplier_id}>
            <MenuItem value="">Select supplier</MenuItem>
            {(suppliers || []).map((s: any) => (
              <MenuItem key={s.id} value={String(s.id)}>{s.name} — {s.email}</MenuItem>
            ))}
          </TextField>
          <TextField id="amount" label="Amount" name="amount" type="number" inputProps={{ step: "0.01" }} size="small" fullWidth value={form.amount} onChange={handleChange} error={!!errors.amount} helperText={errors.amount} />
        </Stack>

        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3, flexDirection: isMobile ? "column" : "row", gap: isMobile ? 2 : 0 }}>
          <Button onClick={() => window.history.back()}>Back</Button>
          <Button variant="contained" fullWidth={isMobile} sx={{ backgroundColor: "var(--pallet-blue)" }} onClick={handleSubmit}>Add Creditor</Button>
        </Box>
      </Paper>

      <AddedConfirmationModal open={open} title="Success" content="Creditor has been added successfully!" addFunc={async () => {}} handleClose={() => setOpen(false)} onSuccess={() => window.history.back()} />
      <ErrorModal open={errorOpen} onClose={() => setErrorOpen(false)} message={errorMessage} />
    </Stack>
  );
}
