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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import theme from "../../../theme";
import AddedConfirmationModal from "../../../components/AddedConfirmationModal";
import ErrorModal from "../../../components/ErrorModal";

export default function PastYearAnalysis() {
  const [dateRange, setDateRange] = useState("12m");
  const [forecastPeriod, setForecastPeriod] = useState("12m");
  const [externalRisks, setExternalRisks] = useState(false);
  const [naturalDisasters, setNaturalDisasters] = useState(false);

  const [socialPoliticalRisks, setSocialPoliticalRisks] = useState(false);
  const [salesDataFile, setSalesDataFile] = useState<File | null>(null);
  const [expenseDataFile, setExpenseDataFile] = useState<File | null>(null);
  const [targetRevenue, setTargetRevenue] = useState("");
  const [targetProfitMargin, setTargetProfitMargin] = useState("");

  const [otherNotes, setOtherNotes] = useState("");

  const [openSuccess, setOpenSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | undefined>(undefined);
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (f: File | null) => void) => {
    const f = e.target.files && e.target.files.length > 0 ? e.target.files[0] : null;
    setter(f);
  };

  const handleForecast = async () => {
    try {
      setSuccessMessage("Forecast completed successfully.");
      setOpenSuccess(true);
    } catch (err: any) {
      setErrorMessage("Forecast failed. Please try again.");
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
          Forecast — Next Period
        </Typography>

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Stack spacing={2}>
              <Typography variant="subtitle1">Forecast Inputs</Typography>
              <Divider />

              <FormControl size="small" fullWidth>
                <InputLabel>Date Range</InputLabel>
                <Select label="Date Range" value={dateRange} onChange={(e) => setDateRange(String(e.target.value))}>
                  <MenuItem value="12m">Next 12 months</MenuItem>
                  <MenuItem value="2y">Next 2 years</MenuItem>
                  <MenuItem value="5y">Next 5 years</MenuItem>
                </Select>
              </FormControl>

              <FormControlLabel
                control={<Checkbox checked={externalRisks} onChange={(e) => setExternalRisks(e.target.checked)} />}
                label="External factors & risks"
              />

              <FormControlLabel
                control={<Checkbox checked={naturalDisasters} onChange={(e) => setNaturalDisasters(e.target.checked)} />}
                label="Natural disasters"
              />

              <FormControl size="small" fullWidth>
                <InputLabel>Forecast Period</InputLabel>
                <Select label="Forecast Period" value={forecastPeriod} onChange={(e) => setForecastPeriod(String(e.target.value))}>
                  <MenuItem value="12m">Next 12 months</MenuItem>
                  <MenuItem value="2y">Next 2 years</MenuItem>
                  <MenuItem value="5y">Next 5 years</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Grid>

          <Grid item xs={12} md={6}>
            <Stack spacing={2} alignItems="flex-start">
              <Typography variant="subtitle1">Data & Targets</Typography>
              <Divider sx={{ width: '100%' }} />

              <FormControlLabel
                control={<Checkbox checked={socialPoliticalRisks} onChange={(e) => setSocialPoliticalRisks(e.target.checked)} />}
                label="Social & Political Risks"
              />

              <Box sx={{ width: '100%' }}>
                <Typography variant="body2">Sales Data (CSV / XLSX)</Typography>
                <input type="file" accept=".csv,.xlsx,.xls" onChange={(e) => handleFileChange(e, setSalesDataFile)} />
              </Box>

              <Box sx={{ width: '100%' }}>
                <Typography variant="body2">Expense Data (CSV / XLSX)</Typography>
                <input type="file" accept=".csv,.xlsx,.xls" onChange={(e) => handleFileChange(e, setExpenseDataFile)} />
              </Box>

              <TextField
                label="Target Revenue"
                size="small"
                fullWidth
                value={targetRevenue}
                onChange={(e) => setTargetRevenue(e.target.value)}
              />

              <TextField
                label="Target Profit Margin (%)"
                size="small"
                fullWidth
                value={targetProfitMargin}
                onChange={(e) => setTargetProfitMargin(e.target.value)}
              />
            </Stack>
          </Grid>
        </Grid>

        <Box sx={{ mt: 3 }}>
          <TextField fullWidth multiline rows={4} label="Other" value={otherNotes} onChange={(e) => setOtherNotes(e.target.value)} />
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 2 }}>
          <Button variant="contained" onClick={handleForecast}>Forecast</Button>
        </Box>
      </Paper>

      <AddedConfirmationModal
        open={openSuccess}
        title="Success"
        content={successMessage || "Forecast completed"}
        addFunc={async () => {}}
        handleClose={() => setOpenSuccess(false)}
        onSuccess={() => setOpenSuccess(false)}
      />

      <ErrorModal open={errorOpen} onClose={() => setErrorOpen(false)} message={errorMessage} />
    </Stack>
  );
}
