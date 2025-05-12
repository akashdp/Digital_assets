import { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Chip,
  TextField,
  Button,
  IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

const Tags = () => {
  const [newTag, setNewTag] = useState('');
  const [tags, setTags] = useState([
    { id: 1, name: 'Important', count: 5 },
    { id: 2, name: 'Work', count: 3 },
    { id: 3, name: 'Personal', count: 2 },
  ]);

  const handleAddTag = () => {
    if (newTag.trim()) {
      setTags([...tags, { id: Date.now(), name: newTag.trim(), count: 0 }]);
      setNewTag('');
    }
  };

  const handleDeleteTag = (tagId) => {
    setTags(tags.filter(tag => tag.id !== tagId));
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Tags
      </Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            fullWidth
            label="New Tag"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
          />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddTag}
          >
            Add Tag
          </Button>
        </Box>
      </Paper>

      <Grid container spacing={2}>
        {tags.map((tag) => (
          <Grid item xs={12} sm={6} md={4} key={tag.id}>
            <Paper
              sx={{
                p: 2,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Box>
                <Typography variant="h6">{tag.name}</Typography>
                <Typography variant="body2" color="textSecondary">
                  {tag.count} files
                </Typography>
              </Box>
              <Box>
                <IconButton size="small" color="primary">
                  <EditIcon />
                </IconButton>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleDeleteTag(tag.id)}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Tags; 