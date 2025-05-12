import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Paper,
} from '@mui/material';
import {
  MoreVert,
  Delete,
  Edit,
  GetApp,
  Folder,
  Image as ImageIcon,
  PictureAsPdf as PdfIcon,
  Movie as VideoIcon,
  Description as DocIcon,
} from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { fileService } from '../../services/api';
import { deleteFile, updateFile } from '../../store/slices/fileSlice';

const FileList = ({ files }) => {
  const dispatch = useDispatch();
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [newTags, setNewTags] = useState('');
  const [loading, setLoading] = useState(false);

  const handleMenuOpen = (event, file) => {
    setAnchorEl(event.currentTarget);
    setSelectedFile(file);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEditClick = () => {
    setNewTags(selectedFile.tags?.join(',') || '');
    setEditDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDownload = async () => {
    if (selectedFile?.url) {
      window.open(selectedFile.url, '_blank');
    }
    handleMenuClose();
  };

  const handleUpdateTags = async () => {
    try {
      if (!selectedFile?._id) {
        console.error('No file selected or missing _id');
        return;
      }
      const response = await fileService.updateFileTags(
        selectedFile._id,
        newTags.split(',').map(tag => tag.trim())
      );
      dispatch(updateFile(response.data.data));
      setEditDialogOpen(false);
    } catch (error) {
      console.error('Failed to update tags:', error);
    }
  };

  const handleDelete = async () => {
    try {
      if (!selectedFile?._id) {
        console.error('No file selected or missing _id');
        return;
      }

      setDeleteDialogOpen(false);
      setLoading(true);
      
      console.log('Attempting to delete file:', selectedFile);
      const response = await fileService.deleteFile(selectedFile._id);
      console.log('Delete response:', response);
      
      if (response.message === 'File deleted successfully') {
        // Only dispatch and clear if deletion was successful
        dispatch(deleteFile(selectedFile._id));
        setSelectedFile(null);
        handleMenuClose();
      } else {
        throw new Error(response.message || 'Failed to delete file');
      }
    } catch (error) {
      console.error('Failed to delete file:', error);
      alert(error.message || 'Failed to delete file. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (format) => {
    if (format?.startsWith('image/') || format === 'png' || format === 'jpg' || format === 'jpeg') {
      return <ImageIcon />;
    } else if (format?.startsWith('video/') || format === 'mp4') {
      return <VideoIcon />;
    } else if (format?.startsWith('application/pdf') || format === 'pdf') {
      return <PdfIcon />;
    }
    return <DocIcon />;
  };

  // Group files by folder
  const filesByFolder = files.reduce((acc, file) => {
    const folder = file.folder || 'No Folder';
    if (!acc[folder]) acc[folder] = [];
    acc[folder].push(file);
    return acc;
  }, {});

  // Add loading state to the delete button
  const renderDeleteButton = () => (
    <Button 
      onClick={handleDelete} 
      color="error" 
      variant="contained"
      disabled={loading}
    >
      {loading ? 'Deleting...' : 'Delete'}
    </Button>
  );

  if (!files || files.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="textSecondary" gutterBottom>
          No files found
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Upload your first file to get started. Your files will be private and only visible to you.
        </Typography>
      </Paper>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {Object.entries(filesByFolder).map(([folder, filesInFolder]) => (
        <Box key={folder} sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ mb: 2 }}>
            <Folder sx={{ mr: 1, verticalAlign: 'middle' }} />
            {folder}
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 3 }}>
            {filesInFolder.map((file) => (
              <Card key={file._id} sx={{ position: 'relative', height: '100%' }}>
                <CardMedia
                  component="img"
                  height="140"
                  image={file.url}
                  alt={file.name}
                  sx={{ 
                    objectFit: 'cover',
                    backgroundColor: 'grey.100'
                  }}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/140x140?text=File';
                  }}
                />
                <CardContent>
                  <Typography variant="h6" noWrap>
                    {file.name}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    {new Date(file.created_at).toLocaleDateString()}
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
                    {file.tags?.map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                  </Stack>
                </CardContent>
                <IconButton
                  sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(255,255,255,0.8)' }}
                  onClick={(e) => handleMenuOpen(e, file)}
                >
                  <MoreVert />
                </IconButton>
              </Card>
            ))}
          </Box>
        </Box>
      ))}

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEditClick}>
          <Edit sx={{ mr: 1 }} /> Edit Tags
        </MenuItem>
        <MenuItem onClick={handleDownload}>
          <GetApp sx={{ mr: 1 }} /> Download
        </MenuItem>
        <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
          <Delete sx={{ mr: 1 }} /> Delete
        </MenuItem>
      </Menu>

      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>Edit Tags</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Tags"
            value={newTags}
            onChange={(e) => setNewTags(e.target.value)}
            placeholder="Enter tags separated by commas"
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdateTags} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete File</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this file? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          {renderDeleteButton()}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FileList; 