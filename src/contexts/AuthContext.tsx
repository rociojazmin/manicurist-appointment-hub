
import { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';

// Create the auth context with the return value of useAuth
const AuthContext = createContext<ReturnType<typeof useAuth> | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

// Export this function to access the auth context
export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
