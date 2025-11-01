import React, { createContext, useContext, useState } from 'react';

interface Contact {
  name: string;
  relationship: string;
  phone: string;
  useMyPhone?: boolean;
}

interface EmergencyContactContextType {
  tempContacts: Contact[];
  setTempContacts: (contacts: Contact[]) => void;
  clearTempContacts: () => void;
}

const EmergencyContactContext = createContext<EmergencyContactContextType | undefined>(undefined);

export function EmergencyContactProvider({ children }: { children: React.ReactNode }) {
  const [tempContacts, setTempContacts] = useState<Contact[]>([]);

  const clearTempContacts = () => {
    setTempContacts([]);
  };

  return (
    <EmergencyContactContext.Provider value={{ tempContacts, setTempContacts, clearTempContacts }}>
      {children}
    </EmergencyContactContext.Provider>
  );
}

export function useEmergencyContact() {
  const context = useContext(EmergencyContactContext);
  if (!context) {
    throw new Error('useEmergencyContact must be used within EmergencyContactProvider');
  }
  return context;
}

