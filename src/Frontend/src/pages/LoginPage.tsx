import React, { useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Divider
} from '@mui/material'
import { Building2, LogIn, ShieldCheck } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const DEMO_USERS = [
  { username: 'bilgi_sef', label: 'Bilgi İşlem - Şef', dept: 'Bilgi İşlem Müdürlüğü', title: 'Şef' },
  { username: 'bilgi_teminci', label: 'Bilgi İşlem - Teminci', dept: 'Bilgi İşlem Müdürlüğü', title: 'Teminci' },
  { username: 'mali_sef', label: 'Mali Hizmetler - Şef', dept: 'Mali Hizmetler Müdürlüğü', title: 'Şef' },
  { username: 'mali_teminci', label: 'Mali Hizmetler - Teminci', dept: 'Mali Hizmetler Müdürlüğü', title: 'Teminci' },
  { username: 'park_sef', label: 'Park ve Bahçeler - Şef', dept: 'Park ve Bahçeler Müdürlüğü', title: 'Şef' },
  { username: 'admin', label: 'Sistem Yöneticisi', dept: 'Bilgi İşlem Müdürlüğü', title: 'Şef' }
]

export const LoginPage: React.FC = () => {
  const { login, isLoading } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('123456')
  const [error, setError] = useState('')
  const [selectedDemo, setSelectedDemo] = useState('')

  const handleLogin = async () => {
    if (!username.trim()) {
      setError('Kullanıcı adı gereklidir.')
      return
    }
    setError('')
    const success = await login(username, password)
    if (!success) {
      setError('Giriş başarısız. Kullanıcı adı veya şifre hatalı.')
    }
  }

  const handleDemoSelect = (u: string) => {
    setSelectedDemo(u)
    setUsername(u)
    setPassword('123456')
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background decorations */}
      <Box sx={{
        position: 'absolute', inset: 0, overflow: 'hidden',
        '&::before': {
          content: '""', position: 'absolute',
          top: '-30%', right: '-20%', width: '600px', height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)'
        },
        '&::after': {
          content: '""', position: 'absolute',
          bottom: '-30%', left: '-20%', width: '500px', height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%)'
        }
      }} />

      <Box sx={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 460, px: 3 }}>
        {/* Header Logo */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box sx={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 72, height: 72, borderRadius: '20px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            boxShadow: '0 8px 32px rgba(59, 130, 246, 0.4)', mb: 2
          }}>
            <Building2 size={38} color="#ffffff" />
          </Box>
          <Typography variant="h4" sx={{ color: '#f8fafc', fontWeight: 800, letterSpacing: '-0.5px' }}>
            BBYS
          </Typography>
          <Typography variant="body2" sx={{ color: '#94a3b8', mt: 0.5 }}>
            Belediye Bilgi Yönetim Sistemi
          </Typography>
          <Chip
            icon={<ShieldCheck size={14} />}
            label="BELSİS Uyumlu Sistem"
            size="small"
            sx={{ mt: 1.5, backgroundColor: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.3)' }}
          />
        </Box>

        {/* Login Card */}
        <Card sx={{
          backgroundColor: 'rgba(30, 41, 59, 0.8)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '20px',
          boxShadow: '0 25px 50px rgba(0,0,0,0.5)'
        }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" sx={{ color: '#f8fafc', fontWeight: 700, mb: 3 }}>
              Sisteme Giriş
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '10px' }}>{error}</Alert>}

            {/* Demo User Quick Select */}
            <FormControl fullWidth size="small" sx={{ mb: 3 }}>
              <InputLabel sx={{ color: '#94a3b8' }}>Demo Kullanıcı Seç</InputLabel>
              <Select
                value={selectedDemo}
                label="Demo Kullanıcı Seç"
                onChange={(e) => handleDemoSelect(e.target.value)}
                sx={{
                  color: '#f8fafc', borderRadius: '10px',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' }
                }}
              >
                {DEMO_USERS.map((u) => (
                  <MenuItem key={u.username} value={u.username}>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{u.label}</Typography>
                      <Typography variant="caption" color="text.secondary">{u.dept} • {u.title}</Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Divider sx={{ mb: 3, borderColor: 'rgba(255,255,255,0.1)' }}>
              <Typography variant="caption" sx={{ color: '#94a3b8' }}>veya manuel giriş</Typography>
            </Divider>

            <TextField
              fullWidth
              label="Kullanıcı Adı"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              sx={{ mb: 2 }}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              slotProps={{
                inputLabel: { sx: { color: '#94a3b8' } },
                input: { sx: { color: '#f8fafc', borderRadius: '10px' } }
              }}
            />

            <TextField
              fullWidth
              label="Şifre"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ mb: 3 }}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              slotProps={{
                inputLabel: { sx: { color: '#94a3b8' } },
                input: { sx: { color: '#f8fafc', borderRadius: '10px' } }
              }}
            />

            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handleLogin}
              disabled={isLoading}
              startIcon={isLoading ? <CircularProgress size={18} color="inherit" /> : <LogIn size={20} />}
              sx={{
                py: 1.5, borderRadius: '12px', fontWeight: 700,
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)',
                '&:hover': { background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)' }
              }}
            >
              {isLoading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </Button>

            <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 2, color: '#64748b' }}>
              Demo şifre: <strong style={{ color: '#94a3b8' }}>123456</strong>
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  )
}
