'use client';

import { useState, useEffect } from 'react';
import { User } from '@/types';
import { initializeStorage, authenticateUser } from '@/lib/storage';
import LoginPage from '@/components/LoginPage';
import MainSystem from '@/components/MainSystem';

export default function Home() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // localStorage 초기화
    initializeStorage();
    
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
    
    setIsLoading(false);
  }, []);

  const handleLogin = (username: string, password: string) => {
    const user = authenticateUser(username, password);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  const handleDemoLogin = () => {
    const user = authenticateUser('admin', 'admin123');
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
    }
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
        <LoginPage onLogin={handleLogin} onDemoLogin={handleDemoLogin} />
      )}
    </div>
  );
} 