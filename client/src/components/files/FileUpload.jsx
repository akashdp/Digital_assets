import React, { useCallback, useState, useMemo, lazy, Suspense, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  LinearProgress,
  TextField,
  Button,
  Chip,
  Stack,
  Alert,
  List,
  ListItem,
  ListItemText,
  CircularProgress
} from '@mui/material';
import { CloudUpload, Add } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fileService } from '../../services/api';
import {
  uploadStart,
  uploadProgress,
  uploadSuccess,
  uploadFailure,
  fetchFiles,
} from '../../store/slices/fileSlice';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'video/mp4',
  'video/quicktime',
  'video/x-msvideo',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

// Lazy load the dropzone component
const DropzoneArea = lazy(() => import('./DropzoneArea'));

const FileUpload = ({ onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, uploadProgress: progress, error } = useSelector((state) => state.files);
  const { user } = useSelector((state) => state.auth);
  const [folder, setFolder] = useState('');
  const [tags, setTags] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [validationError, setValidationError] = useState('');

  // Check authentication on component mount
  useEffect(() => {
    if (!user) {
      setValidationError('Please log in to upload files');
      // Optionally redirect to login
      // navigate('/login');
    }
  }, [user, navigate]);

  // Memoize validation function
  const validateFile = useCallback((file) => {
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`File ${file.name} is too large. Maximum size is 10MB.`);
    }
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      throw new Error(`File ${file.name} is not a supported file type.`);
    }
  }, []);

  // Memoize onDrop callback
  const onDrop = useCallback((acceptedFiles) => {
    try {
      setValidationError('');
      acceptedFiles.forEach(validateFile);
      setSelectedFiles((prev) => [...prev, ...acceptedFiles]);
    } catch (error) {
      setValidationError(error.message);
    }
  }, [validateFile]);

  // Memoize dropzone config
  const dropzoneConfig = useMemo(() => ({
    onDrop,
    multiple: true,
    accept: ALLOWED_FILE_TYPES.join(','),
    maxSize: MAX_FILE_SIZE
  }), [onDrop]);

  const handleAddTag = useCallback(() => {
    if (tagInput && !tags.split(',').includes(tagInput)) {
      setTags(tags ? `${tags},${tagInput}` : tagInput);
      setTagInput('');
    }
  }, [tagInput, tags]);

  const handleRemoveTag = useCallback((tagToRemove) => {
    setTags(tags.split(',').filter(tag => tag !== tagToRemove).join(','));
  }, [tags]);

  const handleRemoveFile = useCallback((fileName) => {
    setSelectedFiles(selectedFiles.filter(file => file.name !== fileName));
  }, [selectedFiles]);

  const handleUpload = useCallback(async () => {
    if (!user) {
      setValidationError('Please log in to upload files');
      return;
    }

    if (selectedFiles.length === 0) return;
    
    try {
      setValidationError('');
      for (const file of selectedFiles) {
        validateFile(file);
        
        const formData = new FormData();
        formData.append('file', file);
        if (folder) formData.append('folder', folder);
        if (tags) formData.append('tags', tags);
        
        dispatch(uploadStart());
        const response = await fileService.uploadFile(formData);
        dispatch(uploadSuccess(response.data.data));
      }
      dispatch(fetchFiles());
      setSelectedFiles([]);
      if (onClose) onClose();
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Upload failed';
      dispatch(uploadFailure(errorMessage));
      setValidationError(errorMessage);
    }
  }, [selectedFiles, folder, tags, dispatch, validateFile, onClose, user]);

  // Memoize selected files list
  const selectedFilesList = useMemo(() => (
    selectedFiles.length > 0 && (
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle1">Selected Files:</Typography>
        <List>
          {selectedFiles.map((file) => (
            <ListItem key={file.name} secondaryAction={
              <Button color="error" size="small" onClick={() => handleRemoveFile(file.name)}>
                Remove
              </Button>
            }>
              <ListItemText primary={file.name} secondary={`${(file.size / 1024 / 1024).toFixed(2)} MB`} />
            </ListItem>
          ))}
        </List>
      </Box>
    )
  ), [selectedFiles, handleRemoveFile]);

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
      {!user ? (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Please log in to upload files
        </Alert>
      ) : (
        <>
          <Suspense fallback={<CircularProgress />}>
            <DropzoneArea config={dropzoneConfig} />
          </Suspense>

          {selectedFilesList}

          <Box sx={{ mt: 3 }}>
            <TextField
              fullWidth
              label="Folder"
              value={folder}
              onChange={(e) => setFolder(e.target.value)}
              placeholder="Enter folder name (optional)"
              sx={{ mb: 2 }}
            />

            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                label="Add Tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Enter tag and press Enter"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                InputProps={{
                  endAdornment: (
                    <Button
                      onClick={handleAddTag}
                      startIcon={<Add />}
                      disabled={!tagInput}
                    >
                      Add
                    </Button>
                  ),
                }}
              />
            </Box>

            <Alert severity="info" sx={{ mb: 2 }}>
              Your files are private and will only be visible to you. Other users cannot access your uploaded files.
            </Alert>

            {tags && (
              <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
                {tags.split(',').map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    onDelete={() => handleRemoveTag(tag)}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Stack>
            )}

            {loading && (
              <Box sx={{ width: '100%', mt: 2 }}>
                <LinearProgress variant="determinate" value={progress} />
                <Typography variant="body2" color="textSecondary" align="center" sx={{ mt: 1 }}>
                  Uploading... {progress}%
                </Typography>
              </Box>
            )}

            {(error || validationError) && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {typeof error === 'string' ? error : validationError || 'An error occurred during upload'}
              </Alert>
            )}
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
            <Button onClick={onClose} color="secondary" variant="outlined">
              Cancel
            </Button>
            <Button 
              onClick={handleUpload} 
              color="primary" 
              variant="contained" 
              disabled={selectedFiles.length === 0 || loading || !user}
            >
              Upload
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
};

export default React.memo(FileUpload); 