'use client';

import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

type Props = {
  children: ReactNode;
};
type Context = {
  userId: string | null;
  authenticate: () => void;
};

const AuthContext = createContext<Context | null>(null);

export const AuthContextProvider = ({ children }: Props) => {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    authenticate();
  }, []);

  const authenticate = () => {
    //   fetch('/api/auth/token?refresh=false').then((res) => {
    //     if (res.status === 200) {
    //       res.json().then((data) => {
    //         setUserId(data.userId);
    //       });
    //     } else {
    //       setUserId(null);
    //     }
    //   });
  };

  return <AuthContext.Provider value={{ userId: userId, authenticate }}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);

  if (!context) throw new Error('AuthContext must be called from within the AuthContextProvider');

  return context;
};
