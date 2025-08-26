'use client';

import { useState, useEffect } from 'react';
import { getAccounts, debugAccounts, authenticateUser, initializeStorage } from '@/lib/storage';
import { Account } from '@/types';

export default function DebugPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loginResult, setLoginResult] = useState<string>('');
  const [testUsername, setTestUsername] = useState('admin');
  const [testPassword, setTestPassword] = useState('admin123');

  useEffect(() => {
    // 스토리지 초기화
    initializeStorage();
    
    // 계정 정보 로드
    const loadedAccounts = getAccounts();
    setAccounts(loadedAccounts);
    
    // 디버깅 정보 출력
    debugAccounts();
  }, []);

  const handleTestLogin = () => {
    console.log('Testing login with:', { testUsername, testPassword });
    const result = authenticateUser(testUsername, testPassword);
    setLoginResult(result ? `로그인 성공: ${JSON.stringify(result)}` : '로그인 실패');
  };

  const handleRefreshAccounts = () => {
    const refreshedAccounts = getAccounts();
    setAccounts(refreshedAccounts);
    debugAccounts();
  };

  const handleClearStorage = () => {
    localStorage.clear();
    alert('localStorage가 초기화되었습니다. 페이지를 새로고침하세요.');
  };

  const handleAddAdminAccount = () => {
    // 기존 계정 가져오기
    const existingAccounts = getAccounts();
    
    // 관리자 계정이 이미 있는지 확인
    const adminExists = existingAccounts.find(account => account.username === 'admin');
    
    if (adminExists) {
      alert('관리자 계정이 이미 존재합니다!');
      return;
    }
    
    // 관리자 계정 추가
    const adminAccount: Account = {
      id: 'admin-1',
      username: 'admin',
      name: '관리자',
      role: 'admin' as const,
      password: 'admin123',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // 기존 계정에 관리자 계정 추가
    const updatedAccounts = [...existingAccounts, adminAccount];
    
    // localStorage에 저장
    localStorage.setItem('accounts', JSON.stringify(updatedAccounts));
    localStorage.setItem('accounts_backup', JSON.stringify(updatedAccounts));
    
    // 계정 목록 새로고침
    setAccounts(updatedAccounts);
    
    alert('✅ 관리자 계정이 추가되었습니다!\n\n사용자명: admin\n비밀번호: admin123');
  };

  // 서버 사이드 렌더링 방지
  if (typeof window === 'undefined') {
    return <div>로딩 중...</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">🔧 관리자 계정 디버깅 페이지</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 계정 정보 */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">📋 현재 계정 목록</h2>
          <button 
            onClick={handleRefreshAccounts}
            className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            계정 목록 새로고침
          </button>
          
          {accounts.length === 0 ? (
            <p className="text-red-500">계정이 없습니다!</p>
          ) : (
            <div className="space-y-2">
              {accounts.map((account, index) => (
                <div key={index} className="border p-3 rounded bg-gray-50">
                  <p><strong>ID:</strong> {account.id}</p>
                  <p><strong>사용자명:</strong> {account.username}</p>
                  <p><strong>이름:</strong> {account.name}</p>
                  <p><strong>역할:</strong> {account.role}</p>
                  <p><strong>비밀번호:</strong> {account.password}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 로그인 테스트 */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">🔐 로그인 테스트</h2>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">사용자명:</label>
              <input
                type="text"
                value={testUsername}
                onChange={(e) => setTestUsername(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">비밀번호:</label>
              <input
                type="text"
                value={testPassword}
                onChange={(e) => setTestPassword(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            
            <button 
              onClick={handleTestLogin}
              className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              로그인 테스트
            </button>
            
            {loginResult && (
              <div className={`p-3 rounded ${loginResult.includes('성공') ? 'bg-green-100' : 'bg-red-100'}`}>
                <strong>결과:</strong> {loginResult}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* localStorage 정보 */}
      <div className="mt-6 bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">💾 localStorage 정보</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-medium mb-2">계정 데이터:</h3>
            <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-40">
              {typeof window !== 'undefined' ? (localStorage.getItem('accounts') || '데이터 없음') : '브라우저에서만 확인 가능'}
            </pre>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">계정 백업:</h3>
            <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-40">
              {typeof window !== 'undefined' ? (localStorage.getItem('accounts_backup') || '백업 없음') : '브라우저에서만 확인 가능'}
            </pre>
          </div>
        </div>
        
        <div className="mt-4">
          <button 
            onClick={handleClearStorage}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            localStorage 초기화
          </button>
        </div>
      </div>

      {/* 빠른 액션 */}
      <div className="mt-6 bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">⚡ 빠른 액션</h2>
        
        <div className="space-x-4">
          <button 
            onClick={() => {
              initializeStorage();
              handleRefreshAccounts();
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            스토리지 재초기화
          </button>
          
          <button 
            onClick={handleAddAdminAccount}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            관리자 계정 추가
          </button>
          
          <button 
            onClick={() => {
              debugAccounts();
              alert('콘솔을 확인하세요!');
            }}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            콘솔에 디버그 정보 출력
          </button>
        </div>
      </div>
    </div>
  );
}
