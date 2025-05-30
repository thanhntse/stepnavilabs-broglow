"use client";

import { User } from "@/data/types";
import { createContext, useContext, useState, ReactNode } from "react";

type UserContextType = {
  user: User | undefined;
  setUser: (user: User) => void;
  addUser: (user: User) => void;
  clearUser: () => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User>();

  const addUser = (user: User) => {
    setUser(user);
  };

  const clearUser = () => {
    setUser(undefined);
  };

  return (
    <UserContext.Provider value={{ user, setUser, addUser, clearUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserContext must be used within an UserProvider");
  }
  return context;
};
