import React from "react";
import { Paper, Typography, Box } from "@mui/material";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

interface DashboardCardProps {
  text: string;
  icon: JSX.Element;
  change?: number; // optional
  onClick?: () => void;
}

export default function DashboardCard({ text, icon, change, onClick }: DashboardCardProps) {
  return (
    <Paper
      sx={{
        p: { xs: 2, sm: 3 },
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#fff",
        borderRadius: 3,
        mb: 2,
        mx: { xs: 2, sm: 3, md: 6 },
        minHeight: { xs: "auto", sm: 150 },
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        transition: "0.3s",
        "&:hover": {
          transform: "translateY(-3px)",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          cursor: "pointer",
        },
      }}
      onClick={onClick}
    >
      {/* Left Side: Title + Optional Change */}
      <Box
        sx={{
          flex: 1,
          minWidth: 0, // prevent overflow
        }}
      >
        <Typography
          variant="subtitle1"
          fontWeight="bold"
          color="text.primary"
          sx={{ mb: change !== undefined ? 1 : 0 }}
        >
          {text}
        </Typography>
        {change !== undefined && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}
          >
            {/* compared last… */}
            <span
              style={{
                fontWeight: "bold",
                color: change >= 0 ? "green" : "red",
              }}
            >
              {/* {change >= 0 ? `+${change}% ↑` : `${change}% ↓`} */}
            </span>
          </Typography>
        )}
      </Box>

      {/* Right Side: Icon + Arrow */}
      <Box
        display="flex"
        alignItems="center"
        gap={1}
        sx={{
          width: "auto",
          justifyContent: "flex-end",
          flexShrink: 0,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
            width: 50,
            height: 50,
          }}
        >
          {React.cloneElement(icon, { sx: { color: "#000", fontSize: 24 } })}
        </Box>
        <ArrowForwardIosIcon fontSize="small" sx={{ color: "gray", fontSize: 20 }} />
      </Box>
    </Paper>
  );
}
