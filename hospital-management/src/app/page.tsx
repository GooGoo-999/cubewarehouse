'use client';

import { useState, useEffect } from 'react';
import { User, Account } from '@/types';
import { initializeStorage, authenticateUser, getAccounts, debugAccounts, setAccounts, generateId } from '@/lib/storage';
import LoginPage from '@/components/LoginPage';
import MainSystem from '@/components/MainSystem';

export default function Home() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('Home component mounted');
    
    // localStorage 초기화 (자동 복원 포함)
    console.log('Initializing storage with auto-restore...');
    initializeStorage();
    
    // 관리자 계정이 없으면 자동 생성
    setTimeout(() => {
      const accounts = getAccounts();
      const adminExists = accounts.find(account => account.username === 'admin');
      
      if (!adminExists) {
        console.log('관리자 계정이 없습니다. 자동으로 생성합니다...');
        const adminAccount: Account = {
          id: generateId(),
          username: 'admin',
          name: '관리자',
          role: 'admin',
          password: 'admin123',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        const updatedAccounts = [...accounts, adminAccount];
        setAccounts(updatedAccounts);
        console.log('✅ 관리자 계정이 생성되었습니다:', adminAccount);
        alert('관리자 계정이 자동으로 생성되었습니다!\n\n사용자명: admin\n비밀번호: admin123');
      } else {
        console.log('관리자 계정이 이미 존재합니다:', adminExists);
      }
    }, 1000); // 1초 후 실행
    
    // 디버깅: 모든 계정 정보 출력
    debugAccounts();
    
    // 저장된 사용자 정보 확인
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('currentUser');
      }
    }
    
    // 주기적 자동 백업 설정 (5분마다)
    const backupInterval = setInterval(() => {
      console.log('🔄 Auto backup triggered...');
      try {
        const allData = {
          accounts: JSON.parse(localStorage.getItem('accounts') || '[]'),
          hospitals: JSON.parse(localStorage.getItem('hospitals') || '[]'),
          parts: JSON.parse(localStorage.getItem('parts') || '[]'),
          warehouse: JSON.parse(localStorage.getItem('warehouse') || '[]'),
          coils: JSON.parse(localStorage.getItem('coils') || '[]'),
          inoutHistory: JSON.parse(localStorage.getItem('inoutHistory') || '[]'),
          outboundParts: JSON.parse(localStorage.getItem('outboundParts') || '[]'),
          outboundHistory: JSON.parse(localStorage.getItem('outboundHistory') || '[]'),
          backupDate: new Date().toISOString()
        };
        
        localStorage.setItem('all_data_backup', JSON.stringify(allData));
        console.log('✅ Auto backup completed');
      } catch (error) {
        console.error('❌ Auto backup failed:', error);
      }
    }, 300000); // 5분 = 300,000ms
    
    setIsLoading(false);
    
    // 컴포넌트 언마운트 시 인터벌 정리
    return () => {
      clearInterval(backupInterval);
    };
  }, []);

  const handleLogin = (username: string, password: string) => {
    console.log('Login attempt:', { username, password });
    
    // 로그인 시도 전에 계정 데이터 다시 확인
    const accounts = getAccounts();
    console.log('Current accounts before login:', accounts);
    
    // 디버깅: 로그인 시도 전 계정 정보 출력
    debugAccounts();
    
    const user = authenticateUser(username, password);
    console.log('Authentication result:', user);
    
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
      console.log('Login successful, user set:', user);
      return true;
    }
    
    console.log('Login failed');
    return false;
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  const handleRegister = (username: string, password: string, name: string): boolean => {
    console.log('회원가입 시도:', { username, name });
    
    // 기존 계정 확인
    const accounts = getAccounts();
    const existingAccount = accounts.find(account => account.username === username);
    
    if (existingAccount) {
      console.log('이미 존재하는 계정:', existingAccount);
      return false;
    }
    
    // 새 계정 생성
    const newAccount: Account = {
      id: generateId(),
      username,
      name,
      role: 'user', // 일반 사용자로 설정
      password,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // 계정 추가
    const updatedAccounts = [...accounts, newAccount];
    setAccounts(updatedAccounts);
    
    // 기존 데이터 유지를 위해 다른 데이터들도 확인하고 초기화
    const dataKeys = ['hospitals', 'parts', 'warehouse', 'coils', 'inoutHistory', 'outboundParts', 'outboundHistory'];
    dataKeys.forEach(key => {
      if (!localStorage.getItem(key) || localStorage.getItem(key) === '[]' || localStorage.getItem(key) === 'null') {
        localStorage.setItem(key, JSON.stringify([]));
        localStorage.setItem(`${key}_backup`, JSON.stringify([]));
      }
    });
    
    console.log('새 계정 생성 완료:', newAccount);
    console.log('전체 계정 목록:', updatedAccounts);
    console.log('기존 데이터 유지 확인 완료');
    
    return true;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="container">
      {currentUser ? (
        <MainSystem currentUser={currentUser} onLogout={handleLogout} />
      ) : (
        <LoginPage onLogin={handleLogin} onRegister={handleRegister} />
      )}
    </div>
  );
}
