'use client';

import { useState, useEffect } from 'react';
import { Hospital } from '@/types';
import { getHospitals, searchData } from '@/lib/storage';

export default function HospitalList() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const data = getHospitals();
    setHospitals(data);
  }, []);

  const filteredHospitals = searchData(
    hospitals, 
    searchTerm, 
    ['name', 'systemId', 'equipment', 'modality', 'softwareVersion']
  );

  return (
    <section>
      <h2>📋 병원목록</h2>
      <div className="list-container">
        <h3 className="hospital-list-title">등록된 병원 목록</h3>
        <div className="search-container">
          <input
            type="text"
            placeholder="병원명, System ID, 장비명, Modality, Software Version으로 검색..."
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
                </tr>
              </thead>
              <tbody>
                {filteredHospitals.map((hospital) => (
                  <tr key={hospital.id}>
                    <td>{hospital.name}</td>
                    <td>{hospital.modality}</td>
                    <td>{hospital.systemId}</td>
                    <td>{hospital.equipment || '-'}</td>
                    <td>{hospital.softwareVersion || '-'}</td>
                    <td>{hospital.address || '-'}</td>
                    <td>{hospital.phone || '-'}</td>
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