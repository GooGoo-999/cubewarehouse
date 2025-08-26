'use client';

import { useState, useEffect } from 'react';
import { Part } from '@/types';
import { getParts, setParts, generateId, searchData, paginateData, exportToExcel } from '@/lib/storage';
import PartForm from '../forms/PartForm';
import Modal from '../Modal';

export default function ReplacementHistory() {
  const [parts, setPartsState] = useState<Part[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<Part | null>(null);
  const itemsPerPage = 20;

  useEffect(() => {
    loadParts();
  }, []);

  const loadParts = () => {
    const data = getParts();
    setPartsState(data);
  };

  const handleAddPart = (partData: Omit<Part, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newPart: Part = {
      ...partData,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedParts = [...parts, newPart];
    setParts(updatedParts);
    setPartsState(updatedParts);
    setIsModalOpen(false);
  };

  const handleEditPart = (part: Part) => {
    setEditingPart(part);
    setIsModalOpen(true);
  };

  const handleUpdatePart = (partData: Omit<Part, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!editingPart) return;

    const updatedPart: Part = {
      ...editingPart,
      ...partData,
      updatedAt: new Date().toISOString()
    };

    const updatedParts = parts.map(part => 
      part.id === editingPart.id ? updatedPart : part
    );
    setParts(updatedParts);
    setPartsState(updatedParts);
    setIsModalOpen(false);
    setEditingPart(null);
  };

  const handleDeletePart = (partId: string) => {
    if (confirm('정말로 이 교체 기록을 삭제하시겠습니까?')) {
      const updatedParts = parts.filter(part => part.id !== partId);
      setParts(updatedParts);
      setPartsState(updatedParts);
    }
  };

  const filteredParts = searchData(parts, searchTerm, ['hospitalName', 'partName', 'partNumber', 'serialNumber', 'worker', 'errorContent']);
  const { data: paginatedParts, totalPages, totalItems } = paginateData(filteredParts, currentPage, itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleExportToExcel = () => {
    const data = getParts();
    if (data.length === 0) {
      alert('내보낼 데이터가 없습니다.');
      return;
    }
    exportToExcel(data, '교체히스토리');
  };

  return (
    <section>
      <h2>🔄 교체히스토리</h2>
      <div className="list-container">
        <div className="flex justify-between items-center mb-4">
          <h3>교체 기록</h3>
          <div className="flex gap-2">
            <button
              onClick={handleExportToExcel}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
            >
              엑셀 다운로드
            </button>
            <button
              onClick={() => {
                setEditingPart(null);
                setIsModalOpen(true);
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              부품교체 추가
            </button>
          </div>
        </div>
        <div className="search-container">
          <input
            type="text"
            placeholder="병원명, 부품명, 부품번호, 시리얼번호, 작업자, 에러내용으로 검색..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        
        <div>
          {paginatedParts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? '검색 결과가 없습니다.' : '교체 기록이 없습니다.'}
            </div>
          ) : (
            <>
              <table className="w-full">
                <thead>
                  <tr>
                    <th>교체날짜</th>
                    <th>병원명</th>
                    <th>부품명</th>
                    <th>부품번호</th>
                    <th>시리얼번호</th>
                    <th>작업자</th>
                    <th>에러내용</th>
                    <th>작업</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedParts.map((part) => (
                    <tr key={part.id}>
                      <td>{new Date(part.replacementDate).toLocaleDateString('ko-KR')}</td>
                      <td>{part.hospitalName}</td>
                      <td>{part.partName}</td>
                      <td>{part.partNumber}</td>
                      <td>{part.serialNumber}</td>
                      <td>{part.worker}</td>
                      <td>{part.errorContent}</td>
                      <td>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleEditPart(part)}
                            className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                          >
                            수정
                          </button>
                          <button 
                            onClick={() => handleDeletePart(part.id)}
                            className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors"
                          >
                            삭제
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* 페이지네이션 */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-4">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    이전
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-1 rounded ${
                        currentPage === page
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    다음
                  </button>
                </div>
              )}
              
              {/* 페이지 정보 */}
              {filteredParts.length > 0 && (
                <div className="text-center text-sm text-gray-600 mt-2">
                  총 {filteredParts.length}개 중 {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredParts.length)}개 표시
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        title={editingPart ? "부품교체 수정" : "부품교체 추가"}
        onClose={() => {
          setIsModalOpen(false);
          setEditingPart(null);
        }}
      >
        <PartForm
          part={editingPart}
          onSubmit={editingPart ? handleUpdatePart : handleAddPart}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingPart(null);
          }}
        />
      </Modal>
    </section>
  );
}
