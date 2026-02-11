import React, { useState } from "react";
import {
  Box,
  Stack,
  Typography,
  TextField,
  Button,
  Paper,
  Divider,
  Grid,
} from "@mui/material";
import theme from "../../../theme";
import AddedConfirmationModal from "../../../components/AddedConfirmationModal";
import ErrorModal from "../../../components/ErrorModal";

export default function AchievementTargetForm() {
  const [revenueTarget, setRevenueTarget] = useState("");
  const [profitTarget, setProfitTarget] = useState("");
  const [expenseReductionTarget, setExpenseReductionTarget] = useState("");
  const [salesGrowth, setSalesGrowth] = useState("");
  const [newCustomers, setNewCustomers] = useState("");
  const [other, setOther] = useState("");

  const [aiOptions, setAiOptions] = useState<{ [key: string]: boolean }>({
    optimizePricing: false,
    reduceCosts: false,
    increaseMarketing: false,
    improveSalesProcess: false,
    customerRetention: false,
  });

  const [openSuccess, setOpenSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | undefined>(undefined);
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleAnalyze = async () => {
    try {
      // Placeholder: perform analysis (call backend) — here we just simulate success
      setSuccessMessage("Analysis complete. AI insights are available.");
      setOpenSuccess(true);
    } catch (err: any) {
      setErrorMessage("Failed to analyze targets. Please try again.");
      setErrorOpen(true);
    }
  };

  const handleToggleOption = (key: string) => {
    setAiOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleApplyRecommendations = async () => {
    try {
      // Placeholder: apply selected recommendations
      setSuccessMessage("Recommendations applied successfully.");
      setOpenSuccess(true);
    } catch (err: any) {
      setErrorMessage("Failed to apply recommendations.");
      setErrorOpen(true);
    }
  };

  return (
    <Stack alignItems="center" sx={{ p: { xs: 1, md: 3 } }}>
      <Paper
        sx={{
          p: theme.spacing(3),
          width: "100%",
          maxWidth: "1200px",
          boxShadow: 2,
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" sx={{ mb: 2, textAlign: "center" }}>
          Achievement Targets
        </Typography>

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Stack spacing={2}>
              <Typography variant="subtitle1">Targets</Typography>
              <Divider />

              <TextField
                label="Revenue Target"
                size="small"
                fullWidth
                value={revenueTarget}
                onChange={(e) => setRevenueTarget(e.target.value)}
              />

              <TextField
                label="Profit Target"
                size="small"
                fullWidth
                value={profitTarget}
                onChange={(e) => setProfitTarget(e.target.value)}
              />

              <TextField
                label="Expense Reduction Target"
                size="small"
                fullWidth
                value={expenseReductionTarget}
                onChange={(e) => setExpenseReductionTarget(e.target.value)}
              />

              <TextField
                label="Sales Growth (%)"
                size="small"
                fullWidth
                value={salesGrowth}
                onChange={(e) => setSalesGrowth(e.target.value)}
              />

              <TextField
                label="Number of New Customers"
                size="small"
                fullWidth
                value={newCustomers}
                onChange={(e) => setNewCustomers(e.target.value)}
              />

              <TextField
                label="Other"
                size="small"
                fullWidth
                multiline
                rows={4}
                value={other}
                onChange={(e) => setOther(e.target.value)}
              />

              <Box sx={{ display: "flex", justifyContent: "flex-start", gap: 2, mt: 1 }}>
                <Button variant="contained" onClick={handleAnalyze}>
                  Analyze
                </Button>
              </Box>
            </Stack>
          </Grid>

          <Grid item xs={12} md={6}>
            <Stack spacing={2} alignItems="center">
              <Typography variant="h5">AI Insights</Typography>
              <Divider sx={{ width: '100%' }} />

              <Box sx={{ width: '100%', bgcolor: 'grey.200', p: 2, borderRadius: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {[
                  { key: 'optimizePricing', label: 'Optimize Pricing' },
                  { key: 'reduceCosts', label: 'Reduce Costs' },
                  { key: 'increaseMarketing', label: 'Increase Marketing' },
                  { key: 'improveSalesProcess', label: 'Improve Sales Process' },
                  { key: 'customerRetention', label: 'Customer Retention' },
                ].map((opt) => {
                  const selected = !!aiOptions[opt.key];
                  return (
                    <Box
                      key={opt.key}
                      onClick={() => handleToggleOption(opt.key)}
                      sx={{
                        width: '100%',
                        border: 1,
                        borderColor: selected ? 'primary.main' : 'divider',
                        borderRadius: 4,
                        p: 1.5,
                        mb: 1,
                        cursor: 'pointer',
                        bgcolor: selected ? 'grey.600' : 'transparent',
                        color: selected ? 'primary.contrastText' : 'text.primary',
                        textAlign: 'center',
                        '&:hover': { boxShadow: 1 },
                      }}
                    >
                      <Typography>{opt.label}</Typography>
                    </Box>
                  );
                })}

                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 1 }}>
                  <Button variant="contained" onClick={handleApplyRecommendations}>
                    Apply Recommendations
                  </Button>
                </Box>
              </Box>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      <AddedConfirmationModal
        open={openSuccess}
        title="Success"
        content={successMessage || "Operation successful"}
        addFunc={async () => {}}
        handleClose={() => setOpenSuccess(false)}
        onSuccess={() => setOpenSuccess(false)}
      />

      <ErrorModal open={errorOpen} onClose={() => setErrorOpen(false)} message={errorMessage} />
    </Stack>
  );
}
