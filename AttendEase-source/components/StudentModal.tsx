import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Student } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";

interface Props {
  visible: boolean;
  student?: Student | null;
  onSave: (data: Omit<Student, "id">) => void;
  onClose: () => void;
}

export default function StudentModal({ visible, student, onSave, onClose }: Props) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [className, setClassName] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (student) {
      setName(student.name);
      setRollNumber(student.rollNumber);
      setClassName(student.className);
    } else {
      setName("");
      setRollNumber("");
      setClassName("");
    }
    setErrors({});
  }, [student, visible]);

  function validate() {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Name is required";
    if (!rollNumber.trim()) e.rollNumber = "Roll number is required";
    if (!className.trim()) e.className = "Class is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSave() {
    if (!validate()) return;
    onSave({ name: name.trim(), rollNumber: rollNumber.trim(), className: className.trim() });
    onClose();
  }

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "flex-end",
    },
    container: {
      backgroundColor: colors.card,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: 24,
      paddingBottom: Math.max(insets.bottom, 24),
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 24,
    },
    title: {
      fontSize: 20,
      fontWeight: "700",
      color: colors.foreground,
      fontFamily: "Inter_700Bold",
    },
    closeBtn: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.muted,
      alignItems: "center",
      justifyContent: "center",
    },
    closeTxt: {
      fontSize: 16,
      color: colors.mutedForeground,
      fontFamily: "Inter_600SemiBold",
    },
    label: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.mutedForeground,
      marginBottom: 6,
      fontFamily: "Inter_600SemiBold",
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    input: {
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 16,
      color: colors.foreground,
      backgroundColor: colors.background,
      marginBottom: 4,
      fontFamily: "Inter_400Regular",
    },
    inputError: {
      borderColor: colors.destructive,
    },
    errorText: {
      fontSize: 12,
      color: colors.destructive,
      marginBottom: 12,
      fontFamily: "Inter_400Regular",
    },
    fieldWrap: {
      marginBottom: 12,
    },
    saveBtn: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: "center",
      marginTop: 8,
    },
    saveTxt: {
      color: colors.primaryForeground,
      fontSize: 16,
      fontWeight: "700",
      fontFamily: "Inter_700Bold",
    },
  });

  return (
    <Modal visible={visible} transparent animationType="slide">
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>{student ? "Edit Student" : "Add Student"}</Text>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeTxt}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.fieldWrap}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={[styles.input, errors.name && styles.inputError]}
              value={name}
              onChangeText={setName}
              placeholder="e.g. John Smith"
              placeholderTextColor={colors.mutedForeground}
            />
            {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
          </View>

          <View style={styles.fieldWrap}>
            <Text style={styles.label}>Roll Number</Text>
            <TextInput
              style={[styles.input, errors.rollNumber && styles.inputError]}
              value={rollNumber}
              onChangeText={setRollNumber}
              placeholder="e.g. 001"
              placeholderTextColor={colors.mutedForeground}
            />
            {errors.rollNumber ? <Text style={styles.errorText}>{errors.rollNumber}</Text> : null}
          </View>

          <View style={styles.fieldWrap}>
            <Text style={styles.label}>Class / Section</Text>
            <TextInput
              style={[styles.input, errors.className && styles.inputError]}
              value={className}
              onChangeText={setClassName}
              placeholder="e.g. Grade 10-A"
              placeholderTextColor={colors.mutedForeground}
            />
            {errors.className ? <Text style={styles.errorText}>{errors.className}</Text> : null}
          </View>

          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.85}>
            <Text style={styles.saveTxt}>{student ? "Save Changes" : "Add Student"}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
