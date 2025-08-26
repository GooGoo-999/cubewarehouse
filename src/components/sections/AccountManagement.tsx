'use client';

import { useState, useEffect } from 'react';
import { Account, User } from '@/types';
import { getAccounts, setAccounts, generateId, isAdmin } from '@/lib/storage';

interface AccountManagementProps {
  currentUser: User;
}

export default function AccountManagement({ currentUser }: AccountManagementProps) {
  const [accounts, setAccountsState] = useState<Account[]>([]);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  useEffect(() => {
    const data = getAccounts();
    setAccountsState(data);
  }, []);

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

  return (
    <section>
      <h2>👥 계정관리</h2>
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
                      {isAdmin(currentUser) && (
                        <button
                          className="btn-delete"
                          onClick={() => handleDeleteAccount(account.id)}
                        >
                          삭제
                        </button>
                      )}
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