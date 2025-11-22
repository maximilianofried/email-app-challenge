'use client';

import Sidebar from './Sidebar';
import { useFilter } from '../contexts/FilterContext';

export default function SidebarWrapper() {
  const { activeFilter, setActiveFilter } = useFilter();

  return <Sidebar activeFilter={activeFilter} onFilterChange={setActiveFilter} />;
}

