import React, { useState, useEffect } from 'react'
import {
  Box, Card, CardContent, Typography, Button, Chip, Divider,
  IconButton, Tooltip, CircularProgress, Avatar, Grid,
  Tabs, Tab, Badge, Collapse
} from '@mui/material'
import {
  Bell, BellOff, Check, CheckCheck, Trash2, Eye,
  FileText, Gavel, Package, AlertTriangle, Info,
  ShieldCheck, Clock, ChevronDown, ChevronUp, Filter
} from 'lucide-react'
import type { NotificationModel } from '../types'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

const NOTIF_TYPES: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  'talep': { icon: <FileText size={18} />, color: '#3b82f6', label: 'Talep' },
  'ihale': { icon: <Gavel size={18} />, color: '#8b5cf6', label: 'İhale' },
  'stok': { icon: <Package size={18} />, color: '#f59e0b', label: 'Stok' },
  'sistem': { icon: <ShieldCheck size={18} />, color: '#10b981', label: 'Sistem' },
  'uyari': { icon: <AlertTriangle size={18} />, color: '#ef4444', label: 'Uyarı' },
  'bilgi': { icon: <Info size={18} />, color: '#06b6d4', label: 'Bilgi' }
}

function detectNotifType(title: string): string {
  const lower = title.toLowerCase()
  if (lower.includes('talep') || lower.includes('onay')) return 'talep'
  if (lower.includes('ihale') || lower.includes('teklif')) return 'ihale'
  if (lower.includes('stok') || lower.includes('malzeme')) return 'stok'
  if (lower.includes('uyarı') || lower.includes('kritik')) return 'uyari'
  if (lower.includes('sistem') || lower.includes('güncelleme') || lower.includes('bakım')) return 'sistem'
  return 'bilgi'
}

const DEMO_NOTIFICATIONS: NotificationModel[] = [
  { id: 1, userId: 2, title: 'Yeni Talep Onayı Gerekiyor', message: 'TAL-2026-0012 numaralı "A4 Fotokopi Kağıdı Temini" talebi Şef onayınızı beklemektedir. Tahmini tutar: 14.500 ₺', isRead: false, createdAt: '2026-08-08T09:00:00Z' },
  { id: 2, userId: 2, title: 'İhale Değerlendirmesi Başladı', message: 'IHL-2026-0001 numaralı ihale için 3 firma teklif vermiştir. Teklifleri karşılaştırarak kazanan firmayı seçebilirsiniz.', isRead: false, createdAt: '2026-08-07T14:30:00Z' },
  { id: 3, userId: 2, title: 'Düşük Stok Uyarısı: Cat6 Ağ Kablosu', message: 'Bilgi İşlem Ana Depo\'daki Cat6 UTP Ağ Kablosu stoku 3 kutuya düşmüştür. Yeni temin talebi oluşturmanız önerilir.', isRead: false, createdAt: '2026-08-07T11:00:00Z' },
  { id: 4, userId: 2, title: 'Sistem Bakım Bildirimi', message: 'BBYS sistemi 10 Ağustos 2026 Cumartesi 02:00-06:00 saatleri arasında planlı bakım nedeniyle erişime kapatılacaktır.', isRead: true, createdAt: '2026-08-06T16:00:00Z' },
  { id: 5, userId: 2, title: 'Talep Tamamlandı: TAL-2026-0009', message: 'Cat6 Ağ Kablosu temini başarıyla tamamlanmıştır. Kazanan firma: Güven Tedarik ve Loj. Ltd. Şti. — 26.500 ₺', isRead: true, createdAt: '2026-08-05T10:00:00Z' },
  { id: 6, userId: 2, title: 'İhale Sonuçlandı: IHL-2026-0003', message: 'Cat6 Ağ Kablosu ihalesinde en düşük teklif Güven Tedarik tarafından verilmiştir. İhale onay belgesi oluşturulmuştur.', isRead: true, createdAt: '2026-08-04T15:00:00Z' },
  { id: 7, userId: 2, title: 'Yeni Kullanıcı Ataması', message: 'Bilgi İşlem Müdürlüğü\'ne yeni bir Teminci kullanıcısı atanmıştır. Görev tanımları için profil sayfasını kontrol ediniz.', isRead: true, createdAt: '2026-08-03T09:00:00Z' },
  { id: 8, userId: 2, title: 'Bütçe Kullanım Uyarısı', message: 'Bilgi İşlem Müdürlüğü aylık bütçe kullanım oranı %75 seviyesine ulaşmıştır. Kalan bütçe: 65.000 ₺', isRead: true, createdAt: '2026-08-02T08:30:00Z' },
  { id: 9, userId: 2, title: 'Teklif Mektubu Oluşturuldu', message: 'IHL-2026-0001 numaralı ihale için Resmi Teklif Mektubu Şablonu otomatik olarak üretilmiştir. Yönetim Konsolundan görüntüleyebilirsiniz.', isRead: true, createdAt: '2026-08-01T13:00:00Z' },
  { id: 10, userId: 2, title: 'Stok Güncelleme Bilgisi', message: 'Masaüstü İş İstasyonu stok miktarı 25\'ten 20\'ye güncellenmiştir. 5 adet Bilgi İşlem 3. kat birimine zimmetlenmiştir.', isRead: true, createdAt: '2026-07-30T10:00:00Z' }
]

function timeAgo(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'Az önce'
  if (diffMins < 60) return `${diffMins} dakika önce`
  if (diffHours < 24) return `${diffHours} saat önce`
  if (diffDays < 7) return `${diffDays} gün önce`
  return new Date(dateStr).toLocaleDateString('tr-TR')
}

export const NotificationsPage: React.FC = () => {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<NotificationModel[]>([])
  const [loading, setLoading] = useState(true)
  const [tabValue, setTabValue] = useState(0) // 0=All, 1=Unread, 2=Read
  const [expandedId, setExpandedId] = useState<number | null>(null)

  useEffect(() => { fetchNotifications() }, [])

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications')
      setNotifications(res.data as NotificationModel[])
    } catch {
      setNotifications(DEMO_NOTIFICATIONS)
    } finally { setLoading(false) }
  }

  const markAsRead = async (id: number) => {
    try {
      await api.put(`/notifications/${id}/read`)
    } catch { /* demo fallback */ }
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
  }

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all')
    } catch { /* demo fallback */ }
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
  }

  const deleteNotification = async (id: number) => {
    try {
      await api.delete(`/notifications/${id}`)
    } catch { /* demo fallback */ }
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const unreadCount = notifications.filter(n => !n.isRead).length
  const readCount = notifications.filter(n => n.isRead).length

  const filteredNotifications = notifications.filter(n => {
    if (tabValue === 1) return !n.isRead
    if (tabValue === 2) return n.isRead
    return true
  })

  // Group by date
  const groupedNotifications = filteredNotifications.reduce((acc, n) => {
    const date = new Date(n.createdAt).toLocaleDateString('tr-TR')
    if (!acc[date]) acc[date] = []
    acc[date].push(n)
    return acc
  }, {} as Record<string, NotificationModel[]>)

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <Badge badgeContent={unreadCount} color="error">
              <Avatar sx={{ bgcolor: '#f59e0b', width: 40, height: 40 }}>
                <Bell size={20} />
              </Avatar>
            </Badge>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>Bildirimler</Typography>
              <Typography variant="body2" color="text.secondary">
                {unreadCount > 0 ? `${unreadCount} okunmamış bildiriminiz var` : 'Tüm bildirimleriniz okundu'}
              </Typography>
            </Box>
          </Box>
        </Box>
        {unreadCount > 0 && (
          <Button variant="outlined" startIcon={<CheckCheck size={16} />} onClick={markAllAsRead} sx={{ borderRadius: '10px' }}>
            Tümünü Okundu İşaretle
          </Button>
        )}
      </Box>

      {/* Stats */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card sx={{ position: 'relative', overflow: 'visible' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>Toplam</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800 }}>{notifications.length}</Typography>
                </Box>
                <Box sx={{ width: 44, height: 44, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#3b82f622', color: '#3b82f6' }}>
                  <Bell size={22} />
                </Box>
              </Box>
            </CardContent>
            <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, borderRadius: '0 0 12px 12px', backgroundColor: '#3b82f6' }} />
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card sx={{ position: 'relative', overflow: 'visible' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>Okunmamış</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: '#f59e0b' }}>{unreadCount}</Typography>
                </Box>
                <Box sx={{ width: 44, height: 44, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f59e0b22', color: '#f59e0b' }}>
                  <Clock size={22} />
                </Box>
              </Box>
            </CardContent>
            <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, borderRadius: '0 0 12px 12px', backgroundColor: '#f59e0b' }} />
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card sx={{ position: 'relative', overflow: 'visible' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>Okunmuş</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: '#10b981' }}>{readCount}</Typography>
                </Box>
                <Box sx={{ width: 44, height: 44, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#10b98122', color: '#10b981' }}>
                  <CheckCheck size={22} />
                </Box>
              </Box>
            </CardContent>
            <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, borderRadius: '0 0 12px 12px', backgroundColor: '#10b981' }} />
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ mb: 3, '& .MuiTab-root': { fontWeight: 700, textTransform: 'none' } }}>
        <Tab label={`Tümü (${notifications.length})`} />
        <Tab label={
          <Badge badgeContent={unreadCount} color="error" sx={{ '& .MuiBadge-badge': { fontSize: '0.65rem' } }}>
            <span style={{ paddingRight: unreadCount > 0 ? 16 : 0 }}>Okunmamış</span>
          </Badge>
        } />
        <Tab label={`Okunmuş (${readCount})`} />
      </Tabs>

      {/* Notifications List */}
      {loading && <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>}

      {!loading && filteredNotifications.length === 0 && (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <BellOff size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              {tabValue === 1 ? 'Okunmamış bildiriminiz yok' : 'Bildirim bulunamadı'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sistem güncellemeleri, görev atamaları ve onay süreçleri burada görünecektir.
            </Typography>
          </CardContent>
        </Card>
      )}

      {!loading && Object.entries(groupedNotifications).map(([date, notifs]) => (
        <Box key={date} sx={{ mb: 3 }}>
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 1, mb: 1.5, display: 'block' }}>
            {date}
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {notifs.map(notif => {
              const type = NOTIF_TYPES[detectNotifType(notif.title)]
              const isExpanded = expandedId === notif.id
              return (
                <Card key={notif.id} sx={{
                  transition: 'all 0.2s ease',
                  borderLeft: notif.isRead ? 'none' : `4px solid ${type.color}`,
                  opacity: notif.isRead ? 0.85 : 1,
                  '&:hover': { transform: 'translateX(4px)', boxShadow: 6 }
                }}>
                  <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                      {/* Icon */}
                      <Avatar sx={{
                        width: 40, height: 40, bgcolor: `${type.color}18`, color: type.color,
                        flexShrink: 0
                      }}>
                        {type.icon}
                      </Avatar>

                      {/* Content */}
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: notif.isRead ? 600 : 800, flex: 1 }}>
                            {notif.title}
                          </Typography>
                          <Chip label={type.label} size="small" sx={{
                            height: 20, fontSize: '0.65rem', fontWeight: 700,
                            backgroundColor: `${type.color}18`, color: type.color
                          }} />
                          {!notif.isRead && (
                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: type.color, flexShrink: 0 }} />
                          )}
                        </Box>

                        <Typography variant="body2" color="text.secondary" sx={{
                          overflow: 'hidden',
                          display: '-webkit-box',
                          WebkitLineClamp: isExpanded ? 'unset' : 2,
                          WebkitBoxOrient: 'vertical'
                        }}>
                          {notif.message}
                        </Typography>

                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1.5 }}>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Clock size={12} />
                            {timeAgo(notif.createdAt)}
                          </Typography>

                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <Tooltip title={isExpanded ? 'Daralt' : 'Genişlet'}>
                              <IconButton size="small" onClick={() => setExpandedId(isExpanded ? null : notif.id)}>
                                {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                              </IconButton>
                            </Tooltip>
                            {!notif.isRead && (
                              <Tooltip title="Okundu İşaretle">
                                <IconButton size="small" color="primary" onClick={() => markAsRead(notif.id)}>
                                  <Check size={14} />
                                </IconButton>
                              </Tooltip>
                            )}
                            <Tooltip title="Sil">
                              <IconButton size="small" color="error" onClick={() => deleteNotification(notif.id)}>
                                <Trash2 size={14} />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              )
            })}
          </Box>
        </Box>
      ))}
    </Box>
  )
}