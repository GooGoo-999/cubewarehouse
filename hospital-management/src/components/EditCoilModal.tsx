'use client';

import { useState, useEffect } from 'react';
import { CoilItem } from '@/types';

interface EditCoilModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (updatedItem: CoilItem) => void;
  item: CoilItem | null;
}

export default function EditCoilModal({ isOpen, onClose, onConfirm, item }: EditCoilModalProps) {
  console.log('EditCoilModal 렌더링:', { isOpen, item });
  const [formData, setFormData] = useState<Partial<CoilItem>>({});

  useEffect(() => {
    if (item) {
      setFormData({
        coilName: item.coilName,
        coilNumber: item.coilNumber,
        serialNumber: item.serialNumber,
        location: item.location,
        inboundDate: item.inboundDate,
        status: item.status,
        description: item.description,
        author: item.author,
      });
    }
  }, [item]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;

    const updatedItem: CoilItem = {
      ...item,
      coilName: formData.coilName || item.coilName,
      coilNumber: formData.coilNumber || item.coilNumber,
      serialNumber: formData.serialNumber || item.serialNumber,
      location: formData.location || item.location,
      inboundDate: formData.inboundDate || item.inboundDate,
      status: formData.status || item.status,
      description: formData.description || item.description,
      author: formData.author || item.author,
      updatedAt: new Date().toISOString(),
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
        <h3 className="text-lg font-semibold mb-4">코일 재고 수정</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                코일명 *
              </label>
              <input
                type="text"
                value={formData.coilName || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, coilName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                코일번호 *
              </label>
              <input
                type="text"
                value={formData.coilNumber || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, coilNumber: e.target.value }))}
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
                입고날짜 *
              </label>
              <input
                type="date"
                value={formData.inboundDate || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, inboundDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                상태 *
              </label>
              <select
                value={formData.status || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'Good' | 'Bad' }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="Good">Good</option>
                <option value="Bad">Bad</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                입고자 *
              </label>
              <input
                type="text"
                value={formData.author || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              입고내용 *
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
