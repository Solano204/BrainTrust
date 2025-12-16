// File: src/app/infraestructure/hooks/gradebook/use-gradebook-view.ts
"use client";

import { useState } from 'react';

export type GradebookView = 'units' | 'course';

export function useGradebookView() {
  const [currentView, setCurrentView] = useState<GradebookView>('units');
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);

  const switchView = (view: GradebookView) => {
    setCurrentView(view);
    setSelectedUnit(null);
  };

  const selectUnit = (unitId: string) => {
    setSelectedUnit(unitId);
    setCurrentView('units');
  };

  const backToUnits = () => {
    setSelectedUnit(null);
  };

  return {
    currentView,
    selectedUnit,
    switchView,
    selectUnit,
    backToUnits
  };
}