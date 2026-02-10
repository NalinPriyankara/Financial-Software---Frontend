import { BrowserRouter } from "react-router";
import AppRoutes from "./Routes.tsx";
import { CssBaseline, ThemeProvider } from "@mui/material";
import theme from "./theme.ts";
import { SnackbarProvider } from "notistack";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import { QueryClientProvider } from "@tanstack/react-query";
import { OrganizationHeadSetter } from "../src/utils/index.html";
import queryClient from "./state/queryClient.ts";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <BrowserRouter>
            <AuthProvider>
              <SnackbarProvider maxSnack={3} autoHideDuration={2500}>
                <OrganizationHeadSetter />
                <AppRoutes />
              </SnackbarProvider>
            </AuthProvider>
          </BrowserRouter>
        </ThemeProvider>
      </LocalizationProvider>
    </QueryClientProvider>
  );
}

export default App;
