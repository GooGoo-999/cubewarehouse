'use client';

import { useState } from 'react';

interface LoginPageProps {
  onLogin: (username: string, password: string) => boolean;
  onRegister: (username: string, password: string, name: string) => boolean;
}

export default function LoginPage({ onLogin, onRegister }: LoginPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [registerData, setRegisterData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    name: ''
  });
  const [registerError, setRegisterError] = useState('');

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

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError('');

    // 유효성 검사
    if (!registerData.username.trim() || !registerData.password.trim() || !registerData.name.trim()) {
      setRegisterError('모든 필드를 입력해주세요.');
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      setRegisterError('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (registerData.password.length < 4) {
      setRegisterError('비밀번호는 4자 이상이어야 합니다.');
      return;
    }

    const success = onRegister(registerData.username, registerData.password, registerData.name);
    if (success) {
      // 회원가입 성공 시 로그인 모드로 전환
      setIsRegisterMode(false);
      setUsername(registerData.username);
      setPassword(registerData.password);
      setRegisterData({
        username: '',
        password: '',
        confirmPassword: '',
        name: ''
      });
      alert('회원가입이 완료되었습니다. 로그인해주세요.');
    } else {
      setRegisterError('이미 존재하는 아이디입니다.');
    }
  };

  return (
    <section className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>🏥 큐브메디 부품관리 시스템</h1>
          <p>{isRegisterMode ? '회원가입하여 시스템을 이용하세요' : '로그인하여 시스템을 이용하세요'}</p>
        </div>
        
        {!isRegisterMode ? (
          // 로그인 폼
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
            
            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => setIsRegisterMode(true)}
                className="text-blue-500 hover:text-blue-700 underline"
              >
                계정이 없으신가요? 회원가입
              </button>
            </div>
          </form>
        ) : (
          // 회원가입 폼
          <form onSubmit={handleRegisterSubmit} className="login-form">
            <div className="input-group">
              <label htmlFor="reg-username">아이디</label>
              <input
                type="text"
                id="reg-username"
                value={registerData.username}
                onChange={(e) => setRegisterData(prev => ({ ...prev, username: e.target.value }))}
                placeholder="아이디를 입력하세요"
                required
              />
            </div>
            
            <div className="input-group">
              <label htmlFor="reg-name">이름</label>
              <input
                type="text"
                id="reg-name"
                value={registerData.name}
                onChange={(e) => setRegisterData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="이름을 입력하세요"
                required
              />
            </div>
            
            <div className="input-group">
              <label htmlFor="reg-password">비밀번호</label>
              <input
                type="password"
                id="reg-password"
                value={registerData.password}
                onChange={(e) => setRegisterData(prev => ({ ...prev, password: e.target.value }))}
                placeholder="비밀번호를 입력하세요 (4자 이상)"
                required
              />
            </div>
            
            <div className="input-group">
              <label htmlFor="reg-confirm-password">비밀번호 확인</label>
              <input
                type="password"
                id="reg-confirm-password"
                value={registerData.confirmPassword}
                onChange={(e) => setRegisterData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder="비밀번호를 다시 입력하세요"
                required
              />
            </div>
            
            {registerError && (
              <div className="text-red-500 text-sm text-center">
                {registerError}
              </div>
            )}
            
            <button type="submit" className="login-btn">
              회원가입
            </button>
            
            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => {
                  setIsRegisterMode(false);
                  setRegisterError('');
                  setRegisterData({
                    username: '',
                    password: '',
                    confirmPassword: '',
                    name: ''
                  });
                }}
                className="text-blue-500 hover:text-blue-700 underline"
              >
                이미 계정이 있으신가요? 로그인
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
