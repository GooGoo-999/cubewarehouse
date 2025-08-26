'use client';

import { useState } from 'react';
import { User, NavigationSection } from '@/types';
import { isAdmin } from '@/lib/storage';
import Header from './Header';
import Navigation from './Navigation';
import HospitalManagement from './sections/HospitalManagement';
import HospitalList from './sections/HospitalList';
import WarehouseManagement from './sections/WarehouseManagement';
import CoilManagement from './sections/CoilManagement';
import InOutHistory from './sections/InOutHistory';
import OutboundPartsManagement from './sections/OutboundPartsManagement';
import ReplacementHistory from './sections/ReplacementHistory';
import AccountManagement from './sections/AccountManagement';
import HospitalDetail from './sections/HospitalDetail';
import DataMigration from './sections/DataMigration';

interface MainSystemProps {
  currentUser: User;
  onLogout: () => void;
}

export default function MainSystem({ currentUser, onLogout }: MainSystemProps) {
  const [activeSection, setActiveSection] = useState<NavigationSection>('hospitals');
  const [selectedHospitalId, setSelectedHospitalId] = useState<string | null>(null);

  const handleSectionChange = (section: NavigationSection) => {
    setActiveSection(section);
    setSelectedHospitalId(null); // 섹션 변경 시 선택된 병원 초기화
  };

  const handleHospitalSelect = (hospitalId: string) => {
    setSelectedHospitalId(hospitalId);
    setActiveSection('hospital-detail');
  };

  const handleBackToList = () => {
    setSelectedHospitalId(null);
    setActiveSection('hospital-list');
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'hospitals':
        return <HospitalManagement />;
      case 'hospital-list':
        return <HospitalList onHospitalSelect={handleHospitalSelect} />;
      case 'hospital-detail':
        return <HospitalDetail hospitalId={selectedHospitalId} onBackToList={handleBackToList} />;
      case 'warehouse':
        return <WarehouseManagement currentUser={currentUser} />;
      case 'coil':
        return <CoilManagement />;
      case 'inout-history':
        return <InOutHistory currentUser={currentUser} />;
      case 'parts':
        return <OutboundPartsManagement />;
      case 'history':
        return <ReplacementHistory />;
      case 'accounts':
        return <AccountManagement currentUser={currentUser} />;
              case 'data-migration':
          return isAdmin(currentUser) ? <DataMigration /> : <div className="p-6 text-center text-gray-500">관리자만 접근할 수 있습니다.</div>;
      default:
        return <HospitalManagement />;
    }
  };

  return (
    <section>
      <Header currentUser={currentUser} onLogout={onLogout} />
      <Navigation 
        activeSection={activeSection} 
        onSectionChange={handleSectionChange} 
        currentUser={currentUser}
      />
      <main>
        {renderSection()}
      </main>
    </section>
  );
}

