"use client";

import { createContext, useContext, type ReactNode } from "react";

type LiniqoSlideValue = {
  /** Bumps when the active slide changes — Live figures remount immediately. */
  remountKey: string | number;
};

const LiniqoSlideContext = createContext<LiniqoSlideValue>({ remountKey: 0 });

export function LiniqoSlideProvider({
  remountKey,
  children,
}: LiniqoSlideValue & { children: ReactNode }) {
  return (
    <LiniqoSlideContext.Provider value={{ remountKey }}>
      {children}
    </LiniqoSlideContext.Provider>
  );
}

export function useLiniqoSlide() {
  return useContext(LiniqoSlideContext);
}
