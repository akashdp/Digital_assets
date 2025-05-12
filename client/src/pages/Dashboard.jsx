import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Typography,
  IconButton,
  Button,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  useTheme,
  alpha
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Folder as FolderIcon,
  Tag as TagIcon,
  Storage as StorageIcon,
  Search as SearchIcon,
  Add as AddIcon,
  MoreVert as MoreIcon,
  Description as FileIcon
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFiles } from '../store/slices/fileSlice';
import FileList from '../components/files/FileList';
import FileUpload from '../components/files/FileUpload';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import TextField from '@mui/material/TextField';

const StatCard = ({ title, value, icon, color }) => {
  const theme = useTheme();
  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        background: `linear-gradient(45deg, ${alpha(color, 0.08)}, ${alpha(color, 0.16)})`,
        borderRadius: 3,
        boxShadow: '0 4px 20px rgba(0,0,0,0.04)'
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar sx={{ bgcolor: color, width: 48, height: 48, mr: 2 }}>{icon}</Avatar>
          <Typography variant="h6" color="text.secondary">
            {title}
          </Typography>
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: color }}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
};

const RecentActivity = ({ activities }) => {
  return (
    <Card sx={{ height: '100%', borderRadius: 3, display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flex: 1 }}>
        <Typography variant="h6" gutterBottom>
          Recent Activity
        </Typography>
        <List>
          {activities.map((activity, index) => (
            <React.Fragment key={index}>
              <ListItem>
                <ListItemIcon>
                  <Avatar sx={{ bgcolor: activity.color }}>{activity.icon}</Avatar>
                </ListItemIcon>
                <ListItemText primary={activity.title} secondary={activity.time} />
              </ListItem>
              {index < activities.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

const QuickActions = ({ onUpload, onNewFolder }) => {
  return (
    <Card sx={{ height: '100%', borderRadius: 3, display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flex: 1 }}>
        <Typography variant="h6" gutterBottom>
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Button fullWidth variant="contained" startIcon={<UploadIcon />} sx={{ mb: 1 }} onClick={onUpload}>
              Upload File
            </Button>
          </Grid>
          <Grid item xs={6}>
            <Button fullWidth variant="outlined" startIcon={<FolderIcon />} sx={{ mb: 1 }} onClick={onNewFolder}>
              New Folder
            </Button>
          </Grid>
          <Grid item xs={6}>
            <Button fullWidth variant="outlined" startIcon={<TagIcon />}>Add Tags</Button>
          </Grid>
          <Grid item xs={6}>
            <Button fullWidth variant="outlined" startIcon={<SearchIcon />}>Search</Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

const Dashboard = () => {
  const dispatch = useDispatch();
  const { files } = useSelector((state) => state.files);
  const { user } = useSelector((state) => state.auth);
  const theme = useTheme();

  const [recentActivities] = useState([
    {
      title: 'New file uploaded: presentation.pdf',
      time: '2 minutes ago',
      icon: <FileIcon />,
      color: theme.palette.primary.main
    },
    {
      title: 'Folder created: Project Assets',
      time: '1 hour ago',
      icon: <FolderIcon />,
      color: theme.palette.success.main
    },
    {
      title: 'Tags updated: Marketing',
      time: '3 hours ago',
      icon: <TagIcon />,
      color: theme.palette.warning.main
    }
  ]);

  const [uploadOpen, setUploadOpen] = useState(false);
  const [folderOpen, setFolderOpen] = useState(false);
  const [folderName, setFolderName] = useState('');

  const handleUploadClick = () => setUploadOpen(true);
  const handleUploadClose = () => setUploadOpen(false);

  const handleFolderClick = () => setFolderOpen(true);
  const handleFolderClose = () => setFolderOpen(false);
  const handleFolderCreate = () => {
    // TODO: Implement folder creation logic (API call)
    setFolderOpen(false);
    setFolderName('');
  };

  useEffect(() => {
    dispatch(fetchFiles());
  }, [dispatch]);

  return (
    <Box sx={{ p: { xs: 1, md: 4 }, background: theme.palette.grey[50], minHeight: '100vh' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Welcome back, {user?.name}
        </Typography>
      </Box>
      <Grid container spacing={3} alignItems="stretch">
        {/* Statistics Cards */}
        <Grid item xs={12} md={4}>
          <StatCard
            title="Total Files"
            value={files.length}
            icon={<FileIcon />}
            color={theme.palette.primary.main}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Storage Used"
            value="2.4 GB"
            icon={<StorageIcon />}
            color={theme.palette.success.main}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Total Tags"
            value="12"
            icon={<TagIcon />}
            color={theme.palette.warning.main}
          />
        </Grid>
        {/* Recent Activity and Quick Actions */}
        <Grid item xs={12} md={8} sx={{ display: 'flex', flexDirection: 'column' }}>
          <RecentActivity activities={recentActivities} />
        </Grid>
        <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column' }}>
          <QuickActions
            onUpload={handleUploadClick}
            onNewFolder={handleFolderClick}
          />
        </Grid>
        {/* File Management Section */}
        <Grid item xs={12}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Recent Files</Typography>
                <IconButton>
                  <MoreIcon />
                </IconButton>
              </Box>
              <FileList files={files} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Dialog open={uploadOpen} onClose={handleUploadClose} maxWidth="sm" fullWidth>
        <DialogTitle>Upload File</DialogTitle>
        <DialogContent>
          <FileUpload onClose={handleUploadClose} />
        </DialogContent>
      </Dialog>
      <Dialog open={folderOpen} onClose={handleFolderClose}>
        <DialogTitle>Create New Folder</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Folder Name"
            fullWidth
            value={folderName}
            onChange={e => setFolderName(e.target.value)}
          />
          <Button onClick={handleFolderCreate} variant="contained" sx={{ mt: 2 }}>
            Create
          </Button>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Dashboard; 