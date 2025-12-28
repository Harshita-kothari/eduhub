import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserDataStorage, UserData } from '@/lib/userDataStorage';

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  updateUserData: (section: keyof UserData, data: any) => void;
  getUserData: () => UserData | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USERS_STORAGE_KEY = 'focus-flow-users';
const CURRENT_USER_KEY = 'focus-flow-current-user';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const currentUserStr = localStorage.getItem(CURRENT_USER_KEY);
    if (currentUserStr) {
      try {
        const currentUser = JSON.parse(currentUserStr);
        setUser(currentUser);
        // Load user data
        const data = UserDataStorage.getUserData(currentUser.id);
        setUserData(data);
      } catch (error) {
        console.error('Error loading current user:', error);
        localStorage.removeItem(CURRENT_USER_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const signup = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      // Get existing users
      const usersStr = localStorage.getItem(USERS_STORAGE_KEY);
      const users = usersStr ? JSON.parse(usersStr) : {};

      // Check if email already exists
      if (users[email]) {
        return false;
      }

      // Create new user
      const newUser: User = {
        id: Date.now().toString(),
        email: email.toLowerCase().trim(),
        name: name.trim(),
        createdAt: new Date().toISOString(),
      };

      // Store user with password (in production, password should be hashed)
      users[email.toLowerCase().trim()] = {
        ...newUser,
        password, // In production, hash this password
      };

      // Save users
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

      // Initialize user data
      const initialUserData = UserDataStorage.initializeUserData(newUser.id);
      UserDataStorage.saveUserData(newUser.id, initialUserData);

      // Auto login
      setUser(newUser);
      setUserData(initialUserData);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));

      return true;
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const usersStr = localStorage.getItem(USERS_STORAGE_KEY);
      if (!usersStr) return false;

      const users = JSON.parse(usersStr);
      const userData = users[email.toLowerCase().trim()];

      if (!userData || userData.password !== password) {
        return false;
      }

      // Remove password from user object
      const { password: _, ...userWithoutPassword } = userData;
      const currentUser: User = userWithoutPassword;

      // Load user data
      const appUserData = UserDataStorage.getUserData(currentUser.id);

      setUser(currentUser);
      setUserData(appUserData);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));

      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setUserData(null);
    localStorage.removeItem(CURRENT_USER_KEY);
  };

  const updateUserData = (section: keyof UserData, data: any) => {
    if (!user) return;
    
    const updatedData = { ...userData };
    if (updatedData) {
      updatedData[section] = data;
      setUserData(updatedData);
      UserDataStorage.updateUserData(user.id, section, data);
    }
  };

  const getUserData = () => userData;

  // Show nothing while loading to prevent flash
  if (isLoading) {
    return null;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        userData,
        login,
        signup,
        logout,
        isAuthenticated: !!user,
        updateUserData,
        getUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
