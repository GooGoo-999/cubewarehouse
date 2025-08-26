import { NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = createSupabaseClient();
    
    if (!supabase) {
      return NextResponse.json({
        success: false,
        error: 'Supabase 클라이언트 초기화 실패',
        details: {
          hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          url: process.env.NEXT_PUBLIC_SUPABASE_URL,
          keyPrefix: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20)
        }
      });
    }

    // 간단한 쿼리로 연결 테스트
    const { data, error } = await supabase
      .from('accounts')
      .select('count')
      .limit(1);

    if (error) {
      return NextResponse.json({
        success: false,
        error: 'Supabase 쿼리 실패',
        details: error
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Supabase 연결 성공',
      data: data
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: '예외 발생',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}
