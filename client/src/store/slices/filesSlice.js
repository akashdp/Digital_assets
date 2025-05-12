import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  files: [],
  loading: false,
  error: null,
  selectedFile: null,
  currentFolder: 'root',
};

const filesSlice = createSlice({
  name: 'files',
  initialState,
  reducers: {
    setFiles: (state, action) => {
      state.files = action.payload;
    },
    addFile: (state, action) => {
      state.files.push(action.payload);
    },
    removeFile: (state, action) => {
      state.files = state.files.filter(file => file.id !== action.payload);
    },
    setSelectedFile: (state, action) => {
      state.selectedFile = action.payload;
    },
    setCurrentFolder: (state, action) => {
      state.currentFolder = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const {
  setFiles,
  addFile,
  removeFile,
  setSelectedFile,
  setCurrentFolder,
  setLoading,
  setError,
} = filesSlice.actions;

export default filesSlice.reducer; 