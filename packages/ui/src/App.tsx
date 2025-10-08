import React, { useState, useEffect } from 'react';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Box,
  AppBar,
  Toolbar,
  Typography,
  Tabs,
  Tab,
  Paper,
  Grid,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  Chip,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  Alert,
  Snackbar,
  Divider,
} from '@mui/material';
import {
  Search as SearchIcon,
  Folder as FolderIcon,
  Settings as SettingsIcon,
  PlayArrow as PlayArrowIcon,
  Stop as StopIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Clear as ClearIcon,
  SelectAll as SelectAllIcon,
  Deselect as DeselectIcon,
  GetApp as GetAppIcon,
  Launch as LaunchIcon,
  Build as BuildIcon,
  AutoFixHigh as WizardIcon,
  Help as HelpIcon,
} from '@mui/icons-material';
import { QueryBuilder } from './QueryBuilder';
import { WizardRunner } from './WizardRunner';
import { api, exportToCSV, exportToJSON } from './api';

const theme = createTheme({
  palette: {
    primary: {
      main: '#0077B5', // LinkedIn blue
    },
    secondary: {
      main: '#28A745',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
  },
});

import type { SearchResult, SearchProgress } from '../../../shared/types';

function App() {
  const [activeTab, setActiveTab] = useState(0);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [filteredKeywords, setFilteredKeywords] = useState<string[]>([]);
  const [selectedKeywords, setSelectedKeywords] = useState<Set<string>>(new Set());
  const [filterText, setFilterText] = useState('');
  const [isSearchRunning, setIsSearchRunning] = useState(false);
  const [searchProgress, setSearchProgress] = useState<SearchProgress | null>(null);
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const [statusMessage, setStatusMessage] = useState('Ready');
  const [showQueryBuilder, setShowQueryBuilder] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [showUsageGuide, setShowUsageGuide] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({
    open: false,
    message: '',
    severity: 'info'
  });

  // Configuration state
  const [searxUrl, setSearxUrl] = useState('http://localhost:8888');
  const [useCache, setUseCache] = useState(true);
  const [openResults, setOpenResults] = useState(false);
  const [verbose, setVerbose] = useState(true);
  const [parallel, setParallel] = useState(true);
  const [throttleLimit, setThrottleLimit] = useState(5);
  const [delay, setDelay] = useState(2);
  const [maxRetries, setMaxRetries] = useState(3);

  // Dialog states
  const [addKeywordDialog, setAddKeywordDialog] = useState(false);
  const [editKeywordDialog, setEditKeywordDialog] = useState(false);
  const [newKeyword, setNewKeyword] = useState('');
  const [editingKeyword, setEditingKeyword] = useState('');

  // Results state
  const [results, setResults] = useState<SearchResult[]>([]);

  useEffect(() => {
    loadKeywords();
  }, []);

  useEffect(() => {
    const filtered = keywords.filter(kw =>
      kw.toLowerCase().includes(filterText.toLowerCase())
    );
    setFilteredKeywords(filtered);
  }, [keywords, filterText]);

  const loadKeywords = async () => {
    try {
      const response = await api.getKeywords();
      if (response.keywords.length > 0) {
        setKeywords(response.keywords);
        addToConsole(`Loaded ${response.keywords.length} keywords from local storage`);
        setStatusMessage(`Loaded ${response.keywords.length} keywords`);
      } else {
        // Load default keywords if none saved
        const defaultKeywords = [
          "Stanford Computer Science",
          "Stanford AI",
          "Stanford Machine Learning",
          "Stanford PhD Computer Science",
          "Stanford Artificial Intelligence",
          "Stanford ML",
          "Stanford Deep Learning",
          "Stanford NLP"
        ];
        setKeywords(defaultKeywords);
        // Save defaults to local storage
        await api.saveKeywords(defaultKeywords);
        addToConsole(`Loaded ${defaultKeywords.length} default keywords`);
        setStatusMessage("Loaded default keywords");
      }
    } catch (error) {
      addToConsole(`Error loading keywords: ${error}`);
      setStatusMessage("Error loading keywords");
    }
  };

  const addToConsole = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setConsoleOutput(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const handleKeywordToggle = (keyword: string) => {
    const newSelected = new Set(selectedKeywords);
    if (newSelected.has(keyword)) {
      newSelected.delete(keyword);
    } else {
      newSelected.add(keyword);
    }
    setSelectedKeywords(newSelected);
  };

  const handleSelectAll = () => {
    setSelectedKeywords(new Set(filteredKeywords));
  };

  const handleDeselectAll = () => {
    setSelectedKeywords(new Set());
  };

  const handleAddKeyword = async () => {
    if (newKeyword && !keywords.includes(newKeyword)) {
      const updatedKeywords = [...keywords, newKeyword];
      setKeywords(updatedKeywords);
      await api.saveKeywords(updatedKeywords);
      setNewKeyword('');
      setAddKeywordDialog(false);
      addToConsole(`Added keyword: ${newKeyword}`);
      setStatusMessage("Keyword added");
    }
  };

  const handleEditKeyword = async () => {
    if (editingKeyword && selectedKeywords.size === 1) {
      const oldKeyword = Array.from(selectedKeywords)[0];
      const updatedKeywords = keywords.map(kw => kw === oldKeyword ? editingKeyword : kw);
      setKeywords(updatedKeywords);
      await api.saveKeywords(updatedKeywords);
      setSelectedKeywords(new Set([editingKeyword]));
      setEditingKeyword('');
      setEditKeywordDialog(false);
      addToConsole(`Edited keyword: ${oldKeyword} -> ${editingKeyword}`);
      setStatusMessage("Keyword updated");
    }
  };

  const handleDeleteKeywords = async () => {
    const toDelete = Array.from(selectedKeywords);
    const updatedKeywords = keywords.filter(kw => !selectedKeywords.has(kw));
    setKeywords(updatedKeywords);
    await api.saveKeywords(updatedKeywords);
    setSelectedKeywords(new Set());
    addToConsole(`Deleted ${toDelete.length} keyword(s)`);
    setStatusMessage("Keywords deleted");
  };

  const handleClearAll = async () => {
    setKeywords([]);
    setSelectedKeywords(new Set());
    await api.saveKeywords([]);
    addToConsole("Cleared all keywords");
    setStatusMessage("All keywords cleared");
  };

  const handleRunSearch = async () => {
    const keywordsToSearch = selectedKeywords.size > 0 ? Array.from(selectedKeywords) : keywords;

    if (keywordsToSearch.length === 0) {
      setSnackbar({ open: true, message: 'No keywords to search. Please add or select keywords first.', severity: 'error' });
      return;
    }

    if (!confirm(`Run search with ${keywordsToSearch.length} keyword(s)?\n\nThis may take several minutes depending on the number of keywords.`)) {
      return;
    }

    setIsSearchRunning(true);
    setStatusMessage("Search running...");
    addToConsole("=".repeat(40));
    addToConsole("SEARCH CONFIGURATION");
    addToConsole("=".repeat(40));
    addToConsole(`Keywords: ${keywordsToSearch.length} total`);
    addToConsole(`Mode: ${parallel ? 'PARALLEL' : 'SEQUENTIAL'}`);
    addToConsole(`SearxNG URL: ${searxUrl}`);
    addToConsole("=".repeat(40));
    addToConsole("Starting search operation...");

    try {
      // Call the direct SearxNG API
      const response = await api.runSearch({
        keywords: keywordsToSearch,
        searxUrl,
        useCache,
        openResults,
        verbose,
        parallel,
        throttleLimit,
        delay,
        maxRetries
      });

      if (response.success) {
        addToConsole("✓ Search completed successfully!");
        if (response.output) {
          response.output.split('\n').forEach(line => addToConsole(line));
        }
        if (response.results) {
          setResults(response.results);
          addToConsole(`Found ${response.results.length} results`);
        }
        setStatusMessage("Search completed");
        setSnackbar({ open: true, message: 'Search completed successfully!', severity: 'success' });
        setActiveTab(1); // Switch to results tab
      } else {
        addToConsole(`ERROR: ${response.error || 'Search failed'}`);
        setStatusMessage("Search failed");
        setSnackbar({ open: true, message: response.error || 'Search failed', severity: 'error' });
      }
    } catch (error: any) {
      addToConsole(`ERROR: Search failed - ${error.message}`);
      setStatusMessage("Search failed");
      setSnackbar({ open: true, message: `Search failed: ${error.message}`, severity: 'error' });
    } finally {
      setIsSearchRunning(false);
      setSearchProgress(null);
    }
  };

  const simulateSearch = async (keywordsToSearch: string[]) => {
    for (let i = 0; i < keywordsToSearch.length; i++) {
      setSearchProgress({
        current: i + 1,
        total: keywordsToSearch.length,
        activity: `Searching: ${keywordsToSearch[i]}`
      });

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Add some fake results
      if (Math.random() > 0.5) {
        const fakeResult: SearchResult = {
          title: `Professor ${keywordsToSearch[i]} - Stanford University`,
          url: `https://linkedin.com/in/${keywordsToSearch[i].toLowerCase().replace(/\s+/g, '-')}`,
          keyword: keywordsToSearch[i],
          engine: 'linkedin'
        };
        setResults(prev => [...prev, fakeResult]);
      }
    }

    setSearchProgress(null);
    addToConsole("=".repeat(40));
    addToConsole("SEARCH COMPLETED");
    addToConsole("=".repeat(40));
  };

  const handleExportResults = (format: 'csv' | 'json') => {
    if (results.length === 0) {
      setSnackbar({ open: true, message: 'No results to export', severity: 'error' });
      return;
    }

    let content: string;
    let filename: string;
    let mimeType: string;

    if (format === 'csv') {
      content = exportToCSV(results);
      filename = `linkedin_results_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.csv`;
      mimeType = 'text/csv';
    } else {
      content = exportToJSON(results);
      filename = `linkedin_results_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
      mimeType = 'application/json';
    }

    // Create and download the file
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    addToConsole(`Exported ${results.length} results to ${filename}`);
    setSnackbar({ open: true, message: `Exported ${results.length} results to ${filename}`, severity: 'success' });
  };

  const handleTestConnection = async () => {
    addToConsole("=".repeat(40));
    addToConsole("Testing connection to SearxNG...");
    addToConsole(`Target URL: ${searxUrl}`);
    addToConsole("Timeout: 5 seconds");
    setStatusMessage("Testing connection...");

    try {
      const response = await api.testConnection(searxUrl);
      
      if (response.success) {
        addToConsole("✓ Connection successful! SearxNG is accessible.");
        addToConsole("=".repeat(40));
        setStatusMessage("Connection OK");
        setSnackbar({ open: true, message: 'Successfully connected to SearxNG!', severity: 'success' });
      } else {
        addToConsole("✗ Connection failed!");
        addToConsole(`Error: ${response.error}`);
        addToConsole("=".repeat(40));
        setStatusMessage("Connection failed");
        setSnackbar({ open: true, message: `Failed to connect: ${response.error}`, severity: 'error' });
      }
    } catch (error: any) {
      addToConsole("✗ Connection failed!");
      addToConsole(`Error: ${error.message}`);
      addToConsole("=".repeat(40));
      setStatusMessage("Connection failed");
      setSnackbar({ open: true, message: `Failed to connect: ${error.message}`, severity: 'error' });
    }
  };

  const handleQueryGenerated = (queries: string[]) => {
    setKeywords(queries);
    setSelectedKeywords(new Set());
    addToConsole(`Generated ${queries.length} queries from query builder`);
    setSnackbar({ open: true, message: `Generated ${queries.length} queries`, severity: 'success' });
    setShowQueryBuilder(false);
  };

  const handleWizardComplete = (config: any) => {
    // Apply wizard configuration
    setKeywords(config.keywords);
    setSearxUrl(config.searxUrl);
    setUseCache(config.searchOptions.useCache);
    setParallel(config.searchOptions.parallel);
    setVerbose(config.searchOptions.verbose);
    setThrottleLimit(config.searchOptions.throttleLimit);
    setDelay(config.searchOptions.delay);
    setMaxRetries(config.searchOptions.maxRetries);

    addToConsole('Wizard configuration applied');
    setSnackbar({ open: true, message: 'Configuration loaded from wizard', severity: 'success' });
    setShowWizard(false);

    // If query builder mode, open query builder
    if (config.mode === 'query-builder') {
      setTimeout(() => setShowQueryBuilder(true), 300);
    } else {
      // Auto-run search
      setTimeout(() => handleRunSearch(), 500);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1, height: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <AppBar position="static" sx={{ backgroundColor: '#0077B5' }}>
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              🔍 SearxNG LinkedIn Collector - React UI
            </Typography>
            <Button
              color="inherit"
              startIcon={<WizardIcon />}
              onClick={() => setShowWizard(true)}
              sx={{ mr: 2 }}
            >
              Launch Wizard
            </Button>
            <Button
              color="inherit"
              startIcon={<HelpIcon />}
              onClick={() => setShowUsageGuide(true)}
              sx={{ mr: 2 }}
            >
              Guide
            </Button>
            <Chip
              label={`Keywords: ${keywords.length}`}
              sx={{ mr: 1, backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
            />
            <Chip
              label={`Selected: ${selectedKeywords.size}`}
              sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
            />
          </Toolbar>
        </AppBar>

        {/* Main Content */}
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tab icon={<SearchIcon />} label="Search" />
            <Tab icon={<FolderIcon />} label="Results" />
          </Tabs>

          <Box sx={{ flexGrow: 1, p: 2 }}>
            {activeTab === 0 && (
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, height: '100%' }}>
                {/* Keywords Panel */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="h6" gutterBottom>
                      📋 Keyword List
                    </Typography>

                    <TextField
                      fullWidth
                      placeholder="🔍 Search keywords..."
                      value={filterText}
                      onChange={(e) => setFilterText(e.target.value)}
                      sx={{ mb: 2 }}
                    />

                    <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                      <Button 
                        startIcon={<BuildIcon />} 
                        onClick={() => setShowQueryBuilder(true)} 
                        size="small"
                        variant="contained"
                        color="secondary"
                      >
                        Query Builder
                      </Button>
                      <Button startIcon={<AddIcon />} onClick={() => setAddKeywordDialog(true)} size="small">
                        Add
                      </Button>
                      <Button
                        startIcon={<EditIcon />}
                        onClick={() => {
                          if (selectedKeywords.size === 1) {
                            setEditingKeyword(Array.from(selectedKeywords)[0]);
                            setEditKeywordDialog(true);
                          }
                        }}
                        disabled={selectedKeywords.size !== 1}
                        size="small"
                      >
                        Edit
                      </Button>
                      <Button
                        startIcon={<DeleteIcon />}
                        onClick={handleDeleteKeywords}
                        disabled={selectedKeywords.size === 0}
                        color="error"
                        size="small"
                      >
                        Delete
                      </Button>
                      <Button startIcon={<ClearIcon />} onClick={handleClearAll} color="error" size="small">
                        Clear All
                      </Button>
                      <Button startIcon={<SelectAllIcon />} onClick={handleSelectAll} size="small">
                        Select All
                      </Button>
                      <Button startIcon={<DeselectIcon />} onClick={handleDeselectAll} size="small">
                        Deselect
                      </Button>
                    </Box>

                    <Box sx={{ flexGrow: 1, overflow: 'auto', border: 1, borderColor: 'grey.300', borderRadius: 1 }}>
                      <List dense>
                        {filteredKeywords.map((keyword) => (
                          <ListItem key={keyword} disablePadding>
                            <ListItemButton onClick={() => handleKeywordToggle(keyword)}>
                              <Checkbox
                                checked={selectedKeywords.has(keyword)}
                                onChange={() => handleKeywordToggle(keyword)}
                              />
                              <ListItemText primary={keyword} />
                            </ListItemButton>
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  </Paper>
                </Box>

                {/* Configuration Panel */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Paper sx={{ p: 2, height: '100%', overflow: 'auto' }}>
                    <Typography variant="h6" gutterBottom>
                      ⚙️ Configuration
                    </Typography>

                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography>🔧 SearxNG Settings</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <TextField
                          fullWidth
                          label="SearxNG URL"
                          value={searxUrl}
                          onChange={(e) => setSearxUrl(e.target.value)}
                        />
                      </AccordionDetails>
                    </Accordion>

                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography>🎯 Search Options</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <FormControlLabel
                          control={<Switch checked={useCache} onChange={(e) => setUseCache(e.target.checked)} />}
                          label="Use Cache"
                        />
                        <FormControlLabel
                          control={<Switch checked={openResults} onChange={(e) => setOpenResults(e.target.checked)} />}
                          label="Auto-open Results"
                        />
                        <FormControlLabel
                          control={<Switch checked={verbose} onChange={(e) => setVerbose(e.target.checked)} />}
                          label="Verbose Output"
                        />
                        <FormControlLabel
                          control={<Switch checked={parallel} onChange={(e) => setParallel(e.target.checked)} />}
                          label="⚡ Parallel Execution"
                        />


                        <TextField
                          fullWidth
                          label="Parallel Threads"
                          type="number"
                          value={throttleLimit}
                          onChange={(e) => setThrottleLimit(Number(e.target.value))}
                          sx={{ mb: 2 }}
                        />
                        <TextField
                          fullWidth
                          label="Delay (seconds)"
                          type="number"
                          value={delay}
                          onChange={(e) => setDelay(Number(e.target.value))}
                          sx={{ mb: 2 }}
                        />
                        <TextField
                          fullWidth
                          label="Max Retries"
                          type="number"
                          value={maxRetries}
                          onChange={(e) => setMaxRetries(Number(e.target.value))}
                        />
                      </AccordionDetails>
                    </Accordion>

                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography>⚡ Quick Actions</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Button startIcon={<FolderIcon />} fullWidth sx={{ mb: 1 }}>
                          📂 Results Folder
                        </Button>
                        <Button startIcon={<FolderIcon />} fullWidth sx={{ mb: 1 }}>
                          📊 Reports Folder
                        </Button>
                        <Button startIcon={<FolderIcon />} fullWidth>
                          📝 Logs Folder
                        </Button>
                      </AccordionDetails>
                    </Accordion>
                  </Paper>
                </Box>
              </Box>
            )}

            {activeTab === 0 && (
              <Box sx={{ mt: 2 }}>
                  <Paper sx={{ p: 2, mt: 2 }}>
                    <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
                      <Typography>Status: {statusMessage}</Typography>
                      <Box sx={{ flexGrow: 1 }} />
                      <Button
                        variant="outlined"
                        startIcon={<SettingsIcon />}
                        onClick={handleTestConnection}
                      >
                        Test Connection
                      </Button>
                      <Button
                        variant="contained"
                        startIcon={<PlayArrowIcon />}
                        onClick={handleRunSearch}
                        disabled={isSearchRunning}
                      >
                        Run Search
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        startIcon={<StopIcon />}
                        disabled={!isSearchRunning}
                      >
                        Stop
                      </Button>
                    </Box>

                    {searchProgress && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          {searchProgress.activity} ({searchProgress.current}/{searchProgress.total})
                        </Typography>
                        <Box sx={{ width: '100%', mt: 1 }}>
                          <Box
                            sx={{
                              width: `${(searchProgress.current / searchProgress.total) * 100}%`,
                              height: 8,
                              backgroundColor: 'primary.main',
                              borderRadius: 4,
                            }}
                          />
                        </Box>
                      </Box>
                    )}

                    <Typography variant="h6" gutterBottom>
                      📺 Output Console
                    </Typography>
                    <Box
                      sx={{
                        height: 200,
                        overflow: 'auto',
                        backgroundColor: '#f8f9fa',
                        p: 1,
                        border: 1,
                        borderColor: 'grey.300',
                        borderRadius: 1,
                        fontFamily: 'monospace',
                        fontSize: '0.875rem',
                      }}
                    >
                      {consoleOutput.map((line, index) => (
                        <div key={index}>{line}</div>
                      ))}
                    </Box>
                  </Paper>
              </Box>
            )}

            {activeTab === 1 && (
              <Box>
                <Box sx={{ mb: 2 }}>
                  <Paper sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                      <Button
                        startIcon={<GetAppIcon />}
                        variant="outlined"
                        onClick={() => handleExportResults('csv')}
                        disabled={results.length === 0}
                      >
                        Export CSV
                      </Button>
                      <Button
                        startIcon={<GetAppIcon />}
                        variant="outlined"
                        onClick={() => handleExportResults('json')}
                        disabled={results.length === 0}
                      >
                        Export JSON
                      </Button>
                    </Box>
                  </Paper>
                </Box>

                <Box>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      📊 Search Results
                    </Typography>
                    {results.length === 0 ? (
                      <Typography color="text.secondary">
                        No results loaded yet. Run a search to see results here.
                      </Typography>
                    ) : (
                      <Box>
                        <Typography variant="subtitle1" gutterBottom>
                          Found {results.length} profiles
                        </Typography>
                        {results.map((result, index) => (
                          <Card key={index} sx={{ mb: 1 }}>
                            <CardContent sx={{ pb: '16px !important' }}>
                              <Typography variant="h6" component="div">
                                {result.title}
                              </Typography>
                              <Typography
                                component="a"
                                href={result.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={{ color: 'primary.main', textDecoration: 'none' }}
                              >
                                {result.url}
                              </Typography>
                              <Box sx={{ mt: 1 }}>
                                <Chip
                                  label={`Keyword: ${result.keyword}`}
                                  size="small"
                                  sx={{ mr: 1 }}
                                />
                                <Chip
                                  label={`Engine: ${result.engine}`}
                                  size="small"
                                />
                              </Box>
                            </CardContent>
                          </Card>
                        ))}
                      </Box>
                    )}
                  </Paper>
                </Box>
              </Box>
            )}
          </Box>
        </Box>

        {/* Add Keyword Dialog */}
        <Dialog open={addKeywordDialog} onClose={() => setAddKeywordDialog(false)}>
          <DialogTitle>Add Keyword</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Keyword"
              fullWidth
              variant="standard"
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAddKeywordDialog(false)}>Cancel</Button>
            <Button onClick={handleAddKeyword}>Add</Button>
          </DialogActions>
        </Dialog>

        {/* Edit Keyword Dialog */}
        <Dialog open={editKeywordDialog} onClose={() => setEditKeywordDialog(false)}>
          <DialogTitle>Edit Keyword</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Keyword"
              fullWidth
              variant="standard"
              value={editingKeyword}
              onChange={(e) => setEditingKeyword(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditKeywordDialog(false)}>Cancel</Button>
            <Button onClick={handleEditKeyword}>Save</Button>
          </DialogActions>
        </Dialog>

        {/* Query Builder Dialog */}
        <Dialog 
          open={showQueryBuilder} 
          onClose={() => setShowQueryBuilder(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Advanced Query Builder</DialogTitle>
          <DialogContent>
            <QueryBuilder onQueryGenerated={handleQueryGenerated} />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowQueryBuilder(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Interactive Wizard Dialog */}
        <Dialog 
          open={showWizard} 
          onClose={() => setShowWizard(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: { height: '90vh' }
          }}
        >
          <WizardRunner
            onComplete={handleWizardComplete}
            onCancel={() => setShowWizard(false)}
          />
        </Dialog>

        {/* Usage Guide Dialog */}
        <Dialog
          open={showUsageGuide}
          onClose={() => setShowUsageGuide(false)}
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <HelpIcon color="primary" />
              <Typography variant="h6">SearxNG LinkedIn Collector - Usage Guide</Typography>
            </Box>
          </DialogTitle>
          <DialogContent dividers>
            <UsageGuideContent />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowUsageGuide(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert 
            onClose={() => setSnackbar({ ...snackbar, open: false })} 
            severity={snackbar.severity}
            variant="filled"
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}

// Usage Guide Content Component
const UsageGuideContent: React.FC = () => {
  return (
    <Box>
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Welcome to SearxNG LinkedIn Collector!
        </Typography>
        <Typography variant="body2">
          This guide will help you get started with searching, managing keywords, and exporting results.
        </Typography>
      </Alert>

      {/* Quick Start */}
      <Typography variant="h6" gutterBottom sx={{ mt: 3, color: 'primary.main' }}>
        🚀 Quick Start (3 Steps)
      </Typography>
      <Paper sx={{ p: 2, mb: 3, backgroundColor: '#f5f5f5' }}>
        <List>
          <ListItem>
            <ListItemText
              primary={<Typography variant="subtitle1" fontWeight="bold">1. Test Connection</Typography>}
              secondary="Click 'Test Connection' button to verify SearxNG is running"
            />
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText
              primary={<Typography variant="subtitle1" fontWeight="bold">2. Add Keywords</Typography>}
              secondary="Use 'Launch Wizard' or add keywords manually in the Search tab"
            />
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText
              primary={<Typography variant="subtitle1" fontWeight="bold">3. Run Search</Typography>}
              secondary="Click 'Run Search' and view results in the Results tab"
            />
          </ListItem>
        </List>
      </Paper>

      {/* Interactive Wizard */}
      <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
        🧙‍♂️ Interactive Wizard
      </Typography>
      <Typography variant="body2" paragraph>
        The Interactive Wizard guides you through the entire search process step-by-step.
      </Typography>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle2" gutterBottom>
            Wizard Steps:
          </Typography>
          <List dense>
            <ListItem>
              <ListItemText primary="Step 1: Choose your mode (Simple, Advanced, or Query Builder)" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Step 2: Configure keywords with presets or custom input" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Step 3: Set search options and performance settings" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Step 4: Review and launch your search" />
            </ListItem>
          </List>
        </CardContent>
      </Card>

      {/* Query Builder */}
      <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
        🔧 Advanced Query Builder
      </Typography>
      <Typography variant="body2" paragraph>
        Create complex Boolean search queries with AND/OR operators.
      </Typography>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle2" gutterBottom>
            Example Configuration:
          </Typography>
          <Box sx={{ backgroundColor: '#f5f5f5', p: 2, borderRadius: 1, fontFamily: 'monospace', fontSize: '0.875rem' }}>
            <div>Group 1 (OR): Stanford, MIT, Harvard</div>
            <div>Group 2 (AND): Computer Science</div>
            <div>Group 3 (OR): PhD, Professor, Researcher</div>
            <div style={{ marginTop: 8, fontWeight: 'bold' }}>Result: 3 × 1 × 3 = 9 queries</div>
          </Box>
        </CardContent>
      </Card>

      {/* Keyword Management */}
      <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
        📋 Keyword Management
      </Typography>
      <Paper sx={{ p: 2, mb: 3 }}>
        <List dense>
          <ListItem>
            <ListItemText
              primary="Add Keywords"
              secondary="Click the '+ Add' button or press Enter in the filter box"
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Edit Keywords"
              secondary="Select one keyword and click 'Edit' button"
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Delete Keywords"
              secondary="Select one or more keywords and click 'Delete' button"
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Filter/Search"
              secondary="Use the search box to filter the keyword list"
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Select/Deselect"
              secondary="Use 'Select All' or 'Deselect' buttons for bulk operations"
            />
          </ListItem>
        </List>
      </Paper>

      {/* Search Configuration */}
      <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
        ⚙️ Search Configuration
      </Typography>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Performance Options:
        </Typography>
        <List dense>
          <ListItem>
            <ListItemText
              primary="⚡ Parallel Execution"
              secondary="Enable to run 3-8 searches simultaneously (3-5x faster)"
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="💾 Use Cache"
              secondary="Save results for 24 hours to avoid duplicate searches"
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="📝 Verbose Output"
              secondary="Show detailed progress information in console"
            />
          </ListItem>
        </List>

        <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
          Recommended Settings:
        </Typography>
        <List dense>
          <ListItem>
            <ListItemText
              primary="1-10 queries"
              secondary="Sequential mode, 2s delay"
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="10-50 queries"
              secondary="Parallel (3 threads), 2s delay"
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="50-200 queries"
              secondary="Parallel (5 threads), 3s delay, enable cache"
            />
          </ListItem>
        </List>
      </Paper>

      {/* Export Options */}
      <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
        💾 Export Formats
      </Typography>
      <Paper sx={{ p: 2, mb: 3 }}>
        <List dense>
          <ListItem>
            <ListItemText
              primary="CSV"
              secondary="For Excel, Google Sheets, data analysis"
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="JSON"
              secondary="For programming, API integration, data processing"
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="TXT"
              secondary="Simple text file with URLs only"
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="HTML"
              secondary="Professional report with statistics and formatting"
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="ALL"
              secondary="Generate all formats at once (recommended)"
            />
          </ListItem>
        </List>
      </Paper>

      {/* Results */}
      <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
        📊 Viewing Results
      </Typography>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="body2" paragraph>
          After a search completes, results automatically appear in the Results tab.
        </Typography>
        <List dense>
          <ListItem>
            <ListItemText
              primary="Recent Reports"
              secondary="Select from dropdown to view different search results"
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Open in Browser"
              secondary="View full HTML report in your default browser"
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Export"
              secondary="Save current report to a custom location"
            />
          </ListItem>
        </List>
      </Paper>

      {/* Troubleshooting */}
      <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
        🔧 Troubleshooting
      </Typography>
      <Paper sx={{ p: 2 }}>
        <List dense>
          <ListItem>
            <ListItemText
              primary="Connection Failed"
              secondary="Ensure SearxNG is running at the configured URL (default: http://localhost:8888)"
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Search Not Starting"
              secondary="Check that keywords are added and API server is running (node api-server.js)"
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="No Results Found"
              secondary="Try broader keywords or check SearxNG search engines configuration"
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Slow Performance"
              secondary="Enable parallel execution and adjust throttle limit (recommended: 5)"
            />
          </ListItem>
        </List>
      </Paper>

      <Alert severity="success" sx={{ mt: 3 }}>
        <Typography variant="subtitle2">
          💡 Pro Tip: Use the Interactive Wizard for the easiest experience!
        </Typography>
      </Alert>
    </Box>
  );
};

export default App;
