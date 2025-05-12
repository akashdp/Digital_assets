import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Switch,
  FormControlLabel,
  Divider,
  Button,
  TextField,
  Grid,
} from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { toggleDarkMode } from '../store/slices/uiSlice';

const Settings = () => {
  const dispatch = useDispatch();
  const { darkMode } = useSelector((state) => state.ui);
  const [settings, setSettings] = useState({
    emailNotifications: true,
    autoSave: true,
    defaultView: 'grid',
    storageLimit: '10GB',
  });

  const handleToggle = (setting) => {
    setSettings({
      ...settings,
      [setting]: !settings[setting],
    });
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Appearance
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={darkMode}
                  onChange={() => dispatch(toggleDarkMode())}
                />
              }
              label="Dark Mode"
            />
            <Divider sx={{ my: 2 }} />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.defaultView === 'grid'}
                  onChange={() =>
                    setSettings({
                      ...settings,
                      defaultView: settings.defaultView === 'grid' ? 'list' : 'grid',
                    })
                  }
                />
              }
              label="Default Grid View"
            />
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Notifications
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.emailNotifications}
                  onChange={() => handleToggle('emailNotifications')}
                />
              }
              label="Email Notifications"
            />
            <Divider sx={{ my: 2 }} />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.autoSave}
                  onChange={() => handleToggle('autoSave')}
                />
              }
              label="Auto-save Changes"
            />
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Storage
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <TextField
                label="Storage Limit"
                value={settings.storageLimit}
                onChange={(e) =>
                  setSettings({ ...settings, storageLimit: e.target.value })
                }
                sx={{ width: 200 }}
              />
              <Button variant="contained" color="primary">
                Update Limit
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Settings; 