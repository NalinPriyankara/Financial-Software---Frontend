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
import { getStocks } from "../../../api/Stocks/stocksApi";
import { getItems } from "../../../api/Items/itemsApi";

export default function StocksReport() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));

  const { data: stocksRes = [] } = useQuery({ queryKey: ["stocks"], queryFn: getStocks });
  const { data: itemsRes = [] } = useQuery({ queryKey: ["items"], queryFn: getItems });
  const printRef = useRef<HTMLDivElement | null>(null);

  const stocks = Array.isArray(stocksRes) ? stocksRes : (stocksRes as any)?.data ?? [];
  const items = Array.isArray(itemsRes) ? itemsRes : (itemsRes as any)?.data ?? [];

  const mapped = useMemo(() => {
    const itemsMap: Record<number, string> = {};
    (items || []).forEach((it: any) => { if (it) itemsMap[Number(it.id)] = String(it.name ?? ""); });
    return (stocks || []).map((s: any) => ({
      id: s.id,
      item_id: s.item_id,
      quantity: Number(s.quantity ?? 0),
      item_name: s.item?.name ?? itemsMap[Number(s.item_id)] ?? "",
    }));
  }, [stocks, items]);

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
          <title>Stocks Report</title>
          <style>${styles}</style>
        </head>
        <body>
          <h1>Stocks Report</h1>
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
        <PageTitle title="Stocks Report" />
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
          <Table aria-label="stocks report table">
            <TableHead sx={{ backgroundColor: "var(--pallet-lighter-blue)" }}>
              <TableRow>
                <TableCell>No</TableCell>
                <TableCell>Item</TableCell>
                <TableCell align="right">Quantity</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {paginated.length > 0 ? (
                paginated.map((r: any, index: number) => (
                  <TableRow key={r.id ?? `stock-${page}-${index}`} hover>
                    <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                    <TableCell>{r.item_name}</TableCell>
                    <TableCell align="right">{Number(r.quantity ?? 0).toFixed(2)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    <Typography variant="body2">No Records Found</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>

            <TableFooter>
              <TableRow>
                <TablePagination
                  rowsPerPageOptions={[10, 25, 50, { label: "All", value: -1 }]}
                  colSpan={3}
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
