// ===============================================================
// Real-time Health Dashboard Component
// ===============================================================
// Provides comprehensive monitoring of system health, circuit breakers, and processes

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  LinearProgress,
  Button,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Refresh as RefreshIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  PlayArrow as PlayArrowIcon,
  Stop as StopIcon,
  RestartAlt as RestartIcon,
  Timeline as TimelineIcon,
  Speed as SpeedIcon,
  Memory as MemoryIcon,
  NetworkCheck as NetworkCheckIcon,
  ElectricBolt as CircuitIcon
} from '@mui/icons-material';

import { api, HealthStatus, ConnectionTestResult } from '../api';

interface HealthDashboardProps {
  onHealthChange?: (isHealthy: boolean) => void;
}

const HealthDashboard: React.FC<HealthDashboardProps> = ({ onHealthChange }) => {
  const [healthData, setHealthData] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch health data
  const fetchHealthData = useCallback(async () => {
    try {
      setError(null);
      const data = await api.getHealth();
      setHealthData(data);
      setLastUpdate(new Date());

      // Notify parent of health status change
      if (onHealthChange) {
        const isHealthy = data.overall.status === 'healthy';
        onHealthChange(isHealthy);
      }
    } catch (err: any) {
      setError(err.message);
      console.error('Failed to fetch health data:', err);
    } finally {
      setLoading(false);
    }
  }, [onHealthChange]);

  // Auto-refresh effect
  useEffect(() => {
    fetchHealthData();

    if (autoRefresh) {
      const interval = setInterval(fetchHealthData, 10000); // Refresh every 10 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh, fetchHealthData]);

  // Format uptime
  const formatUptime = (uptime: number): string => {
    if (uptime < 60000) return `${Math.round(uptime / 1000)}s`;
    if (uptime < 3600000) return `${Math.round(uptime / 60000)}m`;
    if (uptime < 86400000) return `${Math.round(uptime / 3600000)}h`;
    return `${Math.round(uptime / 86400000)}d`;
  };

  // Get status color
  const getStatusColor = (status: string): 'success' | 'warning' | 'error' | 'default' => {
    switch (status.toLowerCase()) {
      case 'healthy':
      case 'running':
      case 'closed':
        return 'success';
      case 'degraded':
      case 'half_open':
      case 'half-open':
        return 'warning';
      case 'unhealthy':
      case 'critical':
      case 'stopped':
      case 'failed':
      case 'open':
        return 'error';
      default:
        return 'default';
    }
  };

  // Force health check
  const handleForceHealthCheck = async () => {
    setLoading(true);
    await fetchHealthData();
  };

  // Reset circuit breaker
  const handleResetCircuitBreaker = async (name: string) => {
    try {
      await api.resetCircuitBreaker(name);
      await fetchHealthData(); // Refresh data
    } catch (err: any) {
      console.error('Failed to reset circuit breaker:', err);
    }
  };

  // Start/stop process
  const handleProcessAction = async (processId: string, action: 'start' | 'stop') => {
    try {
      if (action === 'start') {
        await api.startProcess(processId);
      } else {
        await api.stopProcess(processId);
      }
      await fetchHealthData(); // Refresh data
    } catch (err: any) {
      console.error(`Failed to ${action} process:`, err);
    }
  };

  if (loading && !healthData) {
    return (
      <Box sx={{ width: '100%', mt: 2 }}>
        <LinearProgress />
        <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
          Loading health data...
        </Typography>
      </Box>
    );
  }

  if (error && !healthData) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Failed to load health data: {error}
        <Button onClick={fetchHealthData} sx={{ ml: 2 }}>
          Retry
        </Button>
      </Alert>
    );
  }

  if (!healthData) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        No health data available
      </Alert>
    );
  }

  return (
    <Box sx={{ mt: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" component="h2">
          System Health Dashboard
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                size="small"
              />
            }
            label="Auto-refresh"
          />
          <Tooltip title="Force health check">
            <IconButton onClick={handleForceHealthCheck} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {lastUpdate && (
        <Typography variant="caption" sx={{ mb: 2, display: 'block' }}>
          Last updated: {lastUpdate.toLocaleTimeString()}
        </Typography>
      )}

      {/* Overall Status */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {healthData.overall.status === 'healthy' ? (
              <CheckCircleIcon color="success" sx={{ fontSize: 40 }} />
            ) : healthData.overall.status === 'degraded' ? (
              <WarningIcon color="warning" sx={{ fontSize: 40 }} />
            ) : (
              <ErrorIcon color="error" sx={{ fontSize: 40 }} />
            )}
            <Box>
              <Typography variant="h6">
                System Status: {healthData.overall.status.toUpperCase()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {healthData.overall.message}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Grid container spacing={2}>
        {/* Services Status */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <NetworkCheckIcon />
                Services
              </Typography>
              <List dense>
                {healthData.services.map((service) => (
                  <ListItem key={service.id}>
                    <ListItemText
                      primary={service.name}
                      secondary={
                        <Box>
                          <Typography variant="caption" component="div">
                            Uptime: {service.uptime.toFixed(1)}% |
                            Avg Response: {service.averageResponseTime.toFixed(0)}ms
                          </Typography>
                          {service.issues.length > 0 && (
                            <Typography variant="caption" color="error">
                              Issues: {service.issues.join(', ')}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Chip
                        label={service.status}
                        color={getStatusColor(service.status)}
                        size="small"
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Circuit Breakers */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircuitIcon />
                Circuit Breakers
              </Typography>
              <List dense>
                {healthData.circuitBreakers.map((cb) => (
                  <ListItem key={cb.name}>
                    <ListItemText
                      primary={cb.name}
                      secondary={
                        <Box>
                          <Typography variant="caption" component="div">
                            Total Requests: {cb.stats?.totalRequests || 0} |
                            Failures: {cb.stats?.totalFailures || 0}
                          </Typography>
                          <Typography variant="caption" component="div">
                            Avg Response: {cb.stats?.averageResponseTime?.toFixed(0) || 0}ms
                          </Typography>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          label={cb.state}
                          color={getStatusColor(cb.state)}
                          size="small"
                        />
                        {cb.state === 'OPEN' && (
                          <Tooltip title="Reset circuit breaker">
                            <IconButton
                              size="small"
                              onClick={() => handleResetCircuitBreaker(cb.name)}
                            >
                              <RestartIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Processes */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <SpeedIcon />
                Processes
              </Typography>
              <List dense>
                {healthData.processes.map((process) => (
                  <ListItem key={process.id}>
                    <ListItemText
                      primary={process.name}
                      secondary={
                        <Typography variant="caption">
                          Uptime: {formatUptime(process.uptime)} |
                          Restarts: {process.restartCount}
                        </Typography>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          label={process.status}
                          color={getStatusColor(process.status)}
                          size="small"
                        />
                        <Tooltip title="Start/Restart">
                          <IconButton
                            size="small"
                            onClick={() => handleProcessAction(process.id, 'start')}
                          >
                            <PlayArrowIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Stop">
                          <IconButton
                            size="small"
                            onClick={() => handleProcessAction(process.id, 'stop')}
                          >
                            <StopIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Connection Pool Stats */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <MemoryIcon />
                Connection Pool
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">HTTP</Typography>
                  <Typography variant="body1">
                    {healthData.connectionPool?.http?.sockets || 0} active
                  </Typography>
                  <Typography variant="body1">
                    {healthData.connectionPool?.http?.freeSockets || 0} free
                  </Typography>
                </Box>
                <Divider orientation="vertical" flexItem />
                <Box>
                  <Typography variant="body2" color="text.secondary">HTTPS</Typography>
                  <Typography variant="body1">
                    {healthData.connectionPool?.https?.sockets || 0} active
                  </Typography>
                  <Typography variant="body1">
                    {healthData.connectionPool?.https?.freeSockets || 0} free
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Show errors if any */}
      {error && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          Health monitoring error: {error}
        </Alert>
      )}
    </Box>
  );
};

export default HealthDashboard;