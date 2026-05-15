import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import StudentModal from "@/components/StudentModal";
import { Student, useData } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";

export default function StudentsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { students, addStudent, updateStudent, deleteStudent, getStudentAttendanceStats } = useData();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  function handleAdd() {
    setEditingStudent(null);
    setModalVisible(true);
  }

  function handleEdit(student: Student) {
    setEditingStudent(student);
    setModalVisible(true);
  }

  function handleDelete(student: Student) {
    Alert.alert(
      "Delete Student",
      `Remove ${student.name} from the class? All their attendance records will also be deleted.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            await deleteStudent(student.id);
          },
        },
      ]
    );
  }

  async function handleSave(data: Omit<Student, "id">) {
    if (editingStudent) {
      await updateStudent({ ...editingStudent, ...data });
    } else {
      await addStudent(data);
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      backgroundColor: colors.primary,
      paddingTop: Platform.OS === "web" ? 16 : 8,
      paddingBottom: 20,
      paddingHorizontal: 20,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
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
    addBtn: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: "rgba(255,255,255,0.2)",
      alignItems: "center",
      justifyContent: "center",
    },
    list: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: botPad + 100 },
    card: {
      backgroundColor: colors.card,
      borderRadius: 14,
      padding: 16,
      marginBottom: 10,
      flexDirection: "row",
      alignItems: "center",
      shadowColor: "#000",
      shadowOpacity: 0.05,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
    },
    avatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.secondary,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 14,
    },
    avatarTxt: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.primary,
      fontFamily: "Inter_700Bold",
    },
    info: { flex: 1 },
    name: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.foreground,
      fontFamily: "Inter_600SemiBold",
    },
    meta: {
      fontSize: 13,
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
      marginTop: 2,
    },
    badge: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 8,
      marginRight: 10,
    },
    badgeTxt: { fontSize: 12, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
    actions: { flexDirection: "row", gap: 8 },
    actionBtn: {
      width: 34,
      height: 34,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
    },
    empty: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 80 },
    emptyIcon: { marginBottom: 16 },
    emptyTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.foreground,
      fontFamily: "Inter_600SemiBold",
      marginBottom: 6,
    },
    emptyDesc: {
      fontSize: 14,
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
      textAlign: "center",
      paddingHorizontal: 40,
    },
  });

  function renderItem({ item }: { item: Student }) {
    const stats = getStudentAttendanceStats(item.id);
    const pct = stats.percentage;
    const badgeColor = pct >= 75 ? colors.present : pct >= 50 ? colors.warning : colors.absent;
    const initials = item.name
      .split(" ")
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

    return (
      <View style={s.card}>
        <View style={s.avatar}>
          <Text style={s.avatarTxt}>{initials}</Text>
        </View>
        <View style={s.info}>
          <Text style={s.name}>{item.name}</Text>
          <Text style={s.meta}>Roll #{item.rollNumber} · {item.className}</Text>
        </View>
        {stats.total > 0 && (
          <View style={[s.badge, { backgroundColor: badgeColor + "22" }]}>
            <Text style={[s.badgeTxt, { color: badgeColor }]}>{pct}%</Text>
          </View>
        )}
        <View style={s.actions}>
          <TouchableOpacity
            style={[s.actionBtn, { backgroundColor: colors.secondary }]}
            onPress={() => handleEdit(item)}
          >
            <Feather name="edit-2" size={16} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.actionBtn, { backgroundColor: "#FDEDEC" }]}
            onPress={() => handleDelete(item)}
          >
            <Feather name="trash-2" size={16} color={colors.destructive} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <View style={s.header}>
        <View>
          <Text style={s.headerTitle}>Students</Text>
          <Text style={s.headerSub}>{students.length} enrolled</Text>
        </View>
        <TouchableOpacity style={s.addBtn} onPress={handleAdd} activeOpacity={0.8}>
          <Feather name="plus" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={students}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={s.list}
        scrollEnabled={!!students.length}
        ListEmptyComponent={
          <View style={s.empty}>
            <View style={s.emptyIcon}>
              <Feather name="users" size={48} color={colors.border} />
            </View>
            <Text style={s.emptyTitle}>No Students Yet</Text>
            <Text style={s.emptyDesc}>
              Tap the + button to add your first student to the class.
            </Text>
          </View>
        }
      />

      <StudentModal
        visible={modalVisible}
        student={editingStudent}
        onSave={handleSave}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
}
