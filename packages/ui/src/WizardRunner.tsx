import React, { useState } from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Button,
  Paper,
  Typography,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  FormGroup,
  Chip,
  Alert,
  LinearProgress,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  NavigateNext as NextIcon,
  NavigateBefore as BackIcon,
  PlayArrow as RunIcon,
  CheckCircle as CheckIcon,
  Info as InfoIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from '@mui/icons-material';

interface WizardStep {
  label: string;
  description: string;
}

interface WizardRunnerProps {
  onComplete: (config: WizardConfig) => void;
  onCancel: () => void;
}

interface WizardConfig {
  mode: 'simple' | 'advanced' | 'query-builder';
  keywords: string[];
  searxUrl: string;
  workDir: string;
  searchOptions: {
    useCache: boolean;
    parallel: boolean;
    verbose: boolean;
    exportFormat: string;
    throttleLimit: number;
    delay: number;
    maxRetries: number;
  };
}

const steps: WizardStep[] = [
  {
    label: 'Choose Mode',
    description: 'Select how you want to create your search queries',
  },
  {
    label: 'Configure Keywords',
    description: 'Add your search keywords or build complex queries',
  },
  {
    label: 'Search Settings',
    description: 'Configure SearxNG connection and search options',
  },
  {
    label: 'Review & Run',
    description: 'Review your configuration and start the search',
  },
];

export const WizardRunner: React.FC<WizardRunnerProps> = ({ onComplete, onCancel }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [mode, setMode] = useState<'simple' | 'advanced' | 'query-builder'>('simple');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [currentKeyword, setCurrentKeyword] = useState('');
  const [searxUrl, setSearxUrl] = useState('http://localhost:8888');
  const [workDir, setWorkDir] = useState('C:\\SearxQueries');
  
  // Search options
  const [useCache, setUseCache] = useState(true);
  const [parallel, setParallel] = useState(true);
  const [verbose, setVerbose] = useState(true);
  const [exportFormat, setExportFormat] = useState('ALL');
  const [throttleLimit, setThrottleLimit] = useState(5);
  const [delay, setDelay] = useState(2);
  const [maxRetries, setMaxRetries] = useState(3);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleAddKeyword = () => {
    if (currentKeyword.trim() && !keywords.includes(currentKeyword.trim())) {
      setKeywords([...keywords, currentKeyword.trim()]);
      setCurrentKeyword('');
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    setKeywords(keywords.filter(k => k !== keyword));
  };

  const handleFinish = () => {
    const config: WizardConfig = {
      mode,
      keywords,
      searxUrl,
      workDir,
      searchOptions: {
        useCache,
        parallel,
        verbose,
        exportFormat,
        throttleLimit,
        delay,
        maxRetries,
      },
    };
    onComplete(config);
  };

  const loadPresetKeywords = (preset: string) => {
    const presets: { [key: string]: string[] } = {
      stanford: [
        'Stanford Computer Science',
        'Stanford AI',
        'Stanford Machine Learning',
        'Stanford PhD Computer Science',
      ],
      tech: [
        'Software Engineer',
        'Senior Software Engineer',
        'Tech Lead',
        'Engineering Manager',
      ],
      research: [
        'Research Scientist',
        'Postdoc',
        'Professor Computer Science',
        'AI Researcher',
      ],
    };
    setKeywords(presets[preset] || []);
  };

  const canProceed = () => {
    switch (activeStep) {
      case 0:
        return mode !== null;
      case 1:
        return keywords.length > 0;
      case 2:
        return searxUrl.trim() !== '' && workDir.trim() !== '';
      case 3:
        return true;
      default:
        return false;
    }
  };

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider', backgroundColor: '#0077B5' }}>
        <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold' }}>
          🧙‍♂️ Interactive Search Wizard
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mt: 1 }}>
          Step-by-step guide to configure and run your LinkedIn search
        </Typography>
      </Box>

      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 3 }}>
        <Stepper activeStep={activeStep} orientation="vertical">
          {/* Step 0: Choose Mode */}
          <Step>
            <StepLabel>
              <Typography variant="h6">{steps[0].label}</Typography>
            </StepLabel>
            <StepContent>
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                {steps[0].description}
              </Typography>

              <FormControl component="fieldset">
                <RadioGroup value={mode} onChange={(e) => setMode(e.target.value as any)}>
                  <Card sx={{ mb: 2, border: mode === 'simple' ? 2 : 1, borderColor: mode === 'simple' ? 'primary.main' : 'grey.300' }}>
                    <CardContent>
                      <FormControlLabel
                        value="simple"
                        control={<Radio />}
                        label={
                          <Box>
                            <Typography variant="subtitle1" fontWeight="bold">
                              🎯 Simple Mode
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Add keywords one by one. Best for straightforward searches.
                            </Typography>
                          </Box>
                        }
                      />
                    </CardContent>
                  </Card>

                  <Card sx={{ mb: 2, border: mode === 'advanced' ? 2 : 1, borderColor: mode === 'advanced' ? 'primary.main' : 'grey.300' }}>
                    <CardContent>
                      <FormControlLabel
                        value="advanced"
                        control={<Radio />}
                        label={
                          <Box>
                            <Typography variant="subtitle1" fontWeight="bold">
                              ⚡ Advanced Mode
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Load keywords from file or use preset templates. Best for bulk searches.
                            </Typography>
                          </Box>
                        }
                      />
                    </CardContent>
                  </Card>

                  <Card sx={{ border: mode === 'query-builder' ? 2 : 1, borderColor: mode === 'query-builder' ? 'primary.main' : 'grey.300' }}>
                    <CardContent>
                      <FormControlLabel
                        value="query-builder"
                        control={<Radio />}
                        label={
                          <Box>
                            <Typography variant="subtitle1" fontWeight="bold">
                              🔧 Query Builder Mode
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Create complex Boolean queries with AND/OR operators. Best for precise targeting.
                            </Typography>
                          </Box>
                        }
                      />
                    </CardContent>
                  </Card>
                </RadioGroup>
              </FormControl>

              <Box sx={{ mt: 3 }}>
                <Button variant="contained" onClick={handleNext} disabled={!canProceed()}>
                  Next <NextIcon />
                </Button>
              </Box>
            </StepContent>
          </Step>

          {/* Step 1: Configure Keywords */}
          <Step>
            <StepLabel>
              <Typography variant="h6">{steps[1].label}</Typography>
            </StepLabel>
            <StepContent>
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                {steps[1].description}
              </Typography>

              {mode === 'simple' && (
                <Box>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    Enter keywords one at a time. Press Enter or click Add to add each keyword.
                  </Alert>

                  <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <TextField
                      fullWidth
                      label="Enter Keyword"
                      placeholder="e.g., Stanford Computer Science"
                      value={currentKeyword}
                      onChange={(e) => setCurrentKeyword(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddKeyword();
                        }
                      }}
                    />
                    <Button
                      variant="contained"
                      onClick={handleAddKeyword}
                      startIcon={<AddIcon />}
                    >
                      Add
                    </Button>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Keywords Added ({keywords.length}):
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {keywords.map((kw, idx) => (
                        <Chip
                          key={idx}
                          label={kw}
                          onDelete={() => handleRemoveKeyword(kw)}
                          color="primary"
                        />
                      ))}
                      {keywords.length === 0 && (
                        <Typography variant="body2" color="text.secondary">
                          No keywords added yet
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Box>
              )}

              {mode === 'advanced' && (
                <Box>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    Choose a preset template or manually add keywords in bulk.
                  </Alert>

                  <Typography variant="subtitle2" gutterBottom>
                    Quick Presets:
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
                    <Button
                      variant="outlined"
                      onClick={() => loadPresetKeywords('stanford')}
                    >
                      Stanford Keywords
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => loadPresetKeywords('tech')}
                    >
                      Tech Roles
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => loadPresetKeywords('research')}
                    >
                      Research Positions
                    </Button>
                  </Box>

                  <TextField
                    fullWidth
                    multiline
                    rows={6}
                    label="Keywords (one per line)"
                    placeholder="Enter keywords, one per line&#10;Example:&#10;Stanford AI&#10;Stanford Machine Learning&#10;Stanford PhD"
                    value={keywords.join('\n')}
                    onChange={(e) => {
                      const lines = e.target.value.split('\n').map(l => l.trim()).filter(l => l);
                      setKeywords(lines);
                    }}
                    sx={{ mb: 2 }}
                  />

                  <Typography variant="body2" color="text.secondary">
                    Total keywords: {keywords.length}
                  </Typography>
                </Box>
              )}

              {mode === 'query-builder' && (
                <Box>
                  <Alert severity="success" sx={{ mb: 2 }}>
                    You'll use the Advanced Query Builder in the next screen after completing the wizard.
                  </Alert>

                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        🔧 What is Query Builder?
                      </Typography>
                      <Typography variant="body2" paragraph>
                        The Query Builder lets you create complex Boolean search queries by combining multiple keyword groups with AND/OR operators.
                      </Typography>

                      <Typography variant="subtitle2" gutterBottom>
                        Example:
                      </Typography>
                      <List dense>
                        <ListItem>
                          <ListItemText
                            primary="Group 1 (OR): Stanford, MIT, Harvard"
                            secondary="Any of these universities"
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="Group 2 (AND): Computer Science"
                            secondary="Must include this field"
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="Group 3 (OR): PhD, Professor, Researcher"
                            secondary="Any of these roles"
                          />
                        </ListItem>
                      </List>

                      <Typography variant="body2" sx={{ mt: 2, fontWeight: 'bold' }}>
                        Generates: 3 × 1 × 3 = 9 targeted queries
                      </Typography>
                    </CardContent>
                  </Card>

                  {/* Placeholder - will open query builder after wizard */}
                  <Button
                    variant="outlined"
                    fullWidth
                    sx={{ mt: 2 }}
                    onClick={() => {
                      setKeywords(['Placeholder - Query Builder will open after wizard']);
                    }}
                  >
                    Preview Query Builder (Available After Wizard)
                  </Button>
                </Box>
              )}

              <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                <Button onClick={handleBack} startIcon={<BackIcon />}>
                  Back
                </Button>
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={!canProceed()}
                  endIcon={<NextIcon />}
                >
                  Next
                </Button>
              </Box>
            </StepContent>
          </Step>

          {/* Step 2: Search Settings */}
          <Step>
            <StepLabel>
              <Typography variant="h6">{steps[2].label}</Typography>
            </StepLabel>
            <StepContent>
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                {steps[2].description}
              </Typography>

              <Alert severity="info" sx={{ mb: 2 }}>
                Default settings work for most users. Adjust if you have specific requirements.
              </Alert>

              <Card variant="outlined" sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                    🔧 SearxNG Connection
                  </Typography>

                  <TextField
                    fullWidth
                    label="SearxNG URL"
                    value={searxUrl}
                    onChange={(e) => setSearxUrl(e.target.value)}
                    helperText="URL where your SearxNG instance is running"
                    sx={{ mb: 2 }}
                  />

                  <TextField
                    fullWidth
                    label="Work Directory"
                    value={workDir}
                    onChange={(e) => setWorkDir(e.target.value)}
                    helperText="Directory where results will be saved"
                  />
                </CardContent>
              </Card>

              <Card variant="outlined" sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                    ⚡ Performance Options
                  </Typography>

                  <FormGroup>
                    <FormControlLabel
                      control={<Checkbox checked={parallel} onChange={(e) => setParallel(e.target.checked)} />}
                      label={
                        <Box>
                          <Typography variant="body2">Parallel Execution</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Run multiple searches at once (3-5x faster)
                          </Typography>
                        </Box>
                      }
                    />

                    {parallel && (
                      <Box sx={{ ml: 4, mt: 1, mb: 2 }}>
                        <TextField
                          type="number"
                          label="Parallel Threads"
                          value={throttleLimit}
                          onChange={(e) => setThrottleLimit(Number(e.target.value))}
                          inputProps={{ min: 1, max: 10 }}
                          size="small"
                          helperText="Recommended: 3-5 threads"
                        />
                      </Box>
                    )}

                    <FormControlLabel
                      control={<Checkbox checked={useCache} onChange={(e) => setUseCache(e.target.checked)} />}
                      label={
                        <Box>
                          <Typography variant="body2">Use Cache</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Save results for 24 hours to avoid re-scraping
                          </Typography>
                        </Box>
                      }
                    />

                    <FormControlLabel
                      control={<Checkbox checked={verbose} onChange={(e) => setVerbose(e.target.checked)} />}
                      label={
                        <Box>
                          <Typography variant="body2">Verbose Logging</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Show detailed progress information
                          </Typography>
                        </Box>
                      }
                    />
                  </FormGroup>
                </CardContent>
              </Card>

              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                    📊 Export & Timing
                  </Typography>

                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <FormLabel>Export Format</FormLabel>
                    <RadioGroup
                      row
                      value={exportFormat}
                      onChange={(e) => setExportFormat(e.target.value)}
                    >
                      <FormControlLabel value="ALL" control={<Radio />} label="All Formats" />
                      <FormControlLabel value="CSV" control={<Radio />} label="CSV" />
                      <FormControlLabel value="JSON" control={<Radio />} label="JSON" />
                      <FormControlLabel value="HTML" control={<Radio />} label="HTML" />
                    </RadioGroup>
                  </FormControl>

                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                      type="number"
                      label="Delay (seconds)"
                      value={delay}
                      onChange={(e) => setDelay(Number(e.target.value))}
                      inputProps={{ min: 1, max: 10 }}
                      size="small"
                      helperText="Pause between requests"
                      fullWidth
                    />
                    <TextField
                      type="number"
                      label="Max Retries"
                      value={maxRetries}
                      onChange={(e) => setMaxRetries(Number(e.target.value))}
                      inputProps={{ min: 1, max: 5 }}
                      size="small"
                      helperText="Retry failed requests"
                      fullWidth
                    />
                  </Box>
                </CardContent>
              </Card>

              <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                <Button onClick={handleBack} startIcon={<BackIcon />}>
                  Back
                </Button>
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={!canProceed()}
                  endIcon={<NextIcon />}
                >
                  Next
                </Button>
              </Box>
            </StepContent>
          </Step>

          {/* Step 3: Review & Run */}
          <Step>
            <StepLabel>
              <Typography variant="h6">{steps[3].label}</Typography>
            </StepLabel>
            <StepContent>
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                {steps[3].description}
              </Typography>

              <Alert severity="success" sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  ✅ Configuration Complete!
                </Typography>
                <Typography variant="body2">
                  Review your settings below and click "Start Search" when ready.
                </Typography>
              </Alert>

              <Card variant="outlined" sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    📋 Summary
                  </Typography>

                  <List dense>
                    <ListItem>
                      <ListItemText
                        primary="Mode"
                        secondary={
                          mode === 'simple' ? '🎯 Simple Mode' :
                          mode === 'advanced' ? '⚡ Advanced Mode' :
                          '🔧 Query Builder Mode'
                        }
                      />
                    </ListItem>
                    <Divider />
                    <ListItem>
                      <ListItemText
                        primary="Keywords"
                        secondary={`${keywords.length} keyword(s) configured`}
                      />
                    </ListItem>
                    <Divider />
                    <ListItem>
                      <ListItemText
                        primary="SearxNG URL"
                        secondary={searxUrl}
                      />
                    </ListItem>
                    <Divider />
                    <ListItem>
                      <ListItemText
                        primary="Performance"
                        secondary={parallel ? `⚡ Parallel (${throttleLimit} threads)` : '📝 Sequential'}
                      />
                    </ListItem>
                    <Divider />
                    <ListItem>
                      <ListItemText
                        primary="Options"
                        secondary={`Cache: ${useCache ? 'On' : 'Off'} | Verbose: ${verbose ? 'On' : 'Off'} | Export: ${exportFormat}`}
                      />
                    </ListItem>
                    <Divider />
                    <ListItem>
                      <ListItemText
                        primary="Timing"
                        secondary={`${delay}s delay, ${maxRetries} max retries`}
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>

              <Card variant="outlined" sx={{ mb: 2, backgroundColor: '#f5f5f5' }}>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                    📝 Your Keywords:
                  </Typography>
                  <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                    {keywords.map((kw, idx) => (
                      <Typography key={idx} variant="body2" sx={{ py: 0.5 }}>
                        {idx + 1}. {kw}
                      </Typography>
                    ))}
                  </Box>
                </CardContent>
              </Card>

              <Alert severity="warning" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  Estimated time: {Math.ceil(keywords.length * delay / (parallel ? throttleLimit : 1))} seconds
                  ({parallel ? 'parallel' : 'sequential'} mode)
                </Typography>
              </Alert>

              <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                <Button onClick={handleBack} startIcon={<BackIcon />}>
                  Back
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  onClick={handleFinish}
                  disabled={!canProceed()}
                  startIcon={<RunIcon />}
                  size="large"
                >
                  Start Search
                </Button>
                <Button onClick={onCancel}>
                  Cancel
                </Button>
              </Box>
            </StepContent>
          </Step>
        </Stepper>
      </Box>
    </Box>
  );
};

