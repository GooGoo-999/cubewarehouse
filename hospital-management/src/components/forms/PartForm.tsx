'use client';

import { useState, useEffect } from 'react';
import { Part } from '@/types';
import { getHospitals } from '@/lib/storage';

interface PartFormProps {
  part?: Part | null;
  onSubmit: (data: Omit<Part, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

export default function PartForm({ part, onSubmit, onCancel }: PartFormProps) {
  const [formData, setFormData] = useState({
    hospitalId: '',
    hospitalName: '',
    partName: '',
    partNumber: '',
    serialNumber: '',
    replacementDate: '',
    worker: '',
    errorContent: '',
  });
  const [hospitals, setHospitals] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    const hospitalData = getHospitals();
    setHospitals(hospitalData.map(h => ({ id: h.id, name: h.name })));
  }, []);

  useEffect(() => {
    if (part) {
      setFormData({
        hospitalId: part.hospitalId,
        hospitalName: part.hospitalName,
        partName: part.partName,
        partNumber: part.partNumber,
        serialNumber: part.serialNumber,
        replacementDate: part.replacementDate,
        worker: part.worker,
        errorContent: part.errorContent,
      });
    }
  }, [part]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleHospitalChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const hospitalId = e.target.value;
    const selectedHospital = hospitals.find(h => h.id === hospitalId);
    setFormData(prev => ({
      ...prev,
      hospitalId,
      hospitalName: selectedHospital?.name || '',
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          병원 선택 *
        </label>
        <select
          value={formData.hospitalId}
          onChange={handleHospitalChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">병원을 선택하세요</option>
          {hospitals.map((hospital) => (
            <option key={hospital.id} value={hospital.id}>
              {hospital.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          부품명 *
        </label>
        <input
          type="text"
          value={formData.partName}
          onChange={(e) => setFormData(prev => ({ ...prev, partName: e.target.value }))}
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
          value={formData.partNumber}
          onChange={(e) => setFormData(prev => ({ ...prev, partNumber: e.target.value }))}
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
          value={formData.serialNumber}
          onChange={(e) => setFormData(prev => ({ ...prev, serialNumber: e.target.value }))}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="시리얼번호를 입력하세요"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          교체날짜 *
        </label>
        <input
          type="date"
          value={formData.replacementDate}
          onChange={(e) => setFormData(prev => ({ ...prev, replacementDate: e.target.value }))}
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
          value={formData.worker}
          onChange={(e) => setFormData(prev => ({ ...prev, worker: e.target.value }))}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="작업자명을 입력하세요"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          에러내용 *
        </label>
        <textarea
          value={formData.errorContent}
          onChange={(e) => setFormData(prev => ({ ...prev, errorContent: e.target.value }))}
          required
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="에러 내용을 입력하세요"
        />
      </div>

      <div className="flex gap-2 pt-4">
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          {part ? '수정' : '추가'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
        >
          취소
        </button>
      </div>
    </form>
  );
}
