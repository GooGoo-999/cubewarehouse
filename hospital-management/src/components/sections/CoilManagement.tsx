'use client';

import { useState, useEffect } from 'react';
import { CoilItem, InOutHistory, User } from '@/types';
import { getCoils, setCoils, getInOutHistory, setInOutHistory, generateId, searchData, exportToExcel, getData, setData, isAdmin } from '@/lib/storage';
import OutboundModal from '../OutboundModal';
import EditCoilModal from '../EditCoilModal';

interface CoilManagementProps {
  currentUser?: User;
}

export default function CoilManagement({ currentUser }: CoilManagementProps) {
  const [coils, setCoilsState] = useState<CoilItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOutboundModalOpen, setIsOutboundModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CoilItem | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<CoilItem | null>(null);

  useEffect(() => {
    const data = getCoils();
    setCoilsState(data);
  }, []);

  useEffect(() => {
    console.log('코일 모달 상태 변화:', { isEditModalOpen, editItem });
  }, [isEditModalOpen, editItem]);

  useEffect(() => {
    console.log('코일 출고 모달 상태 변화:', { isOutboundModalOpen, selectedItem });
  }, [isOutboundModalOpen, selectedItem]);

  const handleAddCoil = (coilData: Omit<CoilItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newCoil: CoilItem = {
      ...coilData,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedCoils = [...coils, newCoil];
    setCoils(updatedCoils);
    setCoilsState(updatedCoils);

    // 입출고 히스토리에 입고 기록 추가
    const historyItem: InOutHistory = {
      id: generateId(),
      date: new Date().toISOString(),
      partName: coilData.coilName,
      partNumber: coilData.coilNumber,
      serialNumber: coilData.serialNumber,
      type: '입고',
      location: coilData.location,
      description: coilData.description,
      inbounder: coilData.author,
      outbounder: '',
      createdAt: new Date().toISOString(),
    };

    const currentHistory = getInOutHistory();
    const updatedHistory = [...currentHistory, historyItem];
    setInOutHistory(updatedHistory);
  };

  const handleEditCoil = (coil: CoilItem) => {
    console.log('코일 수정 버튼 클릭됨:', coil);
    console.log('현재 모달 상태 (열기 전):', isEditModalOpen);
    console.log('현재 선택된 아이템 (열기 전):', editItem);
    
    setEditItem(coil);
    setIsEditModalOpen(true);
    
    console.log('모달 상태 설정 완료');
    console.log('설정된 아이템:', coil);
  };

  const handleEditConfirm = (updatedItem: CoilItem) => {
    const updatedCoils = coils.map(c => c.id === updatedItem.id ? updatedItem : c);
    setCoils(updatedCoils);
    setCoilsState(updatedCoils);
    setIsEditModalOpen(false);
    setEditItem(null);
  };

  const handleOutboundCoil = (coil: CoilItem) => {
    console.log('코일 출고 버튼 클릭됨:', coil);
    console.log('현재 출고 모달 상태 (열기 전):', isOutboundModalOpen);
    console.log('현재 선택된 아이템 (열기 전):', selectedItem);
    
    setSelectedItem(coil);
    setIsOutboundModalOpen(true);
    
    console.log('출고 모달 상태 설정 완료');
    console.log('설정된 아이템:', coil);
  };

  const handleOutboundConfirm = (data: { hospital: string; outbounder: string; notes: string }) => {
    if (!selectedItem) return;

    // 창고에서 제거
    const updatedCoils = coils.filter(c => c.id !== selectedItem.id);
    setCoils(updatedCoils);
    setCoilsState(updatedCoils);

    // 입출고 히스토리에 출고 기록 추가
    const historyItem: InOutHistory = {
      id: generateId(),
      date: new Date().toISOString(),
      partName: selectedItem.coilName,
      partNumber: selectedItem.coilNumber,
      serialNumber: selectedItem.serialNumber,
      type: '출고',
      location: selectedItem.location,
      description: data.notes,
      inbounder: '',
      outbounder: data.outbounder,
      createdAt: new Date().toISOString(),
    };

    const currentHistory = getInOutHistory();
    const updatedHistory = [...currentHistory, historyItem];
    setInOutHistory(updatedHistory);

    // 출고 부품 관리에도 추가
    const outboundPart = {
      id: generateId(),
      date: new Date().toISOString(),
      hospital: data.hospital,
      partName: selectedItem.coilName,
      partNumber: selectedItem.coilNumber,
      serialNumber: selectedItem.serialNumber,
      worker: data.outbounder,
      notes: data.notes,
      author: data.outbounder,
      createdAt: new Date().toISOString(),
    };

    const currentOutboundParts = getData('outboundParts');
    const updatedOutboundParts = [...currentOutboundParts, outboundPart];
    setData('outboundParts', updatedOutboundParts);

    alert('출고가 완료되었습니다.');
    setIsOutboundModalOpen(false);
    setSelectedItem(null);
  };

  const handleDeleteCoil = (coilId: string) => {
    if (!currentUser || !isAdmin(currentUser)) {
      alert('관리자만 삭제할 수 있습니다.');
      return;
    }
    if (window.confirm('정말로 이 코일을 삭제하시겠습니까?')) {
      const updatedCoils = coils.filter(coil => coil.id !== coilId);
      setCoils(updatedCoils);
      setCoilsState(updatedCoils);
    }
  };

  const handleExportToExcel = () => {
    const data = getCoils();
    if (data.length === 0) {
      alert('내보낼 데이터가 없습니다.');
      return;
    }
    exportToExcel(data, '코일재고목록');
  };

  const filteredCoils = searchData(coils, searchTerm, ['coilName', 'coilNumber', 'serialNumber', 'location']);

  return (
    <section>
      <h2>🔄 코일관리</h2>
      
      <div className="form-container">
        <div className="flex gap-4 mb-4">
          <button 
            onClick={handleExportToExcel}
            className="mb-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            엑셀 다운로드
          </button>
        </div>
        
        <form onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          handleAddCoil({
            coilName: formData.get('coilName') as string,
            coilNumber: formData.get('coilNumber') as string,
            serialNumber: formData.get('serialNumber') as string,
            location: formData.get('location') as string,
            inboundDate: formData.get('inboundDate') as string,
            status: formData.get('status') as 'Good' | 'Bad',
            description: formData.get('description') as string,
            author: formData.get('author') as string,
          });
          e.currentTarget.reset();
        }}>
          <input type="text" name="coilName" placeholder="코일명" required />
          <input type="text" name="coilNumber" placeholder="코일번호" required />
          <input type="text" name="serialNumber" placeholder="시리얼번호" required />
          <input type="text" name="location" placeholder="위치" required />
          <input type="date" name="inboundDate" required />
          <select name="status" required>
            <option value="">상태 선택</option>
            <option value="Good">Good</option>
            <option value="Bad">Bad</option>
          </select>
          <input type="text" name="author" placeholder="입고자" required />
          <textarea name="description" placeholder="입고내용" required />
          <button type="submit">코일 재고 추가</button>
        </form>
      </div>

      <div className="list-container">
        <h3>코일 재고 현황</h3>
        <div className="search-container">
          <input
            type="text"
            placeholder="코일명, 코일번호, 시리얼번호, 위치로 검색..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div>
          {filteredCoils.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? '검색 결과가 없습니다.' : '등록된 코일이 없습니다.'}
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr>
                  <th>코일명</th>
                  <th>코일번호</th>
                  <th>시리얼번호</th>
                  <th>위치</th>
                  <th>입고날짜</th>
                  <th>상태</th>
                  <th>입고내용</th>
                  <th>입고자</th>
                  <th>작업</th>
                </tr>
              </thead>
              <tbody>
                {filteredCoils.map((coil) => (
                  <tr key={coil.id}>
                    <td>{coil.coilName}</td>
                    <td>{coil.coilNumber}</td>
                    <td>{coil.serialNumber}</td>
                    <td>{coil.location}</td>
                    <td>{new Date(coil.inboundDate).toLocaleDateString('ko-KR')}</td>
                    <td>
                      <span className={`px-2 py-1 rounded text-xs ${
                        coil.status === 'Good' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {coil.status}
                      </span>
                    </td>
                    <td>{coil.description}</td>
                    <td>{coil.author}</td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            console.log('코일 수정 버튼 클릭됨 - 인라인:', coil);
                            alert('코일 수정 버튼이 클릭되었습니다!');
                            handleEditCoil(coil);
                          }}
                          className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => {
                            console.log('코일 출고 버튼 클릭됨 - 인라인:', coil);
                            alert('코일 출고 버튼이 클릭되었습니다!');
                            handleOutboundCoil(coil);
                          }}
                          className="px-2 py-1 bg-orange-500 text-white text-xs rounded hover:bg-orange-600 transition-colors"
                        >
                          출고
                        </button>
                        {currentUser && isAdmin(currentUser) && (
                          <button
                            className="btn-delete"
                            onClick={() => handleDeleteCoil(coil.id)}
                          >
                            삭제
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <OutboundModal
        isOpen={isOutboundModalOpen}
        onClose={() => {
          setIsOutboundModalOpen(false);
          setSelectedItem(null);
        }}
        onConfirm={handleOutboundConfirm}
        itemName={selectedItem ? `${selectedItem.coilName} (${selectedItem.coilNumber})` : ''}
      />

      <EditCoilModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditItem(null);
        }}
        onConfirm={handleEditConfirm}
        item={editItem}
      />
    </section>
  );
}
