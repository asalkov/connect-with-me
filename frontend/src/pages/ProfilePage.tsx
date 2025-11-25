import { useEffect, useState, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Grid,
  TextField,
  Button,
  Divider,
  IconButton,
  CircularProgress,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  PhotoCamera,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { MainLayout } from '../components/layout';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchMyProfile,
  updateMyProfile,
  uploadAvatar,
  deleteAvatar,
  clearError,
} from '../store/slices/usersSlice';
import { UpdateProfileData } from '../types/user';

export const ProfilePage = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { currentUser, loading, error } = useAppSelector((state) => state.users);
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UpdateProfileData>({
    firstName: '',
    lastName: '',
    bio: '',
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  useEffect(() => {
    dispatch(fetchMyProfile());
  }, [dispatch]);

  useEffect(() => {
    if (currentUser) {
      setFormData({
        firstName: currentUser.firstName || '',
        lastName: currentUser.lastName || '',
        bio: currentUser.bio || '',
      });
    }
  }, [currentUser]);

  const getUserInitials = () => {
    const userData = currentUser || user;
    if (userData?.firstName && userData?.lastName) {
      return `${userData.firstName[0]}${userData.lastName[0]}`.toUpperCase();
    }
    return userData?.username?.[0]?.toUpperCase() || 'U';
  };

  const getAvatarUrl = () => {
    const userData = currentUser || user;
    if (avatarPreview) return avatarPreview;
    if (userData?.avatarUrl) return `${API_URL}${userData.avatarUrl}`;
    return null;
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (currentUser) {
      setFormData({
        firstName: currentUser.firstName || '',
        lastName: currentUser.lastName || '',
        bio: currentUser.bio || '',
      });
    }
    setAvatarPreview(null);
  };

  const handleSave = async () => {
    try {
      await dispatch(updateMyProfile(formData)).unwrap();
      setIsEditing(false);
      setShowSuccess(true);
    } catch (err) {
      console.error('Failed to update profile:', err);
    }
  };

  const handleAvatarClick = () => {
    if (isEditing) {
      fileInputRef.current?.click();
    }
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      // Validate file type
      if (!file.type.match(/^image\/(jpg|jpeg|png|gif|webp)$/)) {
        alert('Only image files (JPG, PNG, GIF, WEBP) are allowed');
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload avatar
      try {
        await dispatch(uploadAvatar(file)).unwrap();
        setShowSuccess(true);
      } catch (err) {
        console.error('Failed to upload avatar:', err);
        setAvatarPreview(null);
      }
    }
  };

  const handleDeleteAvatar = async () => {
    if (window.confirm('Are you sure you want to delete your avatar?')) {
      try {
        await dispatch(deleteAvatar()).unwrap();
        setAvatarPreview(null);
        setShowSuccess(true);
      } catch (err) {
        console.error('Failed to delete avatar:', err);
      }
    }
  };

  const handleChange = (field: keyof UpdateProfileData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleCloseSnackbar = () => {
    setShowSuccess(false);
    dispatch(clearError());
  };

  const userData = currentUser || user;

  return (
    <MainLayout>
      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          Profile
        </Typography>

        <Grid container spacing={3}>
          {/* Profile Header */}
          <Grid item xs={12}>
            <Paper elevation={2} sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
                <Box sx={{ position: 'relative' }}>
                  <Avatar
                    src={getAvatarUrl() || undefined}
                    sx={{
                      width: 100,
                      height: 100,
                      bgcolor: 'primary.main',
                      fontSize: '2.5rem',
                      cursor: isEditing ? 'pointer' : 'default',
                    }}
                    onClick={handleAvatarClick}
                  >
                    {!getAvatarUrl() && getUserInitials()}
                  </Avatar>
                  {isEditing && (
                    <>
                      <IconButton
                        sx={{
                          position: 'absolute',
                          bottom: -5,
                          right: -5,
                          bgcolor: 'primary.main',
                          color: 'white',
                          '&:hover': { bgcolor: 'primary.dark' },
                        }}
                        size="small"
                        onClick={handleAvatarClick}
                      >
                        <PhotoCamera fontSize="small" />
                      </IconButton>
                      {(getAvatarUrl() || userData?.avatarUrl) && (
                        <IconButton
                          sx={{
                            position: 'absolute',
                            top: -5,
                            right: -5,
                            bgcolor: 'error.main',
                            color: 'white',
                            '&:hover': { bgcolor: 'error.dark' },
                          }}
                          size="small"
                          onClick={handleDeleteAvatar}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      )}
                    </>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleAvatarChange}
                  />
                </Box>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h5" gutterBottom>
                    {userData?.firstName && userData?.lastName
                      ? `${userData.firstName} ${userData.lastName}`
                      : userData?.username}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    @{userData?.username}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {userData?.email}
                  </Typography>
                </Box>
                {!isEditing ? (
                  <Button variant="outlined" startIcon={<EditIcon />} onClick={handleEdit}>
                    Edit Profile
                  </Button>
                ) : (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="contained"
                      startIcon={<SaveIcon />}
                      onClick={handleSave}
                      disabled={loading}
                    >
                      {loading ? <CircularProgress size={20} /> : 'Save'}
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<CancelIcon />}
                      onClick={handleCancel}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                  </Box>
                )}
              </Box>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" gutterBottom>
                Profile Information
              </Typography>

              <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    value={formData.firstName}
                    onChange={handleChange('firstName')}
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    value={formData.lastName}
                    onChange={handleChange('lastName')}
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Username"
                    value={userData?.username || ''}
                    disabled
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    value={userData?.email || ''}
                    disabled
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Bio"
                    multiline
                    rows={3}
                    placeholder="Tell us about yourself..."
                    value={formData.bio}
                    onChange={handleChange('bio')}
                    disabled={!isEditing}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>

        {/* Success Snackbar */}
        <Snackbar
          open={showSuccess}
          autoHideDuration={3000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
            Profile updated successfully!
          </Alert>
        </Snackbar>

        {/* Error Snackbar */}
        <Snackbar
          open={!!error}
          autoHideDuration={5000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>
      </Box>
    </MainLayout>
  );
};
