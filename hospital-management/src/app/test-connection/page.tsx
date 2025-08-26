'use client';

import { useState } from 'react';
import { testSupabaseConnection } from '@/lib/supabase';

export default function TestConnectionPage() {
  const [testResult, setTestResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleTestConnection = async () => {
    setIsLoading(true);
    try {
      const result = await testSupabaseConnection();
      setTestResult(result);
    } catch (error) {
      setTestResult({ success: false, error: error instanceof Error ? error.message : String(error) });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Supabase 연결 테스트</h1>
      
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">환경 변수 상태</h2>
        <div className="space-y-2">
          <div>
            <strong>NEXT_PUBLIC_SUPABASE_URL:</strong> 
            <span className={`ml-2 ${process.env.NEXT_PUBLIC_SUPABASE_URL ? 'text-green-600' : 'text-red-600'}`}>
              {process.env.NEXT_PUBLIC_SUPABASE_URL || '설정되지 않음'}
            </span>
          </div>
          <div>
            <strong>NEXT_PUBLIC_SUPABASE_ANON_KEY:</strong> 
            <span className={`ml-2 ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'text-green-600' : 'text-red-600'}`}>
              {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '설정됨' : '설정되지 않음'}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">연결 테스트</h2>
        <button 
          onClick={handleTestConnection}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {isLoading ? '테스트 중...' : 'Supabase 연결 테스트'}
        </button>
      </div>

      {testResult && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">테스트 결과</h2>
          <div className={`p-4 rounded ${testResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <div className="font-semibold mb-2">
              {testResult.success ? '✅ 성공' : '❌ 실패'}
            </div>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(testResult, null, 2)}
            </pre>
          </div>
        </div>
      )}

      <div className="bg-blue-50 p-6 rounded-lg mt-6">
        <h2 className="text-lg font-semibold mb-4">연결 방법</h2>
        <div className="space-y-2 text-sm">
          <p>1. <strong>Supabase 테이블 생성</strong>: SQL Editor에서 CREATE_TABLES_NEW.sql 실행</p>
          <p>2. <strong>환경 변수 설정</strong>: Vercel에서 NEXT_PUBLIC_SUPABASE_URL과 NEXT_PUBLIC_SUPABASE_ANON_KEY 설정</p>
          <p>3. <strong>로컬 개발</strong>: .env.local 파일에 환경 변수 추가</p>
          <p>4. <strong>연결 테스트</strong>: 위 버튼을 클릭하여 연결 확인</p>
        </div>
      </div>
    </div>
  );
}
