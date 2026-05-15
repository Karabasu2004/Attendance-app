import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin() {
    if (!username.trim() || !password.trim()) {
      setError("Please enter username and password.");
      return;
    }
    setLoading(true);
    setError("");
    const success = await login(username.trim(), password);
    setLoading(false);
    if (success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/(tabs)/attendance");
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError("Invalid username or password.");
    }
  }

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const s = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.primary,
      paddingTop: topPad + 24,
      paddingBottom: botPad + 24,
      paddingHorizontal: 28,
    },
    hero: {
      flex: 1,
      justifyContent: "center",
    },
    iconWrap: {
      width: 80,
      height: 80,
      borderRadius: 20,
      backgroundColor: "rgba(255,255,255,0.15)",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 24,
    },
    appName: {
      fontSize: 32,
      fontWeight: "700",
      color: "#FFFFFF",
      fontFamily: "Inter_700Bold",
      marginBottom: 6,
    },
    tagline: {
      fontSize: 15,
      color: "rgba(255,255,255,0.7)",
      fontFamily: "Inter_400Regular",
      marginBottom: 40,
    },
    card: {
      backgroundColor: "#FFFFFF",
      borderRadius: 20,
      padding: 24,
      shadowColor: "#000",
      shadowOpacity: 0.15,
      shadowRadius: 20,
      shadowOffset: { width: 0, height: 8 },
      elevation: 10,
    },
    label: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.mutedForeground,
      fontFamily: "Inter_600SemiBold",
      textTransform: "uppercase",
      letterSpacing: 0.5,
      marginBottom: 8,
    },
    inputRow: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: 10,
      paddingHorizontal: 14,
      marginBottom: 16,
      backgroundColor: colors.background,
    },
    input: {
      flex: 1,
      paddingVertical: 13,
      fontSize: 16,
      color: colors.foreground,
      fontFamily: "Inter_400Regular",
    },
    error: {
      color: colors.destructive,
      fontSize: 13,
      fontFamily: "Inter_400Regular",
      marginBottom: 12,
      textAlign: "center",
    },
    loginBtn: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "center",
      gap: 8,
    },
    loginTxt: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "700",
      fontFamily: "Inter_700Bold",
    },
    hint: {
      marginTop: 16,
      alignItems: "center",
    },
    hintTxt: {
      fontSize: 12,
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
    },
    hintBold: {
      fontFamily: "Inter_600SemiBold",
      color: colors.primary,
    },
  });

  return (
    <View style={s.container}>
      <View style={s.hero}>
        <View style={s.iconWrap}>
          <Feather name="check-square" size={36} color="#FFFFFF" />
        </View>
        <Text style={s.appName}>AttendEase</Text>
        <Text style={s.tagline}>Smart attendance for modern classrooms</Text>

        <View style={s.card}>
          <Text style={s.label}>Username</Text>
          <View style={s.inputRow}>
            <Feather name="user" size={18} color={colors.mutedForeground} style={{ marginRight: 10 }} />
            <TextInput
              style={s.input}
              value={username}
              onChangeText={(t) => { setUsername(t); setError(""); }}
              placeholder="Enter username"
              placeholderTextColor={colors.mutedForeground}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <Text style={s.label}>Password</Text>
          <View style={s.inputRow}>
            <Feather name="lock" size={18} color={colors.mutedForeground} style={{ marginRight: 10 }} />
            <TextInput
              style={s.input}
              value={password}
              onChangeText={(t) => { setPassword(t); setError(""); }}
              placeholder="Enter password"
              placeholderTextColor={colors.mutedForeground}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Feather name={showPassword ? "eye-off" : "eye"} size={18} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>

          {error ? <Text style={s.error}>{error}</Text> : null}

          <TouchableOpacity style={s.loginBtn} onPress={handleLogin} disabled={loading} activeOpacity={0.85}>
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={s.loginTxt}>Sign In</Text>
            )}
          </TouchableOpacity>

          <View style={s.hint}>
            <Text style={s.hintTxt}>
              Default: <Text style={s.hintBold}>teacher</Text> / <Text style={s.hintBold}>admin123</Text>
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
