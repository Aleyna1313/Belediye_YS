import React, { useState, useEffect } from 'react'
import {
  Box, Card, CardContent, Typography, Chip, Button, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Table, TableBody, TableCell, TableHead, TableRow,
  IconButton, Tooltip, CircularProgress, Alert
} from '@mui/material'
import {
  FileText, Download, Printer, Eye, FileCheck,
  ClipboardList, Gavel, Mail
} from 'lucide-react'
import type { ManagementDocument } from '../types'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

const DOC_TYPE_LABELS: Record<string, string> = {
  TalepYazisi: 'Talep Yazısı',
  GorevYazisi: 'Görev Yazısı',
  IhaleOnayBelgesi: 'İhale Onay Belgesi',
  TeklifMektubu: 'Teklif Mektubu'
}

const DOC_TYPE_COLORS: Record<string, 'primary' | 'secondary' | 'warning' | 'info'> = {
  TalepYazisi: 'primary',
  GorevYazisi: 'info',
  IhaleOnayBelgesi: 'warning',
  TeklifMektubu: 'secondary'
}

const DOC_TYPE_ICONS: Record<string, React.ReactNode> = {
  TalepYazisi: <ClipboardList size={18} />,
  GorevYazisi: <FileCheck size={18} />,
  IhaleOnayBelgesi: <Gavel size={18} />,
  TeklifMektubu: <Mail size={18} />
}

const DEMO_DOCUMENTS: ManagementDocument[] = [
  {
    id: 1, documentNo: 'EVR-TALEP-0001', documentType: 'TalepYazisi',
    requestId: 1, requestNo: 'TAL-2026-0012',
    title: 'TAL-2026-0012 Nolu Satın Alma Talep Yazısı',
    contentJson: JSON.stringify({
      RequestNo: 'TAL-2026-0012', DepartmentName: 'Bilgi İşlem Müdürlüğü',
      UserName: 'Ahmet Yılmaz', UserTitle: 'Şef',
      FileCode: 'DOSYA-20260729-142', Description: 'A4 Fotokopi Kağıdı Temini',
      BudgetType: 'Mal ve Malzeme Alımı', Date: '29.07.2026',
      Items: [{ MaterialName: 'A4 Fotokopi Kağıdı (80 gr)', Quantity: 100, UnitPrice: 145, TotalPrice: 14500 }]
    }),
    createdAt: '2026-07-29T10:00:00Z', createdByUserId: 2,
    createdByUserName: 'Ahmet Yılmaz', createdByUserTitle: 'Şef'
  },
  {
    id: 2, documentNo: 'EVR-GOREV-0001', documentType: 'GorevYazisi',
    requestId: 1, requestNo: 'TAL-2026-0012',
    title: 'TAL-2026-0012 Nolu Piyasa Fiyat Araştırması Görev Yazısı',
    contentJson: JSON.stringify({
      RequestNo: 'TAL-2026-0012', DepartmentName: 'Bilgi İşlem Müdürlüğü',
      AssignedUser: 'Mehmet Demir', AssignedUserTitle: 'Teminci',
      Subject: 'A4 Fotokopi Kağıdı Temini Görevlendirmesi', Date: '29.07.2026'
    }),
    createdAt: '2026-07-29T10:05:00Z', createdByUserId: 2,
    createdByUserName: 'Ahmet Yılmaz', createdByUserTitle: 'Şef'
  },
  {
    id: 3, documentNo: 'EVR-ONAY-0001', documentType: 'IhaleOnayBelgesi',
    tenderId: 1, tenderNo: 'IHL-2026-0001',
    requestId: 1, requestNo: 'TAL-2026-0012',
    title: 'IHL-2026-0001 Nolu İhale Onay Belgesi',
    contentJson: JSON.stringify({
      TenderNo: 'IHL-2026-0001', RequestNo: 'TAL-2026-0012',
      DepartmentName: 'Bilgi İşlem Müdürlüğü',
      EstimatedBudget: 14500, TenderDate: '05.08.2026', Date: '01.08.2026',
      ApproverTitle: 'Müdür / İhale Yetkilisi'
    }),
    createdAt: '2026-07-30T09:00:00Z', createdByUserId: 2,
    createdByUserName: 'Ahmet Yılmaz', createdByUserTitle: 'Şef'
  },
  {
    id: 4, documentNo: 'EVR-TEKLIF-0001', documentType: 'TeklifMektubu',
    tenderId: 1, tenderNo: 'IHL-2026-0001',
    title: 'IHL-2026-0001 Nolu Resmi Teklif Mektubu Şablonu',
    contentJson: JSON.stringify({
      TenderNo: 'IHL-2026-0001', DepartmentName: 'Bilgi İşlem Müdürlüğü',
      Subject: 'A4 Fotokopi Kağıdı Fiyat Teklif Cetveli', Date: '01.08.2026',
      Items: [{ MaterialCode: 'MAL-150-001', MaterialName: 'A4 Fotokopi Kağıdı', Unit: 'Paket', Quantity: 100 }]
    }),
    createdAt: '2026-07-30T09:10:00Z', createdByUserId: 2,
    createdByUserName: 'Ahmet Yılmaz', createdByUserTitle: 'Şef'
  }
]

function DocumentPrintView({ doc, onClose }: { doc: ManagementDocument; onClose: () => void }) {
  let contentObj: Record<string, unknown> = {}
  try { contentObj = JSON.parse(doc.contentJson) } catch { /* empty */ }

  const handlePrint = () => {
    window.print()
  }

  return (
    <Dialog open onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {DOC_TYPE_ICONS[doc.documentType]}
          <Typography variant="h6" sx={{ fontWeight: 700 }}>{doc.title}</Typography>
        </Box>
        <Chip label={DOC_TYPE_LABELS[doc.documentType] || doc.documentType} color={DOC_TYPE_COLORS[doc.documentType] || 'default'} />
      </DialogTitle>
      <DialogContent dividers>
        {/* Official Document Preview */}
        <Box sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: '8px', bgcolor: 'background.paper' }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              {contentObj['DepartmentName'] as string || 'Belediye Müdürlüğü'}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, mt: 1, textDecoration: 'underline' }}>
              {DOC_TYPE_LABELS[doc.documentType]?.toUpperCase() || 'RESMİ EVRAK'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Evrak No: <strong>{doc.documentNo}</strong> &nbsp;|&nbsp; Tarih: <strong>{contentObj['Date'] as string || ''}</strong>
            </Typography>
          </Box>
          <Divider sx={{ mb: 3 }} />
          {/* Content rendering */}
          <Box>
            {Object.entries(contentObj).filter(([k]) => k !== 'Items').map(([key, val]) => (
              <Box key={key} sx={{ display: 'flex', mb: 1, gap: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 700, minWidth: 160, color: 'text.secondary' }}>
                  {key.replace(/([A-Z])/g, ' $1').trim()}:
                </Typography>
                <Typography variant="body2">{String(val)}</Typography>
              </Box>
            ))}
            {Array.isArray(contentObj['Items']) && contentObj['Items'].length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 700, mb: 1 }}>Kalemler:</Typography>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      {Object.keys((contentObj['Items'] as Record<string, unknown>[])[0]).map((k) => (
                        <TableCell key={k} sx={{ fontWeight: 700 }}>{k}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(contentObj['Items'] as Record<string, unknown>[]).map((item, i) => (
                      <TableRow key={i}>
                        {Object.values(item).map((v, j) => (
                          <TableCell key={j}>{String(v)}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            )}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button startIcon={<Printer size={16} />} variant="contained" onClick={handlePrint}>
          Yazdır
        </Button>
        <Button startIcon={<Download size={16} />} variant="outlined">
          PDF İndir
        </Button>
        <Button onClick={onClose}>Kapat</Button>
      </DialogActions>
    </Dialog>
  )
}

export const ManagementConsole: React.FC = () => {
  const { user } = useAuth()
  const [documents, setDocuments] = useState<ManagementDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [previewDoc, setPreviewDoc] = useState<ManagementDocument | null>(null)

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const res = await api.get(`/documents?filterDepartment=true`)
        setDocuments(res.data as ManagementDocument[])
      } catch {
        setDocuments(DEMO_DOCUMENTS)
      } finally {
        setLoading(false)
      }
    }
    fetchDocs()
  }, [])

  const docsByType = documents.reduce((acc, doc) => {
    if (!acc[doc.documentType]) acc[doc.documentType] = []
    acc[doc.documentType].push(doc)
    return acc
  }, {} as Record<string, ManagementDocument[]>)

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>Yönetim Konsolu</Typography>
        <Typography variant="body2" color="text.secondary">
          {user?.departmentName} — Resmi evrakları görüntüle, yazdır ve PDF olarak indir
        </Typography>
      </Box>

      {loading && <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>}

      {!loading && documents.length === 0 && (
        <Alert severity="info" sx={{ borderRadius: '12px' }}>
          Henüz oluşturulmuş evrak bulunmamaktadır. Talep veya ihale oluşturduğunuzda evraklar otomatik üretilecektir.
        </Alert>
      )}

      {/* Group by doc type */}
      {!loading && Object.entries(DOC_TYPE_LABELS).map(([type, label]) => {
        const docs = docsByType[type] || []
        return (
          <Card key={type} sx={{ mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Box sx={{ color: 'primary.main' }}>{DOC_TYPE_ICONS[type]}</Box>
                <Typography variant="h6" sx={{ fontWeight: 700, flex: 1 }}>{label}</Typography>
                <Chip label={`${docs.length} Evrak`} size="small" color={DOC_TYPE_COLORS[type] || 'default'} />
              </Box>
              <Divider sx={{ mb: 2 }} />
              {docs.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                  Bu kategoride henüz evrak yok
                </Typography>
              ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Evrak No</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Başlık</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Talep / İhale</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Oluşturan</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Tarih</TableCell>
                      <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>İşlemler</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {docs.map((doc) => (
                      <TableRow key={doc.id} hover>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                            {doc.documentNo}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{doc.title}</Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                            {doc.requestNo && <Chip label={doc.requestNo} size="small" variant="outlined" color="primary" />}
                            {doc.tenderNo && <Chip label={doc.tenderNo} size="small" variant="outlined" color="secondary" />}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{doc.createdByUserName}</Typography>
                          <Typography variant="caption" color="text.secondary">{doc.createdByUserTitle}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(doc.createdAt).toLocaleDateString('tr-TR')}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                            <Tooltip title="Görüntüle">
                              <IconButton size="small" color="primary" onClick={() => setPreviewDoc(doc)}>
                                <Eye size={16} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Yazdır">
                              <IconButton size="small" color="info" onClick={() => { setPreviewDoc(doc) }}>
                                <Printer size={16} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="PDF İndir">
                              <IconButton size="small" color="secondary">
                                <Download size={16} />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )
      })}

      {previewDoc && (
        <DocumentPrintView doc={previewDoc} onClose={() => setPreviewDoc(null)} />
      )}
    </Box>
  )
}
