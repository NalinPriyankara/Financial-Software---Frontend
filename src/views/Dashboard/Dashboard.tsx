import React, { useMemo } from 'react'
import { Box, Grid, Card, CardContent, Typography, Divider, List, ListItem, ListItemText } from '@mui/material'
import CustomPieChart from '../../components/CustomPieChart'
import RadialStrokeBarChart from '../../components/RadialStrokedBarChart'
import { useQuery } from '@tanstack/react-query'
import { getSales } from '../../api/Sales/salesApi'
import { getExpenses } from '../../api/Expenses/expensesApi'
import { getBankAccounts } from '../../api/BankAccounts/bankAccountsApi'
import { getLoans } from '../../api/Loans/loansApi'
import { getStocks } from '../../api/Stocks/stocksApi'
import { getItems } from '../../api/Items/itemsApi'

const Dashboard: React.FC = () => {
  // Dummy data
  const uploadStatus = [
    { name: 'Processed', value: 72 },
    { name: 'Pending', value: 18 },
    { name: 'Failed', value: 10 },
  ];

  const performance = [
    { name: 'Q1', value: 70 },
    { name: 'Q2', value: 85 },
    { name: 'Q3', value: 60 },
    { name: 'Q4', value: 90 },
  ];

  const recentActivities = [
    { title: 'Uploaded React in 28 Days.pdf', subtitle: '2 hours ago' },
    { title: 'Added new company record', subtitle: '1 day ago' },
    { title: 'Role updated: Manager', subtitle: '3 days ago' },
  ];

  const avgPerformance = Math.round(performance.reduce((s, p) => s + p.value, 0) / performance.length);
  

  const { data: salesRes = [] } = useQuery({ queryKey: ['sales'], queryFn: getSales });
  const { data: expensesRes = [] } = useQuery({ queryKey: ['expenses'], queryFn: getExpenses });
  const { data: bankAccountsRes = [] } = useQuery({ queryKey: ['bank-accounts'], queryFn: getBankAccounts });
  const { data: loansRes = [] } = useQuery({ queryKey: ['loans'], queryFn: getLoans });
  const { data: stocksRes = [] } = useQuery({ queryKey: ['stocks'], queryFn: getStocks });
  const { data: itemsRes = [] } = useQuery({ queryKey: ['items'], queryFn: getItems });

  const sales = Array.isArray(salesRes) ? salesRes : (salesRes as any)?.data ?? [];
  const expenses = Array.isArray(expensesRes) ? expensesRes : (expensesRes as any)?.data ?? [];
  const bankAccounts = Array.isArray(bankAccountsRes) ? bankAccountsRes : (bankAccountsRes as any)?.data ?? [];
  const loans = Array.isArray(loansRes) ? loansRes : (loansRes as any)?.data ?? [];
  const stocks = Array.isArray(stocksRes) ? stocksRes : (stocksRes as any)?.data ?? [];
  const items = Array.isArray(itemsRes) ? itemsRes : (itemsRes as any)?.data ?? [];

  // Compute quarterly sales for current year and percent metric
  const quarterlySales = useMemo(() => {
    const quarters = { Q1: 0, Q2: 0, Q3: 0, Q4: 0 } as Record<string, number>;
    const now = new Date();
    const currentYear = now.getFullYear();
    (sales || []).forEach((s: any) => {
      const dateStr = s.sale_date || s.saleDate || s.created_at || s.createdAt;
      if (!dateStr) return;
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return;
      if (d.getFullYear() !== currentYear) return;
      const month = d.getMonth(); // 0-11
      const q = Math.floor(month / 3); // 0..3
      const key = `Q${q + 1}`;
      quarters[key] = (quarters[key] || 0) + Number(s.total_amount ?? 0);
    });
    return [
      { name: 'Q1', value: quarters.Q1 },
      { name: 'Q2', value: quarters.Q2 },
      { name: 'Q3', value: quarters.Q3 },
      { name: 'Q4', value: quarters.Q4 },
    ];
  }, [sales]);

  const avgQuarterPercent = useMemo(() => {
    const vals = (quarterlySales || []).map((q: any) => Number(q.value || 0));
    if (!vals.length) return 0;
    const avg = vals.reduce((s: number, v: number) => s + v, 0) / vals.length;
    const max = Math.max(...vals, 1);
    return Math.round((avg / max) * 100);
  }, [quarterlySales]);

  const totalSales = useMemo(() => {
    return sales.reduce((s: number, x: any) => s + Number(x.total_amount ?? 0), 0);
  }, [sales]);

  const totalExpenses = useMemo(() => {
    return expenses.reduce((s: number, x: any) => s + Number(x.amount ?? 0), 0);
  }, [expenses]);

  const bankBalance = useMemo(() => {
    return bankAccounts.reduce((s: number, a: any) => s + Number(a.balance ?? 0), 0);
  }, [bankAccounts]);

  const loanOutstanding = useMemo(() => {
    return loans.reduce((s: number, l: any) => s + Number(l.balance ?? 0) , 0);
  }, [loans]);

  const stockValue = useMemo(() => {
    // make a map of item selling_price
    const priceMap: Record<number, number> = {};
    (items || []).forEach((it: any) => { priceMap[it.id] = Number(it.selling_price ?? it.sellingPrice ?? 0); });
    return (stocks || []).reduce((s: number, st: any) => {
      const price = priceMap[st.item_id] ?? 0;
      return s + (Number(st.quantity ?? 0) * price);
    }, 0);
  }, [stocks, items]);

  const financeChartData = useMemo(() => {
    return [
      { name: 'Sales', value: Number(totalSales.toFixed(2)) },
      { name: 'Expenses', value: Number(totalExpenses.toFixed(2)) },
      { name: 'Stock Value', value: Number(stockValue.toFixed(2)) },
      { name: 'Bank Balance', value: Number(bankBalance.toFixed(2)) },
      { name: 'Loans', value: Number(loanOutstanding.toFixed(2)) },
    ];
  }, [totalSales, totalExpenses, stockValue, bankBalance, loanOutstanding]);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>Dashboard</Typography>

      {/* Top KPI cards */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2">Total Sales</Typography>
              <Typography variant="h5">{totalSales.toFixed(2)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2">Total Expenses</Typography>
              <Typography variant="h5">{totalExpenses.toFixed(2)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2">Bank Balance</Typography>
              <Typography variant="h5">{bankBalance.toFixed(2)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2">Loan Outstanding</Typography>
              <Typography variant="h5">{loanOutstanding.toFixed(2)}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ alignItems: 'stretch' }}>
        <Grid item xs={12} md={8} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Card sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flex: 1 }}>
                <Typography variant="h6">Financial Overview</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Sales, expenses, stock, bank and loans breakdown</Typography>
                <CustomPieChart data={financeChartData} title={undefined} width="100%" height={300} innerRadius={70} outerRadius={100} />
              </CardContent>
          </Card>

          <Box sx={{ mt: 0, flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Card sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flex: 1 }}>
                <Typography variant="h6">Quarterly Sales Performance</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Average quarterly sales vs peak quarter (current year)</Typography>
                <RadialStrokeBarChart value={avgQuarterPercent} size={300} label="Avg Quarter %" />
                <Box sx={{ mt: 1 }}>
                  {quarterlySales.map((q: any) => (
                    <Typography key={q.name} variant="body2">{q.name}: {Number(q.value ?? 0).toFixed(2)}</Typography>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Grid>

        <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column' }}>
          <Grid container spacing={2} sx={{ flex: 1 }}>
            <Grid item xs={12}>
              <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                      <CardContent>
                        <Typography variant="h6">Uploads Overview</Typography>
                        <CustomPieChart data={uploadStatus} title={undefined} width={250} height={250} innerRadius={50} outerRadius={80} />
                      </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6">Key Metrics</Typography>
                  <Divider sx={{ my: 1 }} />
                  <Grid container spacing={1}>
                        <Grid item xs={6}>
                          <Typography variant="subtitle2">Stock Value</Typography>
                          <Typography variant="h6">{stockValue.toFixed(2)}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="subtitle2">Sales - Expenses</Typography>
                          <Typography variant="h6">{(totalSales - totalExpenses).toFixed(2)}</Typography>
                        </Grid>
                        <Grid item xs={6} sx={{ mt: 1 }}>
                          <Typography variant="subtitle2">Loans Outstanding</Typography>
                          <Typography variant="h6">{loanOutstanding.toFixed(2)}</Typography>
                        </Grid>
                        <Grid item xs={6} sx={{ mt: 1 }}>
                          <Typography variant="subtitle2">Bank Balance</Typography>
                          <Typography variant="h6">{bankBalance.toFixed(2)}</Typography>
                        </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6">Recent Activity</Typography>
                  <List dense>
                    {recentActivities.map((r, i) => (
                      <ListItem key={i} divider>
                        <ListItemText primary={r.title} secondary={r.subtitle} />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  )
}

export default Dashboard
