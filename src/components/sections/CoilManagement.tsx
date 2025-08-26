'use client';

import { useState, useEffect } from 'react';
import { CoilItem } from '@/types';
import { getCoils, setCoils, generateId, searchData } from '@/lib/storage';

export default function CoilManagement() {
  const [coils, setCoilsState] = useState<CoilItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const data = getCoils();
    setCoilsState(data);
  }, []);

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
  };

  const handleDeleteCoil = (coilId: string) => {
    if (window.confirm('정말로 이 코일을 삭제하시겠습니까?')) {
      const updatedCoils = coils.filter(coil => coil.id !== coilId);
      setCoils(updatedCoils);
      setCoilsState(updatedCoils);
    }
  };

  const filteredCoils = searchData(coils, searchTerm, ['coilName', 'coilNumber', 'serialNumber', 'location']);

  return (
    <section>
      <h2>🔄 코일관리</h2>
      
      <div className="form-container">
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
            author: '관리자',
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
                      <button
                        className="btn-delete"
                        onClick={() => handleDeleteCoil(coil.id)}
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