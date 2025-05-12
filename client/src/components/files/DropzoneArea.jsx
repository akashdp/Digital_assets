import React from 'react';
import { useDropzone } from 'react-dropzone';
import { Paper, Typography } from '@mui/material';
import { CloudUpload } from '@mui/icons-material';

const DropzoneArea = ({ config }) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone(config);

  return (
    <Paper
      {...getRootProps()}
      sx={{
        p: 3,
        textAlign: 'center',
        cursor: 'pointer',
        backgroundColor: isDragActive ? 'action.hover' : 'background.paper',
        border: '2px dashed',
        borderColor: isDragActive ? 'primary.main' : 'divider',
        '&:hover': {
          borderColor: 'primary.main',
        },
      }}
    >
      <input {...getInputProps()} />
      <CloudUpload sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
      <Typography variant="h6" gutterBottom>
        {isDragActive
          ? 'Drop the files here'
          : 'Drag and drop files here, or click to select'}
      </Typography>
      <Typography variant="body2" color="textSecondary">
        Supported formats: Images, Videos, Documents. You can select multiple files.
      </Typography>
    </Paper>
  );
};

export default React.memo(DropzoneArea); 