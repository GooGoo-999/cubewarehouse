export interface User {
  id: string;
  username: string;
  name: string;
  role: 'admin' | 'user';
  password: string;
}

export interface Hospital {
  id: string;
  name: string;
  modality: string;
  systemId: string;
  equipment: string;
  softwareVersion: string;
  address: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
}

export interface Part {
  id: string;
  hospitalId: string;
  hospitalName: string;
  partName: string;
  partNumber: string;
  serialNumber: string;
  replacementDate: string;
  worker: string;
  errorContent: string;
  createdAt: string;
  updatedAt: string;
}

export interface WarehouseItem {
  id: string;
  partName: string;
  partNumber: string;
  serialNumber: string;
  location: string;
  inboundDate: string;
  status: 'Good' | 'Bad';
  description: string;
  author: string;
  createdAt: string;
  updatedAt: string;
}

export interface CoilItem {
  id: string;
  coilName: string;
  coilNumber: string;
  serialNumber: string;
  location: string;
  inboundDate: string;
  status: 'Good' | 'Bad';
  description: string;
  author: string;
  createdAt: string;
  updatedAt: string;
}

export interface InOutHistory {
  id: string;
  date: string;
  partName: string;
  partNumber: string;
  serialNumber: string;
  location: string;
  type: '입고' | '출고' | '삭제';
  hospitalName?: string;
  status?: string;
  description: string;
  inbounder?: string;
  outbounder?: string;
  createdAt: string;
}

export interface OutboundPart {
  id: string;
  date: string;
  hospital: string;
  partName: string;
  partNumber: string;
  serialNumber: string;
  worker: string;
  notes: string;
  author: string;
  createdAt: string;
}

export interface OutboundHistory {
  id: string;
  date: string;
  hospital: string;
  partName: string;
  partNumber: string;
  serialNumber: string;
  worker: string;
  notes: string;
  author: string;
  createdAt: string;
}

export interface Account {
  id: string;
  username: string;
  name: string;
  role: 'admin' | 'user';
  password: string;
  createdAt: string;
  updatedAt: string;
}

export type NavigationSection = 
  | 'hospitals'
  | 'hospital-list'
  | 'warehouse'
  | 'coil'
  | 'inout-history'
  | 'parts'
  | 'history'
  | 'accounts'
  | 'hospital-detail'; 