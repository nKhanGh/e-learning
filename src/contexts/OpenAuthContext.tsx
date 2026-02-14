"use client";
import {
  createContext,
  useState,
  Dispatch,
  SetStateAction,
  useContext,
  useMemo,
} from "react";

interface OpenAuthContextType {
  openSignUp: boolean;
  setOpenSignUp: Dispatch<SetStateAction<boolean>>;
  openLogin: boolean;
  setOpenLogin: Dispatch<SetStateAction<boolean>>;
}

const OpenAuthContext = createContext<OpenAuthContextType | boolean>(false);

export const OpenAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [openSignUp, setOpenSignUp] = useState<boolean>(false);
  const [openLogin, setOpenLogin] = useState<boolean>(false);

  const value = useMemo(
    () => ({ openSignUp, setOpenSignUp, openLogin, setOpenLogin }),
    [openSignUp, setOpenSignUp, openLogin, setOpenLogin],
  );

  return (
    <OpenAuthContext.Provider value={value}>
      {children}
    </OpenAuthContext.Provider>
  );
};

export const useOpenAuth = () => {
  const ctx = useContext(OpenAuthContext);
  if (!ctx) {
    throw new Error("useOpenAuth must be used within a SignupProvider");
  }
  return ctx as OpenAuthContextType;
};
