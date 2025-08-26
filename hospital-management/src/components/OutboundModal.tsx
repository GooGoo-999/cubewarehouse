'use client';

import { useState } from 'react';

interface OutboundModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { hospital: string; outbounder: string; notes: string }) => void;
  itemName: string;
}

export default function OutboundModal({ isOpen, onClose, onConfirm, itemName }: OutboundModalProps) {
  console.log('OutboundModal 렌더링:', { isOpen, itemName });
  const [formData, setFormData] = useState({
    hospital: '',
    outbounder: '',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.hospital.trim() || !formData.outbounder.trim() || !formData.notes.trim()) {
      alert('모든 필드를 입력해주세요.');
      return;
    }
    onConfirm(formData);
    setFormData({ hospital: '', outbounder: '', notes: '' });
  };

  console.log('모달 isOpen 상태:', isOpen);
  if (!isOpen) {
    console.log('모달이 닫혀있음, null 반환');
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
      <div className="bg-white rounded-lg p-6 w-[500px] max-w-[90vw] max-h-[90vh] overflow-y-auto" style={{ backgroundColor: 'white', border: '3px solid red', boxShadow: '0 0 20px rgba(255,0,0,0.5)' }}>
        <h3 className="text-lg font-semibold mb-4">출고 정보 입력</h3>
        <p className="text-sm text-gray-600 mb-4">출고할 항목: {itemName}</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              병원명 *
            </label>
            <input
              type="text"
              value={formData.hospital}
              onChange={(e) => setFormData(prev => ({ ...prev, hospital: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="출고할 병원명을 입력하세요"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              출고자 *
            </label>
            <input
              type="text"
              value={formData.outbounder}
              onChange={(e) => setFormData(prev => ({ ...prev, outbounder: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="출고자명을 입력하세요"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              출고 내용 *
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="출고 내용을 입력하세요"
              rows={3}
              required
            />
          </div>
          
          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              출고 확인
            </button>
            <button
              type="button"
              onClick={() => {
                setFormData({ hospital: '', outbounder: '', notes: '' });
                onClose();
              }}
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
