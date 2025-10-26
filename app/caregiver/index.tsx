import { useNavigation } from "@react-navigation/native";
import React from "react";
import { Text, View } from "react-native";

export default function CaregiverHome() {
  const navigation = useNavigation();

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: "#F7F9FC" }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginTop: 16 }}>
        Chào mừng Caregiver 👋
      </Text>
      <Text style={{ marginTop: 10, color: "#555" }}>
        Hãy chọn mục trong menu để bắt đầu công việc của bạn nhé!
      </Text>
    </View>
  );
}
