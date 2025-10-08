import React from 'react';
import {
  Box,
  TextField,
  Button,
  Chip,
  Card,
  CardContent,
  Typography,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Checkbox,
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  SelectAll as SelectAllIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';

interface KeywordsPanelProps {
  keywords: string[];
  filteredKeywords: string[];
  selectedKeywords: Set<string>;
  filterText: string;
  setFilterText: (text: string) => void;
  addKeywordDialog: boolean;
  setAddKeywordDialog: (open: boolean) => void;
  editKeywordDialog: boolean;
  setEditKeywordDialog: (open: boolean) => void;
  newKeyword: string;
  setNewKeyword: (keyword: string) => void;
  editingKeyword: string;
  setEditingKeyword: (keyword: string) => void;
  onKeywordToggle: (keyword: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onAddKeyword: () => void;
  onEditKeyword: () => void;
  onDeleteKeyword: (keyword: string) => void;
}

export const KeywordsPanel: React.FC<KeywordsPanelProps> = ({
  keywords,
  filteredKeywords,
  selectedKeywords,
  filterText,
  setFilterText,
  addKeywordDialog,
  setAddKeywordDialog,
  editKeywordDialog,
  setEditKeywordDialog,
  newKeyword,
  setNewKeyword,
  editingKeyword,
  setEditingKeyword,
  onKeywordToggle,
  onSelectAll,
  onDeselectAll,
  onAddKeyword,
  onEditKeyword,
  onDeleteKeyword,
}) => {
  const handleAddKeyword = () => {
    onAddKeyword();
    setAddKeywordDialog(false);
    setNewKeyword('');
  };

  const handleEditKeyword = () => {
    onEditKeyword();
    setEditKeywordDialog(false);
    setEditingKeyword('');
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Keywords Management
      </Typography>

      <Card>
        <CardContent>
          {/* Search and Filter */}
          <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
            <TextField
              fullWidth
              label="Filter Keywords"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              variant="outlined"
            />

            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<SelectAllIcon />}
                onClick={onSelectAll}
                size="small"
              >
                Select All
              </Button>
              <Button
                variant="outlined"
                startIcon={<ClearIcon />}
                onClick={onDeselectAll}
                size="small"
              >
                Deselect All
              </Button>
            </Box>
          </Box>

          {/* Keywords List */}
          <Box sx={{ maxHeight: 400, overflow: 'auto', mb: 2 }}>
            <Grid container spacing={1}>
              {filteredKeywords.map((keyword) => (
                <Grid item key={keyword} xs={12} sm={6} md={4}>
                  <Card
                    variant="outlined"
                    sx={{
                      backgroundColor: selectedKeywords.has(keyword) ? 'action.selected' : 'background.paper'
                    }}
                  >
                    <CardContent sx={{ py: 1, px: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                          <Checkbox
                            checked={selectedKeywords.has(keyword)}
                            onChange={() => onKeywordToggle(keyword)}
                            size="small"
                          />
                          <Typography variant="body2" sx={{ ml: 1, flexGrow: 1 }}>
                            {keyword}
                          </Typography>
                        </Box>

                        <Box>
                          <IconButton
                            size="small"
                            onClick={() => {
                              setEditingKeyword(keyword);
                              setEditKeywordDialog(true);
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => onDeleteKeyword(keyword)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Add Keyword Button */}
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setAddKeywordDialog(true)}
              sx={{ mt: 2 }}
            >
              Add Keyword
            </Button>
          </Box>

          {/* Summary */}
          <Box sx={{ mt: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Total Keywords: {keywords.length} |
              Selected: {selectedKeywords.size} |
              Filtered: {filteredKeywords.length}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Add Keyword Dialog */}
      <Dialog open={addKeywordDialog} onClose={() => setAddKeywordDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Keyword</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Keyword"
            fullWidth
            variant="outlined"
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleAddKeyword();
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddKeywordDialog(false)}>Cancel</Button>
          <Button onClick={handleAddKeyword} variant="contained" disabled={!newKeyword.trim()}>
            Add
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Keyword Dialog */}
      <Dialog open={editKeywordDialog} onClose={() => setEditKeywordDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Keyword</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Keyword"
            fullWidth
            variant="outlined"
            value={editingKeyword}
            onChange={(e) => setEditingKeyword(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleEditKeyword();
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditKeywordDialog(false)}>Cancel</Button>
          <Button onClick={handleEditKeyword} variant="contained" disabled={!editingKeyword.trim()}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
