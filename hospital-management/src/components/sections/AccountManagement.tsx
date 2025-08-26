'use client';

import { useState, useEffect, useRef } from 'react';
import { Account, User } from '@/types';
import { getAccounts, setAccounts, generateId, isAdmin, exportAllData, importAllData } from '@/lib/storage';

interface AccountManagementProps {
  currentUser: User;
}

export default function AccountManagement({ currentUser }: AccountManagementProps) {
  const [accounts, setAccountsState] = useState<Account[]>([]);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [isAddingAccount, setIsAddingAccount] = useState(false);
  const [newAccount, setNewAccount] = useState({
    username: '',
    name: '',
    password: '',
    role: 'user' as 'admin' | 'user'
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const data = getAccounts();
    setAccountsState(data);
  }, []);

  const handleAddAccount = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAdmin(currentUser)) {
      alert('관리자만 계정을 추가할 수 있습니다.');
      return;
    }

    const account: Account = {
      id: generateId(),
      username: newAccount.username,
      name: newAccount.name,
      password: newAccount.password,
      role: newAccount.role,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedAccounts = [...accounts, account];
    setAccounts(updatedAccounts);
    setAccountsState(updatedAccounts);
    
    // 폼 초기화
    setNewAccount({
      username: '',
      name: '',
      password: '',
      role: 'user'
    });
    setIsAddingAccount(false);
  };

  const handleUpdateAccount = (accountId: string, field: keyof Account, value: string) => {
    if (!isAdmin(currentUser)) {
      alert('관리자만 계정을 수정할 수 있습니다.');
      return;
    }

    const updatedAccounts = accounts.map(account => 
      account.id === accountId 
        ? { ...account, [field]: value, updatedAt: new Date().toISOString() }
        : account
    );

    setAccounts(updatedAccounts);
    setAccountsState(updatedAccounts);
  };

  const handleEditAccount = (account: Account) => {
    if (!isAdmin(currentUser)) {
      alert('관리자만 계정을 수정할 수 있습니다.');
      return;
    }
    setEditingAccount(account);
  };

  const handleDeleteAccount = (accountId: string) => {
    if (!isAdmin(currentUser)) {
      alert('관리자만 계정을 삭제할 수 있습니다.');
      return;
    }

    if (window.confirm('정말로 이 계정을 삭제하시겠습니까?')) {
      const updatedAccounts = accounts.filter(account => account.id !== accountId);
      setAccounts(updatedAccounts);
      setAccountsState(updatedAccounts);
    }
  };

  const handleExportData = () => {
    if (!isAdmin(currentUser)) {
      alert('관리자만 데이터를 내보낼 수 있습니다.');
      return;
    }
    exportAllData();
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!isAdmin(currentUser)) {
      alert('관리자만 데이터를 가져올 수 있습니다.');
      return;
    }

    const file = event.target.files?.[0];
    if (file) {
      importAllData(file).then(() => {
        // 파일 입력 초기화
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      });
    }
  };

  // 디버깅 정보
  console.log('Current User:', currentUser);
  console.log('Is Admin:', isAdmin(currentUser));

  return (
    <section>
      <h2>👥 계정관리</h2>
      
      {/* 디버깅 정보 */}
      <div style={{ background: '#f0f0f0', padding: '10px', margin: '10px 0', borderRadius: '5px' }}>
        <p><strong>현재 사용자:</strong> {currentUser?.name} ({currentUser?.username})</p>
        <p><strong>권한:</strong> {currentUser?.role}</p>
        <p><strong>관리자 여부:</strong> {isAdmin(currentUser) ? '예' : '아니오'}</p>
      </div>
      
      {/* 데이터 백업/복원 섹션 */}
      <div className="form-container">
        <div className="flex gap-4 mb-4">
          <button 
            onClick={handleExportData}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
          >
            📦 전체 데이터 백업
          </button>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            📥 데이터 복원
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImportData}
            style={{ display: 'none' }}
          />
        </div>
      </div>

      {/* 계정 추가 섹션 */}
      <div className="form-container">
        <button 
          onClick={() => setIsAddingAccount(!isAddingAccount)}
          className="mb-4"
        >
          {isAddingAccount ? '계정 추가 취소' : '계정 추가'}
        </button>
        
        {isAddingAccount && (
          <form onSubmit={handleAddAccount} className="space-y-4 p-4 border rounded">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">아이디 *</label>
              <input
                type="text"
                value={newAccount.username}
                onChange={(e) => setNewAccount(prev => ({ ...prev, username: e.target.value }))}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="아이디를 입력하세요"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">이름 *</label>
              <input
                type="text"
                value={newAccount.name}
                onChange={(e) => setNewAccount(prev => ({ ...prev, name: e.target.value }))}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="이름을 입력하세요"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">비밀번호 *</label>
              <input
                type="password"
                value={newAccount.password}
                onChange={(e) => setNewAccount(prev => ({ ...prev, password: e.target.value }))}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="비밀번호를 입력하세요"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">권한 *</label>
              <select
                value={newAccount.role}
                onChange={(e) => setNewAccount(prev => ({ ...prev, role: e.target.value as 'admin' | 'user' }))}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="user">일반사용자</option>
                <option value="admin">관리자</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                계정 추가
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAddingAccount(false);
                  setNewAccount({
                    username: '',
                    name: '',
                    password: '',
                    role: 'user'
                  });
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
              >
                취소
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="list-container">
        <h3>계정 목록</h3>
        
        <div>
          {accounts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              등록된 계정이 없습니다.
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr>
                  <th>아이디</th>
                  <th>이름</th>
                  <th>비밀번호</th>
                  <th>권한</th>
                  <th>등록일</th>
                  <th>수정일</th>
                  <th>작업</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((account) => (
                  <tr key={account.id}>
                    <td>
                      {editingAccount?.id === account.id ? (
                        <input
                          type="text"
                          value={editingAccount.username}
                          onChange={(e) => setEditingAccount({
                            ...editingAccount,
                            username: e.target.value
                          })}
                          onBlur={() => {
                            if (editingAccount) {
                              handleUpdateAccount(account.id, 'username', editingAccount.username);
                              setEditingAccount(null);
                            }
                          }}
                          className="w-full"
                        />
                      ) : (
                        <span onClick={() => isAdmin(currentUser) && setEditingAccount(account)}>
                          {account.username}
                        </span>
                      )}
                    </td>
                    <td>
                      {editingAccount?.id === account.id ? (
                        <input
                          type="text"
                          value={editingAccount.name}
                          onChange={(e) => setEditingAccount({
                            ...editingAccount,
                            name: e.target.value
                          })}
                          onBlur={() => {
                            if (editingAccount) {
                              handleUpdateAccount(account.id, 'name', editingAccount.name);
                              setEditingAccount(null);
                            }
                          }}
                          className="w-full"
                        />
                      ) : (
                        <span onClick={() => isAdmin(currentUser) && setEditingAccount(account)}>
                          {account.name}
                        </span>
                      )}
                    </td>
                    <td>
                      {editingAccount?.id === account.id ? (
                        <input
                          type="password"
                          value={editingAccount.password}
                          onChange={(e) => setEditingAccount({
                            ...editingAccount,
                            password: e.target.value
                          })}
                          onBlur={() => {
                            if (editingAccount) {
                              handleUpdateAccount(account.id, 'password', editingAccount.password);
                              setEditingAccount(null);
                            }
                          }}
                          className="w-full"
                          placeholder="새 비밀번호 입력"
                        />
                      ) : (
                        <span onClick={() => isAdmin(currentUser) && setEditingAccount(account)}>
                          ••••••••
                        </span>
                      )}
                    </td>
                    <td>
                      {editingAccount?.id === account.id ? (
                        <select
                          value={editingAccount.role}
                          onChange={(e) => setEditingAccount({
                            ...editingAccount,
                            role: e.target.value as 'admin' | 'user'
                          })}
                          onBlur={() => {
                            if (editingAccount) {
                              handleUpdateAccount(account.id, 'role', editingAccount.role);
                              setEditingAccount(null);
                            }
                          }}
                          className="w-full"
                        >
                          <option value="user">일반사용자</option>
                          <option value="admin">관리자</option>
                        </select>
                      ) : (
                        <span onClick={() => isAdmin(currentUser) && setEditingAccount(account)}>
                          {account.role === 'admin' ? '관리자' : '일반사용자'}
                        </span>
                      )}
                    </td>
                    <td>{new Date(account.createdAt).toLocaleDateString('ko-KR')}</td>
                    <td>{new Date(account.updatedAt).toLocaleDateString('ko-KR')}</td>
                    <td>
                      {/* 임시로 관리자 권한 체크 제거 */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditAccount(account)}
                          className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                        >
                          수정
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => handleDeleteAccount(account.id)}
                        >
                          삭제
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </section>
  );
}
