import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
} from '@mui/icons-material';

interface QueryGroup {
  id: string;
  operator: 'AND' | 'OR';
  keywords: string[];
}

interface QueryBuilderProps {
  onQueryGenerated: (queries: string[]) => void;
}

export const QueryBuilder: React.FC<QueryBuilderProps> = ({ onQueryGenerated }) => {
  const [groups, setGroups] = useState<QueryGroup[]>([
    { id: '1', operator: 'AND', keywords: [] }
  ]);
  const [currentInput, setCurrentInput] = useState<{ [key: string]: string }>({});
  const [generatedQueries, setGeneratedQueries] = useState<string[]>([]);

  const addGroup = () => {
    const newId = (Math.max(...groups.map(g => parseInt(g.id)), 0) + 1).toString();
    setGroups([...groups, { id: newId, operator: 'AND', keywords: [] }]);
  };

  const removeGroup = (id: string) => {
    setGroups(groups.filter(g => g.id !== id));
  };

  const updateOperator = (id: string, operator: 'AND' | 'OR') => {
    setGroups(groups.map(g => g.id === id ? { ...g, operator } : g));
  };

  const addKeyword = (groupId: string) => {
    const input = currentInput[groupId]?.trim();
    if (!input) return;

    setGroups(groups.map(g => 
      g.id === groupId 
        ? { ...g, keywords: [...g.keywords, input] }
        : g
    ));
    setCurrentInput({ ...currentInput, [groupId]: '' });
  };

  const removeKeyword = (groupId: string, keyword: string) => {
    setGroups(groups.map(g =>
      g.id === groupId
        ? { ...g, keywords: g.keywords.filter(k => k !== keyword) }
        : g
    ));
  };

  const generateQueries = () => {
    const queries: string[] = [];
    
    // Generate all combinations
    const keywordArrays = groups.map(g => g.keywords);
    
    if (keywordArrays.length === 0 || keywordArrays.every(arr => arr.length === 0)) {
      return;
    }

    // Helper function to generate Cartesian product
    const cartesianProduct = (arrays: string[][]): string[][] => {
      return arrays.reduce((acc, curr) => {
        return acc.flatMap(a => curr.map(c => [...a, c]));
      }, [[]] as string[][]);
    };

    const combinations = cartesianProduct(keywordArrays);
    
    combinations.forEach(combo => {
      // Build query based on operators
      let query = '';
      combo.forEach((keyword, index) => {
        if (index > 0) {
          const prevGroup = groups[index - 1];
          query += ` ${prevGroup.operator} `;
        }
        // Wrap multi-word keywords in quotes
        query += keyword.includes(' ') ? `"${keyword}"` : keyword;
      });
      queries.push(query);
    });

    setGeneratedQueries(queries);
    onQueryGenerated(queries);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedQueries.join('\n'));
  };

  return (
    <Box>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          🔧 Advanced Query Builder
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Build complex search queries with AND/OR operators. Each group will be combined with others.
        </Typography>

        {groups.map((group, index) => (
          <Box key={group.id} sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <Typography variant="subtitle2" sx={{ minWidth: 80 }}>
                Group {parseInt(group.id)}:
              </Typography>
              
              <FormControl size="small" sx={{ minWidth: 100 }}>
                <InputLabel>Operator</InputLabel>
                <Select
                  value={group.operator}
                  label="Operator"
                  onChange={(e) => updateOperator(group.id, e.target.value as 'AND' | 'OR')}
                >
                  <MenuItem value="AND">AND</MenuItem>
                  <MenuItem value="OR">OR</MenuItem>
                </Select>
              </FormControl>

              <TextField
                size="small"
                placeholder="Enter keyword..."
                value={currentInput[group.id] || ''}
                onChange={(e) => setCurrentInput({ ...currentInput, [group.id]: e.target.value })}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addKeyword(group.id);
                  }
                }}
                sx={{ flexGrow: 1 }}
              />

              <Button
                size="small"
                startIcon={<AddIcon />}
                onClick={() => addKeyword(group.id)}
              >
                Add
              </Button>

              {groups.length > 1 && (
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => removeGroup(group.id)}
                >
                  <DeleteIcon />
                </IconButton>
              )}
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, ml: 10 }}>
              {group.keywords.map((keyword, idx) => (
                <Chip
                  key={idx}
                  label={keyword}
                  onDelete={() => removeKeyword(group.id, keyword)}
                  color="primary"
                  variant="outlined"
                  size="small"
                />
              ))}
            </Box>

            {index < groups.length - 1 && (
              <Divider sx={{ mt: 2, mb: 1 }} />
            )}
          </Box>
        ))}

        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={addGroup}
          >
            Add Group
          </Button>
          
          <Button
            variant="contained"
            onClick={generateQueries}
            disabled={groups.every(g => g.keywords.length === 0)}
          >
            Generate Queries ({groups.reduce((sum, g) => sum * Math.max(g.keywords.length, 1), 1)})
          </Button>
        </Box>
      </Paper>

      {generatedQueries.length > 0 && (
        <Paper sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Generated Queries ({generatedQueries.length})
            </Typography>
            <Button
              size="small"
              startIcon={<CopyIcon />}
              onClick={copyToClipboard}
            >
              Copy All
            </Button>
          </Box>
          
          <Box
            sx={{
              maxHeight: 300,
              overflow: 'auto',
              backgroundColor: '#f5f5f5',
              p: 2,
              borderRadius: 1,
              fontFamily: 'monospace',
              fontSize: '0.875rem',
            }}
          >
            {generatedQueries.map((query, index) => (
              <Box key={index} sx={{ mb: 0.5 }}>
                {index + 1}. {query}
              </Box>
            ))}
          </Box>
        </Paper>
      )}
    </Box>
  );
};

