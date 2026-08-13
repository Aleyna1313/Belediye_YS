import React, { useState, useEffect } from 'react'
import {
  Box, Card, CardContent, Typography, Button, Chip, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Select, FormControl, InputLabel,
  Table, TableBody, TableCell, TableHead, TableRow,
  IconButton, Tooltip, CircularProgress, Alert, Stepper,
  Step, StepLabel, Grid
} from '@mui/material'
import { Plus, Eye, ArrowRight, Package, Trash2 } from 'lucide-react'
import type { RequestModel, Material, Warehouse, MaterialType } from '../types'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

const STATUS_COLORS: Record<string, string> = {
  PendingApproval: '#f59e0b', InProcurement: '#3b82f6',
  InTender: '#8b5cf6', Completed: '#10b981', Cancelled: '#ef4444', Draft: '#64748b'
}
const STATUS_LABELS: Record<string, string> = {
  PendingApproval: 'Onay Bekliyor', InProcurement: 'Satın Almada',
  InTender: 'İhalede', Completed: 'Tamamlandı', Cancelled: 'İptal', Draft: 'Taslak'
}

const PROCUREMENT_STEPS = [
  'Temin Dosyası', 'Dosya Kodu', 'İşlem Tanımı', 'Bütçe',
  'Ambar Seçimi', 'Malzeme Seçimi', 'Onay'
]

interface RequestItemInput {
  materialId: number
  materialName: string
  quantity: number
  estimatedUnitPrice: number
  notes: string
}

export const RequestsPage: React.FC = () => {
  const { user } = useAuth()
  const [requests, setRequests] = useState<RequestModel[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [detailReq, setDetailReq] = useState<RequestModel | null>(null)
  const [activeStep, setActiveStep] = useState(0)

  // Form state
  const [fileCode, setFileCode] = useState('')
  const [description, setDescription] = useState('')
  const [budgetType, setBudgetType] = useState('')
  const [warehouseId, setWarehouseId] = useState(0)
  const [selectedItems, setSelectedItems] = useState<RequestItemInput[]>([])
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [materials, setMaterials] = useState<Material[]>([])
  const [materialTypes, setMaterialTypes] = useState<MaterialType[]>([])
  const [selectedMat, setSelectedMat] = useState(0)
  const [selectedQty, setSelectedQty] = useState(1)
  const [filterTypeId, setFilterTypeId] = useState(0)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  useEffect(() => {
    fetchRequests()
    fetchWarehouses()
    fetchMaterialTypes()
  }, [])

  useEffect(() => {
    if (warehouseId > 0) {
      fetchMaterials(warehouseId, filterTypeId || undefined)
    }
  }, [warehouseId, filterTypeId])

  const fetchRequests = async () => {
    try {
      const res = await api.get('/requests?filterDepartment=true')
      setRequests(res.data as RequestModel[])
    } catch {
      setRequests([
        {
          id: 1, requestNo: 'TAL-2026-0012', departmentId: user?.departmentId || 1,
          departmentName: user?.departmentName || 'Bilgi İşlem', userId: user?.id || 2,
          userName: user?.fullName || '', userTitle: user?.title || 'Şef',
          fileCode: 'DOSYA-20260729-142', description: 'A4 Fotokopi Kağıdı Temini',
          budgetType: 'Mal ve Malzeme Alımı', status: 'InTender',
          createdAt: '2026-07-29T10:00:00Z', totalEstimatedAmount: 14500,
          items: [{ id: 1, requestId: 1, materialId: 1, materialCode: 'MAL-150-001', materialName: 'A4 Fotokopi Kağıdı', materialTypeName: '150 Sarf Malzemesi', materialTypeCode: '150', unit: 'Paket', quantity: 100, estimatedUnitPrice: 145, totalEstimatedPrice: 14500, notes: '' }]
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const fetchWarehouses = async () => {
    try {
      const res = await api.get(`/warehouses?departmentId=${user?.departmentId || 1}`)
      setWarehouses(res.data as Warehouse[])
    } catch {
      setWarehouses([
        { id: 1, name: 'Bilgi İşlem Ana Depo', location: 'A Blok', departmentId: 1 },
        { id: 4, name: 'Genel Belediye Ambarı', location: 'Garaj', departmentId: undefined }
      ])
    }
  }

  const fetchMaterialTypes = async () => {
    try {
      const res = await api.get('/materials/types')
      setMaterialTypes(res.data as MaterialType[])
    } catch {
      setMaterialTypes([
        { id: 1, code: '150', name: '150 Sarf Malzemesi', description: '' },
        { id: 2, code: '255', name: '255 Demirbaş', description: '' }
      ])
    }
  }

  const fetchMaterials = async (wId: number, typeId?: number) => {
    try {
      const url = `/materials?warehouseId=${wId}${typeId ? `&materialTypeId=${typeId}` : ''}&filterDepartment=false`
      const res = await api.get(url)
      setMaterials(res.data as Material[])
    } catch {
      setMaterials([
        { id: 1, code: 'MAL-150-001', name: 'A4 Fotokopi Kağıdı (80 gr)', materialTypeId: 1, materialTypeCode: '150', materialTypeName: '150 Sarf Malzemesi', warehouseId: 1, warehouseName: 'Bilgi İşlem Ana Depo', stockQuantity: 500, unit: 'Paket', unitPrice: 145, createdAt: '2026-01-01T00:00:00Z' },
        { id: 2, code: 'MAL-150-002', name: 'Siyah Toner (HP LaserJet)', materialTypeId: 1, materialTypeCode: '150', materialTypeName: '150 Sarf Malzemesi', warehouseId: 1, warehouseName: 'Bilgi İşlem Ana Depo', stockQuantity: 35, unit: 'Adet', unitPrice: 850, createdAt: '2026-01-01T00:00:00Z' },
        { id: 4, code: 'MAL-255-001', name: 'Masaüstü İş İstasyonu', materialTypeId: 2, materialTypeCode: '255', materialTypeName: '255 Demirbaş', warehouseId: 1, warehouseName: 'Bilgi İşlem Ana Depo', stockQuantity: 20, unit: 'Adet', unitPrice: 32000, createdAt: '2026-01-01T00:00:00Z' }
      ])
    }
  }

  const addItem = () => {
    const mat = materials.find(m => m.id === selectedMat)
    if (!mat) return
    const existing = selectedItems.findIndex(i => i.materialId === mat.id)
    if (existing >= 0) {
      const updated = [...selectedItems]
      updated[existing].quantity += selectedQty
      setSelectedItems(updated)
    } else {
      setSelectedItems(prev => [...prev, {
        materialId: mat.id, materialName: mat.name,
        quantity: selectedQty, estimatedUnitPrice: mat.unitPrice, notes: ''
      }])
    }
  }

  const removeItem = (materialId: number) => {
    setSelectedItems(prev => prev.filter(i => i.materialId !== materialId))
  }

  const handleCreate = async () => {
    if (selectedItems.length === 0) { setSaveError('En az bir malzeme ekleyin.'); return }
    setSaving(true)
    setSaveError('')
    try {
      const payload = {
        fileCode, description, budgetType,
        warehouseId: warehouseId || 1,
        items: selectedItems.map(i => ({
          materialId: i.materialId,
          quantity: i.quantity,
          estimatedUnitPrice: i.estimatedUnitPrice,
          notes: i.notes
        }))
      }
      await api.post('/requests', payload)
      await fetchRequests()
      setCreateOpen(false)
      resetForm()
    } catch {
      // Demo: add locally
      const mockReq: RequestModel = {
        id: Date.now(), requestNo: `TAL-2026-${Math.floor(Math.random() * 9000) + 1000}`,
        departmentId: user?.departmentId || 1, departmentName: user?.departmentName || '',
        userId: user?.id || 1, userName: user?.fullName || '', userTitle: user?.title || 'Şef',
        fileCode, description, budgetType, status: 'PendingApproval',
        createdAt: new Date().toISOString(),
        totalEstimatedAmount: selectedItems.reduce((s, i) => s + i.quantity * i.estimatedUnitPrice, 0),
        items: selectedItems.map((i, idx) => ({
          id: idx + 1, requestId: 0, materialId: i.materialId, materialCode: '',
          materialName: i.materialName, materialTypeName: '', materialTypeCode: '',
          unit: '', quantity: i.quantity, estimatedUnitPrice: i.estimatedUnitPrice,
          totalEstimatedPrice: i.quantity * i.estimatedUnitPrice, notes: i.notes
        }))
      }
      setRequests(prev => [mockReq, ...prev])
      setCreateOpen(false)
      resetForm()
    } finally {
      setSaving(false)
    }
  }

  const resetForm = () => {
    setFileCode(''); setDescription(''); setBudgetType(''); setWarehouseId(0)
    setSelectedItems([]); setActiveStep(0); setSaveError('')
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>Talep Yönetimi</Typography>
          <Typography variant="body2" color="text.secondary">{user?.departmentName} — Satın alma talepleri</Typography>
        </Box>
        <Button variant="contained" startIcon={<Plus size={18} />} onClick={() => setCreateOpen(true)} sx={{ borderRadius: '10px' }}>
          Yeni Talep
        </Button>
      </Box>

      {loading && <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>}

      {!loading && (
        <Card>
          <CardContent sx={{ p: 0 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, pl: 3 }}>Talep No</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Dosya Kodu</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Açıklama</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Bütçe Türü</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Tahmini Tutar</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Durum</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Tarih</TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>İşlem</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {requests.map((req) => (
                  <TableRow key={req.id} hover>
                    <TableCell sx={{ pl: 3 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>{req.requestNo}</Typography>
                    </TableCell>
                    <TableCell><Typography variant="body2">{req.fileCode}</Typography></TableCell>
                    <TableCell><Typography variant="body2">{req.description}</Typography></TableCell>
                    <TableCell><Typography variant="body2">{req.budgetType}</Typography></TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {req.totalEstimatedAmount.toLocaleString('tr-TR')} ₺
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={STATUS_LABELS[req.status] || req.status}
                        size="small"
                        sx={{ backgroundColor: `${STATUS_COLORS[req.status]}22`, color: STATUS_COLORS[req.status], fontWeight: 700 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(req.createdAt).toLocaleDateString('tr-TR')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Detay Görüntüle">
                        <IconButton size="small" color="primary" onClick={() => setDetailReq(req)}>
                          <Eye size={16} />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
                {requests.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
                      Henüz talep oluşturulmamış
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Create Request Dialog with Stepper */}
      <Dialog open={createOpen} onClose={() => { setCreateOpen(false); resetForm() }} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Plus size={20} />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Yeni Satın Alma Talebi</Typography>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
            {PROCUREMENT_STEPS.map((label) => (
              <Step key={label}><StepLabel>{label}</StepLabel></Step>
            ))}
          </Stepper>

          {saveError && <Alert severity="error" sx={{ mb: 2 }}>{saveError}</Alert>}

          {/* Step 0-1: Temin Dosyası & Dosya Kodu */}
          {activeStep === 0 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Temin Dosyası Bilgileri</Typography>
              <TextField label="Dosya Kodu" value={fileCode} onChange={(e) => setFileCode(e.target.value)} fullWidth placeholder="Örn: DOSYA-20260729-001" />
            </Box>
          )}

          {/* Step 2: İşlem Tanımı */}
          {activeStep === 1 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>İşlem Tanımı</Typography>
              <TextField label="İşlem Tanımı / Gerekçe" value={description} onChange={(e) => setDescription(e.target.value)} fullWidth multiline rows={4} placeholder="Satın alma gerekçesini açıklayın..." />
            </Box>
          )}

          {/* Step 3: Bütçe */}
          {activeStep === 2 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Bütçe Seçimi</Typography>
              <FormControl fullWidth>
                <InputLabel>Bütçe Kalemi</InputLabel>
                <Select value={budgetType} label="Bütçe Kalemi" onChange={(e) => setBudgetType(e.target.value)}>
                  <MenuItem value="Mal ve Malzeme Alımı">Mal ve Malzeme Alımı</MenuItem>
                  <MenuItem value="Hizmet Alımı">Hizmet Alımı</MenuItem>
                  <MenuItem value="Demirbaş Alımı">Demirbaş Alımı</MenuItem>
                  <MenuItem value="Yapım İşleri">Yapım İşleri</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}

          {/* Step 4: Ambar Seçimi */}
          {activeStep === 3 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Ambar Seçimi</Typography>
              <FormControl fullWidth>
                <InputLabel>Ambar</InputLabel>
                <Select value={warehouseId} label="Ambar" onChange={(e) => setWarehouseId(Number(e.target.value))}>
                  {warehouses.map(w => (
                    <MenuItem key={w.id} value={w.id}>{w.name} — {w.location}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          )}

          {/* Step 5: Malzeme Seçimi */}
          {activeStep === 4 && (
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Malzeme Seçimi (150 Sarf / 255 Demirbaş)</Typography>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Malzeme Türü</InputLabel>
                    <Select value={filterTypeId} label="Malzeme Türü" onChange={(e) => setFilterTypeId(Number(e.target.value))}>
                      <MenuItem value={0}>Tümü</MenuItem>
                      {materialTypes.map(t => (
                        <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 5 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Malzeme Seç</InputLabel>
                    <Select value={selectedMat} label="Malzeme Seç" onChange={(e) => setSelectedMat(Number(e.target.value))}>
                      {materials.map(m => (
                        <MenuItem key={m.id} value={m.id}>
                          [{m.materialTypeCode}] {m.name} — Stok: {m.stockQuantity} {m.unit} ({m.unitPrice.toLocaleString('tr-TR')} ₺)
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 2 }}>
                  <TextField size="small" label="Miktar" type="number" value={selectedQty} onChange={(e) => setSelectedQty(Number(e.target.value))} fullWidth slotProps={{ htmlInput: { min: 1 } }} />
                </Grid>
                <Grid size={{ xs: 12, sm: 1 }}>
                  <Button fullWidth variant="contained" sx={{ height: 40 }} onClick={addItem} disabled={!selectedMat}>
                    <Plus size={16} />
                  </Button>
                </Grid>
              </Grid>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body2" sx={{ fontWeight: 700, mb: 1 }}>Seçilen Malzemeler:</Typography>
              {selectedItems.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 3, color: 'text.secondary' }}>
                  <Package size={32} style={{ marginBottom: 8, opacity: 0.4 }} />
                  <Typography variant="body2">Henüz malzeme eklenmedi</Typography>
                </Box>
              ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Malzeme</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Miktar</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>B.Fiyat</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Toplam</TableCell>
                      <TableCell />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedItems.map((item) => (
                      <TableRow key={item.materialId}>
                        <TableCell>{item.materialName}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{item.estimatedUnitPrice.toLocaleString('tr-TR')} ₺</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>{(item.quantity * item.estimatedUnitPrice).toLocaleString('tr-TR')} ₺</TableCell>
                        <TableCell>
                          <IconButton size="small" color="error" onClick={() => removeItem(item.materialId)}>
                            <Trash2 size={14} />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Box>
          )}

          {/* Step 6: Onay */}
          {activeStep === 5 && (
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Talep Özeti — Onay</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Typography variant="body2" sx={{ minWidth: 140, fontWeight: 600, color: 'text.secondary' }}>Müdürlük:</Typography>
                  <Typography variant="body2">{user?.departmentName}</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Typography variant="body2" sx={{ minWidth: 140, fontWeight: 600, color: 'text.secondary' }}>Dosya Kodu:</Typography>
                  <Typography variant="body2">{fileCode || '—'}</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Typography variant="body2" sx={{ minWidth: 140, fontWeight: 600, color: 'text.secondary' }}>Bütçe Kalemi:</Typography>
                  <Typography variant="body2">{budgetType || '—'}</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Typography variant="body2" sx={{ minWidth: 140, fontWeight: 600, color: 'text.secondary' }}>Açıklama:</Typography>
                  <Typography variant="body2">{description || '—'}</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Typography variant="body2" sx={{ minWidth: 140, fontWeight: 600, color: 'text.secondary' }}>Malzeme Sayısı:</Typography>
                  <Typography variant="body2">{selectedItems.length} kalem</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Typography variant="body2" sx={{ minWidth: 140, fontWeight: 600, color: 'text.secondary' }}>Tahmini Toplam:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800, color: 'primary.main' }}>
                    {selectedItems.reduce((s, i) => s + i.quantity * i.estimatedUnitPrice, 0).toLocaleString('tr-TR')} ₺
                  </Typography>
                </Box>
              </Box>
              <Alert severity="info" sx={{ mt: 2, borderRadius: '10px' }}>
                Onaylandığında <strong>Talep Yazısı</strong> ve <strong>Görev Yazısı</strong> otomatik olarak Yönetim Konsolunda üretilecektir.
              </Alert>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          {activeStep > 0 && (
            <Button onClick={() => setActiveStep(s => s - 1)}>Geri</Button>
          )}
          {activeStep < PROCUREMENT_STEPS.length - 1 ? (
            <Button variant="contained" endIcon={<ArrowRight size={16} />} onClick={() => setActiveStep(s => s + 1)}>
              İleri
            </Button>
          ) : (
            <Button
              variant="contained"
              color="success"
              onClick={handleCreate}
              disabled={saving}
              startIcon={saving ? <CircularProgress size={16} color="inherit" /> : undefined}
            >
              {saving ? 'Kaydediliyor...' : 'Talebi Oluştur'}
            </Button>
          )}
          <Button onClick={() => { setCreateOpen(false); resetForm() }}>İptal</Button>
        </DialogActions>
      </Dialog>

      {/* Detail Dialog */}
      {detailReq && (
        <Dialog open onClose={() => setDetailReq(null)} maxWidth="md" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>{detailReq.requestNo}</Typography>
              <Chip label={STATUS_LABELS[detailReq.status] || detailReq.status}
                sx={{ backgroundColor: `${STATUS_COLORS[detailReq.status]}22`, color: STATUS_COLORS[detailReq.status], fontWeight: 700 }} />
            </Box>
          </DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              {[
                ['Müdürlük', detailReq.departmentName], ['Talep Eden', `${detailReq.userName} (${detailReq.userTitle})`],
                ['Dosya Kodu', detailReq.fileCode], ['Bütçe Kalemi', detailReq.budgetType],
                ['Açıklama', detailReq.description], ['Tarih', new Date(detailReq.createdAt).toLocaleDateString('tr-TR')]
              ].map(([k, v]) => (
                <Grid size={{ xs: 12, sm: 6 }} key={k}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>{k}</Typography>
                  <Typography variant="body2">{v}</Typography>
                </Grid>
              ))}
            </Grid>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>Talep Kalemleri</Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Malzeme</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Tür</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Miktar</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>B.Fiyat</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Toplam</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {detailReq.items.map(item => (
                  <TableRow key={item.id}>
                    <TableCell>{item.materialName}</TableCell>
                    <TableCell>
                      <Chip label={item.materialTypeName || item.materialTypeCode} size="small"
                        color={item.materialTypeCode === '255' ? 'secondary' : 'primary'} variant="outlined" />
                    </TableCell>
                    <TableCell>{item.quantity} {item.unit}</TableCell>
                    <TableCell>{item.estimatedUnitPrice.toLocaleString('tr-TR')} ₺</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>{item.totalEstimatedPrice.toLocaleString('tr-TR')} ₺</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, p: 2, backgroundColor: 'action.hover', borderRadius: '8px' }}>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Toplam Tahmini: {detailReq.totalEstimatedAmount.toLocaleString('tr-TR')} ₺
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setDetailReq(null)}>Kapat</Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  )
}
