import React, { useState } from 'react'
import {
  Box, Card, CardContent, Typography, Button, Chip, Divider,
  Avatar, Grid, TextField, Dialog, DialogTitle, DialogContent,
  DialogActions, Alert, Switch, FormControlLabel, LinearProgress,
  Table, TableBody, TableCell, TableHead, TableRow, Tabs, Tab
} from '@mui/material'
import {
  User, Mail, Phone, Building2, Shield, Clock, Edit,
  Save, Key, Eye, EyeOff, Activity, LogIn, LogOut,
  Monitor, MapPin, Briefcase, Award, Calendar, Settings
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import type { AuditLogModel } from '../types'

const DEMO_AUDIT_LOGS: AuditLogModel[] = [
  { id: 1, userId: 2, username: 'bilgi_sef', action: 'Talep Oluşturma', module: 'Talepler', details: 'TAL-2026-0012 numaralı talep oluşturuldu', ipAddress: '192.168.1.45', timestamp: '2026-08-08T09:00:00Z' },
  { id: 2, userId: 2, username: 'bilgi_sef', action: 'Giriş', module: 'Kimlik Doğrulama', details: 'Başarılı giriş', ipAddress: '192.168.1.45', timestamp: '2026-08-08T08:30:00Z' },
  { id: 3, userId: 2, username: 'bilgi_sef', action: 'Evrak Görüntüleme', module: 'Yönetim Konsolu', details: 'EVR-TALEP-0001 numaralı evrak görüntülendi', ipAddress: '192.168.1.45', timestamp: '2026-08-07T15:00:00Z' },
  { id: 4, userId: 2, username: 'bilgi_sef', action: 'İhale Teklif Ekleme', module: 'İhaleler', details: 'IHL-2026-0001 numaralı ihaleye teklif eklendi', ipAddress: '192.168.1.45', timestamp: '2026-08-07T11:30:00Z' },
  { id: 5, userId: 2, username: 'bilgi_sef', action: 'Malzeme Görüntüleme', module: 'Satın Alma', details: 'MAL-150-001 kodlu malzeme detayı görüntülendi', ipAddress: '192.168.1.45', timestamp: '2026-08-06T16:00:00Z' },
  { id: 6, userId: 2, username: 'bilgi_sef', action: 'Profil Güncelleme', module: 'Profil', details: 'Telefon numarası güncellendi', ipAddress: '192.168.1.45', timestamp: '2026-08-05T14:00:00Z' },
  { id: 7, userId: 2, username: 'bilgi_sef', action: 'Çıkış', module: 'Kimlik Doğrulama', details: 'Oturum sonlandırıldı', ipAddress: '192.168.1.45', timestamp: '2026-08-05T18:00:00Z' },
  { id: 8, userId: 2, username: 'bilgi_sef', action: 'Giriş', module: 'Kimlik Doğrulama', details: 'Başarılı giriş', ipAddress: '192.168.1.45', timestamp: '2026-08-05T08:45:00Z' }
]

const ACTION_COLORS: Record<string, string> = {
  'Giriş': '#10b981',
  'Çıkış': '#64748b',
  'Talep Oluşturma': '#3b82f6',
  'Evrak Görüntüleme': '#06b6d4',
  'İhale Teklif Ekleme': '#8b5cf6',
  'Malzeme Görüntüleme': '#f59e0b',
  'Profil Güncelleme': '#ec4899'
}

export const ProfilePage: React.FC = () => {
  const { user, departments, switchDepartment } = useAuth()
  const [tabValue, setTabValue] = useState(0)

  // Profile edit
  const [editOpen, setEditOpen] = useState(false)
  const [editPhone, setEditPhone] = useState(user?.phone || '')
  const [editEmail, setEditEmail] = useState(user?.email || '')

  // Password change
  const [passwordOpen, setPasswordOpen] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Department switch
  const [deptDialogOpen, setDeptDialogOpen] = useState(false)
  const [selectedDeptId, setSelectedDeptId] = useState(user?.departmentId || 1)
  const [selectedTitle, setSelectedTitle] = useState<'Şef' | 'Teminci'>(user?.title as 'Şef' | 'Teminci' || 'Şef')

  const [auditLogs] = useState<AuditLogModel[]>(DEMO_AUDIT_LOGS)

  const handleSaveProfile = () => {
    // In demo mode, just close dialog
    setEditOpen(false)
  }

  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) return
    setPasswordOpen(false)
    setCurrentPassword(''); setNewPassword(''); setConfirmPassword('')
  }

  const handleSwitchDepartment = () => {
    switchDepartment(selectedDeptId, selectedTitle)
    setDeptDialogOpen(false)
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <Box>
      {/* Profile Header Card */}
      <Card sx={{ mb: 4, overflow: 'visible' }}>
        <Box sx={{
          height: 120,
          background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #06b6d4 100%)',
          borderRadius: '12px 12px 0 0',
          position: 'relative'
        }} />
        <CardContent sx={{ pt: 0, px: 4, pb: 3, position: 'relative' }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 3, mt: -6 }}>
            <Avatar sx={{
              width: 100, height: 100, fontSize: '2rem', fontWeight: 800,
              bgcolor: '#1e293b', border: '4px solid', borderColor: 'background.paper',
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
            }}>
              {user?.fullName ? getInitials(user.fullName) : 'U'}
            </Avatar>
            <Box sx={{ flex: 1, mb: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>{user?.fullName || 'Kullanıcı'}</Typography>
              <Typography variant="body2" color="text.secondary">@{user?.username}</Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <Button variant="outlined" startIcon={<Edit size={16} />} onClick={() => setEditOpen(true)} sx={{ borderRadius: '10px' }}>
                Düzenle
              </Button>
              <Button variant="outlined" color="secondary" startIcon={<Building2 size={16} />} onClick={() => setDeptDialogOpen(true)} sx={{ borderRadius: '10px' }}>
                Müdürlük Değiştir
              </Button>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
            <Chip icon={<Briefcase size={14} />} label={user?.title || 'Yetki Yok'}
              color={user?.title === 'Teminci' ? 'secondary' : 'primary'} sx={{ fontWeight: 700 }} />
            <Chip icon={<Shield size={14} />} label={user?.role === 'Admin' ? 'Yönetici' : 'Kullanıcı'}
              variant="outlined" sx={{ fontWeight: 700 }} />
            <Chip icon={<Building2 size={14} />} label={user?.departmentName || '—'} variant="outlined" sx={{ fontWeight: 700 }} />
          </Box>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ mb: 3, '& .MuiTab-root': { fontWeight: 700, textTransform: 'none' } }}>
        <Tab label="Kişisel Bilgiler" icon={<User size={16} />} iconPosition="start" />
        <Tab label="Güvenlik" icon={<Shield size={16} />} iconPosition="start" />
        <Tab label="İşlem Geçmişi" icon={<Activity size={16} />} iconPosition="start" />
      </Tabs>

      {/* Tab 0: Personal Info */}
      {tabValue === 0 && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2.5 }}>İletişim Bilgileri</Typography>
                <Divider sx={{ mb: 2.5 }} />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  {[
                    { icon: <User size={18} />, label: 'Ad Soyad', value: user?.fullName || '—' },
                    { icon: <Mail size={18} />, label: 'E-posta', value: user?.email || '—' },
                    { icon: <Phone size={18} />, label: 'Telefon', value: user?.phone || '—' },
                    { icon: <Monitor size={18} />, label: 'Kullanıcı Adı', value: user?.username || '—' }
                  ].map(item => (
                    <Box key={item.label} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ width: 36, height: 36, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'action.hover', color: 'primary.main' }}>
                        {item.icon}
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>{item.label}</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{item.value}</Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2.5 }}>Kurum Bilgileri</Typography>
                <Divider sx={{ mb: 2.5 }} />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  {[
                    { icon: <Building2 size={18} />, label: 'Müdürlük', value: user?.departmentName || '—' },
                    { icon: <Briefcase size={18} />, label: 'Unvan', value: user?.title || '—' },
                    { icon: <Shield size={18} />, label: 'Sistem Rolü', value: user?.role === 'Admin' ? 'Yönetici' : 'Kullanıcı' },
                    { icon: <Award size={18} />, label: 'Müdürlük Kodu', value: user?.departmentCode || '—' }
                  ].map(item => (
                    <Box key={item.label} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ width: 36, height: 36, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'action.hover', color: 'secondary.main' }}>
                        {item.icon}
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>{item.label}</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{item.value}</Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Role Permissions */}
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Yetki Matrisi</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                  {user?.title === 'Şef' ? 'Şef rolü talep oluşturma, onaylama ve ihale başlatma yetkisine sahiptir.' : 'Teminci rolü piyasa fiyat araştırması yapma ve teklif toplama yetkisine sahiptir.'}
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  {[
                    { perm: 'Talep Oluşturma', sef: true, teminci: false },
                    { perm: 'Talep Onaylama', sef: true, teminci: false },
                    { perm: 'İhale Başlatma', sef: true, teminci: false },
                    { perm: 'Piyasa Araştırması', sef: false, teminci: true },
                    { perm: 'Teklif Toplama', sef: false, teminci: true },
                    { perm: 'Evrak Görüntüleme', sef: true, teminci: true },
                    { perm: 'Stok Takibi', sef: true, teminci: true },
                    { perm: 'Bildirim Alma', sef: true, teminci: true }
                  ].map(p => {
                    const hasPermission = user?.title === 'Teminci' ? p.teminci : p.sef
                    return (
                      <Grid size={{ xs: 12, sm: 6, md: 3 }} key={p.perm}>
                        <Box sx={{
                          display: 'flex', alignItems: 'center', gap: 1.5,
                          p: 1.5, borderRadius: '10px',
                          backgroundColor: hasPermission ? 'rgba(16, 185, 129, 0.06)' : 'rgba(239, 68, 68, 0.04)'
                        }}>
                          {hasPermission ? (
                            <Box sx={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: '#10b98122', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Shield size={12} />
                            </Box>
                          ) : (
                            <Box sx={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: '#ef444422', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <EyeOff size={12} />
                            </Box>
                          )}
                          <Typography variant="caption" sx={{
                            fontWeight: 700,
                            color: hasPermission ? 'text.primary' : 'text.secondary'
                          }}>
                            {p.perm}
                          </Typography>
                        </Box>
                      </Grid>
                    )
                  })}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Tab 1: Security */}
      {tabValue === 1 && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
                  <Key size={20} />
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>Şifre Yönetimi</Typography>
                </Box>
                <Divider sx={{ mb: 2.5 }} />
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Güvenliğiniz için şifrenizi düzenli aralıklarla değiştirmeniz önerilir.
                </Typography>
                <Box sx={{ p: 2, borderRadius: '10px', backgroundColor: 'action.hover', mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>Şifre Gücü</Typography>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#10b981' }}>Güçlü</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={85} sx={{
                    height: 8, borderRadius: 4,
                    backgroundColor: 'rgba(100,116,139,0.1)',
                    '& .MuiLinearProgress-bar': { borderRadius: 4, backgroundColor: '#10b981' }
                  }} />
                </Box>
                <Button variant="contained" startIcon={<Key size={16} />} fullWidth
                  onClick={() => setPasswordOpen(true)} sx={{ borderRadius: '10px' }}>
                  Şifre Değiştir
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
                  <Settings size={20} />
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>Oturum Bilgileri</Typography>
                </Box>
                <Divider sx={{ mb: 2.5 }} />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {[
                    { icon: <Clock size={16} />, label: 'Son Giriş', value: '08 Ağustos 2026, 08:30' },
                    { icon: <MapPin size={16} />, label: 'IP Adresi', value: '192.168.1.45' },
                    { icon: <Monitor size={16} />, label: 'Cihaz', value: 'Windows 11 — Chrome 127' },
                    { icon: <Calendar size={16} />, label: 'Hesap Oluşturma', value: '15 Ocak 2026' }
                  ].map(item => (
                    <Box key={item.label} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box sx={{ color: 'text.secondary' }}>{item.icon}</Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>{item.label}</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{item.value}</Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>

                <Alert severity="success" sx={{ mt: 2.5, borderRadius: '10px' }}>
                  Oturumunuz aktif ve güvenli durumda.
                </Alert>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Tab 2: Audit Logs */}
      {tabValue === 2 && (
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Activity size={20} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>İşlem Geçmişi (Audit Log)</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Sistemdeki tüm işlemleriniz güvenlik amacıyla kayıt altına alınmaktadır.
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </CardContent>
          <CardContent sx={{ p: 0 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, pl: 3 }}>Tarih / Saat</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>İşlem</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Modül</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Detay</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>IP Adresi</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {auditLogs.map(log => (
                  <TableRow key={log.id} hover>
                    <TableCell sx={{ pl: 3 }}>
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        {new Date(log.timestamp).toLocaleDateString('tr-TR')}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        {new Date(log.timestamp).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={log.action}
                        size="small"
                        sx={{
                          fontWeight: 700, fontSize: '0.7rem',
                          backgroundColor: `${ACTION_COLORS[log.action] || '#64748b'}22`,
                          color: ACTION_COLORS[log.action] || '#64748b'
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{log.module}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 300 }}>
                        {log.details}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>{log.ipAddress}</Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Edit Profile Dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Edit size={20} />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Profil Düzenle</Typography>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            <TextField label="Ad Soyad" fullWidth value={user?.fullName || ''} disabled
              helperText="Ad soyad değişikliği için sistem yöneticisine başvurunuz." />
            <TextField label="E-posta" fullWidth value={editEmail} onChange={e => setEditEmail(e.target.value)} />
            <TextField label="Telefon" fullWidth value={editPhone} onChange={e => setEditPhone(e.target.value)} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setEditOpen(false)}>İptal</Button>
          <Button variant="contained" startIcon={<Save size={16} />} onClick={handleSaveProfile}>
            Kaydet
          </Button>
        </DialogActions>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={passwordOpen} onClose={() => setPasswordOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Key size={20} />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Şifre Değiştir</Typography>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            <TextField label="Mevcut Şifre" fullWidth type={showPassword ? 'text' : 'password'}
              value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}
              slotProps={{ input: {
                endAdornment: (
                  <Button size="small" onClick={() => setShowPassword(!showPassword)} sx={{ minWidth: 0 }}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </Button>
                )
              }}}
            />
            <TextField label="Yeni Şifre" fullWidth type={showPassword ? 'text' : 'password'}
              value={newPassword} onChange={e => setNewPassword(e.target.value)} />
            <TextField label="Yeni Şifre (Tekrar)" fullWidth type={showPassword ? 'text' : 'password'}
              value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
              error={confirmPassword.length > 0 && newPassword !== confirmPassword}
              helperText={confirmPassword.length > 0 && newPassword !== confirmPassword ? 'Şifreler eşleşmiyor' : ''}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setPasswordOpen(false)}>İptal</Button>
          <Button variant="contained" startIcon={<Key size={16} />} onClick={handleChangePassword}
            disabled={!currentPassword || !newPassword || newPassword !== confirmPassword}>
            Şifreyi Değiştir
          </Button>
        </DialogActions>
      </Dialog>

      {/* Department Switch Dialog */}
      <Dialog open={deptDialogOpen} onClose={() => setDeptDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Building2 size={20} />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Müdürlük ve Rol Değiştir</Typography>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Demo modunda farklı müdürlük ve rollerde sistemi deneyimleyebilirsiniz.
          </Typography>

          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>Müdürlük Seçin</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
            {departments.map(dept => (
              <Card key={dept.id} variant="outlined" sx={{
                cursor: 'pointer',
                borderColor: selectedDeptId === dept.id ? 'primary.main' : 'divider',
                backgroundColor: selectedDeptId === dept.id ? 'rgba(59, 130, 246, 0.06)' : 'transparent',
                transition: 'all 0.2s'
              }} onClick={() => setSelectedDeptId(dept.id)}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>{dept.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{dept.description}</Typography>
                    </Box>
                    <Chip label={`${dept.userCount} kişi`} size="small" variant="outlined" />
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>

          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>Rol Seçin</Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Card variant="outlined" sx={{
              flex: 1, cursor: 'pointer',
              borderColor: selectedTitle === 'Şef' ? 'primary.main' : 'divider',
              backgroundColor: selectedTitle === 'Şef' ? 'rgba(59, 130, 246, 0.06)' : 'transparent'
            }} onClick={() => setSelectedTitle('Şef')}>
              <CardContent sx={{ p: 2, textAlign: 'center', '&:last-child': { pb: 2 } }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Şef (Onaycı)</Typography>
                <Typography variant="caption" color="text.secondary">Talep onayı ve ihale başlatma</Typography>
              </CardContent>
            </Card>
            <Card variant="outlined" sx={{
              flex: 1, cursor: 'pointer',
              borderColor: selectedTitle === 'Teminci' ? 'secondary.main' : 'divider',
              backgroundColor: selectedTitle === 'Teminci' ? 'rgba(16, 185, 129, 0.06)' : 'transparent'
            }} onClick={() => setSelectedTitle('Teminci')}>
              <CardContent sx={{ p: 2, textAlign: 'center', '&:last-child': { pb: 2 } }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Teminci (Yetkili)</Typography>
                <Typography variant="caption" color="text.secondary">Piyasa araştırması ve teklif toplama</Typography>
              </CardContent>
            </Card>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeptDialogOpen(false)}>İptal</Button>
          <Button variant="contained" startIcon={<Building2 size={16} />} onClick={handleSwitchDepartment}>
            Uygula
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}