import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

interface Teacher {
  id: string;
  username: string;
  name: string;
}

interface AuthContextType {
  teacher: Teacher | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const TEACHERS_KEY = "teachers_db";
const SESSION_KEY = "session_teacher";

const DEFAULT_TEACHER = {
  id: "t1",
  username: "teacher",
  password: "admin123",
  name: "Admin Teacher",
};

const AuthContext = createContext<AuthContextType>({
  teacher: null,
  isLoading: true,
  login: async () => false,
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeAndRestore();
  }, []);

  async function initializeAndRestore() {
    try {
      const existing = await AsyncStorage.getItem(TEACHERS_KEY);
      if (!existing) {
        await AsyncStorage.setItem(TEACHERS_KEY, JSON.stringify([DEFAULT_TEACHER]));
      }
      const session = await AsyncStorage.getItem(SESSION_KEY);
      if (session) {
        setTeacher(JSON.parse(session));
      }
    } catch (e) {
    } finally {
      setIsLoading(false);
    }
  }

  async function login(username: string, password: string): Promise<boolean> {
    try {
      const raw = await AsyncStorage.getItem(TEACHERS_KEY);
      const teachers = raw ? JSON.parse(raw) : [DEFAULT_TEACHER];
      const match = teachers.find(
        (t: any) =>
          t.username.toLowerCase() === username.toLowerCase() &&
          t.password === password
      );
      if (match) {
        const session: Teacher = { id: match.id, username: match.username, name: match.name };
        await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
        setTeacher(session);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  async function logout() {
    await AsyncStorage.removeItem(SESSION_KEY);
    setTeacher(null);
  }

  return (
    <AuthContext.Provider value={{ teacher, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
