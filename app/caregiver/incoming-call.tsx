import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function IncomingCallScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Get caller name from params, or use default
  const callerName = params.callerName as string || "Người dùng";
  const callType = params.callType as string || "video"; // video or audio

  const handleDecline = () => {
    // Handle decline call logic
    router.back();
  };

  const handleAnswer = () => {
    // Navigate to video call screen
    router.push({
      pathname: "/caregiver/video-call",
      params: { callerName, callType },
    });
  };

  return (
    <View style={styles.container}>
      {/* Caller Info */}
      <View style={styles.callerSection}>
        <Text style={styles.callTypeText}>
          {callType === "video" ? "Video call" : "Voice call"}
        </Text>
        
        {/* Avatar Circle */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatarCircle}>
            <MaterialCommunityIcons name="account" size={64} color="#FFFFFF" />
          </View>
        </View>

        {/* Caller Name */}
        <Text style={styles.callerName}>{callerName}</Text>
        <Text style={styles.callingText}>Đang gọi...</Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsSection}>
        {/* Decline Button */}
        <TouchableOpacity
          style={[styles.actionButton, styles.declineButton]}
          onPress={handleDecline}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="close" size={36} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Answer Button */}
        <TouchableOpacity
          style={[styles.actionButton, styles.answerButton]}
          onPress={handleAnswer}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons 
            name={callType === "video" ? "video" : "phone"} 
            size={36} 
            color="#FFFFFF" 
          />
        </TouchableOpacity>
      </View>

      {/* Button Labels */}
      <View style={styles.labelsSection}>
        <Text style={styles.buttonLabel}>Decline</Text>
        <Text style={styles.buttonLabel}>Answer</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
    justifyContent: "space-between",
    paddingVertical: 60,
  },
  callerSection: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  callTypeText: {
    fontSize: 18,
    color: "#FFFFFF",
    fontWeight: "500",
    marginBottom: 40,
  },
  avatarContainer: {
    marginBottom: 30,
  },
  avatarCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#333333",
    borderWidth: 3,
    borderColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  callerName: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 8,
    textAlign: "center",
  },
  callingText: {
    fontSize: 16,
    color: "#AAAAAA",
    fontWeight: "400",
  },
  actionsSection: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 80,
    marginBottom: 16,
  },
  actionButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  declineButton: {
    backgroundColor: "#E91E63",
  },
  answerButton: {
    backgroundColor: "#4CAF50",
  },
  labelsSection: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 100,
  },
  buttonLabel: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "500",
  },
});
