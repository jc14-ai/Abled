'use client';

import { useState, useEffect } from 'react';

export type Role = 'admin' | 'beneficiary' | null;

export function useRole() {
  const [role, setRole] = useState<Role>(null);

  useEffect(() => {
    const savedRole = localStorage.getItem('abled_role') as Role;
    if (savedRole) {
      setRole(savedRole);
    }
  }, []);

  const selectRole = (newRole: Role) => {
    setRole(newRole);
    if (newRole) {
      localStorage.setItem('abled_role', newRole);
    } else {
      localStorage.removeItem('abled_role');
    }
  };

  return { role, selectRole };
}
