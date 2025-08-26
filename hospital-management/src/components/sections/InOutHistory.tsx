'use client';

import { useState, useEffect } from 'react';
import { InOutHistory, User } from '@/types';
import { getInOutHistory, setInOutHistory, searchData, exportToExcel, isAdmin } from '@/lib/storage';
import EditHistoryModal from '../EditHistoryModal';

interface InOutHistorySectionProps {
  currentUser?: User;
}

export default function InOutHistorySection({ currentUser }: InOutHistorySectionProps) {
  const [history, setHistory] = useState<InOutHistory[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InOutHistory | null>(null);

  useEffect(() => {
    const data = getInOutHistory();
    setHistory(data);
  }, []);

  useEffect(() => {
    console.log('모달 상태 변화:', { isEditModalOpen, selectedItem });
  }, [isEditModalOpen, selectedItem]);

  const handleExportToExcel = () => {
    const data = getInOutHistory();
    if (data.length === 0) {
      alert('내보낼 데이터가 없습니다.');
      return;
    }
    exportToExcel(data, '입출고히스토리');
  };

  const handleEditHistory = (item: InOutHistory) => {
    console.log('수정 버튼 클릭됨:', item);
    console.log('현재 사용자:', currentUser);
    console.log('관리자 여부:', currentUser ? isAdmin(currentUser) : false);
    
    if (!currentUser || !isAdmin(currentUser)) {
      alert('관리자만 수정할 수 있습니다.');
      return;
    }

    console.log('모달 열기 시도');
    console.log('현재 모달 상태 (열기 전):', isEditModalOpen);
    console.log('현재 선택된 아이템 (열기 전):', selectedItem);
    
    setSelectedItem(item);
    setIsEditModalOpen(true);
    
    console.log('모달 상태 설정 완료');
    console.log('설정된 아이템:', item);
  };

  const handleEditConfirm = (updatedItem: InOutHistory) => {
    const updatedHistory = history.map(h => h.id === updatedItem.id ? updatedItem : h);
    setInOutHistory(updatedHistory);
    setHistory(updatedHistory);
    alert('수정이 완료되었습니다.');
  };

  const handleDeleteHistory = (item: InOutHistory) => {
    if (!currentUser || !isAdmin(currentUser)) {
      alert('관리자만 삭제할 수 있습니다.');
      return;
    }

    if (window.confirm('정말로 이 기록을 삭제하시겠습니까?')) {
      const updatedHistory = history.filter(h => h.id !== item.id);
      setInOutHistory(updatedHistory);
      setHistory(updatedHistory);
      alert('삭제가 완료되었습니다.');
    }
  };

  const filteredHistory = searchData(
    history, 
    searchTerm, 
    ['partName', 'partNumber', 'serialNumber', 'location', 'hospitalName', 'description']
  );

  return (
    <section>
      <h2>📊 입출고히스토리</h2>
      <div className="list-container">
        <h3>입출고 기록</h3>
        <div className="form-container">
          <button 
            onClick={handleExportToExcel}
            className="mb-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            엑셀 다운로드
          </button>
        </div>
        <div className="search-container">
          <input
            type="text"
            placeholder="부품명, 부품번호, 시리얼번호, 위치, 병원명, 내용으로 검색..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div>
          {filteredHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? '검색 결과가 없습니다.' : '입출고 기록이 없습니다.'}
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr>
                  <th>날짜</th>
                  <th>부품명</th>
                  <th>부품번호</th>
                  <th>시리얼번호</th>
                  <th>위치</th>
                  <th>구분</th>
                  <th>병원명</th>
                  <th>상태</th>
                  <th>내용</th>
                  <th>입고자</th>
                  <th>출고자</th>
                  {currentUser && isAdmin(currentUser) && <th>작업</th>}
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map((item) => (
                  <tr key={item.id}>
                    <td>{new Date(item.date).toLocaleDateString('ko-KR')}</td>
                    <td>{item.partName}</td>
                    <td>{item.partNumber}</td>
                    <td>{item.serialNumber}</td>
                    <td>{item.location}</td>
                    <td>
                      <span className={`px-2 py-1 rounded text-xs ${
                        item.type === '입고' ? 'bg-green-100 text-green-800' :
                        item.type === '출고' ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {item.type}
                      </span>
                    </td>
                    <td>{item.hospitalName || '-'}</td>
                    <td>{item.status || '-'}</td>
                    <td>{item.description}</td>
                    <td>{item.inbounder || '-'}</td>
                    <td>{item.outbounder || '-'}</td>
                    {currentUser && isAdmin(currentUser) && (
                      <td>
                        <div className="flex gap-2">
                                                     <button
                             onClick={() => {
                               console.log('수정 버튼 클릭됨 - 인라인:', item);
                               handleEditHistory(item);
                             }}
                             className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                           >
                             수정
                           </button>
                          <button
                            onClick={() => handleDeleteHistory(item)}
                            className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors"
                          >
                            삭제
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <EditHistoryModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedItem(null);
        }}
        onConfirm={handleEditConfirm}
        item={selectedItem}
      />
    </section>
  );
}
