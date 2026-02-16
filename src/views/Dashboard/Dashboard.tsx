import React from 'react'
import { Box, Grid, Card, CardContent, Typography, Divider, List, ListItem, ListItemText } from '@mui/material'
import CustomPieChart from '../../components/CustomPieChart'
import RadialStrokeBarChart from '../../components/RadialStrokedBarChart'

const Dashboard: React.FC = () => {
  // Dummy data
  const uploadStatus = [
    { name: 'Processed', value: 72 },
    { name: 'Pending', value: 18 },
    { name: 'Failed', value: 10 },
  ];

  const departmentDistribution = [
    { name: 'Sales', value: 35 },
    { name: 'Finance', value: 25 },
    { name: 'HR', value: 15 },
    { name: 'IT', value: 15 },
    { name: 'Other', value: 10 },
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

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>Dashboard</Typography>

      {/* Top KPI cards */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2">Uploads Today</Typography>
              <Typography variant="h5">128</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2">New Users</Typography>
              <Typography variant="h5">24</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2">Avg. File Size</Typography>
              <Typography variant="h5">1.9 MB</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2">Errors</Typography>
              <Typography variant="h5">4</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ alignItems: 'stretch' }}>
        <Grid item xs={12} md={8} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Card sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flex: 1 }}>
              <Typography variant="h6">Uploads Overview</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Summary of recent file uploads</Typography>
              <CustomPieChart data={uploadStatus} title={undefined} width="100%" height={300} innerRadius={70} outerRadius={100} />
            </CardContent>
          </Card>

          <Box sx={{ mt: 0, flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Card sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flex: 1 }}>
                <Typography variant="h6">Quarterly Performance</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Dummy performance metrics</Typography>
                <RadialStrokeBarChart value={avgPerformance} size={300} label="Avg Performance" />
              </CardContent>
            </Card>
          </Box>
        </Grid>

        <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column' }}>
          <Grid container spacing={2} sx={{ flex: 1 }}>
            <Grid item xs={12}>
              <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <CardContent>
                  <Typography variant="h6">Department Distribution</Typography>
                  <CustomPieChart data={departmentDistribution} title={undefined} width={250} height={250} innerRadius={50} outerRadius={80} />
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
                      <Typography variant="subtitle2">Total Uploads</Typography>
                      <Typography variant="h6">1,248</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2">Active Users</Typography>
                      <Typography variant="h6">312</Typography>
                    </Grid>
                    <Grid item xs={6} sx={{ mt: 1 }}>
                      <Typography variant="subtitle2">Avg. Processing Time</Typography>
                      <Typography variant="h6">2.3s</Typography>
                    </Grid>
                    <Grid item xs={6} sx={{ mt: 1 }}>
                      <Typography variant="subtitle2">Failed Rate</Typography>
                      <Typography variant="h6">3.2%</Typography>
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
