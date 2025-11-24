'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { FilterType } from '@/lib/types/email.types';

interface EmailCounts {
  unread: number;
  important: number;
}

interface FilterContextType {
  activeFilter: FilterType;
  setActiveFilter: (filter: FilterType) => void;
  emailCounts: EmailCounts;
  setEmailCounts: (counts: EmailCounts) => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export function FilterProvider({ children }: { children: ReactNode }) {
  const [activeFilter, setActiveFilter] = useState<FilterType>(FilterType.INBOX);
  const [emailCounts, setEmailCounts] = useState<EmailCounts>({ unread: 0, important: 0 });

  return (
    <FilterContext.Provider value={{ activeFilter, setActiveFilter, emailCounts, setEmailCounts }}>
      {children}
    </FilterContext.Provider>
  );
}

export function useFilter() {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error('useFilter must be used within a FilterProvider');
  }
  return context;
}
