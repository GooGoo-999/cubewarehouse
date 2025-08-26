import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 디버깅을 위한 로그
console.log('🔧 Supabase 환경변수 확인:', {
  url: supabaseUrl ? '설정됨' : '설정되지 않음',
  key: supabaseAnonKey ? '설정됨' : '설정되지 않음',
  urlValue: supabaseUrl?.substring(0, 30) + '...',
  keyValue: supabaseAnonKey?.substring(0, 20) + '...'
});

// Supabase 클라이언트 생성 함수
export const createSupabaseClient = (): SupabaseClient<Database> | null => {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Supabase 환경변수가 설정되지 않았습니다:', {
      url: supabaseUrl,
      hasKey: !!supabaseAnonKey
    });
    return null;
  }

  if (supabaseUrl === 'your_supabase_project_url') {
    console.error('❌ Supabase URL이 기본값으로 설정되어 있습니다.');
    return null;
  }

  try {
    const client = createClient<Database>(supabaseUrl, supabaseAnonKey);
    console.log('✅ Supabase 클라이언트 생성 성공');
    return client;
  } catch (error) {
    console.error('❌ Supabase 클라이언트 생성 실패:', error);
    return null;
  }
};

// 클라이언트 인스턴스
export const supabase = createSupabaseClient();

// 테스트용 함수
export const testSupabaseConnection = async () => {
  if (!supabase) {
    console.error('❌ Supabase 클라이언트가 초기화되지 않았습니다.');
    return { success: false, error: '클라이언트 초기화 실패' };
  }

  try {
    // accounts 테이블에서 간단한 쿼리 테스트
    const { data, error } = await supabase
      .from('accounts')
      .select('count')
      .limit(1);

    if (error) {
      console.error('❌ Supabase 쿼리 실패:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Supabase 연결 테스트 성공:', data);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Supabase 연결 테스트 예외:', error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
};
