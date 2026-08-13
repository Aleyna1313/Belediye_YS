import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Badge,
  Menu,
  MenuItem,
  Chip,
  Tooltip,
  Avatar,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  Bell,
  Sun,
  Moon,
  CircleUser,
  Building2,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useThemeMode } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const { user, departments, switchDepartment, logout } = useAuth();
  const { mode, toggleTheme } = useThemeMode();
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfile = () => {
    handleMenuClose();
    navigate('/profile');
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
    navigate('/login');
  };

  return (
    <AppBar
      position="sticky"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backdropFilter: 'blur(16px)',
        backgroundColor: mode === 'dark' ? 'rgba(15, 23, 42, 0.85)' : 'rgba(255, 255, 255, 0.85)',
        color: mode === 'dark' ? '#f8fafc' : '#0f172a',
        boxShadow: mode === 'dark' ? '0 4px 20px rgba(0,0,0,0.4)' : '0 2px 10px rgba(0,0,0,0.05)',
        borderBottom: mode === 'dark' ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)'
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', minHeight: 70 }}>
        {/* Left Logo & Municipality Title */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)',
              color: '#ffffff'
            }}
          >
            <Building2 size={26} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.5px', lineHeight: 1.2 }}>
              BELEDİYE BBYS
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              Bilgi Yönetim Sistemi (BELSİS)
            </Typography>
          </Box>
        </Box>

        {/* Dynamic Department Switcher & Title Badge */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 2 }}>
          {/* Active Department Selection */}
          <FormControl size="small" sx={{ minWidth: 220 }}>
            <InputLabel id="dept-select-label">Aktif Müdürlük</InputLabel>
            <Select
              labelId="dept-select-label"
              value={user?.departmentId || 1}
              label="Aktif Müdürlük"
              onChange={(e) => switchDepartment(Number(e.target.value))}
              sx={{ borderRadius: '10px', fontSize: '0.875rem' }}
            >
              {departments.map((dept) => (
                <MenuItem key={dept.id} value={dept.id}>
                  {dept.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* User Title Chip: Strictly Şef or Teminci */}
          <Chip
            icon={user?.title === 'Teminci' ? <UserCheck size={16} /> : <ShieldCheck size={16} />}
            label={`Görevi: ${user?.title || 'Şef'}`}
            color={user?.title === 'Teminci' ? 'secondary' : 'primary'}
            variant="filled"
            sx={{ fontWeight: 700, px: 1, py: 2, borderRadius: '10px' }}
          />

          {/* Title Quick Toggle for testing */}
          <Tooltip title="Görevi Değiştir (Şef / Teminci Test)">
            <Chip
              label={user?.title === 'Şef' ? 'Teminci Yap' : 'Şef Yap'}
              variant="outlined"
              size="small"
              onClick={() => switchDepartment(user?.departmentId || 1, user?.title === 'Şef' ? 'Teminci' : 'Şef')}
              sx={{ cursor: 'pointer', borderRadius: '8px' }}
            />
          </Tooltip>
        </Box>

        {/* Right Tools & User Menu */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title={mode === 'dark' ? 'Açık Temaya Geç' : 'Koyu Temaya Geç'}>
            <IconButton onClick={toggleTheme} color="inherit">
              {mode === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </IconButton>
          </Tooltip>

          <Tooltip title="Bildirimler">
            <IconButton color="inherit" onClick={() => navigate('/notifications')}>
              <Badge badgeContent={3} color="error">
                <Bell size={20} />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* User Profile Badge */}
          <Box
            onClick={handleMenuOpen}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              ml: 1,
              p: '6px 12px',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
              '&:hover': {
                backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'
              }
            }}
          >
            <Avatar
              sx={{
                width: 36,
                height: 36,
                bgcolor: user?.title === 'Teminci' ? '#10b981' : '#3b82f6',
                fontWeight: 700,
                fontSize: '0.9rem'
              }}
            >
              {user?.fullName ? user.fullName.substring(0, 2).toUpperCase() : 'BY'}
            </Avatar>
            <Box sx={{ display: { xs: 'none', sm: 'block' }, textAlign: 'left' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.1 }}>
                {user?.fullName || 'Kullanıcı'}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {user?.departmentName || 'Müdürlük'}
              </Typography>
            </Box>
          </Box>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            slotProps={{
              paper: {
                sx: { mt: 1.5, minWidth: 200, borderRadius: '12px', p: 1 }
              }
            }}
          >
            <MenuItem onClick={handleProfile} sx={{ borderRadius: '8px', py: 1, gap: 1.5 }}>
              <CircleUser size={18} /> Profilim
            </MenuItem>
            <MenuItem onClick={() => { handleMenuClose(); navigate('/notifications'); }} sx={{ borderRadius: '8px', py: 1, gap: 1.5 }}>
              <Bell size={18} /> Bildirimler
            </MenuItem>
            <MenuItem onClick={handleLogout} sx={{ borderRadius: '8px', py: 1, color: 'error.main' }}>
              Çıkış Yap
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};
