import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import JudgeRequest from '../components/JudgeRequest'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Avatar,
  Chip,
  Grid,
  Divider,
  IconButton,
  Alert,
  CircularProgress,
  Container,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment
} from '@mui/material'
import {
  Edit,
  Save,
  Cancel,
  Person,
  Email,
  Phone,
  Home,
  Wc,
  CalendarToday,
  CloudUpload,
  CheckCircle,
  Pending,
  Cancel as CancelIcon,
  Gavel
} from '@mui/icons-material'
import { motion, AnimatePresence } from 'framer-motion'
import { styled } from '@mui/material/styles'

const StyledCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255,255,255,0.2)',
  borderRadius: 20,
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 40px 0 rgba(31, 38, 135, 0.5)',
  }
}))

const GradientButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
  borderRadius: 25,
  border: 0,
  color: 'white',
  height: 48,
  padding: '0 30px',
  boxShadow: '0 3px 5px 2px rgba(33, 150, 243, .3)',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'linear-gradient(45deg, #1976D2 30%, #1E88E5 90%)',
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 10px 4px rgba(33, 150, 243, .4)',
  }
}))

const Profile = () => {
  const { user, updateProfile } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(user?.profilePic || '')
  
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    phone: user?.phone || '',
    building: user?.building || '',
    flat: user?.flat || '',
    dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
    gender: user?.gender || '',
    profilePic: null
  })

  const handleChange = (e) => {
    const { name, value, files } = e.target
    
    if (name === 'profilePic' && files[0]) {
      const file = files[0]
      setSelectedFile(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => setPreviewUrl(e.target.result)
      reader.readAsDataURL(file)
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const updateData = {
        ...formData,
        profilePic: selectedFile
      }
      
      await updateProfile(updateData)
      setSuccess('Profile updated successfully!')
      setIsEditing(false)
      
      setTimeout(() => {
        setSuccess('')
      }, 3000)
    } catch (err) {
      setError(err.message || 'Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setFormData({
      username: user?.username || '',
      email: user?.email || '',
      phone: user?.phone || '',
      building: user?.building || '',
      flat: user?.flat || '',
      dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
      gender: user?.gender || '',
      profilePic: null
    })
    setSelectedFile(null)
    setPreviewUrl(user?.profilePic || '')
    setError('')
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning'
      case 'approved': return 'success'
      case 'rejected': return 'error'
      default: return 'default'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Pending />
      case 'approved': return <CheckCircle />
      case 'rejected': return <CancelIcon />
      default: return null
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Pending Review'
      case 'approved': return 'Approved'
      case 'rejected': return 'Rejected'
      default: return 'No Request'
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        py: 4
      }}
    >
      <Container maxWidth="lg">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Grid container spacing={4}>
            {/* Profile Header */}
            <Grid item xs={12}>
              <StyledCard>
                <CardContent sx={{ p: 4 }}>
                  <Box display="flex" alignItems="center" flexWrap="wrap" gap={3}>
                    <Box position="relative">
                      <Avatar
                        src={previewUrl}
                        sx={{ 
                          width: 120, 
                          height: 120,
                          border: '4px solid white',
                          boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
                        }}
                      >
                        {user?.username?.charAt(0)?.toUpperCase()}
                      </Avatar>
                      {isEditing && (
                        <IconButton
                          component="label"
                          sx={{
                            position: 'absolute',
                            bottom: 0,
                            right: 0,
                            backgroundColor: 'white',
                            boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                            '&:hover': { backgroundColor: 'grey.100' }
                          }}
                        >
                          <CloudUpload />
                          <input
                            type="file"
                            name="profilePic"
                            accept="image/*"
                            onChange={handleChange}
                            style={{ display: 'none' }}
                          />
                        </IconButton>
                      )}
                    </Box>
                    
                    <Box flex={1}>
                      <Typography variant="h4" fontWeight={700} gutterBottom>
                        {user?.username}
                      </Typography>
                      <Typography variant="body1" color="text.secondary" gutterBottom>
                        {user?.email}
                      </Typography>
                      
                      <Box display="flex" gap={2} flexWrap="wrap" mt={2}>
                        <Chip
                          label={user?.role?.toUpperCase()}
                          color={user?.role === 'admin' ? 'error' : 
                                 user?.role === 'judge' ? 'warning' : 'success'}
                          variant="filled"
                          sx={{ fontWeight: 600 }}
                        />
                        
                        {user?.judgeRequestStatus && user.judgeRequestStatus !== 'none' && (
                          <Chip
                            icon={getStatusIcon(user.judgeRequestStatus)}
                            label={getStatusText(user.judgeRequestStatus)}
                            color={getStatusColor(user.judgeRequestStatus)}
                            variant="outlined"
                            sx={{ fontWeight: 600 }}
                          />
                        )}
                      </Box>
                    </Box>
                    
                    <Box>
                      {!isEditing ? (
                        <Button
                          variant="contained"
                          startIcon={<Edit />}
                          onClick={() => setIsEditing(true)}
                          sx={{ borderRadius: 2 }}
                        >
                          Edit Profile
                        </Button>
                      ) : (
                        <Box display="flex" gap={1}>
                          <Button
                            variant="outlined"
                            onClick={handleCancel}
                            disabled={isLoading}
                          >
                            Cancel
                          </Button>
                          <GradientButton
                            onClick={handleSubmit}
                            disabled={isLoading}
                            startIcon={isLoading ? <CircularProgress size={20} /> : <Save />}
                          >
                            {isLoading ? 'Saving...' : 'Save Changes'}
                          </GradientButton>
                        </Box>
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </StyledCard>
            </Grid>

            {/* Profile Form */}
            <Grid item xs={12} md={8}>
              <StyledCard>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h5" fontWeight={600} gutterBottom>
                    Profile Information
                  </Typography>
                  
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        <Alert severity="error" sx={{ mb: 3 }}>
                          {error}
                        </Alert>
                      </motion.div>
                    )}
                    {success && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        <Alert severity="success" sx={{ mb: 3 }}>
                          {success}
                        </Alert>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Username"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        disabled={!isEditing}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Person />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={!isEditing}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Email />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Phone Number"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        disabled={!isEditing}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Phone />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Building Name"
                        name="building"
                        value={formData.building}
                        onChange={handleChange}
                        disabled={!isEditing}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Home />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Flat Number"
                        name="flat"
                        value={formData.flat}
                        onChange={handleChange}
                        disabled={!isEditing}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Home />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Date of Birth"
                        name="dateOfBirth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={handleChange}
                        disabled={!isEditing}
                        InputLabelProps={{ shrink: true }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <CalendarToday />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth disabled={!isEditing}>
                        <InputLabel>Gender</InputLabel>
                        <Select
                          name="gender"
                          value={formData.gender}
                          onChange={handleChange}
                          label="Gender"
                          startAdornment={
                            <InputAdornment position="start">
                              <Wc />
                            </InputAdornment>
                          }
                        >
                          <MenuItem value="male">Male</MenuItem>
                          <MenuItem value="female">Female</MenuItem>
                          <MenuItem value="other">Other</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Age"
                        value={user?.age || 'N/A'}
                        disabled
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Person />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </StyledCard>
            </Grid>

            {/* Judge Request */}
            <Grid item xs={12} md={4}>
              <JudgeRequest />
            </Grid>
          </Grid>
        </motion.div>
      </Container>
    </Box>
  )
}

export default Profile 