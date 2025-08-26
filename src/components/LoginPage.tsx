'use client';

import { useState } from 'react';

interface LoginPageProps {
  onLogin: (username: string, password: string) => boolean;
  onDemoLogin: () => void;
}

export default function LoginPage({ onLogin, onDemoLogin }: LoginPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('아이디와 비밀번호를 입력해주세요.');
      return;
    }

    const success = onLogin(username, password);
    if (!success) {
      setError('아이디 또는 비밀번호가 올바르지 않습니다.');
    }
  };

  const handleDemoLogin = () => {
    onDemoLogin();
  };

  return (
    <section className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>🏥 큐브메디 부품관리 시스템</h1>
          <p>로그인하여 시스템을 이용하세요</p>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label htmlFor="username">아이디</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="아이디를 입력하세요"
              required
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="password">비밀번호</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요"
              required
            />
          </div>
          
          {error && (
            <div className="text-red-500 text-sm text-center">
              {error}
            </div>
          )}
          
          <button type="submit" className="login-btn">
            로그인
          </button>
        </form>
        
        <div className="login-footer">
          <button 
            type="button" 
            className="demo-btn"
            onClick={handleDemoLogin}
          >
            데모 로그인
          </button>
        </div>
      </div>
    </section>
  );
} 