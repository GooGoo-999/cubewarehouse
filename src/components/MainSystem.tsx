'use client';

import { useState } from 'react';
import { User, NavigationSection } from '@/types';
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

interface MainSystemProps {
  currentUser: User;
  onLogout: () => void;
}

export default function MainSystem({ currentUser, onLogout }: MainSystemProps) {
  const [activeSection, setActiveSection] = useState<NavigationSection>('hospitals');

  const handleSectionChange = (section: NavigationSection) => {
    setActiveSection(section);
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'hospitals':
        return <HospitalManagement />;
      case 'hospital-list':
        return <HospitalList />;
      case 'warehouse':
        return <WarehouseManagement />;
      case 'coil':
        return <CoilManagement />;
      case 'inout-history':
        return <InOutHistory />;
      case 'parts':
        return <OutboundPartsManagement />;
      case 'history':
        return <ReplacementHistory />;
      case 'accounts':
        return <AccountManagement currentUser={currentUser} />;
      case 'hospital-detail':
        return <HospitalDetail />;
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
      />
      <main>
        {renderSection()}
      </main>
    </section>
  );
} 