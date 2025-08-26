'use client';

import { useEffect, useState } from 'react';

export default function TestEnvPage() {
  const [envStatus, setEnvStatus] = useState<{
    supabaseUrl: string;
    supabaseKey: string;
    hasUrl: boolean;
    hasKey: boolean;
    isUrlValid: boolean;
    isKeyValid: boolean;
  }>({
    supabaseUrl: '',
    supabaseKey: '',
    hasUrl: false,
    hasKey: false,
    isUrlValid: false,
    isKeyValid: false
  });

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    
    setEnvStatus({
      supabaseUrl: url,
      supabaseKey: key,
      hasUrl: !!url,
      hasKey: !!key,
      isUrlValid: url.includes('supabase.co') && url !== 'your_supabase_project_url',
      isKeyValid: key.startsWith('eyJ') && key.length > 100
    });
  }, []);

  const testSupabaseConnection = async () => {
    try {
      const response = await fetch('/api/test-supabase');
      const result = await response.json();
      alert(`Supabase 연결 테스트 결과:\n${JSON.stringify(result, null, 2)}`);
    } catch (error) {
      alert(`연결 테스트 실패: ${error}`);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">환경 변수 테스트</h1>
      
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">Supabase 환경 변수 상태</h2>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                NEXT_PUBLIC_SUPABASE_URL
              </label>
              <div className={`p-3 rounded border ${envStatus.hasUrl ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'}`}>
                <div className="text-sm">
                  <strong>상태:</strong> {envStatus.hasUrl ? '✅ 설정됨' : '❌ 설정되지 않음'}
                </div>
                <div className="text-sm mt-1">
                  <strong>값:</strong> {envStatus.supabaseUrl || '(없음)'}
                </div>
                <div className="text-sm mt-1">
                  <strong>유효성:</strong> {envStatus.isUrlValid ? '✅ 유효함' : '❌ 유효하지 않음'}
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                NEXT_PUBLIC_SUPABASE_ANON_KEY
              </label>
              <div className={`p-3 rounded border ${envStatus.hasKey ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'}`}>
                <div className="text-sm">
                  <strong>상태:</strong> {envStatus.hasKey ? '✅ 설정됨' : '❌ 설정되지 않음'}
                </div>
                <div className="text-sm mt-1">
                  <strong>값:</strong> {envStatus.supabaseKey ? `${envStatus.supabaseKey.substring(0, 20)}...` : '(없음)'}
                </div>
                <div className="text-sm mt-1">
                  <strong>유효성:</strong> {envStatus.isKeyValid ? '✅ 유효함' : '❌ 유효하지 않음'}
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold mb-2">전체 연결 상태</h3>
            <div className="text-sm space-y-1">
              <div>URL 설정: {envStatus.hasUrl ? '✅' : '❌'}</div>
              <div>Key 설정: {envStatus.hasKey ? '✅' : '❌'}</div>
              <div>URL 유효성: {envStatus.isUrlValid ? '✅' : '❌'}</div>
              <div>Key 유효성: {envStatus.isKeyValid ? '✅' : '❌'}</div>
              <div className="mt-2 font-semibold">
                최종 상태: {(envStatus.hasUrl && envStatus.hasKey && envStatus.isUrlValid && envStatus.isKeyValid) ? '✅ Supabase 연결 가능' : '❌ Supabase 연결 불가능'}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">Vercel 환경 변수 설정 방법</h2>
        <div className="text-sm space-y-2">
          <p>1. <a href="https://vercel.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Vercel 대시보드</a>에 접속</p>
          <p>2. cubemedi-warehouseDB 프로젝트 선택</p>
          <p>3. Settings → Environment Variables 메뉴로 이동</p>
          <p>4. 다음 환경 변수들을 추가:</p>
          <div className="ml-4 space-y-1">
            <div><strong>NEXT_PUBLIC_SUPABASE_URL:</strong> https://xcwyjuhytnjdmiuoesbe.supabase.co</div>
            <div><strong>NEXT_PUBLIC_SUPABASE_ANON_KEY:</strong> (Supabase에서 가져온 anon key)</div>
          </div>
          <p>5. Save 후 재배포</p>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">테스트</h2>
        <button 
          onClick={testSupabaseConnection}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Supabase 연결 테스트
        </button>
      </div>
    </div>
  );
}
