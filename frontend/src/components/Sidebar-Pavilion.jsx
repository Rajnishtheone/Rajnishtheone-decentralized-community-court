import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Typography,
  Avatar,
  Divider,
  Chip,
  Badge,
  Tooltip,
  Fab
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  Gavel,
  Description,
  Comment,
  Person,
  Settings,
  Logout,
  Home,
  Notifications,
  Close,
  Scale,
  AdminPanelSettings,
  Group,
  ChevronLeft,
  ChevronRight,
  Search
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { styled } from '@mui/material/styles';

const drawerWidth = 280;
const collapsedWidth = 70;

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    width: drawerWidth,
    background: 'linear-gradient(180deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%)',
    color: 'white',
    border: 'none',
    boxShadow: '4px 0 20px rgba(0,0,0,0.15)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '&::-webkit-scrollbar': {
      width: '6px',
    },
    '&::-webkit-scrollbar-track': {
      background: 'rgba(255,255,255,0.1)',
    },
    '&::-webkit-scrollbar-thumb': {
      background: 'rgba(255,255,255,0.3)',
      borderRadius: '3px',
    },
  },
}));

const StyledListItemButton = styled(ListItemButton)(({ theme, active }) => ({
  margin: '6px 12px',
  borderRadius: '12px',
  color: active ? '#1e40af' : 'white',
  backgroundColor: active ? 'rgba(255,255,255,0.95)' : 'transparent',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    backgroundColor: active ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.15)',
    transform: 'translateX(6px) scale(1.02)',
    boxShadow: active ? '0 4px 12px rgba(0,0,0,0.15)' : '0 2px 8px rgba(0,0,0,0.1)',
  },
  '& .MuiListItemIcon-root': {
    color: active ? '#1e40af' : 'white',
    transition: 'all 0.3s ease',
  },
  '& .MuiListItemText-primary': {
    fontWeight: active ? 600 : 500,
    transition: 'all 0.3s ease',
  },
}));

const Sidebar = ({ open, onClose }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const { user, logout, isAdmin, isJudge, isMember } = useAuth();

  const handleDrawerToggle = () => {
    onClose();
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const menuItems = [
    { text: 'Home', icon: <Home />, path: '/', show: true },
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard', show: true },
    { text: 'Cases', icon: <Gavel />, path: '/cases', show: true },
    { text: 'Verifications', icon: <Search />, path: '/verifications', show: isAdmin || isJudge },
    { text: 'Documents', icon: <Description />, path: '/documents', show: true },
    { text: 'Comments', icon: <Comment />, path: '/comments', show: true },
    { text: 'Profile', icon: <Person />, path: '/profile', show: true },
    { text: 'Settings', icon: <Settings />, path: '/settings', show: true },
    { text: 'Admin Panel', icon: <AdminPanelSettings />, path: '/admin', show: isAdmin },
    { text: 'Judge Panel', icon: <Gavel />, path: '/judge', show: isJudge },
  ];

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ p: 3, textAlign: 'center', position: 'relative' }}>
          <IconButton
            onClick={handleDrawerToggle}
            sx={{ 
              position: 'absolute', 
              top: 16, 
              right: 16, 
              color: 'white',
              backgroundColor: 'rgba(255,255,255,0.1)',
              '&:hover': { 
                backgroundColor: 'rgba(255,255,255,0.2)',
                transform: 'rotate(90deg)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            <Close />
          </IconButton>
          
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Scale sx={{ fontSize: 48, mb: 2, filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))' }} />
          </motion.div>
          
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
            DCC Court
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500 }}>
            Community Justice System
          </Typography>
        </Box>
      </motion.div>

      <Divider sx={{ backgroundColor: 'rgba(255,255,255,0.2)', mx: 2 }} />

      {/* User Info */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar
              src={user?.profilePic}
              sx={{ 
                width: 48, 
                height: 48, 
                mr: 2,
                border: '3px solid rgba(255,255,255,0.3)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              }}
            >
              {user?.username?.charAt(0)?.toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>
                {user?.username}
              </Typography>
              <Chip
                label={user?.role?.toUpperCase()}
                size="small"
                sx={{
                  backgroundColor: user?.role === 'admin' ? '#ef4444' : 
                                 user?.role === 'judge' ? '#f59e0b' : '#10b981',
                  color: 'white',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                }}
              />
            </Box>
          </Box>
        </Box>
      </motion.div>

      <Divider sx={{ backgroundColor: 'rgba(255,255,255,0.2)', mx: 2 }} />

      {/* Navigation Menu */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <List sx={{ pt: 1 }}>
          <AnimatePresence>
            {menuItems.filter(item => item.show).map((item, index) => {
              const isActive = location.pathname === item.path;
              return (
                <motion.div
                  key={item.text}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <ListItem disablePadding>
                    <StyledListItemButton
                      component={Link}
                      to={item.path}
                      active={isActive ? 1 : 0}
                      onClick={handleDrawerToggle}
                    >
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        {item.text === 'Comments' ? (
                          <Badge badgeContent={3} color="error">
                            {item.icon}
                          </Badge>
                        ) : (
                          item.icon
                        )}
                      </ListItemIcon>
                      <ListItemText 
                        primary={item.text}
                        primaryTypographyProps={{
                          fontWeight: isActive ? 600 : 500,
                          fontSize: '0.95rem',
                          textShadow: isActive ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                        }}
                      />
                    </StyledListItemButton>
                  </ListItem>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </List>
      </Box>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Box sx={{ p: 2 }}>
          <Divider sx={{ backgroundColor: 'rgba(255,255,255,0.2)', mb: 2 }} />
          <StyledListItemButton onClick={logout}>
            <ListItemIcon>
              <Logout />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </StyledListItemButton>
        </Box>
      </motion.div>
    </Box>
  );

  return (
    <StyledDrawer
      variant="temporary"
      open={open}
      onClose={onClose}
      ModalProps={{
        keepMounted: true, // Better open performance on mobile.
      }}
      sx={{
        display: { xs: 'block' },
        '& .MuiDrawer-paper': { 
          boxSizing: 'border-box', 
          width: drawerWidth,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        },
      }}
    >
      {drawerContent}
    </StyledDrawer>
  );
};

export default Sidebar; 