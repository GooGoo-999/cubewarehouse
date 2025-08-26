'use client';

import { User } from '@/types';

interface HeaderProps {
  currentUser: User;
  onLogout: () => void;
}

export default function Header({ currentUser, onLogout }: HeaderProps) {
  return (
    <header>
      <div className="header-top">
        <h1>🏥 큐브메디 부품관리 시스템</h1>
        <div className="user-info">
          <span>{currentUser.name}</span>
          <button className="logout-btn" onClick={onLogout}>
            로그아웃
          </button>
        </div>
      </div>
    </header>
  );
}
