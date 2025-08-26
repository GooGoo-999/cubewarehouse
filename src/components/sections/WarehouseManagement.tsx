'use client';

import { useState, useEffect } from 'react';
import { WarehouseItem } from '@/types';
import { getWarehouse, setWarehouse, generateId, searchData } from '@/lib/storage';

export default function WarehouseManagement() {
  const [warehouse, setWarehouseState] = useState<WarehouseItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const data = getWarehouse();
    setWarehouseState(data);
  }, []);

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
  };

  const handleDeleteItem = (itemId: string) => {
    if (window.confirm('정말로 이 항목을 삭제하시겠습니까?')) {
      const updatedWarehouse = warehouse.filter(item => item.id !== itemId);
      setWarehouse(updatedWarehouse);
      setWarehouseState(updatedWarehouse);
    }
  };

  const filteredItems = searchData(warehouse, searchTerm, ['partName', 'partNumber', 'serialNumber', 'location']);

  return (
    <section>
      <h2>📦 창고관리</h2>
      
      <div className="form-container">
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
            author: '관리자',
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
                      <button
                        className="btn-delete"
                        onClick={() => handleDeleteItem(item.id)}
                      >
                        삭제
                      </button>
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