'use client';

import { useState, useEffect } from 'react';
import { InOutHistory } from '@/types';

interface EditHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (updatedItem: InOutHistory) => void;
  item: InOutHistory | null;
}

export default function EditHistoryModal({ isOpen, onClose, onConfirm, item }: EditHistoryModalProps) {
  console.log('EditHistoryModal 렌더링:', { isOpen, item });
  const [formData, setFormData] = useState<Partial<InOutHistory>>({});

  useEffect(() => {
    if (item) {
      setFormData({
        partName: item.partName,
        partNumber: item.partNumber,
        serialNumber: item.serialNumber,
        location: item.location,
        type: item.type,
        hospitalName: item.hospitalName || '',
        status: item.status || '',
        description: item.description,
        inbounder: item.inbounder || '',
        outbounder: item.outbounder || '',
      });
    }
  }, [item]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;

    const updatedItem: InOutHistory = {
      ...item,
      partName: formData.partName || item.partName,
      partNumber: formData.partNumber || item.partNumber,
      serialNumber: formData.serialNumber || item.serialNumber,
      location: formData.location || item.location,
      type: formData.type || item.type,
      hospitalName: formData.hospitalName || undefined,
      status: formData.status || undefined,
      description: formData.description || item.description,
      inbounder: formData.inbounder || undefined,
      outbounder: formData.outbounder || undefined,
    };

    onConfirm(updatedItem);
    onClose();
  };

  console.log('모달 isOpen 상태:', isOpen);
  console.log('아이템 존재 여부:', !!item);
  if (!isOpen || !item) {
    console.log('모달이 닫혀있거나 아이템이 없음, null 반환');
    return null;
  }
  
  console.log('모달 렌더링 시작!');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
      <div className="bg-white rounded-lg p-6 w-[600px] max-h-[90vh] overflow-y-auto" style={{ backgroundColor: 'white', border: '3px solid red', boxShadow: '0 0 20px rgba(255,0,0,0.5)' }}>
        <h3 className="text-lg font-semibold mb-4">입출고 기록 수정</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                부품명 *
              </label>
              <input
                type="text"
                value={formData.partName || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, partName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                부품번호 *
              </label>
              <input
                type="text"
                value={formData.partNumber || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, partNumber: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                시리얼번호 *
              </label>
              <input
                type="text"
                value={formData.serialNumber || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, serialNumber: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                위치 *
              </label>
              <input
                type="text"
                value={formData.location || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                구분 *
              </label>
              <select
                value={formData.type || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as '입고' | '출고' | '삭제' }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="입고">입고</option>
                <option value="출고">출고</option>
                <option value="삭제">삭제</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                병원명
              </label>
              <input
                type="text"
                value={formData.hospitalName || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, hospitalName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="병원명을 입력하세요"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                상태
              </label>
              <input
                type="text"
                value={formData.status || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="상태를 입력하세요"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                입고자
              </label>
              <input
                type="text"
                value={formData.inbounder || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, inbounder: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="입고자명을 입력하세요"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                출고자
              </label>
              <input
                type="text"
                value={formData.outbounder || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, outbounder: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="출고자명을 입력하세요"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              내용 *
            </label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              required
            />
          </div>
          
          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              수정 완료
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              취소
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
