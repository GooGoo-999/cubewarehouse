'use client';

import { NavigationSection, User } from '@/types';
import { isAdmin } from '@/lib/storage';

interface NavigationProps {
  activeSection: NavigationSection;
  onSectionChange: (section: NavigationSection) => void;
  currentUser: User | null;
}

export default function Navigation({ activeSection, onSectionChange, currentUser }: NavigationProps) {
  const navItems = [
    { id: 'hospitals' as NavigationSection, label: '병원관리' },
    { id: 'hospital-list' as NavigationSection, label: '병원목록' },
    { id: 'warehouse' as NavigationSection, label: '창고관리' },
    { id: 'coil' as NavigationSection, label: '코일관리' },
    { id: 'inout-history' as NavigationSection, label: '입출고히스토리' },
    { id: 'parts' as NavigationSection, label: '출고부품관리' },
    { id: 'history' as NavigationSection, label: '교체히스토리' },
    { id: 'accounts' as NavigationSection, label: '계정관리' },
    ...(isAdmin(currentUser) ? [{ id: 'data-migration' as NavigationSection, label: '데이터마이그레이션' }] : []),
  ];

  return (
    <nav>
      {navItems.map((item) => (
        <button
          key={item.id}
          className={`nav-btn ${activeSection === item.id ? 'active' : ''}`}
          onClick={() => onSectionChange(item.id)}
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
}
