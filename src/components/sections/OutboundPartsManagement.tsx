'use client';

import { useState, useEffect } from 'react';
import { OutboundPart, OutboundHistory } from '@/types';
import { getOutboundParts, setOutboundParts, getOutboundHistory, setOutboundHistory, generateId, searchData } from '@/lib/storage';

export default function OutboundPartsManagement() {
  const [outboundParts, setOutboundPartsState] = useState<OutboundPart[]>([]);
  const [outboundHistory, setOutboundHistoryState] = useState<OutboundHistory[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [historySearchTerm, setHistorySearchTerm] = useState('');

  useEffect(() => {
    const partsData = getOutboundParts();
    const historyData = getOutboundHistory();
    setOutboundPartsState(partsData);
    setOutboundHistoryState(historyData);
  }, []);

  const handleAddOutboundPart = (partData: Omit<OutboundPart, 'id' | 'createdAt'>) => {
    const newPart: OutboundPart = {
      ...partData,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };

    const newHistoryItem: OutboundHistory = {
      ...newPart,
      id: generateId(),
    };

    const updatedParts = [...outboundParts, newPart];
    const updatedHistory = [...outboundHistory, newHistoryItem];

    setOutboundParts(updatedParts);
    setOutboundHistory(updatedHistory);
    setOutboundPartsState(updatedParts);
    setOutboundHistoryState(updatedHistory);
  };

  const handleDeleteOutboundPart = (partId: string) => {
    if (window.confirm('정말로 이 출고부품을 삭제하시겠습니까?')) {
      const updatedParts = outboundParts.filter(part => part.id !== partId);
      setOutboundParts(updatedParts);
      setOutboundPartsState(updatedParts);
    }
  };

  const filteredParts = searchData(outboundParts, searchTerm, ['date', 'hospital', 'partName', 'partNumber', 'serialNumber', 'worker', 'notes']);
  const filteredHistory = searchData(outboundHistory, historySearchTerm, ['date', 'hospital', 'partName', 'partNumber', 'serialNumber', 'worker', 'notes', 'author']);

  return (
    <section>
      <h2>📤 출고부품관리</h2>
      
      <div className="form-container">
        <form onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          handleAddOutboundPart({
            date: formData.get('date') as string,
            hospital: formData.get('hospital') as string,
            partName: formData.get('partName') as string,
            partNumber: formData.get('partNumber') as string,
            serialNumber: formData.get('serialNumber') as string,
            worker: formData.get('worker') as string,
            notes: formData.get('notes') as string,
            author: '관리자',
          });
          e.currentTarget.reset();
        }}>
          <input type="date" name="date" required />
          <input type="text" name="hospital" placeholder="병원명" required />
          <input type="text" name="partName" placeholder="부품명" required />
          <input type="text" name="partNumber" placeholder="부품번호" required />
          <input type="text" name="serialNumber" placeholder="시리얼번호" required />
          <input type="text" name="worker" placeholder="출고자" required />
          <textarea name="notes" placeholder="내용" required />
          <button type="submit">출고부품 추가</button>
        </form>
      </div>

      <div className="list-container">
        <h3>출고중인 부품 목록</h3>
        <div className="search-container">
          <input
            type="text"
            placeholder="출고날짜, 병원명, 부품명, 부품번호, 시리얼번호, 출고자, 내용으로 검색..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div>
          {filteredParts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? '검색 결과가 없습니다.' : '출고중인 부품이 없습니다.'}
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr>
                  <th>출고날짜</th>
                  <th>병원명</th>
                  <th>부품명</th>
                  <th>부품번호</th>
                  <th>시리얼번호</th>
                  <th>출고자</th>
                  <th>내용</th>
                  <th>작업</th>
                </tr>
              </thead>
              <tbody>
                {filteredParts.map((part) => (
                  <tr key={part.id}>
                    <td>{new Date(part.date).toLocaleDateString('ko-KR')}</td>
                    <td>{part.hospital}</td>
                    <td>{part.partName}</td>
                    <td>{part.partNumber}</td>
                    <td>{part.serialNumber}</td>
                    <td>{part.worker}</td>
                    <td>{part.notes}</td>
                    <td>
                      <button
                        className="btn-delete"
                        onClick={() => handleDeleteOutboundPart(part.id)}
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

      <div className="list-container">
        <h3>출고 히스토리</h3>
        <div className="search-container">
          <input
            type="text"
            placeholder="출고날짜, 병원명, 부품명, 부품번호, 시리얼번호, 출고자, 내용, 작성자로 검색..."
            className="search-input"
            value={historySearchTerm}
            onChange={(e) => setHistorySearchTerm(e.target.value)}
          />
        </div>
        
        <div>
          {filteredHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {historySearchTerm ? '검색 결과가 없습니다.' : '출고 히스토리가 없습니다.'}
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr>
                  <th>출고날짜</th>
                  <th>병원명</th>
                  <th>부품명</th>
                  <th>부품번호</th>
                  <th>시리얼번호</th>
                  <th>출고자</th>
                  <th>내용</th>
                  <th>작성자</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map((item) => (
                  <tr key={item.id}>
                    <td>{new Date(item.date).toLocaleDateString('ko-KR')}</td>
                    <td>{item.hospital}</td>
                    <td>{item.partName}</td>
                    <td>{item.partNumber}</td>
                    <td>{item.serialNumber}</td>
                    <td>{item.worker}</td>
                    <td>{item.notes}</td>
                    <td>{item.author}</td>
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