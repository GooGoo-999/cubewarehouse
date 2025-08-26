import { supabase } from './supabase';
import { User, Hospital, Part, WarehouseItem, CoilItem, InOutHistory, OutboundPart, OutboundHistory, Account } from '@/types';

// Supabase 연결 확인 헬퍼 함수
const isSupabaseConnected = (): boolean => {
  const connected = supabase !== null;
  console.log('🔍 Supabase 연결 상태 확인:', {
    supabase: supabase ? '초기화됨' : 'null',
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    connected
  });
  return connected;
};

// 계정 관련 함수들
export const getAccountsFromSupabase = async (): Promise<Account[]> => {
  if (!isSupabaseConnected()) {
    console.log('⚠️ Supabase 클라이언트가 초기화되지 않았습니다.');
    return [];
  }

  try {
    const { data, error } = await supabase!
      .from('accounts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching accounts:', error);
      return [];
    }

    return data.map(account => ({
      id: account.id,
      username: account.username,
      name: account.name,
      password: account.password,
      role: account.role as 'admin' | 'user',
      createdAt: account.created_at || '',
      updatedAt: account.updated_at || '',
    }));
  } catch (error) {
    console.error('Error fetching accounts:', error);
    return [];
  }
};

export const setAccountsToSupabase = async (accounts: Account[]): Promise<boolean> => {
  console.log('🚀 setAccountsToSupabase 호출됨:', { accountsCount: accounts.length });
  
  if (!isSupabaseConnected()) {
    console.log('⚠️ Supabase 클라이언트가 초기화되지 않았습니다.');
    return false;
  }

  try {
    console.log('🗑️ 기존 데이터 삭제 중...');
    // 기존 데이터 삭제
    const { error: deleteError } = await supabase!.from('accounts').delete().gte('id', '');
    
    if (deleteError) {
      console.error('❌ 기존 데이터 삭제 실패:', deleteError);
    } else {
      console.log('✅ 기존 데이터 삭제 완료');
    }

    console.log('📝 새 데이터 삽입 중...');
    // 새 데이터 삽입 (실제 스키마에 맞게 수정)
    const { data, error } = await supabase!
      .from('accounts')
      .insert(accounts.map(account => ({
        id: account.id,
        username: account.username,
        name: account.name,
        password: account.password,
        role: account.role as string,
        created_at: account.createdAt,
        updated_at: account.updatedAt,
      })))
      .select();

    if (error) {
      console.error('❌ 계정 데이터 저장 실패:', error);
      return false;
    }

    console.log('✅ 계정 데이터 저장 완료:', { savedCount: data?.length });
    return true;
  } catch (error) {
    console.error('❌ setAccountsToSupabase 예외 발생:', error);
    return false;
  }
};

// 병원 관련 함수들
export const getHospitalsFromSupabase = async (): Promise<Hospital[]> => {
  if (!isSupabaseConnected()) {
    console.log('⚠️ Supabase 클라이언트가 초기화되지 않았습니다.');
    return [];
  }

  try {
    const { data, error } = await supabase!
      .from('hospitals')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching hospitals:', error);
      return [];
    }

    return data.map(hospital => ({
      id: hospital.id,
      name: hospital.name,
      modality: hospital.modality || '',
      systemId: hospital.system_id || '',
      equipment: hospital.equipment || '',
      softwareVersion: hospital.software_version || '',
      address: hospital.address || '',
      phone: hospital.phone || '',
      createdAt: hospital.created_at || '',
      updatedAt: hospital.updated_at || '',
    }));
  } catch (error) {
    console.error('Error fetching hospitals:', error);
    return [];
  }
};

export const setHospitalsToSupabase = async (hospitals: Hospital[]): Promise<boolean> => {
  if (!isSupabaseConnected()) {
    console.log('⚠️ Supabase 클라이언트가 초기화되지 않았습니다.');
    return false;
  }

  try {
    // 기존 데이터 삭제
    await supabase!.from('hospitals').delete().gte('id', '');

    // 새 데이터 삽입
    const { error } = await supabase!
      .from('hospitals')
      .insert(hospitals.map(hospital => ({
        id: hospital.id,
        name: hospital.name,
        modality: hospital.modality,
        system_id: hospital.systemId,
        equipment: hospital.equipment,
        software_version: hospital.softwareVersion,
        address: hospital.address,
        phone: hospital.phone,
        created_at: hospital.createdAt,
        updated_at: hospital.updatedAt,
      })));

    if (error) {
      console.error('Error saving hospitals:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error saving hospitals:', error);
    return false;
  }
};

// 사용자 인증
export const authenticateUserFromSupabase = async (username: string, password: string): Promise<User | null> => {
  if (!isSupabaseConnected()) {
    console.log('⚠️ Supabase 클라이언트가 초기화되지 않았습니다.');
    return null;
  }

  try {
    const { data, error } = await supabase!
      .from('accounts')
      .select('*')
      .eq('username', username)
      .eq('password', password)
      .single();

    if (error) {
      console.error('Error authenticating user:', error);
      return null;
    }

    return {
      id: data.id,
      username: data.username,
      name: data.name,
      role: data.role as 'admin' | 'user',
      password: data.password,
    };
  } catch (error) {
    console.error('Error authenticating user:', error);
    return null;
  }
};

// 초기 데이터 생성
export const initializeSupabaseData = async (): Promise<void> => {
  if (!isSupabaseConnected()) {
    console.log('⚠️ Supabase 클라이언트가 초기화되지 않았습니다.');
    return;
  }

  try {
    // 계정이 있는지 확인
    const { data: existingAccounts } = await supabase!
      .from('accounts')
      .select('id')
      .limit(1);

    if (!existingAccounts || existingAccounts.length === 0) {
      // 기본 계정 생성
      const defaultAccounts = [
        {
          id: '1',
          username: 'admin',
          name: '관리자',
          role: 'admin' as const,
          password: 'admin123',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '2',
          username: 'user',
          name: '일반사용자',
          role: 'user' as const,
          password: 'user123',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '3',
          username: 'thek',
          name: '테스트사용자',
          role: 'user' as const,
          password: 'thek123',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      await supabase!.from('accounts').insert(defaultAccounts);
      console.log('✅ Supabase에 기본 계정이 생성되었습니다.');
    } else {
      console.log('✅ Supabase에 계정이 이미 존재합니다.');
    }
  } catch (error) {
    console.error('❌ Supabase 데이터 초기화 실패:', error);
  }
};

// Supabase 연결 상태 확인
export const checkSupabaseConnection = async (): Promise<boolean> => {
  if (!isSupabaseConnected()) {
    return false;
  }

  try {
    const { data, error } = await supabase!
      .from('accounts')
      .select('id')
      .limit(1);

    return !error;
  } catch (error) {
    console.error('Supabase 연결 테스트 실패:', error);
    return false;
  }
};