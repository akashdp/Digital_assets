import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fileService } from '../../services/api';

const initialState = {
  files: [],
  currentFile: null,
  loading: false,
  error: null,
  uploadProgress: 0,
};

export const fetchFiles = createAsyncThunk(
  'files/fetchFiles',
  async (_, { rejectWithValue }) => {
    try {
      console.log('Fetching files...');
      const response = await fileService.fetchFiles();
      console.log('Files response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching files:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch files');
    }
  }
);

const fileSlice = createSlice({
  name: 'files',
  initialState,
  reducers: {
    uploadStart: (state) => {
      state.loading = true;
      state.error = null;
      state.uploadProgress = 0;
    },
    uploadProgress: (state, action) => {
      state.uploadProgress = action.payload;
    },
    uploadSuccess: (state, action) => {
      state.loading = false;
      state.files.push(action.payload);
      state.uploadProgress = 100;
      state.error = null;
    },
    uploadFailure: (state, action) => {
      state.loading = false;
      state.error = typeof action.payload === 'string' ? action.payload : 'Upload failed';
      state.uploadProgress = 0;
    },
    setFiles: (state, action) => {
      state.files = action.payload;
    },
    setCurrentFile: (state, action) => {
      state.currentFile = action.payload;
    },
    updateFile: (state, action) => {
      const index = state.files.findIndex(file => file.public_id === action.payload.public_id);
      if (index !== -1) {
        state.files[index] = { ...state.files[index], ...action.payload };
      }
    },
    deleteFile: (state, action) => {
      state.files = state.files.filter(file => file._id !== action.payload);
      if (state.currentFile?._id === action.payload) {
        state.currentFile = null;
      }
    },
    clearFiles: (state) => {
      state.files = [];
      state.currentFile = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFiles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFiles.fulfilled, (state, action) => {
        state.loading = false;
        state.files = action.payload;
        state.error = null;
      })
      .addCase(fetchFiles.rejected, (state, action) => {
        state.loading = false;
        state.error = typeof action.payload === 'string' ? action.payload : 'Failed to fetch files';
      });
  },
});

export const {
  uploadStart,
  uploadProgress,
  uploadSuccess,
  uploadFailure,
  setFiles,
  setCurrentFile,
  updateFile,
  deleteFile,
  clearFiles,
  clearError
} = fileSlice.actions;

export default fileSlice.reducer; 