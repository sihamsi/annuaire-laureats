import React, { createContext, useContext, useState, ReactNode } from "react";

interface Filters {
  filiere?: string;
  promotion?: string;
  secteur?: string;
  genre?: string;
  organisme?: string;
  province?: string;
  search?: string;
}

interface FiltersContextType {
  filters: Filters;
  setFilters: (filters: Filters) => void;
  resetFilters: () => void;
}

const FiltersContext = createContext<FiltersContextType | undefined>(undefined);

export function FiltersProvider({ children }: { children: ReactNode }) {
  const [filters, setFiltersState] = useState<Filters>({});

  const setFilters = (newFilters: Filters) => {
    setFiltersState(newFilters);
  };

  const resetFilters = () => {
    setFiltersState({});
  };

  return (
    <FiltersContext.Provider value={{ filters, setFilters, resetFilters }}>
      {children}
    </FiltersContext.Provider>
  );
}

export function useFilters() {
  const context = useContext(FiltersContext);
  if (context === undefined) {
    throw new Error("useFilters must be used within a FiltersProvider");
  }
  return context;
}
