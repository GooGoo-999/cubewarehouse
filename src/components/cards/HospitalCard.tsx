'use client';

import { Hospital } from '@/types';
import { formatDate } from '@/lib/storage';

interface HospitalCardProps {
  hospital: Hospital;
  onEdit: (hospital: Hospital) => void;
  onDelete: (hospitalId: string) => void;
}

export default function HospitalCard({ hospital, onEdit, onDelete }: HospitalCardProps) {
  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">{hospital.name}</h3>
        <div className="card-actions">
          <button
            className="btn-edit"
            onClick={() => onEdit(hospital)}
          >
            수정
          </button>
          <button
            className="btn-delete"
            onClick={() => onDelete(hospital.id)}
          >
            삭제
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <strong>Modality:</strong> {hospital.modality}
        </div>
        <div>
          <strong>System ID:</strong> {hospital.systemId}
        </div>
        <div>
          <strong>장비명:</strong> {hospital.equipment || '-'}
        </div>
        <div>
          <strong>Software Version:</strong> {hospital.softwareVersion || '-'}
        </div>
        <div>
          <strong>주소:</strong> {hospital.address || '-'}
        </div>
        <div>
          <strong>연락처:</strong> {hospital.phone || '-'}
        </div>
      </div>
      
      <div className="mt-4 text-sm text-gray-500">
        <div>등록일: {formatDate(hospital.createdAt)}</div>
        <div>수정일: {formatDate(hospital.updatedAt)}</div>
      </div>
    </div>
  );
} 