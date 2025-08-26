import { 
  User, 
  Hospital, 
  Part, 
  WarehouseItem, 
  CoilItem, 
  InOutHistory, 
  OutboundPart, 
  OutboundHistory, 
  Account 
} from '@/types';

// 기본 데이터 생성
const createDefaultData = () => {
  const defaultAccounts: Account[] = [
    {
      id: '1',
      username: 'admin',
      name: '관리자',
      role: 'admin',
      password: 'admin123',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '2',
      username: 'user',
      name: '일반사용자',
      role: 'user',
      password: 'user123',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  if (typeof window !== 'undefined') {
    if (!localStorage.getItem('accounts')) {
      localStorage.setItem('accounts', JSON.stringify(defaultAccounts));
    }
    if (!localStorage.getItem('hospitals')) {
      localStorage.setItem('hospitals', JSON.stringify([]));
    }
    if (!localStorage.getItem('parts')) {
      localStorage.setItem('parts', JSON.stringify([]));
    }
    if (!localStorage.getItem('warehouse')) {
      localStorage.setItem('warehouse', JSON.stringify([]));
    }
    if (!localStorage.getItem('coils')) {
      localStorage.setItem('coils', JSON.stringify([]));
    }
    if (!localStorage.getItem('inoutHistory')) {
      localStorage.setItem('inoutHistory', JSON.stringify([]));
    }
    if (!localStorage.getItem('outboundParts')) {
      localStorage.setItem('outboundParts', JSON.stringify([]));
    }
    if (!localStorage.getItem('outboundHistory')) {
      localStorage.setItem('outboundHistory', JSON.stringify([]));
    }
  }
};

// 데이터 가져오기
export const getData = <T>(key: string): T[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error(`Error loading data from ${key}:`, error);
    return [];
  }
};

// 데이터 저장하기
export const setData = <T>(key: string, data: T[]): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving data to ${key}:`, error);
  }
};

// 특정 데이터 가져오기
export const getAccounts = (): Account[] => getData<Account>('accounts');
export const getHospitals = (): Hospital[] => getData<Hospital>('hospitals');
export const getParts = (): Part[] => getData<Part>('parts');
export const getWarehouse = (): WarehouseItem[] => getData<WarehouseItem>('warehouse');
export const getCoils = (): CoilItem[] => getData<CoilItem>('coils');
export const getInOutHistory = (): InOutHistory[] => getData<InOutHistory>('inoutHistory');
export const getOutboundParts = (): OutboundPart[] => getData<OutboundPart>('outboundParts');
export const getOutboundHistory = (): OutboundHistory[] => getData<OutboundHistory>('outboundHistory');

// 특정 데이터 저장하기
export const setAccounts = (accounts: Account[]): void => setData('accounts', accounts);
export const setHospitals = (hospitals: Hospital[]): void => setData('hospitals', hospitals);
export const setParts = (parts: Part[]): void => setData('parts', parts);
export const setWarehouse = (warehouse: WarehouseItem[]): void => setData('warehouse', warehouse);
export const setCoils = (coils: CoilItem[]): void => setData('coils', coils);
export const setInOutHistory = (history: InOutHistory[]): void => setData('inoutHistory', history);
export const setOutboundParts = (parts: OutboundPart[]): void => setData('outboundParts', parts);
export const setOutboundHistory = (history: OutboundHistory[]): void => setData('outboundHistory', history);

// ID 생성
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// 날짜 포맷팅
export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('ko-KR');
};

// 검색 함수
export const searchData = <T extends Record<string, any>>(
  data: T[], 
  searchTerm: string, 
  searchFields: (keyof T)[]
): T[] => {
  if (!searchTerm.trim()) return data;
  
  const term = searchTerm.toLowerCase();
  return data.filter(item => 
    searchFields.some(field => {
      const value = item[field];
      return value && value.toString().toLowerCase().includes(term);
    })
  );
};

// 페이지네이션
export const paginateData = <T>(
  data: T[], 
  currentPage: number, 
  itemsPerPage: number
): { data: T[], totalPages: number, totalItems: number } => {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = data.slice(startIndex, endIndex);
  
  return {
    data: paginatedData,
    totalPages: Math.ceil(data.length / itemsPerPage),
    totalItems: data.length
  };
};

// 초기화
export const initializeStorage = () => {
  createDefaultData();
};

// 사용자 인증
export const authenticateUser = (username: string, password: string): User | null => {
  const accounts = getAccounts();
  const user = accounts.find(account => 
    account.username === username && account.password === password
  );
  
  if (user) {
    return {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      password: user.password
    };
  }
  
  return null;
};

// 관리자 권한 확인
export const isAdmin = (user: User | null): boolean => {
  return user?.role === 'admin';
}; 