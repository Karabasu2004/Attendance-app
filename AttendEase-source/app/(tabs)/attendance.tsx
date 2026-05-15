import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useData } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";

function formatDate(d: Date) {
  return d.toISOString().split("T")[0];
}

function displayDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}

export default function AttendanceScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { students, markAttendance, getAttendanceForDate } = useData();
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));

  const todayRecords = useMemo(() => getAttendanceForDate(selectedDate), [selectedDate, getAttendanceForDate]);

  function getStatus(studentId: string): "present" | "absent" | null {
    const rec = todayRecords.find((r) => r.studentId === studentId);
    return rec ? rec.status : null;
  }

  async function toggle(studentId: string, status: "present" | "absent") {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await markAttendance(studentId, selectedDate, status);
  }

  function changeDate(offset: number) {
    const d = new Date(selectedDate + "T00:00:00");
    d.setDate(d.getDate() + offset);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (d <= today) {
      setSelectedDate(formatDate(d));
    }
  }

  const presentCount = todayRecords.filter((r) => r.status === "present").length;
  const absentCount = todayRecords.filter((r) => r.status === "absent").length;
  const markedCount = todayRecords.length;

  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      backgroundColor: colors.primary,
      paddingTop: Platform.OS === "web" ? 16 : 8,
      paddingBottom: 20,
      paddingHorizontal: 20,
    },
    headerTitle: {
      fontSize: 22,
      fontWeight: "700",
      color: "#FFFFFF",
      fontFamily: "Inter_700Bold",
      marginBottom: 16,
    },
    dateRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    dateNav: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: "rgba(255,255,255,0.2)",
      alignItems: "center",
      justifyContent: "center",
    },
    dateText: {
      fontSize: 13,
      color: "#FFFFFF",
      fontFamily: "Inter_500Medium",
      textAlign: "center",
      flex: 1,
    },
    statsRow: {
      flexDirection: "row",
      paddingHorizontal: 16,
      paddingTop: 16,
      gap: 10,
    },
    statCard: {
      flex: 1,
      borderRadius: 12,
      padding: 12,
      alignItems: "center",
    },
    statNum: {
      fontSize: 26,
      fontWeight: "700",
      fontFamily: "Inter_700Bold",
    },
    statLabel: {
      fontSize: 11,
      fontFamily: "Inter_500Medium",
      marginTop: 2,
    },
    list: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: botPad + 100 },
    card: {
      backgroundColor: colors.card,
      borderRadius: 14,
      padding: 14,
      marginBottom: 8,
      flexDirection: "row",
      alignItems: "center",
      shadowColor: "#000",
      shadowOpacity: 0.04,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
    },
    avatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.secondary,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },
    avatarTxt: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.primary,
      fontFamily: "Inter_700Bold",
    },
    studentInfo: { flex: 1 },
    studentName: {
      fontSize: 15,
      fontWeight: "600",
      color: colors.foreground,
      fontFamily: "Inter_600SemiBold",
    },
    studentMeta: {
      fontSize: 12,
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
      marginTop: 1,
    },
    toggleRow: { flexDirection: "row", gap: 8 },
    toggleBtn: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 10,
      gap: 5,
      borderWidth: 1.5,
    },
    toggleTxt: {
      fontSize: 13,
      fontWeight: "600",
      fontFamily: "Inter_600SemiBold",
    },
    empty: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 60 },
    emptyTxt: {
      fontSize: 15,
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
      textAlign: "center",
      paddingHorizontal: 40,
    },
    sectionHeader: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.mutedForeground,
      fontFamily: "Inter_600SemiBold",
      textTransform: "uppercase",
      letterSpacing: 0.5,
      marginBottom: 8,
      marginTop: 4,
    },
  });

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Take Attendance</Text>
        <View style={s.dateRow}>
          <TouchableOpacity style={s.dateNav} onPress={() => changeDate(-1)}>
            <Feather name="chevron-left" size={18} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={s.dateText}>{displayDate(selectedDate)}</Text>
          <TouchableOpacity style={s.dateNav} onPress={() => changeDate(1)}>
            <Feather name="chevron-right" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={s.statsRow}>
        <View style={[s.statCard, { backgroundColor: "#E9F7EF" }]}>
          <Text style={[s.statNum, { color: colors.present }]}>{presentCount}</Text>
          <Text style={[s.statLabel, { color: colors.present }]}>Present</Text>
        </View>
        <View style={[s.statCard, { backgroundColor: "#FDEDEC" }]}>
          <Text style={[s.statNum, { color: colors.absent }]}>{absentCount}</Text>
          <Text style={[s.statLabel, { color: colors.absent }]}>Absent</Text>
        </View>
        <View style={[s.statCard, { backgroundColor: colors.muted }]}>
          <Text style={[s.statNum, { color: colors.foreground }]}>
            {students.length - markedCount}
          </Text>
          <Text style={[s.statLabel, { color: colors.mutedForeground }]}>Unmarked</Text>
        </View>
      </View>

      <FlatList
        data={students}
        keyExtractor={(item) => item.id}
        contentContainerStyle={s.list}
        scrollEnabled={!!students.length}
        ListHeaderComponent={
          students.length > 0 ? <Text style={s.sectionHeader}>{students.length} Students</Text> : null
        }
        renderItem={({ item }) => {
          const status = getStatus(item.id);
          const initials = item.name
            .split(" ")
            .map((w) => w[0])
            .slice(0, 2)
            .join("")
            .toUpperCase();

          return (
            <View style={s.card}>
              <View style={[s.avatar, status === "present" ? { backgroundColor: "#E9F7EF" } : status === "absent" ? { backgroundColor: "#FDEDEC" } : {}]}>
                <Text style={[s.avatarTxt, status === "present" ? { color: colors.present } : status === "absent" ? { color: colors.absent } : {}]}>
                  {initials}
                </Text>
              </View>
              <View style={s.studentInfo}>
                <Text style={s.studentName}>{item.name}</Text>
                <Text style={s.studentMeta}>Roll #{item.rollNumber} · {item.className}</Text>
              </View>
              <View style={s.toggleRow}>
                <TouchableOpacity
                  style={[
                    s.toggleBtn,
                    {
                      backgroundColor: status === "present" ? colors.present : "transparent",
                      borderColor: status === "present" ? colors.present : colors.border,
                    },
                  ]}
                  onPress={() => toggle(item.id, "present")}
                  activeOpacity={0.8}
                >
                  <Feather
                    name="check"
                    size={14}
                    color={status === "present" ? "#FFFFFF" : colors.present}
                  />
                  <Text
                    style={[
                      s.toggleTxt,
                      { color: status === "present" ? "#FFFFFF" : colors.present },
                    ]}
                  >
                    P
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    s.toggleBtn,
                    {
                      backgroundColor: status === "absent" ? colors.absent : "transparent",
                      borderColor: status === "absent" ? colors.absent : colors.border,
                    },
                  ]}
                  onPress={() => toggle(item.id, "absent")}
                  activeOpacity={0.8}
                >
                  <Feather
                    name="x"
                    size={14}
                    color={status === "absent" ? "#FFFFFF" : colors.absent}
                  />
                  <Text
                    style={[
                      s.toggleTxt,
                      { color: status === "absent" ? "#FFFFFF" : colors.absent },
                    ]}
                  >
                    A
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={s.empty}>
            <Feather name="clipboard" size={48} color={colors.border} style={{ marginBottom: 16 }} />
            <Text style={s.emptyTxt}>
              No students enrolled yet. Add students from the Students tab to start taking attendance.
            </Text>
          </View>
        }
      />
    </View>
  );
}
