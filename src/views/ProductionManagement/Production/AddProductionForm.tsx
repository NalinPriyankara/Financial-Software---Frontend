import React, { useState } from "react";
import { Box, Stack, Typography, TextField, Button, Paper, useTheme, useMediaQuery } from "@mui/material";
import theme from "../../../theme";
import { createProduction } from "../../../api/Productions/productionsApi";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import UpdateConfirmationModal from "../../../components/UpdateConfirmationModal";
import ErrorModal from "../../../components/ErrorModal";
import useCurrentUser from "../../../hooks/useCurrentUser";

interface FormState {
  production_date: string;
  notes: string;
}

export default function AddProductionForm() {
  const [open, setOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [form, setForm] = useState<FormState>({ production_date: "", notes: "" });
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const queryClient = useQueryClient();
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const { user } = useCurrentUser();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const validate = () => {
    const newErr: Partial<FormState> = {};
    if (!form.production_date) newErr.production_date = "Production date is required";
    setErrors(newErr);
    return Object.keys(newErr).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      const payload: any = { production_date: form.production_date, notes: form.notes || undefined, created_by: user?.id };
      const res = await createProduction(payload);
      const created = res?.data ?? res;

      queryClient.setQueryData(["productions"], (old: any) => {
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
        setErrorMessage("Failed to create production. Please try again.");
        setErrorOpen(true);
      }
    }
  };

  return (
    <Stack alignItems="center" sx={{ mt: 4, px: isMobile ? 2 : 0 }}>
      <Paper sx={{ p: theme.spacing(3), maxWidth: "600px", width: "100%", boxShadow: 2, borderRadius: 2 }}>
        <Typography variant="h6" sx={{ mb: 3, textAlign: isMobile ? "center" : "left" }}>Add Production</Typography>

        <Stack spacing={2}>
          <TextField id="production_date" label="Production Date" name="production_date" type="date" size="small" fullWidth value={form.production_date} onChange={handleChange} InputLabelProps={{ shrink: true }} error={!!errors.production_date} helperText={errors.production_date} />
          <TextField id="notes" label="Notes" name="notes" size="small" fullWidth multiline minRows={3} value={form.notes} onChange={handleChange} />
        </Stack>

        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3, flexDirection: isMobile ? "column" : "row", gap: isMobile ? 2 : 0 }}>
          <Button onClick={() => window.history.back()}>Back</Button>
          <Button variant="contained" fullWidth={isMobile} sx={{ backgroundColor: "var(--pallet-blue)" }} onClick={handleSubmit}>Add Production</Button>
        </Box>
      </Paper>

      <UpdateConfirmationModal open={open} title="Success" content="Production created successfully!" handleClose={() => setOpen(false)} onSuccess={() => window.history.back()} />
      <ErrorModal open={errorOpen} onClose={() => setErrorOpen(false)} message={errorMessage} />
    </Stack>
  );
}
