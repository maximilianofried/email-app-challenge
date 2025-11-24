'use client';

import Sidebar from './Sidebar';
import { useFilter } from '../contexts/FilterContext';

export default function SidebarWrapper() {
  const { activeFilter, setActiveFilter, emailCounts } = useFilter();

  return (
    <Sidebar
      activeFilter={activeFilter}
      onFilterChange={setActiveFilter}
      unreadCount={emailCounts.unread}
      importantCount={emailCounts.important}
    />
  );
}

