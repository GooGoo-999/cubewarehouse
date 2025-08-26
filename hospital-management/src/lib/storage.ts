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

import {
  getAccountsFromSupabase,
  setAccountsToSupabase,
  getHospitalsFromSupabase,
  setHospitalsToSupabase,
  authenticateUserFromSupabase,
  initializeSupabaseData,
  checkSupabaseConnection,
} from './supabase-service';

// Supabase 사용 여부 확인 (클라이언트측)
const isSupabaseEnabled = () => {
  const hasSupabase = typeof window !== 'undefined' && 
         process.env.NEXT_PUBLIC_SUPABASE_URL && 
         process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
         process.env.NEXT_PUBLIC_SUPABASE_URL !== 'your_supabase_project_url' &&
         process.env.NEXT_PUBLIC_SUPABASE_URL.includes('supabase.co');
  
  if (hasSupabase) {
    console.log('✅ Supabase 연결 활성화됨');
    console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...');
    console.log('Project ID:', process.env.NEXT_PUBLIC_SUPABASE_URL?.split('.')[0]?.replace('https://', ''));
  } else {
    console.log('⚠️ Supabase 연결 비활성화됨 - localStorage 사용');
    console.log('환경변수 상태:', {
      hasWindow: typeof window !== 'undefined',
      hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      urlValue: process.env.NEXT_PUBLIC_SUPABASE_URL
    });
  }
  
  return hasSupabase;
};

// 자동 데이터 복원
const autoRestoreData = () => {
  if (typeof window === 'undefined') return;
  
  console.log('=== AUTO DATA RESTORE START ===');
  
  const dataKeys = [
    'accounts', 'hospitals', 'parts', 'warehouse', 
    'coils', 'inoutHistory', 'outboundParts', 'outboundHistory'
  ];
  
  let restoredCount = 0;
  
  dataKeys.forEach(key => {
    const mainData = localStorage.getItem(key);
    if (!mainData || mainData === '[]' || mainData === 'null') {
      console.log(`Attempting to restore ${key}...`);
      
      // 백업에서 복원 시도
      const restored = getData(key);
      if (restored.length > 0) {
        console.log(`✅ Successfully restored ${key} with ${restored.length} items`);
        restoredCount++;
      } else {
        console.log(`❌ Failed to restore ${key}`);
      }
    } else {
      console.log(`✅ ${key} already exists with data`);
    }
  });
  
  console.log(`=== AUTO RESTORE COMPLETE: ${restoredCount} items restored ===`);
};

// 기본 데이터 생성
const createDefaultData = () => {
  console.log('createDefaultData called');
  
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
    },
    {
      id: '3',
      username: 'thek',
      name: '테스트사용자',
      role: 'user',
      password: 'thek123',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  if (typeof window !== 'undefined') {
    console.log('Window is defined, checking localStorage...');
    
    // 자동 데이터 복원 먼저 시도
    autoRestoreData();
    
    // 기존 계정 데이터 확인
    const existingAccounts = localStorage.getItem('accounts');
    console.log('Existing accounts:', existingAccounts);
    
    // 계정이 없거나 비어있으면 기본 계정 생성
    if (!existingAccounts || existingAccounts === '[]' || existingAccounts === 'null') {
      console.log('No existing accounts found, creating default accounts...');
      localStorage.setItem('accounts', JSON.stringify(defaultAccounts));
      localStorage.setItem('accounts_backup', JSON.stringify(defaultAccounts));
      console.log('Default accounts created and saved');
    } else {
      console.log('Existing accounts found, keeping them');
    }
    
    // 다른 데이터들도 초기화 (백업이 없는 경우에만)
    const dataKeys = ['hospitals', 'parts', 'warehouse', 'coils', 'inoutHistory', 'outboundParts', 'outboundHistory'];
    dataKeys.forEach(key => {
      if (!localStorage.getItem(key) || localStorage.getItem(key) === '[]' || localStorage.getItem(key) === 'null') {
        localStorage.setItem(key, JSON.stringify([]));
        localStorage.setItem(`${key}_backup`, JSON.stringify([]));
      }
    });
    
    // 전체 데이터 백업 생성
    updateAllDataBackup();
  }
};

// 데이터 가져오기
export const getData = <T>(key: string): T[] => {
  if (typeof window === 'undefined') return [];
  
  // 현재는 localStorage 사용 (Supabase는 비동기 작업이므로 별도 함수로 처리)
  return getDataFromLocalStorage<T>(key);
};

// Supabase에서 데이터 가져오기 (비동기)
export const getDataFromSupabase = async <T>(key: string): Promise<T[]> => {
  if (typeof window === 'undefined') return [];
  
  const shouldUseSupabase = isSupabaseEnabled();
  
  if (!shouldUseSupabase) {
    console.log(`⚠️ Supabase가 비활성화됨. localStorage 사용 중...`);
    return getDataFromLocalStorage<T>(key);
  }
  
  try {
    console.log(`🔄 Supabase에서 ${key} 데이터 가져오는 중...`);
    
    let data: T[] = [];
    
    switch (key) {
      case 'accounts':
        data = await getAccountsFromSupabase() as T[];
        break;
      case 'hospitals':
        data = await getHospitalsFromSupabase() as T[];
        break;
      default:
        console.log(`⚠️ Supabase에서 지원하지 않는 키: ${key}`);
        return getDataFromLocalStorage<T>(key);
    }
    
    console.log(`✅ Supabase에서 ${key} 데이터 ${data.length}개 로드됨`);
    return data;
  } catch (error) {
    console.error(`❌ Supabase에서 ${key} 데이터 가져오기 실패:`, error);
    console.log(`🔄 localStorage로 폴백...`);
    return getDataFromLocalStorage<T>(key);
  }
};

// localStorage에서 데이터 가져오기 (기존 로직)
const getDataFromLocalStorage = <T>(key: string): T[] => {
  try {
    let data = localStorage.getItem(key);
    
    // 메인 데이터가 없으면 백업에서 복원 시도
    if (!data || data === '[]' || data === 'null') {
      console.log(`Main data for ${key} is empty, trying backup...`);
      
      // 1차 백업 시도
      const backupData = localStorage.getItem(`${key}_backup`);
      if (backupData && backupData !== '[]' && backupData !== 'null') {
        console.log(`Restoring ${key} from primary backup`);
        localStorage.setItem(key, backupData);
        data = backupData;
      } else {
        // 2차 백업 시도
        const secondaryBackup = localStorage.getItem(`${key}_backup2`);
        if (secondaryBackup && secondaryBackup !== '[]' && secondaryBackup !== 'null') {
          console.log(`Restoring ${key} from secondary backup`);
          localStorage.setItem(key, secondaryBackup);
          localStorage.setItem(`${key}_backup`, secondaryBackup);
          data = secondaryBackup;
        } else {
          // 3차 백업 시도 (전체 데이터 백업에서 복원)
          const allDataBackup = localStorage.getItem('all_data_backup');
          if (allDataBackup) {
            try {
              const parsedBackup = JSON.parse(allDataBackup);
              if (parsedBackup[key] && Array.isArray(parsedBackup[key]) && parsedBackup[key].length > 0) {
                console.log(`Restoring ${key} from all data backup`);
                localStorage.setItem(key, JSON.stringify(parsedBackup[key]));
                localStorage.setItem(`${key}_backup`, JSON.stringify(parsedBackup[key]));
                data = JSON.stringify(parsedBackup[key]);
              }
            } catch (e) {
              console.error('Error parsing all data backup:', e);
            }
          }
        }
      }
    }
    
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
    const dataString = JSON.stringify(data);
    
    // 메인 데이터 저장
    localStorage.setItem(key, dataString);
    
    // 1차 백업 저장
    localStorage.setItem(`${key}_backup`, dataString);
    
    // 2차 백업 저장 (주기적으로)
    const lastBackup2 = localStorage.getItem(`${key}_backup2_time`);
    const now = Date.now();
    if (!lastBackup2 || (now - parseInt(lastBackup2)) > 300000) { // 5분마다
      localStorage.setItem(`${key}_backup2`, dataString);
      localStorage.setItem(`${key}_backup2_time`, now.toString());
    }
    
    // 전체 데이터 백업 업데이트
    updateAllDataBackup();
    
    console.log(`Data saved for ${key} with multiple backups`);
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
export const searchData = <T>(
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
  console.log('initializeStorage called');
  
  // Supabase 연결 상태 확인
  const shouldUseSupabase = isSupabaseEnabled();
  
  if (shouldUseSupabase) {
    console.log('🔄 Supabase를 사용하여 데이터 초기화 중...');
    // Supabase 초기화는 비동기로 처리
    initializeSupabaseData().then(() => {
      console.log('✅ Supabase 데이터 초기화 완료');
    }).catch((error) => {
      console.error('❌ Supabase 초기화 실패:', error);
      console.log('🔄 localStorage로 폴백...');
      createDefaultData();
    });
  } else {
    console.log('🔄 localStorage를 사용하여 데이터 초기화 중...');
    createDefaultData();
  }
  
  console.log('Default data created');
  
  // 디버깅: 생성된 계정 확인
  const accounts = getAccounts();
  console.log('Accounts after initialization:', accounts);
};

// 사용자 인증
export const authenticateUser = (username: string, password: string): User | null => {
  console.log('authenticateUser called with:', { username, password });
  
  const accounts = getAccounts();
  console.log('Available accounts for authentication:', accounts);
  
  // 입력된 사용자명과 정확히 일치하는 계정 찾기
  const user = accounts.find(account => {
    console.log(`Comparing: input="${username}" vs account="${account.username}"`);
    console.log(`Password match: input="${password}" vs account="${account.password}"`);
    return account.username === username && account.password === password;
  });
  
  console.log('Found user:', user);
  
  if (user) {
    const result = {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      password: user.password
    };
    console.log('Returning user:', result);
    return result;
  }
  
  console.log('No user found, returning null');
  return null;
};

// 관리자 권한 확인
export const isAdmin = (user: User | null): boolean => {
  return user?.role === 'admin';
};

// 디버깅: 모든 계정 정보 출력 (개발용)
export const debugAccounts = () => {
  if (typeof window === 'undefined') return;
  
  console.log('=== ACCOUNT DEBUG INFO ===');
  const accounts = getAccounts();
  console.log('Total accounts:', accounts.length);
  
  accounts.forEach((account, index) => {
    console.log(`Account ${index + 1}:`, {
      id: account.id,
      username: account.username,
      name: account.name,
      role: account.role,
      password: account.password,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt
    });
  });
  
  console.log('Raw localStorage accounts:', localStorage.getItem('accounts'));
  console.log('=== END DEBUG INFO ===');
};

// 전체 데이터 백업 업데이트
const updateAllDataBackup = () => {
  if (typeof window === 'undefined') return;
  
  try {
    const allData = {
      accounts: getData('accounts'),
      hospitals: getData('hospitals'),
      parts: getData('parts'),
      warehouse: getData('warehouse'),
      coils: getData('coils'),
      inoutHistory: getData('inoutHistory'),
      outboundParts: getData('outboundParts'),
      outboundHistory: getData('outboundHistory'),
      backupDate: new Date().toISOString()
    };
    
    localStorage.setItem('all_data_backup', JSON.stringify(allData));
    console.log('All data backup updated');
  } catch (error) {
    console.error('Error updating all data backup:', error);
  }
};

// 전체 데이터 내보내기
export const exportAllData = () => {
  if (typeof window === 'undefined') return;
  
  const allData = {
    accounts: getData('accounts'),
    hospitals: getData('hospitals'),
    parts: getData('parts'),
    warehouse: getData('warehouse'),
    coils: getData('coils'),
    inoutHistory: getData('inoutHistory'),
    outboundParts: getData('outboundParts'),
    outboundHistory: getData('outboundHistory'),
    exportDate: new Date().toISOString()
  };
  
  const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `cubemedi_backup_${new Date().toISOString().split('T')[0]}.json`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// 전체 데이터 가져오기
export const importAllData = (file: File): Promise<boolean> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        
        if (data.accounts) setData('accounts', data.accounts);
        if (data.hospitals) setData('hospitals', data.hospitals);
        if (data.parts) setData('parts', data.parts);
        if (data.warehouse) setData('warehouse', data.warehouse);
        if (data.coils) setData('coils', data.coils);
        if (data.inoutHistory) setData('inoutHistory', data.inoutHistory);
        if (data.outboundParts) setData('outboundParts', data.outboundParts);
        if (data.outboundHistory) setData('outboundHistory', data.outboundHistory);
        
        alert('데이터 가져오기가 완료되었습니다. 페이지를 새로고침해주세요.');
        resolve(true);
      } catch (error) {
        console.error('Error importing data:', error);
        alert('데이터 가져오기에 실패했습니다.');
        resolve(false);
      }
    };
    reader.readAsText(file);
  });
};

// 엑셀 추출 유틸리티 함수들
export const exportToExcel = (data: unknown[], filename: string) => {
  if (typeof window === 'undefined') return;
  
  // CSV 형식으로 데이터 변환
  const csvContent = convertToCSV(data);
  
  // 파일 다운로드
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const convertToCSV = (data: unknown[]): string => {
  if (data.length === 0) return '';
  
  const firstItem = data[0] as Record<string, unknown>;
  const headers = Object.keys(firstItem);
  const csvRows = [];
  
  // 헤더 추가
  csvRows.push(headers.join(','));
  
  // 데이터 추가
  for (const row of data) {
    const rowData = row as Record<string, unknown>;
    const values = headers.map(header => {
      const value = rowData[header];
      // 날짜 형식 변환
      if (header.includes('Date') || header.includes('createdAt') || header.includes('updatedAt')) {
        return new Date(value as string).toLocaleDateString('ko-KR');
      }
      // 문자열에 쉼표가 있으면 따옴표로 감싸기
      if (typeof value === 'string' && value.includes(',')) {
        return `"${value}"`;
      }
      return value;
    });
    csvRows.push(values.join(','));
  }
  
  return csvRows.join('\n');
};
