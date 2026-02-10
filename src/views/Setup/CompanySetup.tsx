import React from "react";
import {
  Stack,
  Grid,
  Paper,
  Typography,
  Box,
  IconButton,
} from "@mui/material";
import RequestQuoteIcon from "@mui/icons-material/RequestQuote";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import ReceiptIcon from "@mui/icons-material/Receipt";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import PaymentIcon from "@mui/icons-material/Payment";
import NoteAddIcon from "@mui/icons-material/NoteAdd";
import DescriptionIcon from "@mui/icons-material/Description";
import PrintIcon from "@mui/icons-material/Print";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import CreditScoreIcon from "@mui/icons-material/CreditScore";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { useNavigate } from "react-router";
import DashboardCard from "../../components/DashboardCard";

function CompanySetup() {
  const navigate = useNavigate();

  const allItems = [
    {
      text: "COMPANY SETUP",
      change: +36,
      icon: <RequestQuoteIcon sx={{ fontSize: 40, color: "#1976d2" }} />,
      path: "/setup/companysetup/company-setup",
    },
    {
      text: "USER ACCOUNT SETUP",
      change: -14,
      icon: <ShoppingCartIcon sx={{ fontSize: 40, color: "#1976d2" }} />,
      path: "/setup/companysetup/user-account-setup",
    },
    {
      text: "ACCESS SETUP",
      change: +36,
      icon: <LocalShippingIcon sx={{ fontSize: 40, color: "#1976d2" }} />,
      path: "/setup/companysetup/access-setup",
    },
  ];

  const handleItemClick = (path, text) => {
    if (path) {
      navigate(path);
    } else {
      console.log(`Clicked: ${text} (No route defined)`);
    }
  };

  return (
    <Stack sx={{ minHeight: "100vh", backgroundColor: "#f0f0f0", p: 3 }}>

      <Grid container spacing={2}>
        {allItems.map((item, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <DashboardCard
              text={item.text}
              icon={item.icon}
              change={item.change}
              onClick={() => handleItemClick(item.path, item.text)}
            />
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
}

export default CompanySetup;
