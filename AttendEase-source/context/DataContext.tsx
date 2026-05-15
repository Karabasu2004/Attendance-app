import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

export interface Student {
  id: string;
  name: string;
  rollNumber: string;
  className: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string;
  status: "present" | "absent";
}

interface DataContextType {
  students: Student[];
  attendance: AttendanceRecord[];
  addStudent: (s: Omit<Student, "id">) => Promise<void>;
  updateStudent: (s: Student) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
  markAttendance: (studentId: string, date: string, status: "present" | "absent") => Promise<void>;
  getAttendanceForDate: (date: string) => AttendanceRecord[];
  getStudentAttendanceStats: (studentId: string) => { present: number; absent: number; total: number; percentage: number };
  getOverallStats: () => { present: number; absent: number; total: number; percentage: number };
}

const STUDENTS_KEY = "students_db";
const ATTENDANCE_KEY = "attendance_db";

const DataContext = createContext<DataContextType>({
  students: [],
  attendance: [],
  addStudent: async () => {},
  updateStudent: async () => {},
  deleteStudent: async () => {},
  markAttendance: async () => {},
  getAttendanceForDate: () => [],
  getStudentAttendanceStats: () => ({ present: 0, absent: 0, total: 0, percentage: 0 }),
  getOverallStats: () => ({ present: 0, absent: 0, total: 0, percentage: 0 }),
});

function genId() {
  return Date.now().toString() + Math.random().toString(36).substring(2, 9);
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const s = await AsyncStorage.getItem(STUDENTS_KEY);
      const a = await AsyncStorage.getItem(ATTENDANCE_KEY);
      if (s) setStudents(JSON.parse(s));
      if (a) setAttendance(JSON.parse(a));
    } catch {}
  }

  async function saveStudents(list: Student[]) {
    await AsyncStorage.setItem(STUDENTS_KEY, JSON.stringify(list));
    setStudents(list);
  }

  async function saveAttendance(list: AttendanceRecord[]) {
    await AsyncStorage.setItem(ATTENDANCE_KEY, JSON.stringify(list));
    setAttendance(list);
  }

  async function addStudent(s: Omit<Student, "id">) {
    const newStudent: Student = { ...s, id: genId() };
    await saveStudents([...students, newStudent]);
  }

  async function updateStudent(s: Student) {
    const updated = students.map((x) => (x.id === s.id ? s : x));
    await saveStudents(updated);
  }

  async function deleteStudent(id: string) {
    const filtered = students.filter((x) => x.id !== id);
    const filteredAttendance = attendance.filter((a) => a.studentId !== id);
    await saveStudents(filtered);
    await saveAttendance(filteredAttendance);
  }

  async function markAttendance(studentId: string, date: string, status: "present" | "absent") {
    const exists = attendance.find((a) => a.studentId === studentId && a.date === date);
    let updated: AttendanceRecord[];
    if (exists) {
      updated = attendance.map((a) =>
        a.studentId === studentId && a.date === date ? { ...a, status } : a
      );
    } else {
      updated = [...attendance, { id: genId(), studentId, date, status }];
    }
    await saveAttendance(updated);
  }

  const getAttendanceForDate = useCallback(
    (date: string) => attendance.filter((a) => a.date === date),
    [attendance]
  );

  const getStudentAttendanceStats = useCallback(
    (studentId: string) => {
      const records = attendance.filter((a) => a.studentId === studentId);
      const present = records.filter((a) => a.status === "present").length;
      const absent = records.filter((a) => a.status === "absent").length;
      const total = records.length;
      const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
      return { present, absent, total, percentage };
    },
    [attendance]
  );

  const getOverallStats = useCallback(() => {
    const present = attendance.filter((a) => a.status === "present").length;
    const absent = attendance.filter((a) => a.status === "absent").length;
    const total = attendance.length;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
    return { present, absent, total, percentage };
  }, [attendance]);

  return (
    <DataContext.Provider
      value={{
        students,
        attendance,
        addStudent,
        updateStudent,
        deleteStudent,
        markAttendance,
        getAttendanceForDate,
        getStudentAttendanceStats,
        getOverallStats,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  return useContext(DataContext);
}
