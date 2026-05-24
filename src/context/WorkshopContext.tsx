import React, { createContext, useContext } from 'react';
import { WorkshopContextType } from '../types';

export const WorkshopContext = createContext<WorkshopContextType | null>(null);

export const useWorkshop = () => {
  const context = useContext(WorkshopContext);
  return context;
};
