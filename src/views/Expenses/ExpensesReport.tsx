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
import theme from "../../theme";
import { useQuery } from "@tanstack/react-query";
import PageTitle from "../../components/PageTitle";
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { getExpenses } from "../../api/Expenses/expensesApi";
import { getUsers } from "../../api/UserManagement/userManagement";

export default function ExpensesReport() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));

  const { data: expensesRes = [] } = useQuery({ queryKey: ["expenses"], queryFn: getExpenses });
  const { data: users = [] } = useQuery({ queryKey: ["users"], queryFn: getUsers });
  const printRef = useRef<HTMLDivElement | null>(null);

  const expenses = Array.isArray(expensesRes) ? expensesRes : (expensesRes as any)?.data ?? [];

  const mapped = useMemo(() => {
    const userMap: Record<string, any> = {};
    (users || []).forEach((u: any) => { userMap[String(u.id)] = u; });
    return (expenses || []).map((e: any) => ({
      id: e.id,
      title: e.title ?? e.name ?? "",
      expense_no: e.expense_no ?? e.id,
      expense_date: e.expense_date ? String(e.expense_date).split("T")[0] : e.expense_date,
      description: e.description ?? e.category ?? "-",
      amount: Number(e.amount ?? e.total ?? 0),
      created_by_name: (e?.created_by && typeof e.created_by === "object") ? (e.created_by.first_name ?? e.created_by.name) : (userMap[String(e.created_by)] && (userMap[String(e.created_by)].first_name || userMap[String(e.created_by)].name)) || String(e.created_by),
    }));
  }, [expenses, users]);

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
          <title>Expenses Report</title>
          <style>${styles}</style>
        </head>
        <body>
          <h1>Expenses Report</h1>
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
        <PageTitle title="Expenses Report" />
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
          <Table aria-label="expenses report table">
            <TableHead sx={{ backgroundColor: "var(--pallet-lighter-blue)" }}>
                <TableRow>
                  <TableCell>No</TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Expense Date</TableCell>
                  <TableCell>Created By</TableCell>
                </TableRow>
              </TableHead>

            <TableBody>
              {paginated.length > 0 ? (
                paginated.map((r: any, index: number) => (
                  <TableRow key={r.id ?? `exp-${page}-${index}`} hover>
                    <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                    <TableCell>{r.title}</TableCell>
                    <TableCell>{r.amount.toFixed(2)}</TableCell>
                    <TableCell>{r.description}</TableCell>
                    <TableCell>{r.expense_date}</TableCell>
                    <TableCell>{r.created_by_name}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body2">No Records Found</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>

            <TableFooter>
              <TableRow>
                <TablePagination
                  rowsPerPageOptions={[10, 25, 50, { label: "All", value: -1 }]}
                  colSpan={6}
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
