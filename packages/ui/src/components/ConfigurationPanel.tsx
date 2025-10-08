import React from 'react';
import {
  Box,
  TextField,
  Switch,
  FormControlLabel,
  Grid,
  Typography,
  Card,
  CardContent,
  Divider,
} from '@mui/material';

interface ConfigurationPanelProps {
  searxUrl: string;
  setSearxUrl: (url: string) => void;
  useCache: boolean;
  setUseCache: (use: boolean) => void;
  openResults: boolean;
  setOpenResults: (open: boolean) => void;
  verbose: boolean;
  setVerbose: (verbose: boolean) => void;
  parallel: boolean;
  setParallel: (parallel: boolean) => void;
  throttleLimit: number;
  setThrottleLimit: (limit: number) => void;
  delay: number;
  setDelay: (delay: number) => void;
  maxRetries: number;
  setMaxRetries: (retries: number) => void;
}

export const ConfigurationPanel: React.FC<ConfigurationPanelProps> = ({
  searxUrl,
  setSearxUrl,
  useCache,
  setUseCache,
  openResults,
  setOpenResults,
  verbose,
  setVerbose,
  parallel,
  setParallel,
  throttleLimit,
  setThrottleLimit,
  delay,
  setDelay,
  maxRetries,
  setMaxRetries,
}) => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Configuration Settings
      </Typography>

      <Card>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="SearxNG URL"
                value={searxUrl}
                onChange={(e) => setSearxUrl(e.target.value)}
                placeholder="http://localhost:8888"
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12}>
              <Divider />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={useCache}
                    onChange={(e) => setUseCache(e.target.checked)}
                    color="primary"
                  />
                }
                label="Use Cache"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={openResults}
                    onChange={(e) => setOpenResults(e.target.checked)}
                    color="primary"
                  />
                }
                label="Open Results in Browser"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={verbose}
                    onChange={(e) => setVerbose(e.target.checked)}
                    color="primary"
                  />
                }
                label="Verbose Output"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={parallel}
                    onChange={(e) => setParallel(e.target.checked)}
                    color="primary"
                  />
                }
                label="Parallel Processing"
              />
            </Grid>

            <Grid item xs={12}>
              <Divider />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="number"
                label="Throttle Limit"
                value={throttleLimit}
                onChange={(e) => setThrottleLimit(Number(e.target.value))}
                inputProps={{ min: 1, max: 20 }}
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="number"
                label="Delay (seconds)"
                value={delay}
                onChange={(e) => setDelay(Number(e.target.value))}
                inputProps={{ min: 0, max: 10, step: 0.1 }}
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="number"
                label="Max Retries"
                value={maxRetries}
                onChange={(e) => setMaxRetries(Number(e.target.value))}
                inputProps={{ min: 1, max: 10 }}
                variant="outlined"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};
