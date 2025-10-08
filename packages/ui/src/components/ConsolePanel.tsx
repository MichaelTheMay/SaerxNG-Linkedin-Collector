import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Tooltip,
  Chip,
} from '@mui/material';
import {
  Clear as ClearIcon,
  Download as DownloadIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';

interface ConsolePanelProps {
  consoleOutput: string[];
  statusMessage: string;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  onClearConsole: () => void;
  onExportConsole: () => void;
}

export const ConsolePanel: React.FC<ConsolePanelProps> = ({
  consoleOutput,
  statusMessage,
  isExpanded,
  onToggleExpanded,
  onClearConsole,
  onExportConsole,
}) => {
  const getMessageType = (message: string): 'error' | 'success' | 'warning' | 'info' => {
    if (message.toLowerCase().includes('error') || message.toLowerCase().includes('failed')) {
      return 'error';
    }
    if (message.toLowerCase().includes('success') || message.toLowerCase().includes('completed')) {
      return 'success';
    }
    if (message.toLowerCase().includes('warning') || message.toLowerCase().includes('warn')) {
      return 'warning';
    }
    return 'info';
  };

  const getMessageColor = (type: 'error' | 'success' | 'warning' | 'info') => {
    switch (type) {
      case 'error': return 'error';
      case 'success': return 'success';
      case 'warning': return 'warning';
      case 'info': return 'default';
    }
  };

  return (
    <Box>
      <Card>
        <CardContent>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="h6">
                Console Output
              </Typography>
              <Chip
                label={statusMessage}
                size="small"
                color={getMessageColor(getMessageType(statusMessage))}
                variant="outlined"
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Toggle Console">
                <IconButton
                  size="small"
                  onClick={onToggleExpanded}
                >
                  {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Tooltip>

              <Tooltip title="Clear Console">
                <IconButton
                  size="small"
                  onClick={onClearConsole}
                  disabled={consoleOutput.length === 0}
                >
                  <ClearIcon />
                </IconButton>
              </Tooltip>

              <Tooltip title="Export Console">
                <IconButton
                  size="small"
                  onClick={onExportConsole}
                  disabled={consoleOutput.length === 0}
                >
                  <DownloadIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Console Output */}
          {isExpanded && (
            <Box
              sx={{
                bgcolor: 'grey.900',
                color: 'common.white',
                p: 2,
                borderRadius: 1,
                maxHeight: 300,
                overflow: 'auto',
                fontFamily: 'monospace',
                fontSize: '0.875rem',
                '&::-webkit-scrollbar': {
                  width: '8px',
                },
                '&::-webkit-scrollbar-track': {
                  backgroundColor: 'grey.800',
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: 'grey.600',
                  borderRadius: '4px',
                },
              }}
            >
              {consoleOutput.length === 0 ? (
                <Typography variant="body2" sx={{ color: 'grey.400', fontStyle: 'italic' }}>
                  Console output will appear here...
                </Typography>
              ) : (
                consoleOutput.map((message, index) => {
                  const messageType = getMessageType(message);
                  return (
                    <Box
                      key={index}
                      sx={{
                        mb: 0.5,
                        color: messageType === 'error' ? '#f44336' :
                               messageType === 'success' ? '#4caf50' :
                               messageType === 'warning' ? '#ff9800' : 'inherit',
                      }}
                    >
                      {message}
                    </Box>
                  );
                })
              )}
            </Box>
          )}

          {/* Summary */}
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              {consoleOutput.length} messages
            </Typography>
            {isExpanded && consoleOutput.length > 0 && (
              <Typography variant="body2" color="text.secondary">
                Latest: {consoleOutput[consoleOutput.length - 1]}
              </Typography>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};
