"use client";

import React, { createContext, PropsWithChildren, useContext } from "react";

export type DelegationsActions = {
  onDeposit?: () => void;
  onDelegate?: (validator?: string) => void;
  onUndelegate?: (validator: string) => void;
  onUnclaimUnstaked?: (validator: string) => void;
};

const DelegationsActionsContext = createContext<DelegationsActions>({});

export function DelegationsActionsProvider({ value, children }: PropsWithChildren<{ value: DelegationsActions }>) {
  return (
    <DelegationsActionsContext.Provider value={value}>{children}</DelegationsActionsContext.Provider>
  );
}

export function useDelegationsActions(): DelegationsActions {
  return useContext(DelegationsActionsContext);
}

