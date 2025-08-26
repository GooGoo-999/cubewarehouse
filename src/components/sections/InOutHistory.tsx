'use client';

import { useState, useEffect } from 'react';
import { InOutHistory } from '@/types';
import { getInOutHistory, searchData } from '@/lib/storage';

export default function InOutHistorySection() {
  const [history, setHistory] = useState<InOutHistory[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const data = getInOutHistory();
    setHistory(data);
  }, []);

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