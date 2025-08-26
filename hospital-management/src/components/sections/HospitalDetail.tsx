'use client';

import { useState, useEffect } from 'react';
import { Hospital, Part } from '@/types';
import { getHospitals, getParts, searchData, setParts, generateId } from '@/lib/storage';
import Modal from '../Modal';
import PartForm from '../forms/PartForm';

interface HospitalDetailProps {
  hospitalId?: string | null;
  onBackToList?: () => void;
}

export default function HospitalDetail({ hospitalId, onBackToList }: HospitalDetailProps) {
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [parts, setPartsState] = useState<Part[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isPartModalOpen, setIsPartModalOpen] = useState(false);
  const [isSiteInfoModalOpen, setIsSiteInfoModalOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<Part | null>(null);
  const [siteInfoForm, setSiteInfoForm] = useState({
    partName: '',
    partNumber: '',
    serialNumber: '',
    date: '',
    worker: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (hospitalId) {
      const hospitals = getHospitals();
      const foundHospital = hospitals.find(h => h.id === hospitalId);
      setHospital(foundHospital || null);
    }
  }, [hospitalId]);

  useEffect(() => {
    if (hospital) {
      loadParts();
    }
  }, [hospital]);

  const loadParts = () => {
    if (!hospital) return;
    const allParts = getParts();
    const hospitalParts = allParts.filter(part => part.hospitalId === hospital.id);
    setPartsState(hospitalParts);
  };

  const handleAddPart = (partData: Omit<Part, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!hospital) return;
    
    const newPart: Part = {
      ...partData,
      hospitalId: hospital.id,
      hospitalName: hospital.name,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const allParts = getParts();
    const updatedParts = [...allParts, newPart];
    setParts(updatedParts);
    loadParts();
    setIsPartModalOpen(false);
  };

  const handleUpdatePart = (partData: Omit<Part, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!editingPart || !hospital) return;

    const updatedPart: Part = {
      ...editingPart,
      ...partData,
      hospitalId: hospital.id,
      hospitalName: hospital.name,
      updatedAt: new Date().toISOString()
    };

    const allParts = getParts();
    const updatedParts = allParts.map(part => 
      part.id === editingPart.id ? updatedPart : part
    );
    setParts(updatedParts);
    loadParts();
    setEditingPart(null);
    setIsPartModalOpen(false);
  };

  const handleDeletePart = (partId: string) => {
    if (window.confirm('정말로 이 부품을 삭제하시겠습니까?')) {
      const allParts = getParts();
      const updatedParts = allParts.filter(part => part.id !== partId);
      setParts(updatedParts);
      loadParts();
    }
  };

  const handleEditPart = (part: Part) => {
    setEditingPart(part);
    setIsPartModalOpen(true);
  };

  const handlePartReplace = () => {
    setEditingPart(null);
    setIsPartModalOpen(true);
  };

  const handleSiteInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!hospital) return;
    
    // Site INFO를 새로운 부품으로 추가
    const newPart: Part = {
      id: generateId(),
      hospitalId: hospital.id,
      hospitalName: hospital.name,
      partName: siteInfoForm.partName,
      partNumber: siteInfoForm.partNumber,
      serialNumber: siteInfoForm.serialNumber,
      replacementDate: siteInfoForm.date,
      worker: siteInfoForm.worker,
      errorContent: 'Site INFO로 추가됨',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const allParts = getParts();
    const updatedParts = [...allParts, newPart];
    setParts(updatedParts);
    loadParts();
    
    // 폼 초기화
    setSiteInfoForm({
      partName: '',
      partNumber: '',
      serialNumber: '',
      date: '',
      worker: ''
    });
    setIsSiteInfoModalOpen(false);
  };

  const filteredParts = searchData(parts, searchTerm, ['partName', 'partNumber', 'serialNumber', 'worker']);
  
  // 최근 장착된 부품 (최근 5개)
  const recentParts = filteredParts
    .sort((a, b) => new Date(b.replacementDate).getTime() - new Date(a.replacementDate).getTime())
    .slice(0, 5);
  
  // 페이지네이션을 위한 현재 페이지 데이터
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentParts = filteredParts.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredParts.length / itemsPerPage);

  if (!hospital) {
    return (
      <section>
        <h2>🏥 병원상세</h2>
        <div className="text-center py-8 text-gray-500">
          병원 상세 정보를 보려면 병원목록에서 병원을 선택해주세요.
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={onBackToList}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
        >
          ← 병원목록으로 돌아가기
        </button>
        <h2>{hospital.name} 상세정보</h2>
      </div>

      {/* 병원 정보 섹션 */}
      <div className="mb-8">
        <h3 className="text-xl font-bold mb-4 border-b-2 border-gray-300 pb-2">병원 정보</h3>
        <div className="grid grid-cols-2 gap-4">
          <div><strong>병원명:</strong> {hospital.name}</div>
          <div><strong>MODALITY:</strong> {hospital.modality || '미등록'}</div>
          <div><strong>SYSTEM ID:</strong> {hospital.systemId || '미등록'}</div>
          <div><strong>장비명:</strong> {hospital.equipment || '미등록'}</div>
          <div><strong>SOFTWARE VERSION:</strong> {hospital.softwareVersion || '미등록'}</div>
          <div><strong>주소:</strong> {hospital.address || '미등록'}</div>
          <div><strong>연락처:</strong> {hospital.phone || '미등록'}</div>
        </div>
      </div>

      {/* 최근 장착된 부품 섹션 */}
      <div className="mb-8">
        <h3 className="text-xl font-bold mb-4 border-b-2 border-gray-300 pb-2">최근 장착된 부품</h3>
        <button 
          onClick={handlePartReplace}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors mb-4"
        >
          + 부품 교체
        </button>
        
        {recentParts.length === 0 ? (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-500">
            최근 장착된 부품 정보가 없습니다.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-blue-500 text-white">
                  <th className="px-4 py-2 text-left">부품명</th>
                  <th className="px-4 py-2 text-left">부품번호</th>
                  <th className="px-4 py-2 text-left">시리얼번호</th>
                  <th className="px-4 py-2 text-left">교체일</th>
                  <th className="px-4 py-2 text-left">작업자</th>
                  <th className="px-4 py-2 text-left">작업</th>
                </tr>
              </thead>
              <tbody>
                {recentParts.map((part) => (
                  <tr key={part.id} className="border-b border-gray-200">
                    <td className="px-4 py-2">{part.partName}</td>
                    <td className="px-4 py-2">{part.partNumber}</td>
                    <td className="px-4 py-2">{part.serialNumber}</td>
                    <td className="px-4 py-2">{new Date(part.replacementDate).toLocaleDateString('ko-KR')}</td>
                    <td className="px-4 py-2">{part.worker}</td>
                    <td className="px-4 py-2">
                      <button 
                        onClick={() => handleEditPart(part)}
                        className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors mr-2"
                      >
                        수정
                      </button>
                      <button 
                        onClick={() => handleDeletePart(part.id)}
                        className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors"
                      >
                        삭제
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 현재 장착된 부품 섹션 */}
      <div>
        <h3 className="text-xl font-bold mb-4 border-b-2 border-gray-300 pb-2">현재 장착된 부품</h3>
        <div className="flex gap-4 mb-4">
          <input
            type="text"
            placeholder="부품명, 부품번호, 시리얼번호, 작업자로 검색..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button 
            onClick={() => setIsSiteInfoModalOpen(true)}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          >
            + Site INFO 추가
          </button>
        </div>
        
        <table className="w-full">
          <thead>
            <tr className="bg-blue-500 text-white">
              <th className="px-4 py-2 text-left">부품명</th>
              <th className="px-4 py-2 text-left">부품번호</th>
              <th className="px-4 py-2 text-left">시리얼번호</th>
              <th className="px-4 py-2 text-left">교체일</th>
              <th className="px-4 py-2 text-left">작업자</th>
              <th className="px-4 py-2 text-left">작업</th>
            </tr>
          </thead>
          <tbody>
            {filteredParts.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-500">
                  현재 장착된 부품이 없습니다.
                </td>
              </tr>
            ) : (
              currentParts.map((part) => (
                <tr key={part.id} className="border-b border-gray-200">
                  <td className="px-4 py-2">{part.partName}</td>
                  <td className="px-4 py-2">{part.partNumber}</td>
                  <td className="px-4 py-2">{part.serialNumber}</td>
                  <td className="px-4 py-2">{new Date(part.replacementDate).toLocaleDateString('ko-KR')}</td>
                  <td className="px-4 py-2">{part.worker}</td>
                  <td className="px-4 py-2">
                    <button 
                      onClick={() => handleEditPart(part)}
                      className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors mr-2"
                    >
                      수정
                    </button>
                    <button 
                      onClick={() => handleDeletePart(part.id)}
                      className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors"
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        
        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-4">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              이전
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
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
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
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
            총 {filteredParts.length}개 중 {startIndex + 1}-{Math.min(endIndex, filteredParts.length)}개 표시
          </div>
        )}
      </div>

      {/* 부품 교체 모달 */}
      <Modal 
        isOpen={isPartModalOpen} 
        title={editingPart ? "부품 교체 수정" : "부품 교체 추가"}
        onClose={() => {
          setIsPartModalOpen(false);
          setEditingPart(null);
        }}
      >
        <PartForm
          part={editingPart}
          onSubmit={editingPart ? handleUpdatePart : handleAddPart}
          onCancel={() => {
            setIsPartModalOpen(false);
            setEditingPart(null);
          }}
        />
      </Modal>

      {/* Site INFO 추가 모달 */}
      <Modal 
        isOpen={isSiteInfoModalOpen} 
        title="Site INFO 추가"
        onClose={() => {
          setIsSiteInfoModalOpen(false);
          setSiteInfoForm({
            partName: '',
            partNumber: '',
            serialNumber: '',
            date: '',
            worker: ''
          });
        }}
      >
        <form onSubmit={handleSiteInfoSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              부품명 *
            </label>
            <input
              type="text"
              value={siteInfoForm.partName}
              onChange={(e) => setSiteInfoForm(prev => ({ ...prev, partName: e.target.value }))}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="부품명을 입력하세요"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              부품번호 *
            </label>
            <input
              type="text"
              value={siteInfoForm.partNumber}
              onChange={(e) => setSiteInfoForm(prev => ({ ...prev, partNumber: e.target.value }))}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="부품번호를 입력하세요"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              시리얼번호 *
            </label>
            <input
              type="text"
              value={siteInfoForm.serialNumber}
              onChange={(e) => setSiteInfoForm(prev => ({ ...prev, serialNumber: e.target.value }))}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="시리얼번호를 입력하세요"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              연도-월-일 *
            </label>
            <input
              type="date"
              value={siteInfoForm.date}
              onChange={(e) => setSiteInfoForm(prev => ({ ...prev, date: e.target.value }))}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              작업자 *
            </label>
            <input
              type="text"
              value={siteInfoForm.worker}
              onChange={(e) => setSiteInfoForm(prev => ({ ...prev, worker: e.target.value }))}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="작업자명을 입력하세요"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              추가
            </button>
            <button
              type="button"
              onClick={() => {
                setIsSiteInfoModalOpen(false);
                setSiteInfoForm({
                  partName: '',
                  partNumber: '',
                  serialNumber: '',
                  date: '',
                  worker: ''
                });
              }}
              className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              취소
            </button>
          </div>
        </form>
      </Modal>
    </section>
  );
}

