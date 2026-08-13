import React from 'react';
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Divider,
  Chip
} from '@mui/material';
import {
  LayoutDashboard,
  FileSpreadsheet,
  FilePlus,
  ShoppingCart,
  Gavel,
  Bell,
  User,
  ShieldAlert
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useThemeMode } from '../context/ThemeContext';

const DRAWER_WIDTH = 260;

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { mode } = useThemeMode();

  const menuItems = [
    { text: 'Gösterge Paneli', icon: <LayoutDashboard size={20} />, path: '/' },
    { text: 'Yönetim Konsolu', icon: <FileSpreadsheet size={20} />, path: '/management-console' },
    { text: 'Talep Yönetimi', icon: <FilePlus size={20} />, path: '/requests' },
    { text: 'Satın Alma', icon: <ShoppingCart size={20} />, path: '/procurement' },
    { text: 'İhale Yönetimi', icon: <Gavel size={20} />, path: '/tenders' },
    { text: 'Bildirimler', icon: <Bell size={20} />, path: '/notifications' },
    { text: 'Profilim', icon: <User size={20} />, path: '/profile' }
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          top: 70,
          height: 'calc(100vh - 70px)',
          backgroundColor: mode === 'dark' ? '#0f172a' : '#ffffff',
          borderRight: mode === 'dark' ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
          px: 2,
          py: 3
        }
      }}
    >
      {/* Current Active Department Badge */}
      <Box
        sx={{
          p: 2,
          mb: 2,
          borderRadius: '12px',
          background: mode === 'dark'
            ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(30, 41, 59, 0.5) 100%)'
            : 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(241, 245, 249, 1) 100%)',
          border: mode === 'dark' ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid rgba(59, 130, 246, 0.2)'
        }}
      >
        <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Bağlı Müdürlük
        </Typography>
        <Typography variant="subtitle2" sx={{ fontWeight: 800, mt: 0.5, color: 'text.primary', lineHeight: 1.3 }}>
          {user?.departmentName || 'Müdürlük Seçilmedi'}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
          <Chip
            label={user?.title === 'Teminci' ? 'Teminci Yetkili' : 'Şef Onaycı'}
            size="small"
            color={user?.title === 'Teminci' ? 'secondary' : 'primary'}
            sx={{ height: 22, fontSize: '0.7rem', fontWeight: 700 }}
          />
        </Box>
      </Box>

      <Typography variant="caption" sx={{ px: 1.5, pb: 1, color: 'text.secondary', fontWeight: 700, letterSpacing: '0.8px' }}>
        ANA MODÜLLER
      </Typography>

      <List disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          return (
            <ListItemButton
              key={item.text}
              onClick={() => navigate(item.path)}
              sx={{
                borderRadius: '10px',
                py: 1.2,
                px: 2,
                transition: 'all 0.2s ease',
                backgroundColor: isActive
                  ? mode === 'dark' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(37, 99, 235, 0.1)'
                  : 'transparent',
                color: isActive ? 'primary.main' : 'text.secondary',
                '&:hover': {
                  backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                  color: 'text.primary'
                }
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 36,
                  color: isActive ? 'primary.main' : 'text.secondary'
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={
                  <span style={{ fontSize: '0.9rem', fontWeight: isActive ? 700 : 500 }}>
                    {item.text}
                  </span>
                }
              />
            </ListItemButton>
          );
        })}
      </List>

      <Divider sx={{ my: 3 }} />

      {/* Security & System Info Footer */}
      <Box sx={{ mt: 'auto', p: 1.5, textAlign: 'center', backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)', borderRadius: '10px' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.8, color: 'text.secondary', mb: 0.5 }}>
          <ShieldAlert size={14} />
          <Typography variant="caption" sx={{ fontWeight: 600 }}>
            Audit Log Aktif
          </Typography>
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.7rem' }}>
          BBYS v1.0.0 • RESTful API
        </Typography>
      </Box>
    </Drawer>
  );
};
