import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  CircularProgress,
  Alert,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFiles } from '../store/slices/fileSlice';
import FileUpload from '../components/files/FileUpload';
import FileList from '../components/files/FileList';

const Files = () => {
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadOpen, setUploadOpen] = useState(false);
  const { files, loading, error } = useSelector((state) => state.files);

  useEffect(() => {
    console.log('Files component mounted, fetching files...');
    dispatch(fetchFiles());
  }, [dispatch]);

  useEffect(() => {
    console.log('Files state updated:', { files, loading, error });
  }, [files, loading, error]);

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleUploadClick = () => setUploadOpen(true);
  const handleUploadClose = () => {
    setUploadOpen(false);
    console.log('Upload dialog closed, refreshing files...');
    dispatch(fetchFiles());
  };

  // Filter files based on search query
  const filteredFiles = files.filter(file => 
    file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    file.folder?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    file.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  console.log('Filtered files:', filteredFiles);

  return (
    <Box sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Files</Typography>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search files by name, folder, or tags..."
          value={searchQuery}
          onChange={handleSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          Error: {error}
        </Alert>
      ) : filteredFiles.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="textSecondary">
            {searchQuery ? 'No files match your search.' : 'No files found. Upload your first file to get started!'}
          </Typography>
        </Paper>
      ) : (
        <FileList files={filteredFiles} />
      )}

      <Dialog open={uploadOpen} onClose={handleUploadClose} maxWidth="sm" fullWidth>
        <DialogTitle>Upload File</DialogTitle>
        <DialogContent>
          <FileUpload onClose={handleUploadClose} />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Files; 