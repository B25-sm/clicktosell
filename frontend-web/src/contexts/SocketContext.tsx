'use client';

import React, { createContext, useContext } from 'react';

type SocketContextValue = {
  unreadCount: number;
};

const SocketContext = createContext<SocketContextValue>({ unreadCount: 0 });

export function SocketProvider({ children }: { children: React.ReactNode }) {
  return <SocketContext.Provider value={{ unreadCount: 0 }}>{children}</SocketContext.Provider>;
}

export function useSocket() {
  return useContext(SocketContext);
}


