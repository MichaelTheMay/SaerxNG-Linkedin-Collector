import React from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Alert,
  Grid,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  PlayArrow as PlayArrowIcon,
  Stop as StopIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Folder as FolderIcon,
} from '@mui/icons-material';

interface SearchProgress {
  current: number;
  total: number;
  currentKeyword?: string;
  status?: string;
}

interface SearchResult {
  title: string;
  url: string;
  keyword: string;
  engine: string;
}

interface SearchPanelProps {
  isSearchRunning: boolean;
  searchProgress: SearchProgress | null;
  selectedKeywords: Set<string>;
  results: SearchResult[];
  onStartSearch: () => void;
  onStopSearch: () => void;
  onRefreshResults: () => void;
  onExportResults: () => void;
  onViewReport: (filename: string) => void;
  reports: any[];
}

export const SearchPanel: React.FC<SearchPanelProps> = ({
  isSearchRunning,
  searchProgress,
  selectedKeywords,
  results,
  onStartSearch,
  onStopSearch,
  onRefreshResults,
  onExportResults,
  onViewReport,
  reports,
}) => {
  const canStartSearch = selectedKeywords.size > 0 && !isSearchRunning;

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Search Execution
      </Typography>

      <Card>
        <CardContent>
          {/* Search Controls */}
          <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<PlayArrowIcon />}
              onClick={onStartSearch}
              disabled={!canStartSearch}
              size="large"
            >
              Start Search
            </Button>

            {isSearchRunning && (
              <Button
                variant="contained"
                color="error"
                startIcon={<StopIcon />}
                onClick={onStopSearch}
                size="large"
              >
                Stop Search
              </Button>
            )}

            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={onRefreshResults}
              size="large"
            >
              Refresh Results
            </Button>

            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={onExportResults}
              disabled={results.length === 0}
              size="large"
            >
              Export Results
            </Button>
          </Box>

          {/* Search Progress */}
          {isSearchRunning && searchProgress && (
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">
                  Progress: {searchProgress.current} / {searchProgress.total}
                </Typography>
                <Typography variant="body2">
                  {Math.round((searchProgress.current / searchProgress.total) * 100)}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={(searchProgress.current / searchProgress.total) * 100}
                sx={{ height: 8, borderRadius: 4 }}
              />
              {searchProgress.currentKeyword && (
                <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                  Current: {searchProgress.currentKeyword}
                </Typography>
              )}
              {searchProgress.status && (
                <Typography variant="body2" color="text.secondary">
                  Status: {searchProgress.status}
                </Typography>
              )}
            </Box>
          )}

          {/* Search Summary */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card variant="outlined">
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary">
                    {selectedKeywords.size}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Selected Keywords
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card variant="outlined">
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="success.main">
                    {results.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Results Found
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card variant="outlined">
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="info.main">
                    {isSearchRunning ? 'Running' : 'Stopped'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Search Status
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card variant="outlined">
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="warning.main">
                    {reports.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Reports Available
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Results Summary */}
          {results.length > 0 && (
            <Alert severity="success" sx={{ mb: 3 }}>
              <Typography variant="body2">
                Found {results.length} results from {new Set(results.map(r => r.keyword)).size} keywords
              </Typography>
            </Alert>
          )}

          {/* Recent Reports */}
          {reports.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Recent Reports
              </Typography>
              <Grid container spacing={2}>
                {reports.slice(0, 3).map((report, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Box>
                            <Typography variant="body1" gutterBottom>
                              {report.filename}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {new Date(report.created).toLocaleDateString()}
                            </Typography>
                          </Box>
                          <Tooltip title="View Report">
                            <IconButton
                              size="small"
                              onClick={() => onViewReport(report.filename)}
                            >
                              <FolderIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};
