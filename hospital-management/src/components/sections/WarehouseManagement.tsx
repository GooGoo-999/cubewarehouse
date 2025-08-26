'use client';

import { useState, useEffect } from 'react';
import { WarehouseItem, InOutHistory, User } from '@/types';
import { getWarehouse, setWarehouse, getInOutHistory, setInOutHistory, generateId, searchData, exportToExcel, getData, setData, isAdmin } from '@/lib/storage';
import OutboundModal from '../OutboundModal';
import EditWarehouseModal from '../EditWarehouseModal';

interface WarehouseManagementProps {
  currentUser?: User;
}

export default function WarehouseManagement({ currentUser }: WarehouseManagementProps) {
  const [warehouse, setWarehouseState] = useState<WarehouseItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOutboundModalOpen, setIsOutboundModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<WarehouseItem | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<WarehouseItem | null>(null);

  useEffect(() => {
    const data = getWarehouse();
    setWarehouseState(data);
  }, []);

  useEffect(() => {
    console.log('모달 상태 변화:', { isEditModalOpen, editItem });
  }, [isEditModalOpen, editItem]);

  const handleAddItem = (itemData: Omit<WarehouseItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newItem: WarehouseItem = {
      ...itemData,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedWarehouse = [...warehouse, newItem];
    setWarehouse(updatedWarehouse);
    setWarehouseState(updatedWarehouse);

    // 입출고 히스토리에 입고 기록 추가
    const historyItem: InOutHistory = {
      id: generateId(),
      date: new Date().toISOString(),
      partName: itemData.partName,
      partNumber: itemData.partNumber,
      serialNumber: itemData.serialNumber,
      type: '입고',
      location: itemData.location,
      description: itemData.description,
      inbounder: itemData.author,
      outbounder: '',
      createdAt: new Date().toISOString(),
    };

    const currentHistory = getInOutHistory();
    const updatedHistory = [...currentHistory, historyItem];
    setInOutHistory(updatedHistory);
  };

  const handleEditItem = (item: WarehouseItem) => {
    console.log('수정 버튼 클릭됨:', item);
    console.log('현재 모달 상태 (열기 전):', isEditModalOpen);
    console.log('현재 선택된 아이템 (열기 전):', editItem);
    
    setEditItem(item);
    setIsEditModalOpen(true);
    
    console.log('모달 상태 설정 완료');
    console.log('설정된 아이템:', item);
  };

  const handleEditConfirm = (updatedItem: WarehouseItem) => {
    const updatedWarehouse = warehouse.map(w => w.id === updatedItem.id ? updatedItem : w);
    setWarehouse(updatedWarehouse);
    setWarehouseState(updatedWarehouse);
    alert('수정이 완료되었습니다.');
  };

  const handleOutboundItem = (item: WarehouseItem) => {
    console.log('출고 버튼 클릭됨:', item);
    setSelectedItem(item);
    setIsOutboundModalOpen(true);
    console.log('모달 상태:', isOutboundModalOpen);
  };

  const handleOutboundConfirm = (data: { hospital: string; outbounder: string; notes: string }) => {
    if (!selectedItem) return;

    // 창고에서 제거
    const updatedWarehouse = warehouse.filter(w => w.id !== selectedItem.id);
    setWarehouse(updatedWarehouse);
    setWarehouseState(updatedWarehouse);

    // 입출고 히스토리에 출고 기록 추가
    const historyItem: InOutHistory = {
      id: generateId(),
      date: new Date().toISOString(),
      partName: selectedItem.partName,
      partNumber: selectedItem.partNumber,
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
      partName: selectedItem.partName,
      partNumber: selectedItem.partNumber,
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

  const handleDeleteItem = (itemId: string) => {
    if (!currentUser || !isAdmin(currentUser)) {
      alert('관리자만 삭제할 수 있습니다.');
      return;
    }

    if (window.confirm('정말로 이 항목을 삭제하시겠습니까?')) {
      const updatedWarehouse = warehouse.filter(item => item.id !== itemId);
      setWarehouse(updatedWarehouse);
      setWarehouseState(updatedWarehouse);
    }
  };

  const handleExportToExcel = () => {
    const data = getWarehouse();
    if (data.length === 0) {
      alert('내보낼 데이터가 없습니다.');
      return;
    }
    exportToExcel(data, '창고재고목록');
  };

  const filteredItems = searchData(warehouse, searchTerm, ['partName', 'partNumber', 'serialNumber', 'location']);

  return (
    <section>
      <h2>📦 창고관리</h2>
      
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
          handleAddItem({
            partName: formData.get('partName') as string,
            partNumber: formData.get('partNumber') as string,
            serialNumber: formData.get('serialNumber') as string,
            location: formData.get('location') as string,
            inboundDate: formData.get('inboundDate') as string,
            status: formData.get('status') as 'Good' | 'Bad',
            description: formData.get('description') as string,
            author: formData.get('author') as string,
          });
          e.currentTarget.reset();
        }}>
          <input type="text" name="partName" placeholder="부품명" required />
          <input type="text" name="partNumber" placeholder="부품번호" required />
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
          <button type="submit">창고 재고 추가</button>
        </form>
      </div>

      <div className="list-container">
        <h3>창고 재고 현황</h3>
        <div className="search-container">
          <input
            type="text"
            placeholder="부품명, 부품번호, 시리얼번호, 위치로 검색..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div>
          {filteredItems.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? '검색 결과가 없습니다.' : '등록된 재고가 없습니다.'}
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr>
                  <th>부품명</th>
                  <th>부품번호</th>
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
                {filteredItems.map((item) => (
                  <tr key={item.id}>
                    <td>{item.partName}</td>
                    <td>{item.partNumber}</td>
                    <td>{item.serialNumber}</td>
                    <td>{item.location}</td>
                    <td>{new Date(item.inboundDate).toLocaleDateString('ko-KR')}</td>
                    <td>
                      <span className={`px-2 py-1 rounded text-xs ${
                        item.status === 'Good' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td>{item.description}</td>
                    <td>{item.author}</td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            console.log('수정 버튼 클릭됨 - 인라인:', item);
                            handleEditItem(item);
                          }}
                          className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                        >
                          수정
                        </button>
                        {currentUser && isAdmin(currentUser) && (
                          <button
                            className="btn-delete"
                            onClick={() => handleDeleteItem(item.id)}
                          >
                            삭제
                          </button>
                        )}
                        <button
                          onClick={() => {
                            console.log('출고 버튼 클릭됨 - 인라인:', item);
                            handleOutboundItem(item);
                          }}
                          className="px-2 py-1 bg-orange-500 text-white text-xs rounded hover:bg-orange-600 transition-colors"
                        >
                          출고
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

      <OutboundModal
        isOpen={isOutboundModalOpen}
        onClose={() => {
          setIsOutboundModalOpen(false);
          setSelectedItem(null);
        }}
        onConfirm={handleOutboundConfirm}
        itemName={selectedItem ? `${selectedItem.partName} (${selectedItem.partNumber})` : ''}
              />

        <EditWarehouseModal
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
