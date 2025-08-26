'use client';

import { useState, useEffect } from 'react';
import { Hospital } from '@/types';

interface HospitalFormProps {
  hospital?: Hospital | null;
  onSubmit: (data: Omit<Hospital, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

export default function HospitalForm({ hospital, onSubmit, onCancel }: HospitalFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    modality: '',
    systemId: '',
    equipment: '',
    softwareVersion: '',
    address: '',
    phone: '',
  });

  useEffect(() => {
    if (hospital) {
      setFormData({
        name: hospital.name,
        modality: hospital.modality,
        systemId: hospital.systemId,
        equipment: hospital.equipment,
        softwareVersion: hospital.softwareVersion,
        address: hospital.address,
        phone: hospital.phone,
      });
    }
  }, [hospital]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 필수 필드 검증
    if (!formData.name.trim() || !formData.modality.trim() || !formData.systemId.trim()) {
      alert('병원명, Modality, System ID는 필수 입력 항목입니다.');
      return;
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            병원명 *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="병원명"
            required
            className="w-full"
          />
        </div>

        <div>
          <label htmlFor="modality" className="block text-sm font-medium text-gray-700 mb-1">
            Modality *
          </label>
          <input
            type="text"
            id="modality"
            name="modality"
            value={formData.modality}
            onChange={handleChange}
            placeholder="Modality"
            required
            className="w-full"
          />
        </div>

        <div>
          <label htmlFor="systemId" className="block text-sm font-medium text-gray-700 mb-1">
            System ID *
          </label>
          <input
            type="text"
            id="systemId"
            name="systemId"
            value={formData.systemId}
            onChange={handleChange}
            placeholder="System ID"
            required
            className="w-full"
          />
        </div>

        <div>
          <label htmlFor="equipment" className="block text-sm font-medium text-gray-700 mb-1">
            장비명
          </label>
          <input
            type="text"
            id="equipment"
            name="equipment"
            value={formData.equipment}
            onChange={handleChange}
            placeholder="장비명"
            className="w-full"
          />
        </div>

        <div>
          <label htmlFor="softwareVersion" className="block text-sm font-medium text-gray-700 mb-1">
            Software Version
          </label>
          <input
            type="text"
            id="softwareVersion"
            name="softwareVersion"
            value={formData.softwareVersion}
            onChange={handleChange}
            placeholder="Software Version"
            className="w-full"
          />
        </div>

        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
            주소
          </label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="주소"
            className="w-full"
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            연락처
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="연락처"
            className="w-full"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-500 hover:bg-gray-600"
        >
          취소
        </button>
        <button type="submit">
          {hospital ? '수정' : '추가'}
        </button>
      </div>
    </form>
  );
}
