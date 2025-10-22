import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  TrendingUp,
  People,
  ShoppingBag,
  AttachMoney,
  Flag,
  Chat,
  Verified,
  Warning,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';

import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/dashboard/StatCard';
import RecentActivity from '../../components/dashboard/RecentActivity';
import TopCategories from '../../components/dashboard/TopCategories';
import AlertsPanel from '../../components/dashboard/AlertsPanel';
import { useDashboard } from '../../hooks/useDashboard';
import LoadingScreen from '../../components/ui/LoadingScreen';

const DashboardPage: React.FC = () => {
  const { 
    stats, 
    chartData, 
    recentActivity, 
    alerts, 
    isLoading, 
    error,
    refreshData 
  } = useDashboard();

  useEffect(() => {
    refreshData();
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <Box p={3}>
        <Typography color="error">Error loading dashboard data: {error}</Typography>
      </Box>
    );
  }

  const COLORS = ['#183b45', '#4a6572', '#7e9ba3', '#b2d4d9'];

  return (
    <Box>
      <PageHeader
        title="Dashboard"
        subtitle="Overview of your classifieds platform"
        action={{
          label: 'Refresh Data',
          onClick: refreshData,
          icon: <TrendingUp />,
        }}
      />

      {/* Key Statistics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Users"
            value={stats?.users?.total || 0}
            change={stats?.users?.change || 0}
            icon={<People />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Listings"
            value={stats?.listings?.active || 0}
            change={stats?.listings?.change || 0}
            icon={<ShoppingBag />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Revenue"
            value={`₹${stats?.revenue?.total?.toLocaleString() || 0}`}
            change={stats?.revenue?.change || 0}
            icon={<AttachMoney />}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pending Reports"
            value={stats?.reports?.pending || 0}
            change={stats?.reports?.change || 0}
            icon={<Flag />}
            color="error"
          />
        </Grid>
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* User Growth Chart */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                User Growth
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData?.userGrowth || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="users"
                      stroke="#183b45"
                      fill="#183b45"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Category Distribution */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Listings by Category
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData?.categoryDistribution || []}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {(chartData?.categoryDistribution || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Revenue and Activity Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Revenue Chart */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Monthly Revenue
              </Typography>
              <Box sx={{ height: 250 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData?.revenue || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`₹${value}`, 'Revenue']} />
                    <Bar dataKey="amount" fill="#183b45" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* System Health */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                System Health
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography variant="body2" sx={{ minWidth: 120 }}>
                    Server Load
                  </Typography>
                  <Box sx={{ flex: 1, mx: 2 }}>
                    <LinearProgress
                      variant="determinate"
                      value={stats?.system?.serverLoad || 0}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {stats?.system?.serverLoad || 0}%
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography variant="body2" sx={{ minWidth: 120 }}>
                    Memory Usage
                  </Typography>
                  <Box sx={{ flex: 1, mx: 2 }}>
                    <LinearProgress
                      variant="determinate"
                      value={stats?.system?.memoryUsage || 0}
                      color="warning"
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {stats?.system?.memoryUsage || 0}%
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography variant="body2" sx={{ minWidth: 120 }}>
                    Database
                  </Typography>
                  <Box sx={{ flex: 1, mx: 2 }}>
                    <LinearProgress
                      variant="determinate"
                      value={stats?.system?.databaseHealth || 0}
                      color="success"
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {stats?.system?.databaseHealth || 0}%
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 1, mt: 3 }}>
                  <Chip
                    icon={<Verified />}
                    label="API Healthy"
                    color="success"
                    size="small"
                  />
                  <Chip
                    icon={<Chat />}
                    label="Chat Active"
                    color="primary"
                    size="small"
                  />
                  {stats?.system?.alerts > 0 && (
                    <Chip
                      icon={<Warning />}
                      label={`${stats.system.alerts} Alerts`}
                      color="warning"
                      size="small"
                    />
                  )}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Bottom Row - Activity and Alerts */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <RecentActivity activities={recentActivity || []} />
        </Grid>
        <Grid item xs={12} md={4}>
          <AlertsPanel alerts={alerts || []} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;



