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
  Download as DownloadIcon,
  Upload as UploadIcon,
  TableChart as TableChartIcon,
  ViewList as ViewListIcon,
  FilterList as FilterListIcon,
  Sort as SortIcon,
  OpenInNew as OpenInNewIcon,
  ContentCopy as ContentCopyIcon,
  Share as ShareIcon,
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
  const [resultsMetadata, setResultsMetadata] = useState<any>(null);
  const [resultsStatistics, setResultsStatistics] = useState<any>(null);
  const [resultsFileInfo, setResultsFileInfo] = useState<any>(null);
  const [allResultFiles, setAllResultFiles] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'table'>('list');
  const [sortBy, setSortBy] = useState<'title' | 'url' | 'keyword' | 'engine'>('title');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filterEngine, setFilterEngine] = useState<string>('');
  const [filterKeyword, setFilterKeyword] = useState<string>('');
  const [selectedResults, setSelectedResults] = useState<Set<number>>(new Set());
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [searchProgress, setSearchProgress] = useState<{
    currentKeyword: string;
    currentIndex: number;
    totalKeywords: number;
    resultsFound: number;
    status: string;
    percentage: number;
    startTime?: string;
    endTime?: string;
  } | null>(null);
  const [isSearchRunning, setIsSearchRunning] = useState(false);

  useEffect(() => {
    loadKeywords();
    loadComprehensiveResults(); // Load existing results on startup
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

  // Load comprehensive results
  const loadComprehensiveResults = async () => {
    try {
      const response = await fetch('/api/results');
      const data = await response.json();
      
      if (data.results) {
        setResults(data.results);
        setResultsMetadata(data.metadata);
        setResultsStatistics(data.statistics);
        setResultsFileInfo(data.fileInfo);
        setAllResultFiles(data.allFiles || []);
        addToConsole(`Loaded ${data.results.length} results from ${data.fileInfo?.name || 'latest file'}`);
      }
    } catch (error) {
      console.error('Error loading results:', error);
      addToConsole('Error loading comprehensive results');
    }
  };

  // Import data from file
  const handleImportData = async () => {
    if (!importFile) return;

    try {
      const text = await importFile.text();
      const format = importFile.name.endsWith('.csv') ? 'csv' : 'json';
      
      console.log('Importing file:', importFile.name, 'Format:', format, 'Size:', text.length);
      
      const response = await fetch('/api/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: text,
          filename: importFile.name,
          format: format
        })
      });

      const result = await response.json();
      console.log('Import response:', result);
      
      if (result.success) {
        setSnackbar({ 
          open: true, 
          message: `Imported ${result.imported} results successfully!`, 
          severity: 'success' 
        });
        setShowImportDialog(false);
        setImportFile(null);
        loadComprehensiveResults(); // Reload results
        addToConsole(`Imported ${result.imported} results from ${importFile.name}`);
      } else {
        throw new Error(result.details || result.error || 'Import failed');
      }
    } catch (error: any) {
      console.error('Import error:', error);
      setSnackbar({ 
        open: true, 
        message: `Failed to import data: ${error.message}`, 
        severity: 'error' 
      });
      addToConsole(`Import failed: ${error.message}`);
    }
  };

  // Export data
  const handleExportData = async (format: string) => {
    try {
      const exportData = {
        results: results,
        metadata: resultsMetadata,
        statistics: resultsStatistics,
        fileInfo: resultsFileInfo
      };

      const response = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          format: format,
          data: exportData,
          filename: `searx_results_${new Date().toISOString().split('T')[0]}`
        })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `searx_results_${new Date().toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        setSnackbar({ open: true, message: `Data exported as ${format.toUpperCase()} successfully!`, severity: 'success' });
        setShowExportDialog(false);
      } else {
        throw new Error('Export failed');
      }
    } catch (error) {
      console.error('Export error:', error);
      setSnackbar({ open: true, message: 'Failed to export data', severity: 'error' });
    }
  };

  // Filter and sort results
  const getFilteredAndSortedResults = () => {
    let filtered = results.filter(result => {
      if (filterEngine && result.engine !== filterEngine) return false;
      if (filterKeyword && !result.keyword.toLowerCase().includes(filterKeyword.toLowerCase())) return false;
      return true;
    });

    filtered.sort((a, b) => {
      const aVal = a[sortBy] || '';
      const bVal = b[sortBy] || '';
      const comparison = aVal.toString().localeCompare(bVal.toString());
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  };

  // Copy URL to clipboard
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setSnackbar({ open: true, message: 'Copied to clipboard!', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to copy to clipboard', severity: 'error' });
    }
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
    setSearchProgress({
      currentKeyword: '',
      currentIndex: 0,
      totalKeywords: keywordsToSearch.length,
      resultsFound: 0,
      status: 'Starting...',
      percentage: 0,
      startTime: new Date().toISOString()
    });
    addToConsole("=".repeat(40));
    addToConsole("SEARCH CONFIGURATION");
    addToConsole("=".repeat(40));
    addToConsole(`Keywords: ${keywordsToSearch.length} total`);
    addToConsole(`Mode: ${parallel ? 'PARALLEL' : 'SEQUENTIAL'}`);
    addToConsole(`SearxNG URL: ${searxUrl}`);
    addToConsole("=".repeat(40));
    addToConsole("Starting search operation...");

    try {
      // Use Server-Sent Events for real-time progress
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          keywords: keywordsToSearch,
          searxUrl,
          useCache,
          openResults,
          verbose,
          parallel,
          throttleLimit,
          delay,
          maxRetries,
          exportFormat: 'ALL'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body reader available');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.type === 'complete') {
                // Search completed
                if (data.success) {
                  addToConsole("✓ Search completed successfully!");
                  if (data.output) {
                    data.output.split('\n').forEach((line: string) => addToConsole(line));
                  }
                  if (data.results) {
                    setResults(data.results);
                    addToConsole(`Found ${data.results.length} results`);
                    // Load comprehensive results to get metadata and statistics
                    setTimeout(() => loadComprehensiveResults(), 1000);
                  }
                  setStatusMessage("Search completed");
                  setSnackbar({ open: true, message: 'Search completed successfully!', severity: 'success' });
                  setActiveTab(1); // Switch to results tab
                } else {
                  addToConsole(`ERROR: ${data.error || 'Search failed'}`);
                  setStatusMessage("Search failed");
                  setSnackbar({ open: true, message: `Search failed: ${data.error}`, severity: 'error' });
                }
                setIsSearchRunning(false);
                setSearchProgress(prev => prev ? { ...prev, endTime: new Date().toISOString() } : null);
              } else {
                // Progress update
                setSearchProgress(data);
                addToConsole(data.status);
              }
            } catch (e) {
              console.error('Error parsing SSE data:', e);
            }
          }
        }
      }
    } catch (error: any) {
      addToConsole(`ERROR: Search failed - ${error.message}`);
      setStatusMessage("Search failed");
      setSnackbar({ open: true, message: `Search failed: ${error.message}`, severity: 'error' });
      setIsSearchRunning(false);
      setSearchProgress(prev => prev ? { ...prev, endTime: new Date().toISOString() } : null);
    } finally {
      addToConsole("=".repeat(40));
    }
  };

  const simulateSearch = async (keywordsToSearch: string[]) => {
    for (let i = 0; i < keywordsToSearch.length; i++) {
      setSearchProgress({
        currentKeyword: keywordsToSearch[i],
        currentIndex: i + 1,
        totalKeywords: keywordsToSearch.length,
        resultsFound: 0,
        status: `Searching: ${keywordsToSearch[i]}`,
        percentage: Math.round(((i + 1) / keywordsToSearch.length) * 100)
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


                    <Typography variant="h6" gutterBottom>
                      📺 Output Console
                    </Typography>
                    
                    {/* Dynamic Progress Bar */}
                    {searchProgress && (
                      <Box sx={{ mb: 2, p: 2, bgcolor: 'primary.light', borderRadius: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="subtitle2" color="primary.contrastText">
                            {searchProgress.status}
                          </Typography>
                          <Typography variant="body2" color="primary.contrastText">
                            {searchProgress.percentage}%
                          </Typography>
                        </Box>
                        
                        <Box sx={{ width: '100%', bgcolor: 'rgba(255,255,255,0.3)', borderRadius: 1, mb: 1 }}>
                          <Box
                            sx={{
                              width: `${searchProgress.percentage}%`,
                              height: 8,
                              bgcolor: 'primary.main',
                              borderRadius: 1,
                              transition: 'width 0.3s ease-in-out',
                            }}
                          />
                        </Box>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="caption" color="primary.contrastText">
                            Keyword {searchProgress.currentIndex} of {searchProgress.totalKeywords}
                            {searchProgress.currentKeyword && `: ${searchProgress.currentKeyword}`}
                          </Typography>
                          <Typography variant="caption" color="primary.contrastText">
                            Results: {searchProgress.resultsFound}
                          </Typography>
                        </Box>
                        
                        {searchProgress.startTime && (
                          <Typography variant="caption" color="primary.contrastText" sx={{ display: 'block', mt: 1 }}>
                            Started: {new Date(searchProgress.startTime).toLocaleTimeString()}
                            {searchProgress.endTime && ` | Completed: ${new Date(searchProgress.endTime).toLocaleTimeString()}`}
                          </Typography>
                        )}
                      </Box>
                    )}
                    
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
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6">
                        📊 Search Results
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<UploadIcon />}
                          onClick={() => setShowImportDialog(true)}
                        >
                          Import
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<DownloadIcon />}
                          onClick={() => setShowExportDialog(true)}
                          disabled={results.length === 0}
                        >
                          Export
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<RefreshIcon />}
                          onClick={loadComprehensiveResults}
                        >
                          Refresh
                        </Button>
                      </Box>
                    </Box>

                    {/* Results Statistics */}
                    {resultsStatistics && (
                      <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                        <Typography variant="subtitle2" gutterBottom>Session Statistics</Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                          <Box sx={{ minWidth: 120 }}>
                            <Typography variant="body2" color="text.secondary">Total Results</Typography>
                            <Typography variant="h6">{resultsStatistics.totalResults || results.length}</Typography>
                          </Box>
                          <Box sx={{ minWidth: 120 }}>
                            <Typography variant="body2" color="text.secondary">Unique URLs</Typography>
                            <Typography variant="h6">{resultsStatistics.uniqueUrls || new Set(results.map(r => r.url)).size}</Typography>
                          </Box>
                          <Box sx={{ minWidth: 120 }}>
                            <Typography variant="body2" color="text.secondary">Keywords Used</Typography>
                            <Typography variant="h6">{resultsStatistics.keywordsUsed || new Set(results.map(r => r.keyword)).size}</Typography>
                          </Box>
                          <Box sx={{ minWidth: 120 }}>
                            <Typography variant="body2" color="text.secondary">Engines</Typography>
                            <Typography variant="h6">{resultsStatistics.enginesUsed || new Set(results.map(r => r.engine)).size}</Typography>
                          </Box>
                        </Box>
                      </Box>
                    )}

                    {/* File Information */}
                    {resultsFileInfo && (
                      <Box sx={{ mb: 2, p: 1, bgcolor: 'info.light', borderRadius: 1 }}>
                        <Typography variant="body2">
                          📁 Data from: {resultsFileInfo.name} 
                          {resultsFileInfo.modified && ` (${new Date(resultsFileInfo.modified).toLocaleString()})`}
                        </Typography>
                      </Box>
                    )}

                    {/* Controls */}
                    {results.length > 0 && (
                      <Box sx={{ mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                          <InputLabel>View Mode</InputLabel>
                          <Select
                            value={viewMode}
                            label="View Mode"
                            onChange={(e) => setViewMode(e.target.value as 'list' | 'table')}
                          >
                            <MenuItem value="list">List View</MenuItem>
                            <MenuItem value="table">Table View</MenuItem>
                          </Select>
                        </FormControl>

                        <FormControl size="small" sx={{ minWidth: 120 }}>
                          <InputLabel>Sort By</InputLabel>
                          <Select
                            value={sortBy}
                            label="Sort By"
                            onChange={(e) => setSortBy(e.target.value as any)}
                          >
                            <MenuItem value="title">Title</MenuItem>
                            <MenuItem value="url">URL</MenuItem>
                            <MenuItem value="keyword">Keyword</MenuItem>
                            <MenuItem value="engine">Engine</MenuItem>
                          </Select>
                        </FormControl>

                        <Button
                          size="small"
                          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                          startIcon={<SortIcon />}
                        >
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </Button>

                        <TextField
                          size="small"
                          label="Filter by Engine"
                          value={filterEngine}
                          onChange={(e) => setFilterEngine(e.target.value)}
                          sx={{ minWidth: 150 }}
                        />

                        <TextField
                          size="small"
                          label="Filter by Keyword"
                          value={filterKeyword}
                          onChange={(e) => setFilterKeyword(e.target.value)}
                          sx={{ minWidth: 150 }}
                        />

                        <Button
                          size="small"
                          onClick={() => {
                            setFilterEngine('');
                            setFilterKeyword('');
                          }}
                        >
                          Clear Filters
                        </Button>
                      </Box>
                    )}

                    {/* Results Display */}
                    {results.length === 0 ? (
                      <Typography color="text.secondary">
                        No results loaded yet. Run a search or import data to see results here.
                      </Typography>
                    ) : (
                      <Box>
                        <Typography variant="subtitle1" gutterBottom>
                          Showing {getFilteredAndSortedResults().length} of {results.length} results
                        </Typography>
                        
                        {viewMode === 'list' ? (
                          <Box>
                            {getFilteredAndSortedResults().map((result, index) => (
                              <Card key={index} sx={{ mb: 1 }}>
                                <CardContent sx={{ pb: '16px !important' }}>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <Box sx={{ flex: 1 }}>
                                      <Typography variant="h6" component="div" sx={{ mb: 1 }}>
                                        {result.title}
                                      </Typography>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                        <Typography
                                          component="a"
                                          href={result.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          sx={{ color: 'primary.main', textDecoration: 'none', flex: 1 }}
                                        >
                                          {result.url}
                                        </Typography>
                                        <Button
                                          size="small"
                                          onClick={() => copyToClipboard(result.url)}
                                          startIcon={<ContentCopyIcon />}
                                        >
                                          Copy
                                        </Button>
                                        <Button
                                          size="small"
                                          component="a"
                                          href={result.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          startIcon={<OpenInNewIcon />}
                                        >
                                          Open
                                        </Button>
                                      </Box>
                                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                        <Chip
                                          label={`Keyword: ${result.keyword}`}
                                          size="small"
                                          color="primary"
                                          variant="outlined"
                                        />
                                        <Chip
                                          label={`Engine: ${result.engine}`}
                                          size="small"
                                          color="secondary"
                                          variant="outlined"
                                        />
                                        {(result as any).content && (
                                          <Chip
                                            label={`Content: ${(result as any).content.substring(0, 50)}...`}
                                            size="small"
                                            color="default"
                                            variant="outlined"
                                          />
                                        )}
                                      </Box>
                                    </Box>
                                  </Box>
                                </CardContent>
                              </Card>
                            ))}
                          </Box>
                        ) : (
                          <Box sx={{ overflow: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                              <thead>
                                <tr style={{ backgroundColor: '#f5f5f5' }}>
                                  <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #ddd' }}>Title</th>
                                  <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #ddd' }}>URL</th>
                                  <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #ddd' }}>Keyword</th>
                                  <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #ddd' }}>Engine</th>
                                  <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #ddd' }}>Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {getFilteredAndSortedResults().map((result, index) => (
                                  <tr key={index}>
                                    <td style={{ padding: '8px', border: '1px solid #ddd' }}>{result.title}</td>
                                    <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                                      <a href={result.url} target="_blank" rel="noopener noreferrer" style={{ color: '#1976d2' }}>
                                        {result.url}
                                      </a>
                                    </td>
                                    <td style={{ padding: '8px', border: '1px solid #ddd' }}>{result.keyword}</td>
                                    <td style={{ padding: '8px', border: '1px solid #ddd' }}>{result.engine}</td>
                                    <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                                      <Button
                                        size="small"
                                        onClick={() => copyToClipboard(result.url)}
                                        startIcon={<ContentCopyIcon />}
                                      >
                                        Copy
                                      </Button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </Box>
                        )}
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

        {/* Import Dialog */}
        <Dialog
          open={showImportDialog}
          onClose={() => setShowImportDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <UploadIcon color="primary" />
              <Typography variant="h6">Import Data</Typography>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Import search results from a JSON or CSV file. The file should contain search results with fields like title, url, keyword, and engine.
            </Typography>
            <input
              type="file"
              accept=".json,.csv"
              onChange={(e) => setImportFile(e.target.files?.[0] || null)}
              style={{ marginBottom: 16 }}
            />
            {importFile && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="body2">
                  Selected file: {importFile.name} ({(importFile.size / 1024).toFixed(1)} KB)
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowImportDialog(false)}>Cancel</Button>
            <Button 
              onClick={handleImportData} 
              variant="contained"
              disabled={!importFile}
            >
              Import
            </Button>
          </DialogActions>
        </Dialog>

        {/* Export Dialog */}
        <Dialog
          open={showExportDialog}
          onClose={() => setShowExportDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <DownloadIcon color="primary" />
              <Typography variant="h6">Export Data</Typography>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Export your search results in various formats. Choose the format that best suits your needs.
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<TableChartIcon />}
                onClick={() => handleExportData('csv')}
                fullWidth
              >
                Export as CSV
              </Button>
              <Button
                variant="outlined"
                startIcon={<ViewListIcon />}
                onClick={() => handleExportData('json')}
                fullWidth
              >
                Export as JSON
              </Button>
              <Button
                variant="outlined"
                startIcon={<ViewListIcon />}
                onClick={() => handleExportData('txt')}
                fullWidth
              >
                Export URLs as Text
              </Button>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowExportDialog(false)}>Close</Button>
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
