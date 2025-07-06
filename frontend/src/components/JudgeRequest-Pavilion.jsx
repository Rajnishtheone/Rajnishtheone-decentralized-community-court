import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Chip,
  Avatar,
  LinearProgress,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Gavel,
  Send,
  Close,
  CheckCircle,
  Pending,
  Cancel,
  Scale,
  Description
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { styled } from '@mui/material/styles';

const StyledCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255,255,255,0.2)',
  borderRadius: 16,
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 40px 0 rgba(31, 38, 135, 0.5)',
  }
}));

const GradientButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(45deg, #ff9800 30%, #ff5722 90%)',
  borderRadius: 25,
  border: 0,
  color: 'white',
  height: 48,
  padding: '0 30px',
  boxShadow: '0 3px 5px 2px rgba(255, 152, 0, .3)',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'linear-gradient(45deg, #f57c00 30%, #e64a19 90%)',
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 10px 4px rgba(255, 152, 0, .4)',
  }
}));

const JudgeRequest = () => {
  const { user, requestJudgeRole } = useAuth();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setReason('');
    setError('');
    setSuccess('');
  };

  const handleSubmit = async () => {
    if (!reason.trim()) {
      setError('Please provide a reason for your judge request');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await requestJudgeRole(reason);
      setSuccess('Judge request submitted successfully!');
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to submit judge request');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Pending />;
      case 'approved': return <CheckCircle />;
      case 'rejected': return <Cancel />;
      default: return <Scale />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Pending Review';
      case 'approved': return 'Approved';
      case 'rejected': return 'Rejected';
      default: return 'No Request';
    }
  };

  // Don't show if user is already admin or judge
  if (user?.role === 'admin' || user?.role === 'judge') {
    return null;
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <StyledCard>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <Avatar
                sx={{
                  background: 'linear-gradient(45deg, #ff9800, #ff5722)',
                  mr: 2
                }}
              >
                <Gavel />
              </Avatar>
              <Box flex={1}>
                <Typography variant="h6" fontWeight={600}>
                  Become a Judge
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Request elevated privileges to help resolve community cases
                </Typography>
              </Box>
            </Box>

            {user?.judgeRequestStatus && user.judgeRequestStatus !== 'none' ? (
              <Box>
                <Box display="flex" alignItems="center" mb={2}>
                  <Chip
                    icon={getStatusIcon(user.judgeRequestStatus)}
                    label={getStatusText(user.judgeRequestStatus)}
                    color={getStatusColor(user.judgeRequestStatus)}
                    variant="outlined"
                    sx={{ fontWeight: 600 }}
                  />
                </Box>
                
                {user.judgeRequestStatus === 'pending' && (
                  <Box>
                    <Typography variant="body2" color="text.secondary" mb={1}>
                      Your request is under review by administrators
                    </Typography>
                    <LinearProgress 
                      sx={{ 
                        height: 6, 
                        borderRadius: 3,
                        backgroundColor: 'rgba(255, 152, 0, 0.2)',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: '#ff9800'
                        }
                      }} 
                    />
                  </Box>
                )}

                {user.judgeRequestStatus === 'rejected' && user.judgeRequestReason && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    <Typography variant="body2">
                      <strong>Reason:</strong> {user.judgeRequestReason}
                    </Typography>
                  </Alert>
                )}

                {user.judgeRequestStatus === 'rejected' && (
                  <Button
                    variant="outlined"
                    onClick={handleOpen}
                    startIcon={<Send />}
                    sx={{ mt: 2 }}
                  >
                    Submit New Request
                  </Button>
                )}
              </Box>
            ) : (
              <Box>
                <Typography variant="body2" color="text.secondary" mb={3}>
                  As a judge, you'll be able to:
                </Typography>
                
                <Box mb={3}>
                  {[
                    'Review and resolve community cases',
                    'Make binding decisions on disputes',
                    'Access advanced case management tools',
                    'Help maintain community harmony'
                  ].map((benefit, index) => (
                    <motion.div
                      key={benefit}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <Box display="flex" alignItems="center" mb={1}>
                        <CheckCircle 
                          sx={{ 
                            fontSize: 16, 
                            color: 'success.main', 
                            mr: 1 
                          }} 
                        />
                        <Typography variant="body2">
                          {benefit}
                        </Typography>
                      </Box>
                    </motion.div>
                  ))}
                </Box>

                <GradientButton
                  fullWidth
                  onClick={handleOpen}
                  startIcon={<Send />}
                >
                  Request Judge Role
                </GradientButton>
              </Box>
            )}
          </CardContent>
        </StyledCard>
      </motion.div>

      {/* Request Dialog */}
      <Dialog 
        open={open} 
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
            backdropFilter: 'blur(10px)',
          }
        }}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center">
              <Avatar
                sx={{
                  background: 'linear-gradient(45deg, #ff9800, #ff5722)',
                  mr: 2
                }}
              >
                <Gavel />
              </Avatar>
              <Typography variant="h6" fontWeight={600}>
                Request Judge Role
              </Typography>
            </Box>
            <IconButton onClick={handleClose}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Please explain why you would like to become a judge and how you can contribute to the community justice system.
          </Typography>

          <TextField
            fullWidth
            multiline
            rows={4}
            label="Reason for Request"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Describe your motivation, relevant experience, and how you plan to contribute to the community justice system..."
            variant="outlined"
            sx={{ mb: 2 }}
          />

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Alert severity="error" sx={{ mb: 2 }}>
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
                <Alert severity="success" sx={{ mb: 2 }}>
                  {success}
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <GradientButton
            onClick={handleSubmit}
            disabled={isLoading || !reason.trim()}
            startIcon={isLoading ? <LinearProgress size={20} /> : <Send />}
          >
            {isLoading ? 'Submitting...' : 'Submit Request'}
          </GradientButton>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default JudgeRequest; 