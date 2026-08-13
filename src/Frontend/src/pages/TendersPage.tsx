import React, { useState, useEffect } from 'react'
import {
  Box, Card, CardContent, Typography, Button, Chip, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Select, FormControl, InputLabel,
  Table, TableBody, TableCell, TableHead, TableRow,
  IconButton, Tooltip, CircularProgress, Alert, Grid,
  Tabs, Tab, LinearProgress, Avatar, InputAdornment
} from '@mui/material'
import {
  Gavel, Plus, Eye, Trophy, Users, Search,
  TrendingUp, Clock, CheckCircle, XCircle, Scale,
  Building2, Phone, Mail, Hash, ArrowRight, BarChart3
} from 'lucide-react'
import type { TenderModel, FirmOffer, Firm, OfferComparison } from '../types'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

const TENDER_STATUS_COLORS: Record<string, string> = {
  Active: '#3b82f6',
  Evaluating: '#f59e0b',
  Completed: '#10b981',
  Cancelled: '#ef4444'
}

const TENDER_STATUS_LABELS: Record<string, string> = {
  Active: 'Aktif',
  Evaluating: 'Değerlendirmede',
  Completed: 'Tamamlandı',
  Cancelled: 'İptal Edildi'
}

const TENDER_STATUS_ICONS: Record<string, React.ReactNode> = {
  Active: <Clock size={16} />,
  Evaluating: <Scale size={16} />,
  Completed: <CheckCircle size={16} />,
  Cancelled: <XCircle size={16} />
}

const DEMO_FIRMS: Firm[] = [
  { id: 1, taxNumber: '1234567890', name: 'Mega Kırtasiye ve Ofis Malz. A.Ş.', contactPerson: 'Ali Kaya', phone: '0212 555 1234', email: 'ali@megakirtasiye.com', address: 'İstanbul, Ataşehir' },
  { id: 2, taxNumber: '9876543210', name: 'Teknoloji Market Ltd. Şti.', contactPerson: 'Zeynep Arslan', phone: '0312 444 5678', email: 'zeynep@teknomarket.com', address: 'Ankara, Çankaya' },
  { id: 3, taxNumber: '5678901234', name: 'Anadolu Bilişim San. Tic. A.Ş.', contactPerson: 'Mehmet Demir', phone: '0232 333 9012', email: 'mehmet@anadolubilisim.com', address: 'İzmir, Bayraklı' },
  { id: 4, taxNumber: '3456789012', name: 'Güven Tedarik ve Loj. Ltd. Şti.', contactPerson: 'Fatma Yıldız', phone: '0216 222 3456', email: 'fatma@guventedarik.com', address: 'İstanbul, Kadıköy' },
  { id: 5, taxNumber: '7890123456', name: 'Başkent Ofis Çözümleri A.Ş.', contactPerson: 'Emre Çelik', phone: '0312 111 7890', email: 'emre@baskentofis.com', address: 'Ankara, Yenimahalle' }
]

const DEMO_TENDERS: TenderModel[] = [
  {
    id: 1, tenderNo: 'IHL-2026-0001', requestId: 1, requestNo: 'TAL-2026-0012',
    title: 'A4 Fotokopi Kağıdı Temini İhalesi', tenderDate: '2026-08-05T10:00:00Z',
    status: 'Evaluating', offers: [
      { id: 1, tenderId: 1, firmId: 1, firmName: 'Mega Kırtasiye ve Ofis Malz. A.Ş.', firmTaxNumber: '1234567890', offerAmount: 13200, offerDate: '2026-08-01T09:00:00Z', isWinning: false, notes: 'KDV dahil fiyat' },
      { id: 2, tenderId: 1, firmId: 2, firmName: 'Teknoloji Market Ltd. Şti.', firmTaxNumber: '9876543210', offerAmount: 14800, offerDate: '2026-08-02T14:00:00Z', isWinning: false, notes: '' },
      { id: 3, tenderId: 1, firmId: 3, firmName: 'Anadolu Bilişim San. Tic. A.Ş.', firmTaxNumber: '5678901234', offerAmount: 12500, offerDate: '2026-08-03T11:00:00Z', isWinning: false, notes: 'Teslimat 5 iş günü' }
    ]
  },
  {
    id: 2, tenderNo: 'IHL-2026-0002', requestId: 2, requestNo: 'TAL-2026-0011',
    title: 'Masaüstü Bilgisayar Alım İhalesi', tenderDate: '2026-08-10T10:00:00Z',
    status: 'Active', offers: []
  },
  {
    id: 3, tenderNo: 'IHL-2026-0003', requestId: 3, requestNo: 'TAL-2026-0009',
    title: 'Cat6 Ağ Kablosu Temini İhalesi', tenderDate: '2026-07-15T10:00:00Z',
    status: 'Completed', winningFirmId: 4, winningFirmName: 'Güven Tedarik ve Loj. Ltd. Şti.',
    winningAmount: 26500, completedAt: '2026-07-22T16:00:00Z',
    offers: [
      { id: 4, tenderId: 3, firmId: 4, firmName: 'Güven Tedarik ve Loj. Ltd. Şti.', firmTaxNumber: '3456789012', offerAmount: 26500, offerDate: '2026-07-12T10:00:00Z', isWinning: true, notes: '' },
      { id: 5, tenderId: 3, firmId: 5, firmName: 'Başkent Ofis Çözümleri A.Ş.', firmTaxNumber: '7890123456', offerAmount: 29800, offerDate: '2026-07-13T15:00:00Z', isWinning: false, notes: '' }
    ]
  }
]

interface StatCardProps {
  title: string; value: string | number; color: string; icon: React.ReactNode
}

const StatCard: React.FC<StatCardProps> = ({ title, value, color, icon }) => (
  <Card sx={{ height: '100%', position: 'relative', overflow: 'visible' }}>
    <CardContent sx={{ p: 2.5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>{title}</Typography>
          <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1, mt: 0.5 }}>{value}</Typography>
        </Box>
        <Box sx={{ width: 44, height: 44, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: `${color}22`, color }}>
          {icon}
        </Box>
      </Box>
    </CardContent>
    <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, borderRadius: '0 0 12px 12px', backgroundColor: color }} />
  </Card>
)

export const TendersPage: React.FC = () => {
  const { user } = useAuth()
  const [tenders, setTenders] = useState<TenderModel[]>([])
  const [loading, setLoading] = useState(true)
  const [tabValue, setTabValue] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')

  // Detail dialog
  const [detailTender, setDetailTender] = useState<TenderModel | null>(null)

  // Add offer dialog
  const [addOfferOpen, setAddOfferOpen] = useState(false)
  const [offerTenderId, setOfferTenderId] = useState(0)
  const [offerFirmId, setOfferFirmId] = useState(0)
  const [offerAmount, setOfferAmount] = useState(0)
  const [offerNotes, setOfferNotes] = useState('')
  const [saving, setSaving] = useState(false)

  // Comparison dialog
  const [comparisonTender, setComparisonTender] = useState<TenderModel | null>(null)

  const [firms] = useState<Firm[]>(DEMO_FIRMS)

  useEffect(() => { fetchTenders() }, [])

  const fetchTenders = async () => {
    try {
      const res = await api.get('/tenders?filterDepartment=true')
      setTenders(res.data as TenderModel[])
    } catch {
      setTenders(DEMO_TENDERS)
    } finally { setLoading(false) }
  }

  const handleAddOffer = async () => {
    if (!offerFirmId || offerAmount <= 0) return
    setSaving(true)
    const firm = firms.find(f => f.id === offerFirmId)
    try {
      await api.post(`/tenders/${offerTenderId}/offers`, {
        firmId: offerFirmId, offerAmount, notes: offerNotes
      })
      await fetchTenders()
    } catch {
      const newOffer: FirmOffer = {
        id: Date.now(), tenderId: offerTenderId, firmId: offerFirmId,
        firmName: firm?.name || '', firmTaxNumber: firm?.taxNumber || '',
        offerAmount, offerDate: new Date().toISOString(), isWinning: false, notes: offerNotes
      }
      setTenders(prev => prev.map(t =>
        t.id === offerTenderId ? { ...t, offers: [...t.offers, newOffer] } : t
      ))
    } finally {
      setSaving(false)
      setAddOfferOpen(false)
      setOfferFirmId(0); setOfferAmount(0); setOfferNotes('')
    }
  }

  const handleSelectWinner = async (tender: TenderModel, offer: FirmOffer) => {
    try {
      await api.put(`/tenders/${tender.id}/complete`, { winningOfferId: offer.id })
      await fetchTenders()
    } catch {
      setTenders(prev => prev.map(t =>
        t.id === tender.id ? {
          ...t, status: 'Completed', winningFirmId: offer.firmId,
          winningFirmName: offer.firmName, winningAmount: offer.offerAmount,
          completedAt: new Date().toISOString(),
          offers: t.offers.map(o => ({ ...o, isWinning: o.id === offer.id }))
        } : t
      ))
    }
    setComparisonTender(null)
    setDetailTender(null)
  }

  // Tab filtering
  const tabStatuses = ['', 'Active', 'Evaluating', 'Completed', 'Cancelled']
  const filteredTenders = tenders.filter(t => {
    const matchesTab = tabValue === 0 || t.status === tabStatuses[tabValue]
    const matchesSearch = !searchTerm ||
      t.tenderNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.requestNo.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesTab && matchesSearch
  })

  const stats = {
    active: tenders.filter(t => t.status === 'Active').length,
    evaluating: tenders.filter(t => t.status === 'Evaluating').length,
    completed: tenders.filter(t => t.status === 'Completed').length,
    totalOffers: tenders.reduce((s, t) => s + t.offers.length, 0)
  }

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <Avatar sx={{ bgcolor: '#8b5cf6', width: 40, height: 40 }}>
              <Gavel size={20} />
            </Avatar>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>İhale Yönetimi</Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            {user?.departmentName} — İhale süreçleri, teklif karşılaştırma ve kazanan firma seçimi
          </Typography>
        </Box>
      </Box>

      {/* Stats Row */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard title="Aktif İhaleler" value={stats.active} color="#3b82f6" icon={<Clock size={22} />} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard title="Değerlendirmede" value={stats.evaluating} color="#f59e0b" icon={<Scale size={22} />} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard title="Tamamlanan" value={stats.completed} color="#10b981" icon={<CheckCircle size={22} />} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard title="Toplam Teklif" value={stats.totalOffers} color="#8b5cf6" icon={<Users size={22} />} />
        </Grid>
      </Grid>

      {/* Filters & Search */}
      <Card sx={{ mb: 3 }}>
        <Box sx={{ px: 3, pt: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ '& .MuiTab-root': { fontWeight: 700, textTransform: 'none' } }}>
              <Tab label={`Tümü (${tenders.length})`} />
              <Tab label={`Aktif (${stats.active})`} />
              <Tab label={`Değerlendirmede (${stats.evaluating})`} />
              <Tab label={`Tamamlanan (${stats.completed})`} />
            </Tabs>
            <TextField
              size="small" placeholder="İhale no, başlık veya talep no ara..."
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              sx={{ width: 300 }}
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search size={16} /></InputAdornment> } }}
            />
          </Box>
        </Box>

        {/* Table */}
        <CardContent sx={{ p: 0 }}>
          {loading && <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>}
          {!loading && (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, pl: 3 }}>İhale No</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Başlık</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Talep No</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>İhale Tarihi</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Teklif Sayısı</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Durum</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Kazanan</TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>İşlemler</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTenders.map(tender => (
                  <TableRow key={tender.id} hover>
                    <TableCell sx={{ pl: 3 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>{tender.tenderNo}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {tender.title}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={tender.requestNo} size="small" variant="outlined" color="primary" />
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(tender.tenderDate).toLocaleDateString('tr-TR')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Users size={14} />
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{tender.offers.length}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={<Box sx={{ display: 'flex', pl: 0.5 }}>{TENDER_STATUS_ICONS[tender.status]}</Box>}
                        label={TENDER_STATUS_LABELS[tender.status] || tender.status}
                        size="small"
                        sx={{
                          backgroundColor: `${TENDER_STATUS_COLORS[tender.status]}22`,
                          color: TENDER_STATUS_COLORS[tender.status], fontWeight: 700
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      {tender.winningFirmName ? (
                        <Box>
                          <Typography variant="caption" sx={{ fontWeight: 700, color: '#10b981' }}>
                            <Trophy size={12} style={{ marginRight: 4 }} />
                            {tender.winningFirmName}
                          </Typography>
                          <Typography variant="caption" sx={{ display: 'block', fontWeight: 700 }}>
                            {tender.winningAmount?.toLocaleString('tr-TR')} ₺
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="caption" color="text.secondary">—</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                        <Tooltip title="Detay Görüntüle">
                          <IconButton size="small" color="primary" onClick={() => setDetailTender(tender)}>
                            <Eye size={16} />
                          </IconButton>
                        </Tooltip>
                        {(tender.status === 'Active' || tender.status === 'Evaluating') && (
                          <Tooltip title="Teklif Ekle">
                            <IconButton size="small" color="secondary" onClick={() => {
                              setOfferTenderId(tender.id)
                              setAddOfferOpen(true)
                            }}>
                              <Plus size={16} />
                            </IconButton>
                          </Tooltip>
                        )}
                        {tender.offers.length >= 2 && tender.status !== 'Completed' && (
                          <Tooltip title="Teklif Karşılaştır">
                            <IconButton size="small" sx={{ color: '#f59e0b' }} onClick={() => setComparisonTender(tender)}>
                              <BarChart3 size={16} />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredTenders.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
                      <Gavel size={40} style={{ opacity: 0.3, marginBottom: 8 }} />
                      <Typography variant="body2">Gösterilecek ihale bulunamadı</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add Offer Dialog */}
      <Dialog open={addOfferOpen} onClose={() => setAddOfferOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Plus size={20} />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Yeni Teklif Ekle</Typography>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Firma Seçin</InputLabel>
              <Select value={offerFirmId} label="Firma Seçin" onChange={e => setOfferFirmId(Number(e.target.value))}>
                {firms.map(f => (
                  <MenuItem key={f.id} value={f.id}>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>{f.name}</Typography>
                      <Typography variant="caption" color="text.secondary">VKN: {f.taxNumber} • {f.contactPerson}</Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {offerFirmId > 0 && (() => {
              const selectedFirm = firms.find(f => f.id === offerFirmId)
              return selectedFirm ? (
                <Card variant="outlined" sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                    <Building2 size={18} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{selectedFirm.name}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Hash size={12} /> <Typography variant="caption">VKN: {selectedFirm.taxNumber}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Phone size={12} /> <Typography variant="caption">{selectedFirm.phone}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Mail size={12} /> <Typography variant="caption">{selectedFirm.email}</Typography>
                    </Box>
                  </Box>
                </Card>
              ) : null
            })()}

            <TextField
              label="Teklif Tutarı (₺)" type="number" fullWidth
              value={offerAmount || ''} onChange={e => setOfferAmount(Number(e.target.value))}
              slotProps={{ input: { startAdornment: <InputAdornment position="start">₺</InputAdornment> }, htmlInput: { min: 0 } }}
            />
            <TextField
              label="Notlar (opsiyonel)" fullWidth multiline rows={2}
              value={offerNotes} onChange={e => setOfferNotes(e.target.value)}
              placeholder="KDV bilgisi, teslimat süresi vb."
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setAddOfferOpen(false)}>İptal</Button>
          <Button variant="contained" onClick={handleAddOffer} disabled={saving || !offerFirmId || offerAmount <= 0}
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <Plus size={16} />}>
            {saving ? 'Kaydediliyor...' : 'Teklifi Kaydet'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Detail Dialog */}
      {detailTender && (
        <Dialog open onClose={() => setDetailTender(null)} maxWidth="md" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Gavel size={22} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>{detailTender.tenderNo}</Typography>
                  <Typography variant="caption" color="text.secondary">{detailTender.title}</Typography>
                </Box>
              </Box>
              <Chip
                label={TENDER_STATUS_LABELS[detailTender.status] || detailTender.status}
                sx={{ backgroundColor: `${TENDER_STATUS_COLORS[detailTender.status]}22`, color: TENDER_STATUS_COLORS[detailTender.status], fontWeight: 700 }}
              />
            </Box>
          </DialogTitle>
          <DialogContent dividers>
            {/* Info Summary */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              {[
                ['Bağlı Talep', detailTender.requestNo],
                ['İhale Tarihi', new Date(detailTender.tenderDate).toLocaleDateString('tr-TR')],
                ['Teklif Sayısı', `${detailTender.offers.length} firma`],
                ['Kazanan', detailTender.winningFirmName || 'Henüz belirlenmedi']
              ].map(([k, v]) => (
                <Grid size={{ xs: 12, sm: 6 }} key={k}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>{k}</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{v}</Typography>
                </Grid>
              ))}
            </Grid>

            {detailTender.winningAmount && (
              <Alert severity="success" sx={{ mb: 3, borderRadius: '10px' }}
                icon={<Trophy size={20} />}>
                Kazanan teklif: <strong>{detailTender.winningFirmName}</strong> — <strong>{detailTender.winningAmount.toLocaleString('tr-TR')} ₺</strong>
              </Alert>
            )}

            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>Firma Teklifleri</Typography>

            {detailTender.offers.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                <Users size={40} style={{ opacity: 0.3, marginBottom: 8 }} />
                <Typography variant="body2">Henüz teklif alınmamış</Typography>
              </Box>
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Firma</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>VKN</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Teklif Tutarı</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Tarih</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Not</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Durum</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[...detailTender.offers].sort((a, b) => a.offerAmount - b.offerAmount).map((offer, idx) => (
                    <TableRow key={offer.id} sx={{
                      backgroundColor: offer.isWinning ? 'rgba(16, 185, 129, 0.08)' : idx === 0 && !detailTender.winningFirmId ? 'rgba(59, 130, 246, 0.05)' : 'transparent'
                    }}>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{offer.firmName}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">{offer.firmTaxNumber}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 800, color: idx === 0 ? '#10b981' : 'text.primary' }}>
                          {offer.offerAmount.toLocaleString('tr-TR')} ₺
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(offer.offerDate).toLocaleDateString('tr-TR')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">{offer.notes || '—'}</Typography>
                      </TableCell>
                      <TableCell>
                        {offer.isWinning ? (
                          <Chip label="Kazanan" size="small" sx={{ backgroundColor: '#10b98122', color: '#10b981', fontWeight: 700 }}
                            icon={<Box sx={{ display: 'flex', pl: 0.5 }}><Trophy size={12} /></Box>} />
                        ) : idx === 0 && !detailTender.winningFirmId ? (
                          <Chip label="En Düşük" size="small" sx={{ backgroundColor: '#3b82f622', color: '#3b82f6', fontWeight: 700 }} />
                        ) : null}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2, gap: 1 }}>
            {detailTender.offers.length >= 2 && detailTender.status !== 'Completed' && (
              <Button variant="contained" color="warning" startIcon={<BarChart3 size={16} />}
                onClick={() => { setComparisonTender(detailTender); setDetailTender(null) }}>
                Karşılaştır & Seç
              </Button>
            )}
            <Button onClick={() => setDetailTender(null)}>Kapat</Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Comparison Dialog */}
      {comparisonTender && comparisonTender.offers.length > 0 && (
        <Dialog open onClose={() => setComparisonTender(null)} maxWidth="lg" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <BarChart3 size={22} />
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>Teklif Karşılaştırma</Typography>
                <Typography variant="caption" color="text.secondary">
                  {comparisonTender.tenderNo} — {comparisonTender.title}
                </Typography>
              </Box>
            </Box>
          </DialogTitle>
          <DialogContent dividers>
            <Alert severity="info" sx={{ mb: 3, borderRadius: '10px' }}>
              En düşük teklifi veren firmayı kazanan olarak seçebilirsiniz.
            </Alert>

            {/* Visual comparison bars */}
            <Box sx={{ mb: 4 }}>
              {(() => {
                const sorted = [...comparisonTender.offers].sort((a, b) => a.offerAmount - b.offerAmount)
                const maxAmount = Math.max(...sorted.map(o => o.offerAmount))
                return sorted.map((offer, idx) => (
                  <Box key={offer.id} sx={{ mb: 2.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 28, height: 28, fontSize: '0.75rem', bgcolor: idx === 0 ? '#10b981' : '#64748b' }}>
                          {idx + 1}
                        </Avatar>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{offer.firmName}</Typography>
                        {idx === 0 && <Chip label="En Düşük" size="small" sx={{ height: 20, fontSize: '0.65rem', bgcolor: '#10b98122', color: '#10b981', fontWeight: 700 }} />}
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 800 }}>
                        {offer.offerAmount.toLocaleString('tr-TR')} ₺
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(offer.offerAmount / maxAmount) * 100}
                      sx={{
                        height: 12, borderRadius: 6,
                        backgroundColor: 'rgba(100,116,139,0.1)',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 6,
                          backgroundColor: idx === 0 ? '#10b981' : idx === 1 ? '#3b82f6' : '#f59e0b'
                        }
                      }}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        VKN: {offer.firmTaxNumber}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {offer.notes || 'Ek not yok'}
                      </Typography>
                    </Box>
                  </Box>
                ))
              })()}
            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* Comparison table */}
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Sıra</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Firma Adı</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>VKN</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Teklif (₺)</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Fark</TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Kazanan Seç</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(() => {
                  const sorted = [...comparisonTender.offers].sort((a, b) => a.offerAmount - b.offerAmount)
                  const lowest = sorted[0]?.offerAmount || 0
                  return sorted.map((offer, idx) => (
                    <TableRow key={offer.id} sx={{
                      backgroundColor: idx === 0 ? 'rgba(16, 185, 129, 0.06)' : 'transparent'
                    }}>
                      <TableCell>
                        <Avatar sx={{ width: 24, height: 24, fontSize: '0.7rem', bgcolor: idx === 0 ? '#10b981' : '#94a3b8' }}>
                          {idx + 1}
                        </Avatar>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{offer.firmName}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">{offer.firmTaxNumber}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 800 }}>
                          {offer.offerAmount.toLocaleString('tr-TR')} ₺
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {idx === 0 ? (
                          <Chip label="Referans" size="small" sx={{ height: 20, fontSize: '0.65rem' }} />
                        ) : (
                          <Typography variant="caption" sx={{ color: '#ef4444', fontWeight: 700 }}>
                            +{(offer.offerAmount - lowest).toLocaleString('tr-TR')} ₺
                            ({((offer.offerAmount - lowest) / lowest * 100).toFixed(1)}%)
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Button
                          variant={idx === 0 ? 'contained' : 'outlined'}
                          size="small"
                          color={idx === 0 ? 'success' : 'primary'}
                          startIcon={<Trophy size={14} />}
                          onClick={() => handleSelectWinner(comparisonTender, offer)}
                          sx={{ fontSize: '0.75rem' }}
                        >
                          Seç
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                })()}
              </TableBody>
            </Table>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setComparisonTender(null)}>Kapat</Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  )
}