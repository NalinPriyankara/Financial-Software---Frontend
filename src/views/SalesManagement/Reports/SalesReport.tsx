import React, { useMemo, useState, useRef } from "react";
import {
  Box,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableFooter,
  TablePagination,
  Paper,
  Typography,
  Button,
  useMediaQuery,
  Theme,
} from "@mui/material";
import theme from "../../../theme";
import { useQuery } from "@tanstack/react-query";
import PageTitle from "../../../components/PageTitle";
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { getSales } from "../../../api/Sales/salesApi";
import { getUsers } from "../../../api/UserManagement/userManagement";
import { getCustomers } from "../../../api/Customers/customersApi";

export default function SalesReport() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));

  const { data: salesRes = [] } = useQuery({ queryKey: ["sales"], queryFn: getSales });
  const { data: users = [] } = useQuery({ queryKey: ["users"], queryFn: getUsers });
  const { data: customers = [] } = useQuery({ queryKey: ["customers"], queryFn: getCustomers });
  const printRef = useRef<HTMLDivElement | null>(null);

  const sales = Array.isArray(salesRes) ? salesRes : (salesRes as any)?.data ?? [];

  const mapped = useMemo(() => {
    const custMap: Record<string, any> = {};
    (customers || []).forEach((c: any) => { custMap[String(c.id)] = c; });
    const userMap: Record<string, any> = {};
    (users || []).forEach((u: any) => { userMap[String(u.id)] = u; });

    return (sales || []).map((s: any) => ({
      id: s.id,
      invoice_no: s.invoice_no,
      sale_date: s.sale_date ? String(s.sale_date).split("T")[0] : s.sale_date,
      customer: s.customer?.name ?? s.customer_name ?? (custMap[String(s.customer_id)] && custMap[String(s.customer_id)].name) ?? String(s.customer_id ?? "-"),
      total_amount: Number(s.total_amount ?? 0),
      paid_amount: Number(s.paid_amount ?? 0),
      balance: Number(s.balance ?? 0),
      created_by:
        (s.created_by_user && (s.created_by_user.first_name || s.created_by_user.name)) ||
        (userMap[String(s.created_by)] && (userMap[String(s.created_by)].first_name || userMap[String(s.created_by)].name)) ||
        String(s.created_by),
    }));
  }, [sales, users, customers]);

  const filtered = mapped;

  const handleDownloadPDF = () => {
    const el = printRef.current;
    if (!el) return;
    const newWindow = window.open("", "_blank", "width=900,height=700");
    if (!newWindow) return;
    const styles = `
      body { font-family: Arial, Helvetica, sans-serif; padding: 20px; }
      table { width: 100%; border-collapse: collapse; }
      th, td { border: 1px solid #ddd; padding: 8px; }
      th { background: #f5f9ff; }
    `;
    newWindow.document.write(`
      <html>
        <head>
          <title>Sales Report</title>
          <style>${styles}</style>
        </head>
        <body>
          <h1>Sales Report</h1>
          ${el.innerHTML}
        </body>
      </html>
    `);
    newWindow.document.close();
    newWindow.focus();
    newWindow.print();
  };

  const paginated = useMemo(() => {
    if (rowsPerPage === -1) return filtered;
    return filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filtered, page, rowsPerPage]);

  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  return (
    <Stack>
      <Box sx={{ padding: theme.spacing(2), boxShadow: 2, marginY: 2, borderRadius: 1 }}>
        <PageTitle title="Sales Report" />
      </Box>

      <Stack direction={"row"} spacing={2} sx={{ px: 2, mb: 2, alignItems: "center", justifyContent: "space-between" }}>
        <Box />
        <Box>
          <Button variant="contained" startIcon={<PictureAsPdfIcon />} onClick={handleDownloadPDF}>
            Download PDF
          </Button>
        </Box>
      </Stack>

      <Stack sx={{ alignItems: "center" }}>
        <TableContainer component={Paper} elevation={2} sx={{ overflowX: "auto", maxWidth: isMobile ? "88vw" : "100%" }} ref={printRef}>
          <Table aria-label="sales report table">
            <TableHead sx={{ backgroundColor: "var(--pallet-lighter-blue)" }}>
              <TableRow>
                <TableCell>Invoice No</TableCell>
                <TableCell>Sale Date</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell align="right">Total Amount</TableCell>
                <TableCell align="right">Paid Amount</TableCell>
                <TableCell align="right">Balance</TableCell>
                <TableCell>Created By</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {paginated.length > 0 ? (
                paginated.map((r: any, index: number) => (
                  <TableRow key={r.id ?? `sale-${page}-${index}`} hover>
                    <TableCell>{r.invoice_no}</TableCell>
                    <TableCell>{r.sale_date}</TableCell>
                    <TableCell>{r.customer}</TableCell>
                    <TableCell align="right">{r.total_amount.toFixed(2)}</TableCell>
                    <TableCell align="right">{r.paid_amount.toFixed(2)}</TableCell>
                    <TableCell align="right">{r.balance.toFixed(2)}</TableCell>
                    <TableCell>{r.created_by}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body2">No Records Found</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>

            <TableFooter>
              <TableRow>
                <TablePagination
                  rowsPerPageOptions={[10, 25, 50, { label: "All", value: -1 }]}
                  colSpan={7}
                  count={filtered.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  showFirstButton
                  showLastButton
                />
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer>
      </Stack>
    </Stack>
  );
}
