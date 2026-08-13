import React, { useState, useEffect } from 'react'
import {
  Box, Card, CardContent, Typography, Button, Chip, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Select, FormControl, InputLabel,
  Table, TableBody, TableCell, TableHead, TableRow,
  IconButton, Tooltip, CircularProgress, Alert, Grid,
  Tabs, Tab, LinearProgress, Avatar, InputAdornment, Switch, FormControlLabel
} from '@mui/material'
import {
  ShoppingCart, Package, Search, Eye, Plus, Trash2,
  Warehouse, Tag, AlertTriangle, TrendingDown, TrendingUp,
  BarChart3, Edit, Archive, ArrowUpDown
} from 'lucide-react'
import type { Material, MaterialType, Warehouse as WarehouseType, CreateMaterialInput } from '../types'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

const DEMO_MATERIALS: Material[] = [
  { id: 1, code: 'MAL-150-001', name: 'A4 Fotokopi Kağıdı (80 gr)', materialTypeId: 1, materialTypeCode: '150', materialTypeName: '150 Sarf Malzemesi', warehouseId: 1, warehouseName: 'Bilgi İşlem Ana Depo', stockQuantity: 500, unit: 'Paket', unitPrice: 145, createdAt: '2026-01-15T00:00:00Z' },
  { id: 2, code: 'MAL-150-002', name: 'Siyah Toner (HP LaserJet)', materialTypeId: 1, materialTypeCode: '150', materialTypeName: '150 Sarf Malzemesi', warehouseId: 1, warehouseName: 'Bilgi İşlem Ana Depo', stockQuantity: 35, unit: 'Adet', unitPrice: 850, createdAt: '2026-02-10T00:00:00Z' },
  { id: 3, code: 'MAL-150-003', name: 'Renkli Toner Set (HP)', materialTypeId: 1, materialTypeCode: '150', materialTypeName: '150 Sarf Malzemesi', warehouseId: 1, warehouseName: 'Bilgi İşlem Ana Depo', stockQuantity: 12, unit: 'Set', unitPrice: 2400, createdAt: '2026-03-05T00:00:00Z' },
  { id: 4, code: 'MAL-255-001', name: 'Masaüstü İş İstasyonu', materialTypeId: 2, materialTypeCode: '255', materialTypeName: '255 Demirbaş', warehouseId: 1, warehouseName: 'Bilgi İşlem Ana Depo', stockQuantity: 20, unit: 'Adet', unitPrice: 32000, createdAt: '2026-01-20T00:00:00Z' },
  { id: 5, code: 'MAL-255-002', name: '27" Monitör (Dell U2723QE)', materialTypeId: 2, materialTypeCode: '255', materialTypeName: '255 Demirbaş', warehouseId: 1, warehouseName: 'Bilgi İşlem Ana Depo', stockQuantity: 8, unit: 'Adet', unitPrice: 19500, createdAt: '2026-02-15T00:00:00Z' },
  { id: 6, code: 'MAL-150-004', name: 'Cat6 UTP Ağ Kablosu (305m)', materialTypeId: 1, materialTypeCode: '150', materialTypeName: '150 Sarf Malzemesi', warehouseId: 1, warehouseName: 'Bilgi İşlem Ana Depo', stockQuantity: 3, unit: 'Kutu', unitPrice: 4800, createdAt: '2026-04-01T00:00:00Z' },
  { id: 7, code: 'MAL-255-003', name: 'Lazer Yazıcı (HP M404dn)', materialTypeId: 2, materialTypeCode: '255', materialTypeName: '255 Demirbaş', warehouseId: 1, warehouseName: 'Bilgi İşlem Ana Depo', stockQuantity: 5, unit: 'Adet', unitPrice: 12500, createdAt: '2026-05-10T00:00:00Z' },
  { id: 8, code: 'MAL-150-005', name: 'Zımba Teli (No:24/6)', materialTypeId: 1, materialTypeCode: '150', materialTypeName: '150 Sarf Malzemesi', warehouseId: 2, warehouseName: 'Genel Belediye Ambarı', stockQuantity: 200, unit: 'Kutu', unitPrice: 35, createdAt: '2026-01-01T00:00:00Z' },
  { id: 9, code: 'MAL-150-006', name: 'Klasör (Geniş, Mavi)', materialTypeId: 1, materialTypeCode: '150', materialTypeName: '150 Sarf Malzemesi', warehouseId: 2, warehouseName: 'Genel Belediye Ambarı', stockQuantity: 45, unit: 'Adet', unitPrice: 85, createdAt: '2026-01-01T00:00:00Z' },
  { id: 10, code: 'MAL-255-004', name: 'Ergonomik Ofis Koltuğu', materialTypeId: 2, materialTypeCode: '255', materialTypeName: '255 Demirbaş', warehouseId: 2, warehouseName: 'Genel Belediye Ambarı', stockQuantity: 15, unit: 'Adet', unitPrice: 8500, createdAt: '2026-03-20T00:00:00Z' }
]

const DEMO_WAREHOUSES: WarehouseType[] = [
  { id: 1, name: 'Bilgi İşlem Ana Depo', location: 'A Blok Zemin Kat', departmentId: 1, departmentName: 'Bilgi İşlem Müdürlüğü' },
  { id: 2, name: 'Genel Belediye Ambarı', location: 'Garaj Binası', departmentId: undefined, departmentName: undefined },
  { id: 3, name: 'Kültür Sanat Depo', location: 'Kültür Merkezi', departmentId: 2, departmentName: 'Kültür Sanat ve Sosyal İşler Müdürlüğü' }
]

const DEMO_MATERIAL_TYPES: MaterialType[] = [
  { id: 1, code: '150', name: '150 Sarf Malzemesi', description: 'Tüketim malzemeleri - kırtasiye, toner, kablo vb.' },
  { id: 2, code: '255', name: '255 Demirbaş', description: 'Dayanıklı taşınır mallar - bilgisayar, yazıcı, mobilya vb.' }
]

const LOW_STOCK_THRESHOLD = 15

interface StatCardProps {
  title: string; value: string | number; subtitle?: string; color: string; icon: React.ReactNode
}
const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, color, icon }) => (
  <Card sx={{ height: '100%', position: 'relative', overflow: 'visible' }}>
    <CardContent sx={{ p: 2.5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>{title}</Typography>
          <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1, mt: 0.5 }}>{value}</Typography>
          {subtitle && <Typography variant="caption" color="text.secondary">{subtitle}</Typography>}
        </Box>
        <Box sx={{ width: 44, height: 44, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: `${color}22`, color }}>
          {icon}
        </Box>
      </Box>
    </CardContent>
    <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, borderRadius: '0 0 12px 12px', backgroundColor: color }} />
  </Card>
)

export const ProcurementPage: React.FC = () => {
  const { user } = useAuth()
  const [materials, setMaterials] = useState<Material[]>([])
  const [warehouses, setWarehouses] = useState<WarehouseType[]>([])
  const [materialTypes, setMaterialTypes] = useState<MaterialType[]>([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [filterTypeId, setFilterTypeId] = useState(0)
  const [filterWarehouseId, setFilterWarehouseId] = useState(0)
  const [showLowStockOnly, setShowLowStockOnly] = useState(false)
  const [tabValue, setTabValue] = useState(0) // 0=Malzeme, 1=Ambar

  // Add material dialog
  const [addOpen, setAddOpen] = useState(false)
  const [newCode, setNewCode] = useState('')
  const [newName, setNewName] = useState('')
  const [newTypeId, setNewTypeId] = useState(0)
  const [newWarehouseId, setNewWarehouseId] = useState(0)
  const [newStock, setNewStock] = useState(0)
  const [newUnit, setNewUnit] = useState('Adet')
  const [newPrice, setNewPrice] = useState(0)
  const [saving, setSaving] = useState(false)

  // Detail dialog
  const [detailMaterial, setDetailMaterial] = useState<Material | null>(null)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      const [matRes, whRes, typeRes] = await Promise.all([
        api.get('/materials?filterDepartment=false'),
        api.get(`/warehouses?departmentId=${user?.departmentId || 1}`),
        api.get('/materials/types')
      ])
      setMaterials(matRes.data as Material[])
      setWarehouses(whRes.data as WarehouseType[])
      setMaterialTypes(typeRes.data as MaterialType[])
    } catch {
      setMaterials(DEMO_MATERIALS)
      setWarehouses(DEMO_WAREHOUSES)
      setMaterialTypes(DEMO_MATERIAL_TYPES)
    } finally { setLoading(false) }
  }

  const handleAddMaterial = async () => {
    if (!newCode || !newName || !newTypeId || !newWarehouseId) return
    setSaving(true)
    const payload: CreateMaterialInput = {
      code: newCode, name: newName, materialTypeId: newTypeId,
      warehouseId: newWarehouseId, stockQuantity: newStock, unit: newUnit, unitPrice: newPrice
    }
    try {
      await api.post('/materials', payload)
      await fetchData()
    } catch {
      const type = materialTypes.find(t => t.id === newTypeId)
      const wh = warehouses.find(w => w.id === newWarehouseId)
      const mock: Material = {
        id: Date.now(), code: newCode, name: newName,
        materialTypeId: newTypeId, materialTypeCode: type?.code || '150',
        materialTypeName: type?.name || '', warehouseId: newWarehouseId,
        warehouseName: wh?.name || '', stockQuantity: newStock,
        unit: newUnit, unitPrice: newPrice, createdAt: new Date().toISOString()
      }
      setMaterials(prev => [...prev, mock])
    } finally {
      setSaving(false); setAddOpen(false)
      setNewCode(''); setNewName(''); setNewTypeId(0); setNewWarehouseId(0)
      setNewStock(0); setNewUnit('Adet'); setNewPrice(0)
    }
  }

  // Filter logic
  const filteredMaterials = materials.filter(m => {
    const matchesSearch = !searchTerm ||
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.code.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = !filterTypeId || m.materialTypeId === filterTypeId
    const matchesWarehouse = !filterWarehouseId || m.warehouseId === filterWarehouseId
    const matchesLowStock = !showLowStockOnly || m.stockQuantity <= LOW_STOCK_THRESHOLD
    return matchesSearch && matchesType && matchesWarehouse && matchesLowStock
  })

  // Stats
  const totalMaterials = materials.length
  const sarf = materials.filter(m => m.materialTypeCode === '150')
  const demirbas = materials.filter(m => m.materialTypeCode === '255')
  const lowStockCount = materials.filter(m => m.stockQuantity <= LOW_STOCK_THRESHOLD).length
  const totalStockValue = materials.reduce((s, m) => s + m.stockQuantity * m.unitPrice, 0)

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <Avatar sx={{ bgcolor: '#10b981', width: 40, height: 40 }}>
              <ShoppingCart size={20} />
            </Avatar>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>Satın Alma ve Tedarik</Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            {user?.departmentName} — Ambar yönetimi, malzeme stok takibi ve tedarik süreçleri
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Plus size={18} />} onClick={() => setAddOpen(true)} sx={{ borderRadius: '10px' }}>
          Yeni Malzeme
        </Button>
      </Box>

      {/* Stats Row */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard title="Toplam Malzeme" value={totalMaterials} subtitle={`${sarf.length} sarf, ${demirbas.length} demirbaş`} color="#3b82f6" icon={<Package size={22} />} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard title="Toplam Stok Değeri" value={`₺${(totalStockValue / 1000).toFixed(0)}K`} color="#10b981" icon={<TrendingUp size={22} />} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard title="Ambar Sayısı" value={warehouses.length} color="#8b5cf6" icon={<Warehouse size={22} />} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard title="Düşük Stok Uyarısı" value={lowStockCount} subtitle="Eşik: ≤15 adet" color="#f59e0b" icon={<AlertTriangle size={22} />} />
        </Grid>
      </Grid>

      {/* Tabs */}
      <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ mb: 3, '& .MuiTab-root': { fontWeight: 700, textTransform: 'none' } }}>
        <Tab label="Malzeme Envanter" icon={<Package size={16} />} iconPosition="start" />
        <Tab label="Ambar Yönetimi" icon={<Warehouse size={16} />} iconPosition="start" />
      </Tabs>

      {/* Tab 0: Materials */}
      {tabValue === 0 && (
        <Card>
          <CardContent sx={{ p: 3, pb: 1 }}>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField size="small" fullWidth placeholder="Malzeme adı veya kodu ara..."
                  value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                  slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search size={16} /></InputAdornment> } }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Malzeme Türü</InputLabel>
                  <Select value={filterTypeId} label="Malzeme Türü" onChange={e => setFilterTypeId(Number(e.target.value))}>
                    <MenuItem value={0}>Tümü</MenuItem>
                    {materialTypes.map(t => <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Ambar</InputLabel>
                  <Select value={filterWarehouseId} label="Ambar" onChange={e => setFilterWarehouseId(Number(e.target.value))}>
                    <MenuItem value={0}>Tümü</MenuItem>
                    {warehouses.map(w => <MenuItem key={w.id} value={w.id}>{w.name}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 2 }}>
                <FormControlLabel
                  control={<Switch checked={showLowStockOnly} onChange={e => setShowLowStockOnly(e.target.checked)} color="warning" />}
                  label={<Typography variant="caption" sx={{ fontWeight: 600 }}>Düşük Stok</Typography>}
                />
              </Grid>
            </Grid>
          </CardContent>

          <CardContent sx={{ p: 0 }}>
            {loading && <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>}
            {!loading && (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, pl: 3 }}>Kod</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Malzeme Adı</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Tür</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Ambar</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Stok</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Birim Fiyat</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Toplam Değer</TableCell>
                    <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>İşlem</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredMaterials.map(mat => {
                    const isLowStock = mat.stockQuantity <= LOW_STOCK_THRESHOLD
                    return (
                      <TableRow key={mat.id} hover sx={{
                        backgroundColor: isLowStock ? 'rgba(245, 158, 11, 0.04)' : 'transparent'
                      }}>
                        <TableCell sx={{ pl: 3 }}>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main', fontFamily: 'monospace' }}>
                            {mat.code}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{mat.name}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={mat.materialTypeName}
                            size="small"
                            color={mat.materialTypeCode === '255' ? 'secondary' : 'primary'}
                            variant="outlined"
                            sx={{ fontWeight: 700 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Warehouse size={12} />
                            <Typography variant="caption">{mat.warehouseName}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" sx={{
                              fontWeight: 800,
                              color: isLowStock ? '#f59e0b' : '#10b981'
                            }}>
                              {mat.stockQuantity}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">{mat.unit}</Typography>
                            {isLowStock && (
                              <Tooltip title="Düşük stok uyarısı">
                                <AlertTriangle size={14} color="#f59e0b" />
                              </Tooltip>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {mat.unitPrice.toLocaleString('tr-TR')} ₺
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {(mat.stockQuantity * mat.unitPrice).toLocaleString('tr-TR')} ₺
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                            <Tooltip title="Detay">
                              <IconButton size="small" color="primary" onClick={() => setDetailMaterial(mat)}>
                                <Eye size={16} />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                  {filteredMaterials.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
                        <Package size={40} style={{ opacity: 0.3, marginBottom: 8 }} />
                        <Typography variant="body2">Eşleşen malzeme bulunamadı</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>

          {!loading && filteredMaterials.length > 0 && (
            <CardContent sx={{ pt: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                  {filteredMaterials.length} malzeme gösteriliyor (toplam {materials.length})
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  Görüntülenen Toplam Değer: {filteredMaterials.reduce((s, m) => s + m.stockQuantity * m.unitPrice, 0).toLocaleString('tr-TR')} ₺
                </Typography>
              </Box>
            </CardContent>
          )}
        </Card>
      )}

      {/* Tab 1: Warehouses */}
      {tabValue === 1 && (
        <Grid container spacing={3}>
          {warehouses.map(wh => {
            const whMaterials = materials.filter(m => m.warehouseId === wh.id)
            const whSarf = whMaterials.filter(m => m.materialTypeCode === '150')
            const whDemirbas = whMaterials.filter(m => m.materialTypeCode === '255')
            const whValue = whMaterials.reduce((s, m) => s + m.stockQuantity * m.unitPrice, 0)
            const whLowStock = whMaterials.filter(m => m.stockQuantity <= LOW_STOCK_THRESHOLD)

            return (
              <Grid size={{ xs: 12, md: 6 }} key={wh.id}>
                <Card sx={{ height: '100%' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Avatar sx={{ bgcolor: '#8b5cf622', color: '#8b5cf6', width: 44, height: 44 }}>
                        <Warehouse size={22} />
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>{wh.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{wh.location}</Typography>
                      </Box>
                      {wh.departmentName && (
                        <Chip label={wh.departmentName} size="small" variant="outlined" color="primary" />
                      )}
                    </Box>

                    <Divider sx={{ mb: 2 }} />

                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      <Grid size={{ xs: 6 }}>
                        <Box sx={{ textAlign: 'center', p: 1.5, borderRadius: '10px', backgroundColor: 'rgba(59, 130, 246, 0.06)' }}>
                          <Typography variant="h5" sx={{ fontWeight: 800, color: '#3b82f6' }}>{whMaterials.length}</Typography>
                          <Typography variant="caption" color="text.secondary">Toplam Malzeme</Typography>
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <Box sx={{ textAlign: 'center', p: 1.5, borderRadius: '10px', backgroundColor: 'rgba(16, 185, 129, 0.06)' }}>
                          <Typography variant="h5" sx={{ fontWeight: 800, color: '#10b981' }}>
                            ₺{(whValue / 1000).toFixed(0)}K
                          </Typography>
                          <Typography variant="caption" color="text.secondary">Stok Değeri</Typography>
                        </Box>
                      </Grid>
                    </Grid>

                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                      <Chip label={`${whSarf.length} Sarf (150)`} size="small" color="primary" variant="outlined" />
                      <Chip label={`${whDemirbas.length} Demirbaş (255)`} size="small" color="secondary" variant="outlined" />
                    </Box>

                    {whLowStock.length > 0 && (
                      <Alert severity="warning" sx={{ borderRadius: '10px', '& .MuiAlert-message': { width: '100%' } }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}>
                          Düşük Stok Uyarısı ({whLowStock.length} malzeme):
                        </Typography>
                        {whLowStock.slice(0, 3).map(m => (
                          <Typography key={m.id} variant="caption" sx={{ display: 'block' }}>
                            • {m.name}: <strong>{m.stockQuantity} {m.unit}</strong>
                          </Typography>
                        ))}
                        {whLowStock.length > 3 && (
                          <Typography variant="caption" color="text.secondary">
                            ve {whLowStock.length - 3} malzeme daha...
                          </Typography>
                        )}
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            )
          })}
        </Grid>
      )}

      {/* Add Material Dialog */}
      <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Plus size={20} />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Yeni Malzeme Ekle</Typography>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            <TextField label="Malzeme Kodu" fullWidth value={newCode} onChange={e => setNewCode(e.target.value)} placeholder="Örn: MAL-150-007" />
            <TextField label="Malzeme Adı" fullWidth value={newName} onChange={e => setNewName(e.target.value)} placeholder="Örn: Siyah Toner HP LaserJet" />
            <FormControl fullWidth>
              <InputLabel>Malzeme Türü</InputLabel>
              <Select value={newTypeId} label="Malzeme Türü" onChange={e => setNewTypeId(Number(e.target.value))}>
                {materialTypes.map(t => (
                  <MenuItem key={t.id} value={t.id}>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>{t.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{t.description}</Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Ambar</InputLabel>
              <Select value={newWarehouseId} label="Ambar" onChange={e => setNewWarehouseId(Number(e.target.value))}>
                {warehouses.map(w => <MenuItem key={w.id} value={w.id}>{w.name} — {w.location}</MenuItem>)}
              </Select>
            </FormControl>
            <Grid container spacing={2}>
              <Grid size={{ xs: 4 }}>
                <TextField label="Stok Adedi" type="number" fullWidth value={newStock || ''} onChange={e => setNewStock(Number(e.target.value))} slotProps={{ htmlInput: { min: 0 } }} />
              </Grid>
              <Grid size={{ xs: 4 }}>
                <TextField label="Birim" fullWidth value={newUnit} onChange={e => setNewUnit(e.target.value)} />
              </Grid>
              <Grid size={{ xs: 4 }}>
                <TextField label="Birim Fiyat (₺)" type="number" fullWidth value={newPrice || ''} onChange={e => setNewPrice(Number(e.target.value))}
                  slotProps={{ input: { startAdornment: <InputAdornment position="start">₺</InputAdornment> }, htmlInput: { min: 0 } }} />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setAddOpen(false)}>İptal</Button>
          <Button variant="contained" onClick={handleAddMaterial} disabled={saving || !newCode || !newName || !newTypeId || !newWarehouseId}
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <Plus size={16} />}>
            {saving ? 'Kaydediliyor...' : 'Malzeme Ekle'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Material Detail Dialog */}
      {detailMaterial && (
        <Dialog open onClose={() => setDetailMaterial(null)} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Package size={22} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>{detailMaterial.name}</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>{detailMaterial.code}</Typography>
                </Box>
              </Box>
              <Chip
                label={detailMaterial.materialTypeName}
                color={detailMaterial.materialTypeCode === '255' ? 'secondary' : 'primary'}
              />
            </Box>
          </DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={2}>
              {[
                ['Malzeme Kodu', detailMaterial.code],
                ['Malzeme Türü', detailMaterial.materialTypeName],
                ['Ambar', detailMaterial.warehouseName],
                ['Birim', detailMaterial.unit],
                ['Stok Miktarı', `${detailMaterial.stockQuantity} ${detailMaterial.unit}`],
                ['Birim Fiyat', `${detailMaterial.unitPrice.toLocaleString('tr-TR')} ₺`],
                ['Toplam Stok Değeri', `${(detailMaterial.stockQuantity * detailMaterial.unitPrice).toLocaleString('tr-TR')} ₺`],
                ['Kayıt Tarihi', new Date(detailMaterial.createdAt).toLocaleDateString('tr-TR')]
              ].map(([k, v]) => (
                <Grid size={{ xs: 6 }} key={k}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>{k}</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{v}</Typography>
                </Grid>
              ))}
            </Grid>

            {detailMaterial.stockQuantity <= LOW_STOCK_THRESHOLD && (
              <Alert severity="warning" sx={{ mt: 3, borderRadius: '10px' }}>
                <strong>Düşük Stok Uyarısı:</strong> Bu malzemenin stok seviyesi kritik eşiğin altına düşmüştür.
                Temin talebi oluşturmanız önerilir.
              </Alert>
            )}

            {/* Stock level visual */}
            <Box sx={{ mt: 3, p: 2, borderRadius: '10px', backgroundColor: 'action.hover' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 700 }}>Stok Seviyesi</Typography>
                <Typography variant="caption" sx={{ fontWeight: 700, color: detailMaterial.stockQuantity <= LOW_STOCK_THRESHOLD ? '#f59e0b' : '#10b981' }}>
                  {detailMaterial.stockQuantity} {detailMaterial.unit}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={Math.min((detailMaterial.stockQuantity / (LOW_STOCK_THRESHOLD * 10)) * 100, 100)}
                sx={{
                  height: 10, borderRadius: 5,
                  backgroundColor: 'rgba(100,116,139,0.1)',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 5,
                    backgroundColor: detailMaterial.stockQuantity <= LOW_STOCK_THRESHOLD ? '#f59e0b' : '#10b981'
                  }
                }}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setDetailMaterial(null)}>Kapat</Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  )
}