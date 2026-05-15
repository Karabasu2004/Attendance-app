import { Feather } from "@expo/vector-icons";
import React, { useMemo } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useData } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";

function PieChart({ present, absent }: { present: number; absent: number }) {
  const colors = useColors();
  const total = present + absent;
  if (total === 0) return null;

  const pct = Math.round((present / total) * 100);

  const s = StyleSheet.create({
    wrap: { alignItems: "center", justifyContent: "center", marginVertical: 20 },
    outerRing: {
      width: 160,
      height: 160,
      borderRadius: 80,
      backgroundColor: colors.absent + "33",
      alignItems: "center",
      justifyContent: "center",
    },
    innerRing: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: colors.card,
      alignItems: "center",
      justifyContent: "center",
    },
    pctTxt: {
      fontSize: 36,
      fontWeight: "700",
      color: pct >= 75 ? colors.present : pct >= 50 ? colors.warning : colors.absent,
      fontFamily: "Inter_700Bold",
    },
    pctLabel: {
      fontSize: 12,
      color: colors.mutedForeground,
      fontFamily: "Inter_500Medium",
    },
    legendRow: { flexDirection: "row", gap: 24, marginTop: 12 },
    legendItem: { flexDirection: "row", alignItems: "center", gap: 8 },
    legendDot: { width: 10, height: 10, borderRadius: 5 },
    legendTxt: { fontSize: 13, color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
    progressBar: {
      height: 12,
      borderRadius: 6,
      backgroundColor: colors.border,
      overflow: "hidden",
      marginTop: 12,
      width: 160,
    },
    progressFill: {
      height: 12,
      borderRadius: 6,
      width: `${pct}%`,
      backgroundColor: pct >= 75 ? colors.present : pct >= 50 ? colors.warning : colors.absent,
    },
  });

  return (
    <View style={s.wrap}>
      <View style={[s.outerRing, {
        borderWidth: 12,
        borderColor: colors.absent + "55",
        backgroundColor: "transparent",
        position: "relative",
      }]}>
        <View style={[s.outerRing, {
          position: "absolute",
          top: -12,
          left: -12,
          borderWidth: 12,
          borderColor: "transparent",
          borderTopColor: pct > 0 ? colors.present : "transparent",
          borderRightColor: pct > 25 ? colors.present : "transparent",
          borderBottomColor: pct > 50 ? colors.present : "transparent",
          borderLeftColor: pct > 75 ? colors.present : "transparent",
          backgroundColor: "transparent",
        }]} />
        <View style={s.innerRing}>
          <Text style={s.pctTxt}>{pct}%</Text>
          <Text style={s.pctLabel}>Attendance</Text>
        </View>
      </View>
      <View style={s.progressBar}>
        <View style={s.progressFill as any} />
      </View>
      <View style={s.legendRow}>
        <View style={s.legendItem}>
          <View style={[s.legendDot, { backgroundColor: colors.present }]} />
          <Text style={s.legendTxt}>Present: {present}</Text>
        </View>
        <View style={s.legendItem}>
          <View style={[s.legendDot, { backgroundColor: colors.absent }]} />
          <Text style={s.legendTxt}>Absent: {absent}</Text>
        </View>
      </View>
    </View>
  );
}

function BarRow({ label, value, max, pct, colors }: any) {
  const barPct = max > 0 ? (value / max) * 100 : 0;
  const barColor = pct >= 75 ? colors.present : pct >= 50 ? colors.warning : colors.absent;

  const s = StyleSheet.create({
    row: { marginBottom: 14 },
    top: { flexDirection: "row", justifyContent: "space-between", marginBottom: 5 },
    name: { fontSize: 14, fontWeight: "500", color: colors.foreground, fontFamily: "Inter_500Medium", flex: 1, marginRight: 8 },
    pctTxt: { fontSize: 13, fontWeight: "700", color: barColor, fontFamily: "Inter_700Bold" },
    track: { height: 8, borderRadius: 4, backgroundColor: colors.border, overflow: "hidden" },
    fill: { height: 8, borderRadius: 4, backgroundColor: barColor, width: `${barPct}%` },
  });

  return (
    <View style={s.row}>
      <View style={s.top}>
        <Text style={s.name} numberOfLines={1}>{label}</Text>
        <Text style={s.pctTxt}>{pct}%</Text>
      </View>
      <View style={s.track}>
        <View style={s.fill as any} />
      </View>
    </View>
  );
}

export default function ReportsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { students, attendance, getStudentAttendanceStats, getOverallStats } = useData();

  const overall = getOverallStats();
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const studentStats = useMemo(
    () =>
      students
        .map((s) => ({ ...s, stats: getStudentAttendanceStats(s.id) }))
        .sort((a, b) => b.stats.percentage - a.stats.percentage),
    [students, getStudentAttendanceStats]
  );

  const uniqueDates = useMemo(
    () => [...new Set(attendance.map((a) => a.date))].sort().reverse(),
    [attendance]
  );

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
    },
    headerSub: {
      fontSize: 13,
      color: "rgba(255,255,255,0.7)",
      fontFamily: "Inter_400Regular",
      marginTop: 2,
    },
    scroll: { paddingHorizontal: 16, paddingBottom: botPad + 100 },
    card: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 18,
      marginTop: 16,
      shadowColor: "#000",
      shadowOpacity: 0.05,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
    },
    cardTitle: {
      fontSize: 15,
      fontWeight: "700",
      color: colors.foreground,
      fontFamily: "Inter_700Bold",
      marginBottom: 4,
    },
    cardSub: {
      fontSize: 12,
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
      marginBottom: 8,
    },
    overallRow: { flexDirection: "row", gap: 10, marginTop: 12 },
    statBox: {
      flex: 1,
      borderRadius: 12,
      padding: 14,
      alignItems: "center",
    },
    statNum: {
      fontSize: 24,
      fontWeight: "700",
      fontFamily: "Inter_700Bold",
    },
    statLabel: {
      fontSize: 11,
      fontFamily: "Inter_500Medium",
      marginTop: 2,
    },
    dateRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    dateTxt: {
      fontSize: 13,
      color: colors.foreground,
      fontFamily: "Inter_400Regular",
    },
    dateStats: {
      flexDirection: "row",
      gap: 10,
    },
    datePill: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
    },
    datePillTxt: {
      fontSize: 12,
      fontWeight: "600",
      fontFamily: "Inter_600SemiBold",
    },
    empty: {
      alignItems: "center",
      paddingVertical: 40,
    },
    emptyTxt: {
      fontSize: 14,
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
      textAlign: "center",
    },
  });

  if (attendance.length === 0) {
    return (
      <View style={s.container}>
        <View style={s.header}>
          <Text style={s.headerTitle}>Reports</Text>
          <Text style={s.headerSub}>Attendance analytics</Text>
        </View>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Feather name="bar-chart-2" size={48} color={colors.border} style={{ marginBottom: 16 }} />
          <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground, fontFamily: "Inter_600SemiBold", marginBottom: 6 }}>No Data Yet</Text>
          <Text style={{ fontSize: 14, color: colors.mutedForeground, fontFamily: "Inter_400Regular", textAlign: "center", paddingHorizontal: 40 }}>
            Start taking attendance to see reports and analytics here.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Reports</Text>
        <Text style={s.headerSub}>{uniqueDates.length} days recorded</Text>
      </View>

      <ScrollView contentContainerStyle={s.scroll}>
        <View style={s.card}>
          <Text style={s.cardTitle}>Overall Attendance</Text>
          <Text style={s.cardSub}>{overall.total} total records across all students</Text>
          <PieChart present={overall.present} absent={overall.absent} />
          <View style={s.overallRow}>
            <View style={[s.statBox, { backgroundColor: "#E9F7EF" }]}>
              <Text style={[s.statNum, { color: colors.present }]}>{overall.present}</Text>
              <Text style={[s.statLabel, { color: colors.present }]}>Present</Text>
            </View>
            <View style={[s.statBox, { backgroundColor: "#FDEDEC" }]}>
              <Text style={[s.statNum, { color: colors.absent }]}>{overall.absent}</Text>
              <Text style={[s.statLabel, { color: colors.absent }]}>Absent</Text>
            </View>
            <View style={[s.statBox, { backgroundColor: colors.secondary }]}>
              <Text style={[s.statNum, { color: colors.primary }]}>{overall.percentage}%</Text>
              <Text style={[s.statLabel, { color: colors.primary }]}>Rate</Text>
            </View>
          </View>
        </View>

        {studentStats.length > 0 && (
          <View style={s.card}>
            <Text style={s.cardTitle}>Student-wise Attendance</Text>
            <Text style={s.cardSub}>Ranked by attendance percentage</Text>
            <View style={{ marginTop: 12 }}>
              {studentStats.map((st) => (
                <BarRow
                  key={st.id}
                  label={st.name}
                  value={st.stats.present}
                  max={st.stats.total}
                  pct={st.stats.percentage}
                  colors={colors}
                />
              ))}
            </View>
          </View>
        )}

        {uniqueDates.length > 0 && (
          <View style={s.card}>
            <Text style={s.cardTitle}>Day-wise Summary</Text>
            <Text style={s.cardSub}>Recent attendance records</Text>
            <View style={{ marginTop: 8 }}>
              {uniqueDates.slice(0, 10).map((date) => {
                const recs = attendance.filter((a) => a.date === date);
                const p = recs.filter((a) => a.status === "present").length;
                const ab = recs.filter((a) => a.status === "absent").length;
                const d = new Date(date + "T00:00:00");
                const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric", weekday: "short" });
                return (
                  <View key={date} style={s.dateRow}>
                    <Text style={s.dateTxt}>{label}</Text>
                    <View style={s.dateStats}>
                      <View style={[s.datePill, { backgroundColor: "#E9F7EF" }]}>
                        <Text style={[s.datePillTxt, { color: colors.present }]}>{p}P</Text>
                      </View>
                      <View style={[s.datePill, { backgroundColor: "#FDEDEC" }]}>
                        <Text style={[s.datePillTxt, { color: colors.absent }]}>{ab}A</Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
