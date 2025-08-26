'use client';

import { useState, useEffect } from 'react';
import { Hospital } from '@/types';
import { getHospitals, setHospitals, generateId, searchData, paginateData, exportToExcel } from '@/lib/storage';
import HospitalForm from '../forms/HospitalForm';
import Modal from '../Modal';

export default function HospitalManagement() {
  const [hospitals, setHospitalsState] = useState<Hospital[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHospital, setEditingHospital] = useState<Hospital | null>(null);
  const itemsPerPage = 20;

  useEffect(() => {
    loadHospitals();
  }, []);

  const loadHospitals = () => {
    const data = getHospitals();
    setHospitalsState(data);
  };

  const handleAddHospital = (hospitalData: Omit<Hospital, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newHospital: Hospital = {
      ...hospitalData,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedHospitals = [...hospitals, newHospital];
    setHospitals(updatedHospitals);
    setHospitalsState(updatedHospitals);
    setIsModalOpen(false);
  };

  const handleEditHospital = (hospital: Hospital) => {
    setEditingHospital(hospital);
    setIsModalOpen(true);
  };

  const handleUpdateHospital = (hospitalData: Omit<Hospital, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!editingHospital) return;

    const updatedHospital: Hospital = {
      ...hospitalData,
      id: editingHospital.id,
      createdAt: editingHospital.createdAt,
      updatedAt: new Date().toISOString(),
    };

    const updatedHospitals = hospitals.map(h => 
      h.id === editingHospital.id ? updatedHospital : h
    );
    
    setHospitals(updatedHospitals);
    setHospitalsState(updatedHospitals);
    setEditingHospital(null);
    setIsModalOpen(false);
  };

  const handleDeleteHospital = (hospitalId: string) => {
    if (window.confirm('정말로 이 병원을 삭제하시겠습니까?')) {
      const updatedHospitals = hospitals.filter(h => h.id !== hospitalId);
      setHospitals(updatedHospitals);
      setHospitalsState(updatedHospitals);
    }
  };

  const handleExportToExcel = () => {
    const data = getHospitals();
    if (data.length === 0) {
      alert('내보낼 데이터가 없습니다.');
      return;
    }
    exportToExcel(data, '병원목록');
  };

  const filteredHospitals = searchData(hospitals, searchTerm, ['name', 'modality', 'systemId', 'equipment', 'softwareVersion']);
  const { data: paginatedHospitals, totalPages, totalItems } = paginateData(filteredHospitals, currentPage, itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <section>
      <h2>🏥 병원관리</h2>
      
      <div className="form-container">
        <div className="flex gap-4 mb-4">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="mb-4"
          >
            병원 추가
          </button>
          <button 
            onClick={handleExportToExcel}
            className="mb-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            엑셀 다운로드
          </button>
        </div>
      </div>

      <div className="list-container">
        <h3 className="hospital-list-title">병원 목록</h3>
        <div className="search-container">
          <input
            type="text"
            placeholder="병원명, Modality, System ID, 장비명, Software Version으로 검색..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div>
          {filteredHospitals.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? '검색 결과가 없습니다.' : '등록된 병원이 없습니다.'}
            </div>
          ) : (
            <>
              <table className="w-full">
                <thead>
                  <tr>
                    <th>병원명</th>
                    <th>Modality</th>
                    <th>System ID</th>
                    <th>장비명</th>
                    <th>Software Version</th>
                    <th>주소</th>
                    <th>연락처</th>
                    <th>작업</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedHospitals.map((hospital) => (
                    <tr key={hospital.id}>
                      <td>{hospital.name}</td>
                      <td>{hospital.modality}</td>
                      <td>{hospital.systemId}</td>
                      <td>{hospital.equipment}</td>
                      <td>{hospital.softwareVersion}</td>
                      <td>{hospital.address}</td>
                      <td>{hospital.phone}</td>
                      <td>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditHospital(hospital)}
                            className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                          >
                            수정
                          </button>
                          <button
                            onClick={() => handleDeleteHospital(hospital.id)}
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
                    className="px-3 py-1 bg-gray-300 text-gray-700 rounded disabled:opacity-50"
                  >
                    이전
                  </button>
                  <span className="px-3 py-1">
                    {currentPage} / {totalPages} (총 {totalItems}개)
                  </span>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 bg-gray-300 text-gray-700 rounded disabled:opacity-50"
                  >
                    다음
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        title={editingHospital ? "병원 수정" : "병원 추가"}
        onClose={() => {
          setIsModalOpen(false);
          setEditingHospital(null);
        }}
      >
        <HospitalForm
          hospital={editingHospital}
          onSubmit={editingHospital ? handleUpdateHospital : handleAddHospital}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingHospital(null);
          }}
        />
      </Modal>
    </section>
  );
}
