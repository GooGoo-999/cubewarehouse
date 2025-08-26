'use client';

import React, { useState, useEffect } from 'react';
import { 
  getData, 
  getDataFromSupabase
} from '@/lib/storage';
import {
  setAccountsToSupabase,
  setHospitalsToSupabase,
  checkSupabaseConnection
} from '@/lib/supabase-service';
import { Account, Hospital, Part, WarehouseItem, CoilItem, InOutHistory, OutboundPart, OutboundHistory } from '@/types';

interface MigrationStatus {
  accounts: { total: number; migrated: number; status: 'pending' | 'success' | 'error' };
  hospitals: { total: number; migrated: number; status: 'pending' | 'success' | 'error' };
  parts: { total: number; migrated: number; status: 'pending' | 'success' | 'error' };
  warehouse: { total: number; migrated: number; status: 'pending' | 'success' | 'error' };
  coils: { total: number; migrated: number; status: 'pending' | 'success' | 'error' };
  inoutHistory: { total: number; migrated: number; status: 'pending' | 'success' | 'error' };
  outboundParts: { total: number; migrated: number; status: 'pending' | 'success' | 'error' };
  outboundHistory: { total: number; migrated: number; status: 'pending' | 'success' | 'error' };
}

export default function DataMigration() {
  const [localData, setLocalData] = useState<Record<string, unknown[]>>({});
  const [supabaseData, setSupabaseData] = useState<Record<string, unknown[]>>({});
  const [migrationStatus, setMigrationStatus] = useState<MigrationStatus>({
    accounts: { total: 0, migrated: 0, status: 'pending' },
    hospitals: { total: 0, migrated: 0, status: 'pending' },
    parts: { total: 0, migrated: 0, status: 'pending' },
    warehouse: { total: 0, migrated: 0, status: 'pending' },
    coils: { total: 0, migrated: 0, status: 'pending' },
    inoutHistory: { total: 0, migrated: 0, status: 'pending' },
    outboundParts: { total: 0, migrated: 0, status: 'pending' },
    outboundHistory: { total: 0, migrated: 0, status: 'pending' }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [supabaseConnected, setSupabaseConnected] = useState(false);

  const dataKeys = [
    'accounts', 'hospitals', 'parts', 'warehouse', 'coils', 
    'inoutHistory', 'outboundParts', 'outboundHistory'
  ];

  // 데이터 로드
  useEffect(() => {
    loadData();
    checkConnection();
  }, []);

  const checkConnection = async () => {
    const connected = await checkSupabaseConnection();
    setSupabaseConnected(connected);
  };

  const loadData = () => {
    const local: Record<string, unknown[]> = {};
    const supabase: Record<string, unknown[]> = {};

    dataKeys.forEach(key => {
      local[key] = getData(key);
    });

    setLocalData(local);
    setSupabaseData(supabase);

    // 마이그레이션 상태 초기화
    const status: MigrationStatus = {} as MigrationStatus;
    dataKeys.forEach(key => {
      status[key as keyof MigrationStatus] = {
        total: local[key].length,
        migrated: 0,
        status: 'pending'
      };
    });
    setMigrationStatus(status);
  };

  // 단일 데이터 타입 마이그레이션
  const migrateDataType = async (dataType: keyof MigrationStatus) => {
    if (!supabaseConnected) {
      alert('Supabase 연결이 필요합니다.');
      return;
    }

    const data = localData[dataType];
    if (!data || data.length === 0) {
      setMigrationStatus(prev => ({
        ...prev,
        [dataType]: { total: 0, migrated: 0, status: 'success' }
      }));
      return;
    }

    try {
      setMigrationStatus(prev => ({
        ...prev,
        [dataType]: { ...prev[dataType], status: 'pending' }
      }));

      let success = false;
      
      switch (dataType) {
        case 'accounts':
          success = await setAccountsToSupabase(data as Account[]);
          break;
        case 'hospitals':
          success = await setHospitalsToSupabase(data as Hospital[]);
          break;
        // 다른 데이터 타입들은 향후 구현
        default:
          console.log(`${dataType} 마이그레이션은 아직 구현되지 않았습니다.`);
          success = false;
      }

      if (success) {
        setMigrationStatus(prev => ({
          ...prev,
          [dataType]: { 
            total: data.length, 
            migrated: data.length, 
            status: 'success' 
          }
        }));
      } else {
        setMigrationStatus(prev => ({
          ...prev,
          [dataType]: { 
            total: data.length, 
            migrated: 0, 
            status: 'error' 
          }
        }));
      }
    } catch (error) {
      console.error(`${dataType} 마이그레이션 실패:`, error);
      setMigrationStatus(prev => ({
        ...prev,
        [dataType]: { 
          total: data.length, 
          migrated: 0, 
          status: 'error' 
        }
      }));
    }
  };

  // 전체 마이그레이션
  const migrateAllData = async () => {
    if (!supabaseConnected) {
      alert('Supabase 연결이 필요합니다.');
      return;
    }

    setIsLoading(true);
    
    for (const dataType of dataKeys) {
      await migrateDataType(dataType as keyof MigrationStatus);
      // 각 데이터 타입 사이에 약간의 지연
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    setIsLoading(false);
  };

  // 데이터 내보내기 (JSON)
  const exportLocalData = () => {
    const exportData = {
      timestamp: new Date().toISOString(),
      data: localData
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `localStorage_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: 'pending' | 'success' | 'error') => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: 'pending' | 'success' | 'error') => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      default: return '⏳';
    }
  };

  return (
    <section className="p-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">📊 데이터 마이그레이션</h2>
        
        {/* 연결 상태 */}
        <div className="mb-6 p-4 bg-gray-100 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">연결 상태</h3>
          <div className="flex items-center gap-2">
            <span className={`text-lg ${supabaseConnected ? 'text-green-600' : 'text-red-600'}`}>
              {supabaseConnected ? '✅' : '❌'}
            </span>
            <span>
              Supabase: {supabaseConnected ? '연결됨' : '연결 안됨'}
            </span>
          </div>
        </div>

        {/* 데이터 요약 */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">데이터 요약</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {dataKeys.map(key => (
              <div key={key} className="p-4 bg-white border rounded-lg shadow">
                <div className="text-sm text-gray-600 capitalize">{key}</div>
                <div className="text-2xl font-bold">{localData[key]?.length || 0}</div>
                <div className="text-xs text-gray-500">개 항목</div>
              </div>
            ))}
          </div>
        </div>

        {/* 마이그레이션 상태 */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">마이그레이션 상태</h3>
          <div className="space-y-3">
            {dataKeys.map(key => {
              const status = migrationStatus[key as keyof MigrationStatus];
              return (
                <div key={key} className="flex items-center justify-between p-3 bg-white border rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className={`text-lg ${getStatusColor(status.status)}`}>
                      {getStatusIcon(status.status)}
                    </span>
                    <span className="capitalize font-medium">{key}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm">
                      {status.migrated}/{status.total} 완료
                    </div>
                    <div className={`text-xs ${getStatusColor(status.status)}`}>
                      {status.status === 'success' && '완료'}
                      {status.status === 'error' && '실패'}
                      {status.status === 'pending' && '대기중'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 액션 버튼들 */}
        <div className="flex flex-wrap gap-4">
          <button
            onClick={migrateAllData}
            disabled={!supabaseConnected || isLoading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '🔄 마이그레이션 중...' : '🚀 전체 마이그레이션'}
          </button>
          
          <button
            onClick={exportLocalData}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            📥 localStorage 백업 다운로드
          </button>
          
          <button
            onClick={loadData}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            🔄 데이터 새로고침
          </button>
        </div>

        {/* 개별 마이그레이션 버튼들 */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4">개별 마이그레이션</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {dataKeys.map(key => (
              <button
                key={key}
                onClick={() => migrateDataType(key as keyof MigrationStatus)}
                disabled={!supabaseConnected || isLoading}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {key} 마이그레이션
              </button>
            ))}
          </div>
        </div>

        {/* 주의사항 */}
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="font-semibold text-yellow-800 mb-2">⚠️ 주의사항</h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• 마이그레이션 전에 반드시 데이터를 백업하세요</li>
            <li>• 현재는 accounts와 hospitals만 지원됩니다</li>
            <li>• 마이그레이션 중에는 페이지를 새로고침하지 마세요</li>
            <li>• 실패한 항목은 개별적으로 다시 시도할 수 있습니다</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
