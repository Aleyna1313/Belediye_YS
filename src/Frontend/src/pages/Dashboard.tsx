import React, { useState, useEffect } from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  LinearProgress,
  Divider,
  Avatar
} from '@mui/material'
import {
  FilePlus,
  Gavel,
  Package,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertCircle,
  Building2
} from 'lucide-react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js'
import { Bar, Doughnut } from 'react-chartjs-2'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement)

const STATUS_COLORS: Record<string, string> = {
  'PendingApproval': '#f59e0b',
  'InProcurement': '#3b82f6',
  'InTender': '#8b5cf6',
  'Completed': '#10b981',
  'Cancelled': '#ef4444',
  'Draft': '#64748b'
}

const STATUS_LABELS: Record<string, string> = {
  'PendingApproval': 'Onay Bekliyor',
  'InProcurement': 'Satın Almada',
  'InTender': 'İhalede',
  'Completed': 'Tamamlandı',
  'Cancelled': 'İptal',
  'Draft': 'Taslak'
}

interface StatCardProps {
  title: string
  value: string | number
  subtitle: string
  color: string
  icon: React.ReactNode
  trend?: string
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, color, icon, trend }) => (
  <Card sx={{ height: '100%', position: 'relative', overflow: 'visible' }}>
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600, mb: 0.5 }}>
            {title}
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1 }}>
            {value}
          </Typography>
        </Box>
        <Box sx={{
          width: 48, height: 48, borderRadius: '14px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backgroundColor: `${color}22`, color: color
        }}>
          {icon}
        </Box>
      </Box>
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        {subtitle}
      </Typography>
      {trend && (
        <Chip label={trend} size="small" sx={{ ml: 1, height: 20, fontSize: '0.7rem', backgroundColor: '#10b98122', color: '#10b981' }} />
      )}
    </CardContent>
    {/* Color accent bar at bottom */}
    <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, borderRadius: '0 0 12px 12px', backgroundColor: color }} />
  </Card>
)

export const Dashboard: React.FC = () => {
  const { user } = useAuth()
  const [liveRequests, setLiveRequests] = useState<any[]>([])
  const [liveTenders, setLiveTenders] = useState<any[]>([])
  const [lowStockCount, setLowStockCount] = useState<number>(4)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [reqRes, tendRes, matRes] = await Promise.all([
          api.get('/requests?filterDepartment=true'),
          api.get('/tenders?filterDepartment=true'),
          api.get('/materials?filterDepartment=false')
        ])
        if (reqRes.data && Array.isArray(reqRes.data)) setLiveRequests(reqRes.data)
        if (tendRes.data && Array.isArray(tendRes.data)) setLiveTenders(tendRes.data)
        if (matRes.data && Array.isArray(matRes.data)) {
          setLowStockCount(matRes.data.filter((m: any) => m.stockQuantity <= 15).length)
        }
      } catch {
        // keep fallback stats
      }
    }
    fetchDashboardData()
  }, [])

  const activeRequestsCount = liveRequests.length > 0 ? liveRequests.length : 8
  const activeTendersCount = liveTenders.length > 0 ? liveTenders.filter(t => t.status === 'Active' || t.status === 'Evaluating').length : 3

  const barData = {
    labels: ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem'],
    datasets: [
      {
        label: 'Tamamlanan Talepler',
        data: [4, 7, 5, 8, 6, 9, Math.max(liveRequests.filter(r => r.status === 'Completed').length, 3)],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderRadius: 8,
        borderSkipped: false,
      },
      {
        label: 'Tamamlanan İhaleler',
        data: [2, 3, 4, 5, 3, 6, Math.max(liveTenders.filter(t => t.status === 'Completed').length, 2)],
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderRadius: 8,
        borderSkipped: false,
      }
    ]
  }

  const statusCounts = {
    PendingApproval: liveRequests.filter(r => r.status === 'PendingApproval').length || 3,
    InProcurement: liveRequests.filter(r => r.status === 'InProcurement').length || 5,
    InTender: liveRequests.filter(r => r.status === 'InTender').length || 2,
    Completed: liveRequests.filter(r => r.status === 'Completed').length || 12,
  }

  const doughnutData = {
    labels: ['Onay Bekliyor', 'Satın Almada', 'İhalede', 'Tamamlandı'],
    datasets: [{
      data: [statusCounts.PendingApproval, statusCounts.InProcurement, statusCounts.InTender, statusCounts.Completed],
      backgroundColor: ['#f59e0b', '#3b82f6', '#8b5cf6', '#10b981'],
      borderWidth: 0,
      hoverOffset: 8
    }]
  }

  const recentRequests = liveRequests.length > 0
    ? liveRequests.slice(0, 5).map(r => ({
      no: r.requestNo,
      material: r.description || r.fileCode,
      status: r.status,
      amount: `${(r.totalEstimatedAmount || 0).toLocaleString('tr-TR')} ₺`,
      date: new Date(r.createdAt).toLocaleDateString('tr-TR')
    }))
    : [
      { no: 'TAL-2026-0012', material: 'A4 Fotokopi Kağıdı (150 Sarf)', status: 'InTender', amount: '12.500 ₺', date: '29.07.2026' },
      { no: 'TAL-2026-0011', material: 'Masaüstü Bilgisayar (255 Demirbaş)', status: 'InProcurement', amount: '96.000 ₺', date: '27.07.2026' },
      { no: 'TAL-2026-0010', material: 'Siyah Toner Kartuşu (150 Sarf)', status: 'PendingApproval', amount: '8.500 ₺', date: '25.07.2026' },
      { no: 'TAL-2026-0009', material: 'Cat6 Ağ Kablosu (150 Sarf)', status: 'Completed', amount: '28.800 ₺', date: '21.07.2026' },
      { no: 'TAL-2026-0008', material: '27" Monitör (255 Demirbaş)', status: 'Completed', amount: '47.500 ₺', date: '18.07.2026' },
    ]

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 42, height: 42 }}>
            <Building2 size={22} />
          </Avatar>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary' }}>
              {user?.departmentName || 'Müdürlük'}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Hoş geldiniz, <strong>{user?.fullName}</strong> • {user?.title}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Stat Cards Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            title="Aktif Talepler"
            value={activeRequestsCount}
            subtitle="Bu ay oluşturulan talepler"
            color="#3b82f6"
            icon={<FilePlus size={24} />}
            trend="+2 bu hafta"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            title="Devam Eden İhaleler"
            value={activeTendersCount}
            subtitle="Aktif ihale süreçleri"
            color="#8b5cf6"
            icon={<Gavel size={24} />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            title="Toplam Harcama"
            value="₺193K"
            subtitle="Bu yıl gerçekleşen harcama"
            color="#10b981"
            icon={<TrendingUp size={24} />}
            trend="+12%"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            title="Stok Uyarısı"
            value={lowStockCount}
            subtitle="Düşük stoklu malzeme"
            color="#f59e0b"
            icon={<Package size={24} />}
          />
        </Grid>
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                Aylık Talep ve İhale İstatistikleri
              </Typography>
              <Bar
                data={barData}
                options={{
                  responsive: true,
                  plugins: { legend: { position: 'top' } },
                  scales: {
                    y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' } },
                    x: { grid: { display: false } }
                  }
                }}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                Talep Durum Dağılımı
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <Box sx={{ width: 220, height: 220 }}>
                  <Doughnut
                    data={doughnutData}
                    options={{
                      plugins: { legend: { display: false } },
                      cutout: '70%',
                      maintainAspectRatio: true
                    }}
                  />
                </Box>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {['Onay Bekliyor', 'Satın Almada', 'İhalede', 'Tamamlandı'].map((label, i) => (
                  <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: ['#f59e0b', '#3b82f6', '#8b5cf6', '#10b981'][i] }} />
                      <Typography variant="caption">{label}</Typography>
                    </Box>
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>
                      {[3, 5, 2, 12][i]}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Requests Table */}
      <Card>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Son Talepler</Typography>
            <Chip label={user?.departmentName} size="small" color="primary" variant="outlined" />
          </Box>
          <Divider sx={{ mb: 2 }} />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {recentRequests.map((req) => (
              <Box
                key={req.no}
                sx={{
                  display: 'flex', alignItems: 'center', gap: 2,
                  p: 1.5, borderRadius: '10px',
                  '&:hover': { backgroundColor: 'action.hover' },
                  transition: 'background 0.2s'
                }}
              >
                <Box sx={{ color: STATUS_COLORS[req.status] }}>
                  {req.status === 'Completed' ? <CheckCircle size={18} /> :
                    req.status === 'PendingApproval' ? <Clock size={18} /> :
                      <AlertCircle size={18} />}
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{req.no}</Typography>
                  <Typography variant="caption" color="text.secondary">{req.material}</Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Chip
                    label={STATUS_LABELS[req.status] || req.status}
                    size="small"
                    sx={{
                      backgroundColor: `${STATUS_COLORS[req.status]}22`,
                      color: STATUS_COLORS[req.status],
                      fontWeight: 700,
                      fontSize: '0.7rem',
                      mb: 0.5
                    }}
                  />
                  <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
                    {req.date}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 700, minWidth: 80, textAlign: 'right', color: 'text.primary' }}>
                  {req.amount}
                </Typography>
              </Box>
            ))}
          </Box>
          <Box sx={{ mt: 2 }}>
            <LinearProgress variant="determinate" value={75} sx={{ borderRadius: 4, height: 6 }} />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              Aylık Bütçe Kullanımı: %75 (₺193.000 / ₺258.000)
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}
