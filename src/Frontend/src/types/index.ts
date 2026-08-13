export interface Department {
  id: number;
  name: string;
  code: string;
  description: string;
  isActive: boolean;
  userCount: number;
}

export interface UserProfile {
  id: number;
  username: string;
  fullName: string;
  email: string;
  phone: string;
  departmentId: number;
  departmentName: string;
  departmentCode: string;
  title: "Şef" | "Teminci" | string; // Must strictly show Şef or Teminci
  role: string;
}

export interface MaterialType {
  id: number;
  code: string; // "150" or "255"
  name: string; // "150 Sarf Malzemesi" or "255 Demirbaş"
  description: string;
}

export interface Warehouse {
  id: number;
  name: string;
  location: string;
  departmentId?: number;
  departmentName?: string;
}

export interface Material {
  id: number;
  code: string;
  name: string;
  materialTypeId: number;
  materialTypeCode: string;
  materialTypeName: string;
  warehouseId: number;
  warehouseName: string;
  stockQuantity: number;
  unit: string;
  unitPrice: number;
  createdAt: string;
}

export interface CreateMaterialInput {
  code: string;
  name: string;
  materialTypeId: number;
  warehouseId: number;
  stockQuantity: number;
  unit: string;
  unitPrice: number;
}

export interface RequestItem {
  id: number;
  requestId: number;
  materialId: number;
  materialCode: string;
  materialName: string;
  materialTypeName: string;
  materialTypeCode: string;
  unit: string;
  quantity: number;
  estimatedUnitPrice: number;
  totalEstimatedPrice: number;
  notes: string;
}

export interface RequestModel {
  id: number;
  requestNo: string;
  departmentId: number;
  departmentName: string;
  userId: number;
  userName: string;
  userTitle: string;
  fileCode: string;
  description: string;
  budgetType: string;
  status: "Draft" | "PendingApproval" | "InProcurement" | "InTender" | "Completed" | "Cancelled" | string;
  createdAt: string;
  updatedAt?: string;
  totalEstimatedAmount: number;
  items: RequestItem[];
  tender?: TenderModel;
}

export interface CreateRequestInput {
  fileCode: string;
  description: string;
  budgetType: string;
  warehouseId: number;
  items: {
    materialId: number;
    quantity: number;
    estimatedUnitPrice: number;
    notes: string;
  }[];
}

export interface Firm {
  id: number;
  taxNumber: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
}

export interface FirmOffer {
  id: number;
  tenderId: number;
  firmId: number;
  firmName: string;
  firmTaxNumber: string;
  offerAmount: number;
  offerDate: string;
  isWinning: boolean;
  notes: string;
}

export interface TenderModel {
  id: number;
  tenderNo: string;
  requestId: number;
  requestNo: string;
  title: string;
  tenderDate: string;
  status: "Active" | "Evaluating" | "Completed" | "Cancelled" | string;
  winningFirmId?: number;
  winningFirmName?: string;
  winningAmount?: number;
  completedAt?: string;
  offers: FirmOffer[];
}

export interface OfferComparison {
  tenderId: number;
  tenderNo: string;
  requestNo: string;
  departmentName: string;
  estimatedTotalAmount: number;
  offers: FirmOffer[];
  lowestOfferFirmId: number;
  lowestOfferAmount: number;
}

export interface ManagementDocument {
  id: number;
  documentNo: string;
  documentType: "TalepYazisi" | "GorevYazisi" | "IhaleOnayBelgesi" | "TeklifMektubu" | string;
  requestId?: number;
  requestNo?: string;
  tenderId?: number;
  tenderNo?: string;
  title: string;
  contentJson: string;
  createdAt: string;
  createdByUserId: number;
  createdByUserName: string;
  createdByUserTitle: string;
}

export interface NotificationModel {
  id: number;
  userId: number;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface AuditLogModel {
  id: number;
  userId?: number;
  username: string;
  action: string;
  module: string;
  details: string;
  ipAddress: string;
  timestamp: string;
}
